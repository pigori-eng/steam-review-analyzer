"""
AI Review Analyzer (AI 리뷰 분석기)
===================================
Claude API를 사용하여 Steam 리뷰를 분석합니다.

사용법:
    from analyzer import ReviewAnalyzer
    
    analyzer = ReviewAnalyzer(api_key="your-api-key")
    result = analyzer.analyze(reviews, game_info)
"""

import json
import os
from typing import Optional
import urllib.request
import urllib.error

# ============================================
# 분석 프롬프트 템플릿
# ============================================

ANALYSIS_PROMPT = """당신은 게임 업계 최고의 데이터 분석 전문가입니다. 
PM이 의사결정에 바로 활용할 수 있는 심층 분석을 제공해주세요.

# 게임 정보
- 게임명: {game_name}
- 개발사: {developers}
- 출시일: {release_date}

# 리뷰 데이터 요약
- 총 리뷰 수: {total_reviews}개
- 긍정률: {positive_rate}%
- 부정률: {negative_rate}%
- 평균 플레이타임: {avg_playtime}시간

# 리뷰 데이터
{reviews_text}

---

위 데이터를 분석하여 아래 13개 항목에 대한 분석 결과를 JSON 형식으로 반환해주세요.

## 반환할 JSON 구조:

```json
{{
  "executive_summary": {{
    "overall_score": 0-100,
    "one_line_summary": "한 줄 요약",
    "key_insights": [
      {{
        "title": "인사이트 제목",
        "description": "설명",
        "sentiment": "positive/negative/neutral",
        "impact": "high/medium/low"
      }}
    ]
  }},
  
  "user_rating": {{
    "by_language": [
      {{
        "language": "언어명",
        "total": 숫자,
        "positive": 숫자,
        "positive_rate": 퍼센트
      }}
    ],
    "insight": "언어별 분석 인사이트"
  }},
  
  "sentiment_analysis": {{
    "categories": [
      {{
        "name": "Combat/Gameplay/Graphics/Performance/Content/Difficulty/Story/Multiplayer",
        "score": -100 ~ 100,
        "mention_count": 숫자,
        "keywords": ["키워드1", "키워드2"],
        "summary": "요약"
      }}
    ]
  }},
  
  "playtime_analysis": {{
    "groups": [
      {{
        "range": "0-2h/2-10h/10-50h/50h+",
        "count": 숫자,
        "positive_rate": 퍼센트,
        "main_feedback": "주요 피드백"
      }}
    ],
    "playtime_paradox": {{
      "exists": true/false,
      "description": "설명"
    }}
  }},
  
  "keyword_analysis": {{
    "positive_keywords": [
      {{"keyword": "키워드", "count": 숫자, "context": "맥락"}}
    ],
    "negative_keywords": [
      {{"keyword": "키워드", "count": 숫자, "context": "맥락"}}
    ],
    "trending": ["트렌딩 키워드"]
  }},
  
  "regional_analysis": {{
    "regions": [
      {{
        "language": "언어",
        "characteristics": "특성",
        "main_concerns": ["관심사"],
        "recommendation": "시장별 전략"
      }}
    ]
  }},
  
  "player_journey": {{
    "stages": [
      {{
        "stage": "초보자/중급자/고수",
        "playtime_range": "시간 범위",
        "sentiment": "감정",
        "pain_points": ["불만사항"],
        "highlights": ["좋은 점"]
      }}
    ],
    "churn_points": [
      {{
        "timing": "이탈 시점",
        "reason": "이유",
        "suggestion": "개선 제안"
      }}
    ]
  }},
  
  "loot_system": {{
    "overall_score": 0-100,
    "feedback_summary": "요약",
    "improvements_needed": ["개선점"]
  }},
  
  "difficulty_balance": {{
    "overall_assessment": "전반적 평가",
    "distribution": {{
      "too_easy": 퍼센트,
      "balanced": 퍼센트,
      "too_hard": 퍼센트
    }},
    "specific_issues": ["구체적 이슈"]
  }},
  
  "technical_analysis": {{
    "overall_score": 0-100,
    "issues": [
      {{
        "category": "Performance/Bug/Optimization/Server",
        "severity": "critical/major/minor",
        "description": "설명",
        "frequency": "빈도"
      }}
    ]
  }},
  
  "community_analysis": {{
    "sentiment": 0-100,
    "highlights": ["좋은 점"],
    "concerns": ["우려사항"]
  }},
  
  "competitor_comparison": {{
    "mentioned_games": [
      {{
        "game": "게임명",
        "context": "favorable/unfavorable/neutral",
        "comparison_point": "비교 포인트"
      }}
    ],
    "our_strengths": ["우리 강점"],
    "our_weaknesses": ["우리 약점"]
  }},
  
  "action_items": {{
    "critical": [
      {{
        "title": "제목",
        "description": "설명",
        "expected_impact": "예상 효과"
      }}
    ],
    "short_term": [
      {{
        "title": "제목",
        "description": "설명",
        "timeline": "1-3개월"
      }}
    ],
    "long_term": [
      {{
        "title": "제목",
        "description": "설명",
        "timeline": "3개월+"
      }}
    ]
  }}
}}
```

JSON만 반환해주세요. 다른 텍스트 없이 순수 JSON만 출력하세요.
"""


