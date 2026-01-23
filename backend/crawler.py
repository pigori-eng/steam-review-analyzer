"""
Steam Review Crawler (스팀 리뷰 크롤러)
======================================
Steam 게임 URL에서 리뷰를 수집합니다.

사용법:
    from crawler import SteamCrawler
    
    crawler = SteamCrawler()
    reviews = crawler.crawl("https://store.steampowered.com/app/2621690", count=100)
"""

import json
import re
import time
from datetime import datetime
from urllib.request import urlopen, Request
from urllib.parse import urlencode
from typing import Optional

# ============================================
# 설정값
# ============================================

# 언어 코드 → 한글 이름 매핑
LANGUAGE_NAMES = {
    'korean': '한국어',
    'english': 'English',
    'schinese': '简体中文',
    'tchinese': '繁體中文',
    'japanese': '日本語',
    'russian': 'Русский',
    'german': 'Deutsch',
    'french': 'Français',
    'spanish': 'Español',
    'portuguese': 'Português',
    'brazilian': 'Português-Brasil',
    'italian': 'Italiano',
    'polish': 'Polski',
    'thai': 'ไทย',
    'vietnamese': 'Tiếng Việt',
    'turkish': 'Türkçe',
    'arabic': 'العربية',
    'czech': 'Čeština',
    'hungarian': 'Magyar',
    'dutch': 'Nederlands',
    'norwegian': 'Norsk',
    'swedish': 'Svenska',
    'finnish': 'Suomi',
    'danish': 'Dansk',
    'romanian': 'Română',
    'ukrainian': 'Українська',
    'greek': 'Ελληνικά',
    'indonesian': 'Indonesian',
    'latam': 'Español-Latinoamérica',
}


class SteamCrawler:
    """Steam 리뷰 크롤러"""
    
    def __init__(self):
        self.reviews_per_request = 100  # Steam API 한 번에 최대 100개
        self.request_delay = 0.3  # 요청 사이 딜레이 (초)
        self.max_retries = 3  # 실패 시 재시도 횟수
    
    def extract_app_id(self, url_or_id: str) -> Optional[str]:
        """
        URL 또는 App ID에서 App ID 추출
        
        예시:
            "2621690" → "2621690"
            "https://store.steampowered.com/app/2621690/Arc_Raiders/" → "2621690"
        """
        # 이미 숫자만 있으면 그대로 반환
        if str(url_or_id).strip().isdigit():
            return str(url_or_id).strip()
        
        # URL에서 App ID 추출 (여러 패턴 지원)
        patterns = [
            r'store\.steampowered\.com/app/(\d+)',
            r'steamcommunity\.com/app/(\d+)',
            r'/app/(\d+)',
            r'appid[=:](\d+)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, str(url_or_id), re.IGNORECASE)
            if match:
                return match.group(1)
        
        return None
    
    def get_game_info(self, app_id: str) -> dict:
        """
        Steam API로 게임 기본 정보 가져오기
        
        반환:
            {
                "name": "게임 이름",
                "developers": ["개발사"],
                "publishers": ["퍼블리셔"],
                "release_date": "출시일",
                "header_image": "이미지 URL"
            }
        """
        url = f"https://store.steampowered.com/api/appdetails?appids={app_id}&l=korean"
        
        try:
            req = Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urlopen(req, timeout=10) as response:
                data = json.loads(response.read().decode('utf-8'))
                
                if data.get(app_id, {}).get('success'):
                    game = data[app_id]['data']
                    return {
                        'app_id': app_id,
                        'name': game.get('name', f'Unknown ({app_id})'),
                        'type': game.get('type', 'game'),
                        'developers': game.get('developers', []),
                        'publishers': game.get('publishers', []),
                        'release_date': game.get('release_date', {}).get('date', 'Unknown'),
                        'header_image': game.get('header_image', ''),
                        'short_description': game.get('short_description', ''),
                    }
        except Exception as e:
            print(f"⚠️ 게임 정보 로드 실패: {e}")
        
        return {
            'app_id': app_id,
            'name': f'Unknown Game ({app_id})',
            'type': 'unknown',
            'developers': [],
            'publishers': [],
            'release_date': 'Unknown',
            'header_image': '',
            'short_description': '',
        }
    
    def _fetch_reviews_page(self, app_id: str, cursor: str = '*', 
                            day_range: Optional[int] = None) -> Optional[dict]:
        """
        Steam API로 리뷰 한 페이지 가져오기 (내부 함수)
        """
        base_url = f"https://store.steampowered.com/appreviews/{app_id}"
        
        params = {
            'json': 1,
            'cursor': cursor,
            'num_per_page': self.reviews_per_request,
            'filter': 'recent',
            'language': 'all',
            'review_type': 'all',
            'purchase_type': 'all',
        }
        
        if day_range:
            params['day_range'] = day_range
        
        url = f"{base_url}?{urlencode(params)}"
        
        for attempt in range(self.max_retries):
            try:
                req = Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                with urlopen(req, timeout=15) as response:
                    return json.loads(response.read().decode('utf-8'))
            except Exception as e:
                if attempt < self.max_retries - 1:
                    time.sleep(2 ** attempt)  # 지수 백오프
                else:
                    print(f"⚠️ API 요청 실패: {e}")
        
        return None
    
    def crawl(self, url_or_id: str, count: int = 100, 
              day_range: Optional[int] = None,
              progress_callback=None) -> dict:
        """
        Steam 리뷰 크롤링 메인 함수
        
        Args:
            url_or_id: Steam URL 또는 App ID
            count: 수집할 리뷰 개수 (1 ~ 1,000,000)
            day_range: 기간 필터 (7, 14, 30, 90일 또는 None=전체)
            progress_callback: 진행 상황 콜백 함수 (current, total) → None
        
        Returns:
            {
                "success": True/False,
                "game_info": {...},
                "reviews": [...],
                "statistics": {...},
                "error": "에러 메시지" (실패 시)
            }
        """
        # 1. App ID 추출
        app_id = self.extract_app_id(url_or_id)
        if not app_id:
            return {
                "success": False,
                "error": "올바른 Steam URL 또는 App ID를 입력해주세요.",
                "example": "https://store.steampowered.com/app/2621690/Arc_Raiders/"
            }
        
        # 2. 게임 정보 가져오기
        game_info = self.get_game_info(app_id)
        
        # 3. 리뷰 크롤링
        reviews = []
        cursor = '*'
        page = 0
        
        while len(reviews) < count:
            page += 1
            
            # 진행 상황 콜백
            if progress_callback:
                progress_callback(len(reviews), count)
            
            # API 호출
            result = self._fetch_reviews_page(app_id, cursor, day_range)
            
            if not result or not result.get('success'):
                break
            
            new_reviews = result.get('reviews', [])
            if not new_reviews:
                break
            
            # 리뷰 데이터 정제
            for review in new_reviews:
                reviews.append(self._clean_review(review))
                if len(reviews) >= count:
                    break
            
            # 다음 페이지
            new_cursor = result.get('cursor')
            if not new_cursor or new_cursor == cursor:
                break
            cursor = new_cursor
            
            # 딜레이
            time.sleep(self.request_delay)
        
        # 4. 통계 계산
        statistics = self._calculate_statistics(reviews)
        
        return {
            "success": True,
            "game_info": game_info,
            "reviews": reviews,
            "statistics": statistics,
            "crawl_info": {
                "requested_count": count,
                "actual_count": len(reviews),
                "day_range": day_range,
                "crawled_at": datetime.now().isoformat(),
            }
        }
    
    def _clean_review(self, raw_review: dict) -> dict:
        """리뷰 데이터 정제 (필요한 필드만 추출)"""
        author = raw_review.get('author', {})
        
        return {
            # 기본 정보
            'review_id': raw_review.get('recommendationid', ''),
            'language': raw_review.get('language', 'unknown'),
            'language_name': LANGUAGE_NAMES.get(raw_review.get('language', ''), raw_review.get('language', 'Unknown')),
            'review_text': raw_review.get('review', ''),
            
            # 평가
            'recommended': raw_review.get('voted_up', False),
            'votes_up': raw_review.get('votes_up', 0),
            'votes_funny': raw_review.get('votes_funny', 0),
            'weighted_vote_score': raw_review.get('weighted_vote_score', 0),
            
            # 플레이타임 (분 → 시간 변환)
            'playtime_total_hours': round(author.get('playtime_forever', 0) / 60, 1),
            'playtime_at_review_hours': round(author.get('playtime_at_review', 0) / 60, 1),
            'playtime_last_two_weeks_hours': round(author.get('playtime_last_two_weeks', 0) / 60, 1),
            
            # 시간 정보
            'timestamp_created': raw_review.get('timestamp_created', 0),
            'timestamp_updated': raw_review.get('timestamp_updated', 0),
            'created_date': datetime.fromtimestamp(raw_review.get('timestamp_created', 0)).strftime('%Y-%m-%d %H:%M:%S'),
            
            # 기타
            'steam_purchase': raw_review.get('steam_purchase', False),
            'received_for_free': raw_review.get('received_for_free', False),
            'written_during_early_access': raw_review.get('written_during_early_access', False),
        }
    
    def _calculate_statistics(self, reviews: list) -> dict:
        """리뷰 통계 계산"""
        if not reviews:
            return {}
        
        total = len(reviews)
        positive = sum(1 for r in reviews if r['recommended'])
        negative = total - positive
        
        # 언어별 분포
        lang_dist = {}
        for r in reviews:
            lang = r['language_name']
            lang_dist[lang] = lang_dist.get(lang, 0) + 1
        
        # 플레이타임 통계
        playtimes = [r['playtime_total_hours'] for r in reviews if r['playtime_total_hours'] > 0]
        avg_playtime = sum(playtimes) / len(playtimes) if playtimes else 0
        
        return {
            'total_reviews': total,
            'positive_reviews': positive,
            'negative_reviews': negative,
            'positive_rate': round(positive / total * 100, 1) if total > 0 else 0,
            'negative_rate': round(negative / total * 100, 1) if total > 0 else 0,
            'average_playtime_hours': round(avg_playtime, 1),
            'language_distribution': dict(sorted(lang_dist.items(), key=lambda x: -x[1])),
        }


# ============================================
# 테스트 코드
# ============================================

if __name__ == "__main__":
    # 테스트 실행
    crawler = SteamCrawler()
    
    # Arc Raiders 테스트
    print("🎮 Steam 리뷰 크롤러 테스트")
    print("=" * 50)
    
    result = crawler.crawl(
        url_or_id="https://store.steampowered.com/app/2621690/Arc_Raiders/",
        count=10,
        day_range=30
    )
    
    if result['success']:
        print(f"✅ 게임: {result['game_info']['name']}")
        print(f"📊 수집된 리뷰: {len(result['reviews'])}개")
        print(f"👍 긍정률: {result['statistics']['positive_rate']}%")
        print(f"\n📝 첫 번째 리뷰 샘플:")
        print(f"   {result['reviews'][0]['review_text'][:100]}...")
    else:
        print(f"❌ 에러: {result['error']}")