class ReviewAnalyzer:
    """Claude/OpenAI/Gemini API를 사용한 리뷰 분석기"""
    
    def __init__(self, api_key: Optional[str] = None, provider: str = "claude"):
        """
        Args:
            api_key: API 키
            provider: "claude", "openai", 또는 "gemini"
        """
        self.api_key = api_key
        self.provider = provider.lower()
        
        if self.provider == "openai":
            self.api_url = "https://api.openai.com/v1/chat/completions"
            self.model = "gpt-4o"
        elif self.provider == "gemini":
            self.api_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"
            self.model = "gemini-1.5-flash"
        else:  # claude (기본값)
            self.api_url = "https://api.anthropic.com/v1/messages"
            self.model = "claude-sonnet-4-20250514"
    
    def analyze(self, crawl_result: dict) -> dict:
        """
        크롤링 결과를 분석
        
        Args:
            crawl_result: crawler.crawl()의 반환값
        
        Returns:
            분석 결과 딕셔너리
        """
        if not crawl_result.get('success'):
            return {
                "success": False,
                "error": "크롤링 결과가 없습니다."
            }
        
        if not self.api_key:
            return {
                "success": False,
                "error": "API 키가 설정되지 않았습니다."
            }
        
        # 프롬프트 생성
        prompt = self._build_prompt(crawl_result)
        
        # API 호출 (provider에 따라 다르게)
        try:
            if self.provider == "openai":
                response = self._call_openai_api(prompt)
            elif self.provider == "gemini":
                response = self._call_gemini_api(prompt)
            else:
                response = self._call_claude_api(prompt)
            
            # JSON 파싱
            analysis = self._parse_response(response)
            
            return {
                "success": True,
                "game_info": crawl_result['game_info'],
                "statistics": crawl_result['statistics'],
                "analysis": analysis
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"분석 중 오류 발생: {str(e)}"
            }
    
    def _build_prompt(self, crawl_result: dict) -> str:
        """분석 프롬프트 생성"""
        game_info = crawl_result['game_info']
        stats = crawl_result['statistics']
        reviews = crawl_result['reviews']
        
        # 리뷰 텍스트 포맷팅 (최대 50개)
        reviews_text = ""
        for i, review in enumerate(reviews[:50], 1):
            sentiment = "👍 추천" if review['recommended'] else "👎 비추천"
            reviews_text += f"""
---
[리뷰 {i}]
- 언어: {review['language_name']}
- 평가: {sentiment}
- 플레이타임: {review['playtime_total_hours']}시간
- 내용: {review['review_text'][:500]}
"""
        
        return ANALYSIS_PROMPT.format(
            game_name=game_info.get('name', 'Unknown'),
            developers=', '.join(game_info.get('developers', ['Unknown'])),
            release_date=game_info.get('release_date', 'Unknown'),
            total_reviews=stats.get('total_reviews', 0),
            positive_rate=stats.get('positive_rate', 0),
            negative_rate=stats.get('negative_rate', 0),
            avg_playtime=stats.get('average_playtime_hours', 0),
            reviews_text=reviews_text
        )
    
    def _call_claude_api(self, prompt: str) -> str:
        """Claude API 호출"""
        headers = {
            "Content-Type": "application/json",
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01"
        }
        
        data = {
            "model": self.model,
            "max_tokens": 8000,
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        }
        
        req = urllib.request.Request(
            self.api_url,
            data=json.dumps(data).encode('utf-8'),
            headers=headers,
            method='POST'
        )
        
        with urllib.request.urlopen(req, timeout=120) as response:
            result = json.loads(response.read().decode('utf-8'))
            return result['content'][0]['text']
    
    def _call_openai_api(self, prompt: str) -> str:
        """OpenAI API 호출"""
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
        
        data = {
            "model": self.model,
            "max_tokens": 8000,
            "messages": [
                {
                    "role": "system",
                    "content": "You are a game industry expert data analyst. Always respond in JSON format only, without any additional text."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        }
        
        req = urllib.request.Request(
            self.api_url,
            data=json.dumps(data).encode('utf-8'),
            headers=headers,
            method='POST'
        )
        
        with urllib.request.urlopen(req, timeout=120) as response:
            result = json.loads(response.read().decode('utf-8'))
            return result['choices'][0]['message']['content']
    
    def _call_gemini_api(self, prompt: str) -> str:
        """Google Gemini API 호출"""
        # Gemini는 API 키를 URL 파라미터로 전달
        url = f"{self.api_url}?key={self.api_key}"
        
        headers = {
            "Content-Type": "application/json"
        }
        
        data = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": f"You are a game industry expert data analyst. Always respond in JSON format only, without any additional text.\n\n{prompt}"
                        }
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 8000
            }
        }
        
        req = urllib.request.Request(
            url,
            data=json.dumps(data).encode('utf-8'),
            headers=headers,
            method='POST'
        )
        
        with urllib.request.urlopen(req, timeout=120) as response:
            result = json.loads(response.read().decode('utf-8'))
            return result['candidates'][0]['content']['parts'][0]['text']
    
    def _parse_response(self, response: str) -> dict:
        """API 응답에서 JSON 추출"""
        # JSON 블록 추출 시도
        response = response.strip()
        
        # ```json ... ``` 형식 처리
        if '```json' in response:
            start = response.find('```json') + 7
            end = response.find('```', start)
            response = response[start:end].strip()
        elif '```' in response:
            start = response.find('```') + 3
            end = response.find('```', start)
            response = response[start:end].strip()
        
        return json.loads(response)
    
    def analyze_without_api(self, crawl_result: dict) -> dict:
        """
        API 없이 기본 분석 수행 (간단한 통계 분석)
        Claude API 키가 없을 때 대안으로 사용
        """
        if not crawl_result.get('success'):
            return {
                "success": False,
                "error": "크롤링 결과가 없습니다."
            }
        
        reviews = crawl_result['reviews']
        stats = crawl_result['statistics']
        
        # 언어별 분석
        lang_analysis = {}
        for review in reviews:
            lang = review['language_name']
            if lang not in lang_analysis:
                lang_analysis[lang] = {'total': 0, 'positive': 0}
            lang_analysis[lang]['total'] += 1
            if review['recommended']:
                lang_analysis[lang]['positive'] += 1
        
        user_rating = [
            {
                "language": lang,
                "total": data['total'],
                "positive": data['positive'],
                "positive_rate": round(data['positive'] / data['total'] * 100, 1) if data['total'] > 0 else 0
            }
            for lang, data in sorted(lang_analysis.items(), key=lambda x: -x[1]['total'])
        ]
        
        # 플레이타임 구간 분석
        playtime_groups = {
            "0-2h": {"count": 0, "positive": 0},
            "2-10h": {"count": 0, "positive": 0},
            "10-50h": {"count": 0, "positive": 0},
            "50h+": {"count": 0, "positive": 0},
        }
        
        for review in reviews:
            hours = review['playtime_total_hours']
            if hours < 2:
                group = "0-2h"
            elif hours < 10:
                group = "2-10h"
            elif hours < 50:
                group = "10-50h"
            else:
                group = "50h+"
            
            playtime_groups[group]["count"] += 1
            if review['recommended']:
                playtime_groups[group]["positive"] += 1
        
        playtime_analysis = [
            {
                "range": range_name,
                "count": data["count"],
                "positive_rate": round(data["positive"] / data["count"] * 100, 1) if data["count"] > 0 else 0
            }
            for range_name, data in playtime_groups.items()
        ]
        
        return {
            "success": True,
            "game_info": crawl_result['game_info'],
            "statistics": stats,
            "analysis": {
                "executive_summary": {
                    "overall_score": stats['positive_rate'],
                    "one_line_summary": f"총 {stats['total_reviews']}개 리뷰 중 {stats['positive_rate']}% 긍정 평가",
                    "key_insights": []
                },
                "user_rating": {
                    "by_language": user_rating,
                    "insight": "상세 분석을 위해 Claude API 키가 필요합니다."
                },
                "playtime_analysis": {
                    "groups": playtime_analysis,
                    "playtime_paradox": {"exists": False, "description": "분석 필요"}
                },
                "note": "전체 13개 항목 분석을 위해 Claude API 키를 설정해주세요."
            }
        }


# ============================================
# 테스트
# ============================================

if __name__ == "__main__":
    from sample_data import get_sample_data
    
    print("🤖 AI 분석기 테스트")
    print("=" * 50)
    
    # 샘플 데이터로 테스트
    sample = get_sample_data()
    
    analyzer = ReviewAnalyzer()
    
    # API 키 없이 기본 분석
    result = analyzer.analyze_without_api(sample)
    
    if result['success']:
        print(f"✅ 게임: {result['game_info']['name']}")
        print(f"📊 긍정률: {result['statistics']['positive_rate']}%")
        print(f"\n📈 언어별 분석:")
        for lang in result['analysis']['user_rating']['by_language'][:5]:
            print(f"   - {lang['language']}: {lang['positive_rate']}% ({lang['total']}개)")
        print(f"\n⏱️  플레이타임 분석:")
        for group in result['analysis']['playtime_analysis']['groups']:
            print(f"   - {group['range']}: {group['positive_rate']}% ({group['count']}개)")
    else:
        print(f"❌ 에러: {result['error']}")
