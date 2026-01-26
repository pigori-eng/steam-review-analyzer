"""
Steam Review Analyzer - Advanced Analysis Engine
=================================================
박사급 심층 분석을 제공하는 AI 리뷰 분석 엔진

Features:
- 키워드 기반 정량 분석 (빈도 × 영향도)
- 플레이타임별 코호트 분석
- 국가별 × 카테고리별 매트릭스
- Pain Points 우선순위 매트릭스
- AI 기반 인사이트 도출

Author: Chang yoon
Version: 2.0.0
"""

import json
import re
import math
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Optional, Dict, List, Tuple
import urllib.request
import urllib.error

# ============================================
# 시드 키워드 사전 (Seed Keywords Dictionary)
# ============================================

SEED_KEYWORDS = {
    # ===== GAMEPLAY 카테고리 =====
    "combat": {
        "positive": [
            "combat", "fighting", "battle", "gunplay", "shooting", "shooter",
            "action", "impactful", "satisfying", "tight", "responsive", "smooth",
            "전투", "타격감", "손맛", "액션", "총게임", "슈터", "쏘는맛", "타격", "조작감"
        ],
        "negative": [
            "clunky", "sluggish", "unresponsive", "floaty", "weak", "boring combat",
            "hitbox", "hit detection", "input lag", "delay", "느림", "답답",
            "둔탁", "판정", "렉", "딜레이", "조작", "불편"
        ]
    },
    "gameplay": {
        "positive": [
            "gameplay", "fun", "addictive", "engaging", "enjoyable", "entertaining",
            "game", "play", "재미", "재밌", "꿀잼", "중독", "갓겜", "명작", "게임성"
        ],
        "negative": [
            "boring", "repetitive", "tedious", "grindy", "grind", "monotonous",
            "노잼", "지루", "반복", "노가다", "숙제", "똥겜", "쓰레기"
        ]
    },
    "difficulty": {
        "positive": [
            "balanced", "fair", "challenging", "rewarding", "skill-based",
            "밸런스", "공정", "도전", "보람", "실력"
        ],
        "negative": [
            "unfair", "unbalanced", "too hard", "too easy", "frustrating", "cheap",
            "bullet sponge", "one-shot", "불공정", "불균형", "너무어려", "너무쉬움",
            "짜증", "억까", "노답", "밸붕"
        ]
    },
    
    # ===== CONTENT 카테고리 =====
    "content": {
        "positive": [
            "content", "lots of content", "tons of content", "endgame", "replayable",
            "variety", "diverse", "콘텐츠", "볼륨", "할거많", "엔드게임", "다양"
        ],
        "negative": [
            "lack of content", "no content", "empty", "shallow", "short",
            "nothing to do", "콘텐츠부족", "할게없", "짧", "얕", "볼륨부족"
        ]
    },
    "progression": {
        "positive": [
            "progression", "rewarding", "satisfying progression", "build variety",
            "character growth", "성장", "육성", "빌드", "파밍", "보람"
        ],
        "negative": [
            "paywall", "pay to win", "p2w", "timegate", "time-gated", "pointless",
            "no progression", "현질", "과금", "페이월", "성장벽", "의미없"
        ]
    },
    "loot": {
        "positive": [
            "loot", "drops", "rewards", "exciting loot", "good drops",
            "드랍", "보상", "득템", "파밍", "루팅"
        ],
        "negative": [
            "rng", "bad rng", "no drops", "terrible loot", "boring loot",
            "랜덤", "확률", "드랍안됨", "보상없", "ㅈ같은확률"
        ]
    },
    "story": {
        "positive": [
            "story", "narrative", "lore", "immersive", "emotional", "characters",
            "world building", "스토리", "서사", "세계관", "몰입", "캐릭터"
        ],
        "negative": [
            "no story", "boring story", "cringe", "bad writing", "generic",
            "스토리없", "유치", "오글", "진부", "뻔한"
        ]
    },
    
    # ===== TECHNICAL 카테고리 =====
    "performance": {
        "positive": [
            "smooth", "optimized", "stable", "60fps", "144fps", "runs well",
            "최적화", "부드러움", "안정", "프레임좋", "잘돌아감"
        ],
        "negative": [
            "lag", "stutter", "stuttering", "fps drop", "frame drop", "poorly optimized",
            "unoptimized", "렉", "스터터", "프레임드랍", "최적화안됨", "프레임"
        ]
    },
    "stability": {
        "positive": [
            "stable", "no crashes", "solid", "안정", "안튕김"
        ],
        "negative": [
            "crash", "crashes", "crashing", "freeze", "freezing", "broken",
            "bug", "bugs", "buggy", "glitch", "glitches",
            "튕김", "크래시", "멈춤", "프리징", "버그", "오류", "에러"
        ]
    },
    "network": {
        "positive": [
            "stable server", "good connection", "low ping", "서버안정", "핑좋"
        ],
        "negative": [
            "server", "servers", "disconnect", "connection", "lag", "ping",
            "desync", "netcode", "서버", "연결", "끊김", "핑", "렉", "싱크"
        ]
    },
    "cheating": {
        "positive": [
            "no cheaters", "anti-cheat", "fair play", "핵없", "안티치트"
        ],
        "negative": [
            "cheater", "cheaters", "hacker", "hackers", "hack", "hacks",
            "cheat", "cheating", "exploit", "핵", "치터", "해커", "핵쟁이"
        ]
    },
    
    # ===== POLISH 카테고리 =====
    "graphics": {
        "positive": [
            "graphics", "beautiful", "stunning", "gorgeous", "visual", "art style",
            "그래픽", "예쁜", "아름다운", "비주얼", "아트"
        ],
        "negative": [
            "ugly", "outdated", "bad graphics", "looks bad", "generic art",
            "못생긴", "구린", "그래픽구림", "양산형"
        ]
    },
    "audio": {
        "positive": [
            "sound", "audio", "music", "ost", "soundtrack", "voice acting",
            "사운드", "음악", "ost", "음향", "성우"
        ],
        "negative": [
            "bad sound", "no music", "annoying sound", "sound bug",
            "사운드버그", "음악없", "소리이상"
        ]
    },
    "ui_ux": {
        "positive": [
            "ui", "ux", "interface", "intuitive", "clean", "qol", "quality of life",
            "ui좋", "인터페이스", "직관적", "편의성"
        ],
        "negative": [
            "bad ui", "clunky ui", "confusing", "unintuitive", "menu", "inventory",
            "ui불편", "인벤토리", "메뉴", "복잡", "불편"
        ]
    },
    
    # ===== VALUE 카테고리 =====
    "value": {
        "positive": [
            "worth", "value", "free to play", "f2p friendly", "fair monetization",
            "가성비", "혜자", "무료게임", "돈값", "착한과금"
        ],
        "negative": [
            "overpriced", "expensive", "cash grab", "greedy", "predatory",
            "비쌈", "창렬", "과금유도", "돈먹는", "탐욕"
        ]
    },
    
    # ===== MULTIPLAYER 카테고리 =====
    "multiplayer": {
        "positive": [
            "coop", "co-op", "multiplayer", "friends", "team", "squad",
            "협동", "코옵", "멀티", "친구", "팀", "파티"
        ],
        "negative": [
            "solo unfriendly", "forced coop", "no matchmaking", "dead game",
            "toxic", "솔로불가", "강제파티", "매칭안됨", "유저없"
        ]
    },
    "pvp": {
        "positive": [
            "pvp", "competitive", "fair pvp", "balanced pvp",
            "pvp좋", "경쟁", "밸런스좋"
        ],
        "negative": [
            "unbalanced pvp", "pvp broken", "ganking", "griefing",
            "pvp밸붕", "학살", "저격", "그리핑"
        ]
    },
    
    # ===== ONBOARDING 카테고리 =====
    "onboarding": {
        "positive": [
            "tutorial", "easy to learn", "beginner friendly", "accessible",
            "튜토리얼좋", "입문쉬움", "초보친화"
        ],
        "negative": [
            "confusing", "no tutorial", "bad tutorial", "steep learning curve",
            "refund", "uninstall", "튜토리얼없", "설명없", "입문어려움", "환불"
        ]
    }
}

# 카테고리 그룹핑
CATEGORY_GROUPS = {
    "Core Gameplay": ["combat", "gameplay", "difficulty"],
    "Content & Progression": ["content", "progression", "loot", "story"],
    "Technical": ["performance", "stability", "network", "cheating"],
    "Polish": ["graphics", "audio", "ui_ux"],
    "Value & Social": ["value", "multiplayer", "pvp"],
    "Onboarding": ["onboarding"]
}


# ============================================
# 키워드 분석 엔진
# ============================================

class KeywordEngine:
    """키워드 기반 정량 분석 엔진"""
    
    def __init__(self):
        self.seed_keywords = SEED_KEYWORDS
        self.category_groups = CATEGORY_GROUPS
    
    def analyze_reviews(self, reviews: List[dict]) -> dict:
        """
        모든 리뷰에 대해 키워드 분석 수행
        
        Returns:
            {
                "category_scores": {...},
                "keyword_frequency": {...},
                "pain_points_matrix": {...}
            }
        """
        # 초기화
        category_stats = {cat: {
            "positive_mentions": 0,
            "negative_mentions": 0,
            "total_mentions": 0,
            "positive_reviews_with_mention": 0,
            "negative_reviews_with_mention": 0,
            "keywords_found": defaultdict(lambda: {"count": 0, "positive": 0, "negative": 0})
        } for cat in self.seed_keywords.keys()}
        
        # 각 리뷰 분석
        for review in reviews:
            text = review.get('review_text', '').lower()
            is_positive = review.get('recommended', False)
            
            for category, keywords in self.seed_keywords.items():
                pos_found = False
                neg_found = False
                
                # 긍정 키워드 검색
                for kw in keywords['positive']:
                    if kw.lower() in text:
                        category_stats[category]["positive_mentions"] += 1
                        category_stats[category]["keywords_found"][kw]["count"] += 1
                        if is_positive:
                            category_stats[category]["keywords_found"][kw]["positive"] += 1
                        else:
                            category_stats[category]["keywords_found"][kw]["negative"] += 1
                        pos_found = True
                
                # 부정 키워드 검색
                for kw in keywords['negative']:
                    if kw.lower() in text:
                        category_stats[category]["negative_mentions"] += 1
                        category_stats[category]["keywords_found"][kw]["count"] += 1
                        if is_positive:
                            category_stats[category]["keywords_found"][kw]["positive"] += 1
                        else:
                            category_stats[category]["keywords_found"][kw]["negative"] += 1
                        neg_found = True
                
                # 언급된 리뷰 카운트
                if pos_found or neg_found:
                    category_stats[category]["total_mentions"] += 1
                    if is_positive:
                        category_stats[category]["positive_reviews_with_mention"] += 1
                    else:
                        category_stats[category]["negative_reviews_with_mention"] += 1
        
        # 결과 정리
        return self._compile_results(category_stats, len(reviews))
    
    def _compile_results(self, category_stats: dict, total_reviews: int) -> dict:
        """분석 결과 컴파일"""
        
        category_scores = {}
        all_keywords = []
        pain_points = []
        
        for category, stats in category_stats.items():
            total_mentions = stats["total_mentions"]
            
            if total_mentions > 0:
                # 긍정률 계산 (해당 카테고리 언급 리뷰 중)
                positive_rate = round(
                    stats["positive_reviews_with_mention"] / total_mentions * 100, 1
                ) if total_mentions > 0 else 0
                
                # 감정 점수 (-100 ~ +100)
                pos_m = stats["positive_mentions"]
                neg_m = stats["negative_mentions"]
                if pos_m + neg_m > 0:
                    sentiment_score = round((pos_m - neg_m) / (pos_m + neg_m) * 100)
                else:
                    sentiment_score = 0
                
                category_scores[category] = {
                    "sentiment_score": sentiment_score,
                    "positive_rate": positive_rate,
                    "total_mentions": total_mentions,
                    "positive_mentions": pos_m,
                    "negative_mentions": neg_m,
                    "mention_rate": round(total_mentions / total_reviews * 100, 1)
                }
                
                # 키워드 정리
                for kw, kw_stats in stats["keywords_found"].items():
                    if kw_stats["count"] >= 2:  # 최소 2회 이상 언급
                        is_positive_kw = kw in self.seed_keywords[category]["positive"]
                        all_keywords.append({
                            "keyword": kw,
                            "category": category,
                            "count": kw_stats["count"],
                            "positive_reviews": kw_stats["positive"],
                            "negative_reviews": kw_stats["negative"],
                            "is_positive_keyword": is_positive_kw,
                            "impact_score": self._calculate_impact(kw_stats, total_reviews)
                        })
                
                # Pain Points (부정 언급이 많은 카테고리)
                if neg_m > pos_m and neg_m >= 3:
                    pain_points.append({
                        "category": category,
                        "severity": neg_m,
                        "impact": round(neg_m / total_reviews * 100, 1),
                        "sentiment_score": sentiment_score
                    })
            else:
                category_scores[category] = {
                    "sentiment_score": 0,
                    "positive_rate": 0,
                    "total_mentions": 0,
                    "positive_mentions": 0,
                    "negative_mentions": 0,
                    "mention_rate": 0
                }
        
        # 정렬
        all_keywords.sort(key=lambda x: x["count"], reverse=True)
        pain_points.sort(key=lambda x: x["severity"], reverse=True)
        
        return {
            "category_scores": category_scores,
            "top_keywords": all_keywords[:30],
            "pain_points": pain_points[:10],
            "category_groups": self._group_categories(category_scores)
        }
    
    def _calculate_impact(self, kw_stats: dict, total_reviews: int) -> float:
        """키워드 영향도 계산 (빈도 × 부정 비율)"""
        count = kw_stats["count"]
        neg_ratio = kw_stats["negative"] / count if count > 0 else 0
        frequency_score = min(count / total_reviews * 10, 1)  # 0~1 정규화
        return round(frequency_score * neg_ratio * 100, 1)
    
    def _group_categories(self, category_scores: dict) -> dict:
        """카테고리를 그룹별로 정리"""
        grouped = {}
        for group_name, categories in self.category_groups.items():
            group_data = []
            for cat in categories:
                if cat in category_scores:
                    data = category_scores[cat].copy()
                    data["category"] = cat
                    group_data.append(data)
            grouped[group_name] = sorted(group_data, key=lambda x: x["total_mentions"], reverse=True)
        return grouped


# ============================================
# 플레이타임 분석 엔진
# ============================================

class PlaytimeEngine:
    """플레이타임 기반 코호트 분석"""
    
    PLAYTIME_RANGES = [
        {"name": "0-2h", "min": 0, "max": 2, "label": "Onboarding/Refund Zone"},
        {"name": "2-10h", "min": 2, "max": 10, "label": "Learning Curve"},
        {"name": "10-50h", "min": 10, "max": 50, "label": "Core Experience"},
        {"name": "50h+", "min": 50, "max": float('inf'), "label": "Veteran/Endgame"},
    ]
    
    def analyze(self, reviews: List[dict]) -> dict:
        """플레이타임별 분석"""
        
        groups = {r["name"]: {
            "reviews": [],
            "positive": 0,
            "negative": 0,
            "total": 0,
            "label": r["label"]
        } for r in self.PLAYTIME_RANGES}
        
        for review in reviews:
            hours = review.get('playtime_total_hours', 0)
            is_positive = review.get('recommended', False)
            
            for r in self.PLAYTIME_RANGES:
                if r["min"] <= hours < r["max"]:
                    groups[r["name"]]["reviews"].append(review)
                    groups[r["name"]]["total"] += 1
                    if is_positive:
                        groups[r["name"]]["positive"] += 1
                    else:
                        groups[r["name"]]["negative"] += 1
                    break
        
        # 결과 정리
        result = {
            "groups": [],
            "playtime_paradox": self._detect_paradox(groups),
            "sentiment_curve": [],
            "insights": []
        }
        
        for range_info in self.PLAYTIME_RANGES:
            name = range_info["name"]
            data = groups[name]
            
            if data["total"] > 0:
                positive_rate = round(data["positive"] / data["total"] * 100, 1)
            else:
                positive_rate = 0
            
            result["groups"].append({
                "range": name,
                "label": data["label"],
                "total_reviews": data["total"],
                "positive_reviews": data["positive"],
                "negative_reviews": data["negative"],
                "positive_rate": positive_rate
            })
            
            result["sentiment_curve"].append({
                "range": name,
                "positive_rate": positive_rate,
                "review_count": data["total"]
            })
        
        # 인사이트 생성
        result["insights"] = self._generate_insights(result["groups"])
        
        return result
    
    def _detect_paradox(self, groups: dict) -> dict:
        """Playtime Paradox 감지 (장시간 플레이 후 비추천)"""
        veteran_group = groups.get("50h+", {})
        onboarding_group = groups.get("0-2h", {})
        
        if veteran_group.get("total", 0) < 5:
            return {"exists": False, "description": "베테랑 리뷰 데이터 부족"}
        
        veteran_positive_rate = veteran_group["positive"] / veteran_group["total"] * 100
        onboarding_positive_rate = (
            onboarding_group["positive"] / onboarding_group["total"] * 100 
            if onboarding_group.get("total", 0) > 0 else 0
        )
        
        # 패러독스: 50h+ 유저의 긍정률이 90% 이상인데 0-2h가 30% 미만
        if veteran_positive_rate > 85 and onboarding_positive_rate < 30:
            return {
                "exists": True,
                "type": "slow_burn",
                "description": f"초반 이탈률 높음 ({onboarding_positive_rate:.1f}%), 하지만 장기 플레이어는 매우 만족 ({veteran_positive_rate:.1f}%)",
                "recommendation": "온보딩 경험 개선 필요 - 초반 튜토리얼 강화 및 조기 보상 추가"
            }
        
        # 역 패러독스: 50h+ 유저가 오히려 부정적
        if veteran_group["negative"] > veteran_group["positive"] and veteran_group["total"] >= 10:
            neg_reviews = [r for r in veteran_group.get("reviews", []) if not r.get("recommended")]
            return {
                "exists": True,
                "type": "veteran_burnout",
                "description": f"베테랑 플레이어 불만족 (50h+ 긍정률: {veteran_positive_rate:.1f}%)",
                "recommendation": "엔드게임 콘텐츠 부족 또는 밸런스 문제 점검 필요",
                "sample_count": len(neg_reviews)
            }
        
        return {"exists": False, "description": "정상적인 플레이타임-만족도 상관관계"}
    
    def _generate_insights(self, groups: List[dict]) -> List[dict]:
        """플레이타임 인사이트 생성"""
        insights = []
        
        # 0-2h 분석
        onboarding = next((g for g in groups if g["range"] == "0-2h"), None)
        if onboarding and onboarding["total_reviews"] >= 5:
            if onboarding["positive_rate"] < 30:
                insights.append({
                    "type": "critical",
                    "title": "초기 이탈률 높음",
                    "description": f"0-2시간 플레이어의 긍정률이 {onboarding['positive_rate']}%로 매우 낮습니다.",
                    "recommendation": "튜토리얼 개선, 초반 경험 최적화 필요",
                    "affected_reviews": onboarding["total_reviews"]
                })
            elif onboarding["positive_rate"] < 50:
                insights.append({
                    "type": "warning",
                    "title": "온보딩 개선 필요",
                    "description": f"신규 유저 긍정률 {onboarding['positive_rate']}%",
                    "recommendation": "첫 인상 개선을 위한 UX 점검",
                    "affected_reviews": onboarding["total_reviews"]
                })
        
        # 50h+ 분석
        veteran = next((g for g in groups if g["range"] == "50h+"), None)
        if veteran and veteran["total_reviews"] >= 5:
            if veteran["positive_rate"] > 85:
                insights.append({
                    "type": "positive",
                    "title": "우수한 장기 리텐션",
                    "description": f"50시간+ 플레이어의 {veteran['positive_rate']}%가 긍정 평가",
                    "recommendation": "핵심 게임플레이가 성공적, 신규 유저 유입에 집중",
                    "affected_reviews": veteran["total_reviews"]
                })
            elif veteran["positive_rate"] < 50:
                insights.append({
                    "type": "critical",
                    "title": "베테랑 불만족",
                    "description": f"장기 플레이어조차 {veteran['positive_rate']}%만 긍정 평가",
                    "recommendation": "엔드게임 콘텐츠 및 밸런스 긴급 점검",
                    "affected_reviews": veteran["total_reviews"]
                })
        
        return insights


# ============================================
# 지역/언어별 분석 엔진
# ============================================

class RegionalEngine:
    """국가/언어별 분석"""
    
    # 주요 시장 매핑
    MARKET_MAPPING = {
        "english": {"market": "Global/NA/EU", "region": "서양권"},
        "korean": {"market": "Korea", "region": "한국"},
        "schinese": {"market": "China", "region": "중국"},
        "tchinese": {"market": "Taiwan/HK", "region": "대만/홍콩"},
        "japanese": {"market": "Japan", "region": "일본"},
        "russian": {"market": "Russia/CIS", "region": "러시아권"},
        "german": {"market": "Germany", "region": "독일"},
        "french": {"market": "France", "region": "프랑스"},
        "spanish": {"market": "Spain", "region": "스페인"},
        "latam": {"market": "Latin America", "region": "중남미"},
        "brazilian": {"market": "Brazil", "region": "브라질"},
        "polish": {"market": "Poland", "region": "폴란드"},
        "turkish": {"market": "Turkey", "region": "터키"},
        "thai": {"market": "Thailand", "region": "태국"},
        "vietnamese": {"market": "Vietnam", "region": "베트남"},
    }
    
    def analyze(self, reviews: List[dict], keyword_engine: KeywordEngine) -> dict:
        """지역별 분석"""
        
        # 언어별 그룹핑
        by_language = defaultdict(lambda: {
            "reviews": [],
            "positive": 0,
            "negative": 0,
            "total": 0
        })
        
        for review in reviews:
            lang = review.get('language', 'unknown')
            by_language[lang]["reviews"].append(review)
            by_language[lang]["total"] += 1
            if review.get('recommended'):
                by_language[lang]["positive"] += 1
            else:
                by_language[lang]["negative"] += 1
        
        # 결과 정리
        language_stats = []
        for lang, data in sorted(by_language.items(), key=lambda x: -x[1]["total"]):
            if data["total"] >= 3:  # 최소 3개 이상
                positive_rate = round(data["positive"] / data["total"] * 100, 1)
                market_info = self.MARKET_MAPPING.get(lang, {"market": lang, "region": lang})
                
                # 해당 언어 리뷰만으로 키워드 분석
                lang_keywords = keyword_engine.analyze_reviews(data["reviews"])
                top_complaints = [
                    p["category"] for p in lang_keywords.get("pain_points", [])[:3]
                ]
                
                language_stats.append({
                    "language": lang,
                    "language_name": review.get('language_name', lang),
                    "market": market_info["market"],
                    "region": market_info["region"],
                    "total_reviews": data["total"],
                    "positive_reviews": data["positive"],
                    "negative_reviews": data["negative"],
                    "positive_rate": positive_rate,
                    "top_complaints": top_complaints,
                    "rating": self._get_rating(positive_rate)
                })
        
        # 카테고리별 × 언어별 매트릭스 (상위 5개 언어만)
        category_matrix = self._build_category_matrix(by_language, keyword_engine)
        
        # 인사이트
        insights = self._generate_regional_insights(language_stats)
        
        return {
            "by_language": language_stats[:15],  # 상위 15개 언어
            "category_matrix": category_matrix,
            "insights": insights,
            "total_languages": len(language_stats)
        }
    
    def _get_rating(self, positive_rate: float) -> str:
        """긍정률에 따른 등급"""
        if positive_rate >= 85:
            return "excellent"
        elif positive_rate >= 70:
            return "good"
        elif positive_rate >= 50:
            return "mixed"
        else:
            return "poor"
    
    def _build_category_matrix(self, by_language: dict, keyword_engine: KeywordEngine) -> List[dict]:
        """언어 × 카테고리 매트릭스"""
        matrix = []
        
        # 상위 10개 언어만
        top_languages = sorted(by_language.items(), key=lambda x: -x[1]["total"])[:10]
        
        categories = ["combat", "gameplay", "content", "performance", "graphics"]
        
        for lang, data in top_languages:
            if data["total"] >= 10:
                lang_analysis = keyword_engine.analyze_reviews(data["reviews"])
                cat_scores = lang_analysis.get("category_scores", {})
                
                row = {
                    "language": lang,
                    "total": data["total"]
                }
                
                for cat in categories:
                    if cat in cat_scores:
                        # 긍정률을 점수로 사용
                        score = cat_scores[cat].get("positive_rate", 50)
                        row[cat] = score
                    else:
                        row[cat] = None
                
                matrix.append(row)
        
        return matrix
    
    def _generate_regional_insights(self, language_stats: List[dict]) -> List[dict]:
        """지역별 인사이트"""
        insights = []
        
        if not language_stats:
            return insights
        
        # 전체 평균 계산
        total_positive = sum(l["positive_reviews"] for l in language_stats)
        total_reviews = sum(l["total_reviews"] for l in language_stats)
        avg_positive_rate = total_positive / total_reviews * 100 if total_reviews > 0 else 0
        
        # 평균 대비 크게 낮은 시장 찾기
        for lang in language_stats:
            if lang["total_reviews"] >= 50:  # 충분한 샘플
                diff = lang["positive_rate"] - avg_positive_rate
                if diff < -15:
                    insights.append({
                        "type": "warning",
                        "title": f"{lang['region']} 시장 도전 과제",
                        "description": f"{lang['language_name']} 긍정률 {lang['positive_rate']}% (평균 대비 {diff:.1f}%p 낮음)",
                        "top_issues": lang["top_complaints"],
                        "recommendation": f"{lang['region']} 시장 특화 이슈 분석 및 로컬라이징 품질 점검 필요"
                    })
                elif diff > 15:
                    insights.append({
                        "type": "positive",
                        "title": f"{lang['region']} 시장 성공 사례",
                        "description": f"{lang['language_name']} 긍정률 {lang['positive_rate']}% (평균 대비 +{diff:.1f}%p)",
                        "recommendation": f"{lang['region']} 시장 마케팅 강화 및 성공 요인 분석"
                    })
        
        return insights


# ============================================
# 시계열 분석 엔진
# ============================================

class TimeSeriesEngine:
    """시간에 따른 트렌드 분석"""
    
    def analyze(self, reviews: List[dict]) -> dict:
        """시계열 분석"""
        
        if not reviews:
            return {"timeline": [], "trends": [], "velocity": {}}
        
        # 날짜별 그룹핑
        by_date = defaultdict(lambda: {"positive": 0, "negative": 0, "total": 0})
        
        for review in reviews:
            timestamp = review.get('timestamp_created', 0)
            if timestamp:
                date_str = datetime.fromtimestamp(timestamp).strftime('%Y-%m-%d')
                by_date[date_str]["total"] += 1
                if review.get('recommended'):
                    by_date[date_str]["positive"] += 1
                else:
                    by_date[date_str]["negative"] += 1
        
        # 타임라인 정리
        timeline = []
        for date_str in sorted(by_date.keys()):
            data = by_date[date_str]
            positive_rate = round(data["positive"] / data["total"] * 100, 1) if data["total"] > 0 else 0
            timeline.append({
                "date": date_str,
                "total": data["total"],
                "positive": data["positive"],
                "negative": data["negative"],
                "positive_rate": positive_rate
            })
        
        # 최근 동향 (최근 7일 vs 이전 7일)
        velocity = self._calculate_velocity(timeline)
        
        # 트렌드 감지
        trends = self._detect_trends(timeline)
        
        return {
            "timeline": timeline[-30:],  # 최근 30일
            "velocity": velocity,
            "trends": trends
        }
    
    def _calculate_velocity(self, timeline: List[dict]) -> dict:
        """리뷰 속도 변화 계산"""
        if len(timeline) < 14:
            return {"change": 0, "description": "데이터 부족"}
        
        recent_7 = timeline[-7:]
        prev_7 = timeline[-14:-7]
        
        recent_total = sum(d["total"] for d in recent_7)
        prev_total = sum(d["total"] for d in prev_7)
        
        recent_positive_rate = (
            sum(d["positive"] for d in recent_7) / recent_total * 100 
            if recent_total > 0 else 0
        )
        prev_positive_rate = (
            sum(d["positive"] for d in prev_7) / prev_total * 100 
            if prev_total > 0 else 0
        )
        
        volume_change = ((recent_total - prev_total) / prev_total * 100) if prev_total > 0 else 0
        sentiment_change = recent_positive_rate - prev_positive_rate
        
        return {
            "recent_7d_reviews": recent_total,
            "prev_7d_reviews": prev_total,
            "volume_change_percent": round(volume_change, 1),
            "recent_positive_rate": round(recent_positive_rate, 1),
            "prev_positive_rate": round(prev_positive_rate, 1),
            "sentiment_change": round(sentiment_change, 1),
            "trend": "up" if sentiment_change > 5 else "down" if sentiment_change < -5 else "stable"
        }
    
    def _detect_trends(self, timeline: List[dict]) -> List[dict]:
        """트렌드 이상 감지"""
        trends = []
        
        if len(timeline) < 7:
            return trends
        
        # 급격한 리뷰 증가 감지
        for i in range(len(timeline) - 1):
            curr = timeline[i]
            prev = timeline[i - 1] if i > 0 else None
            
            if prev and prev["total"] > 0:
                change_ratio = (curr["total"] - prev["total"]) / prev["total"]
                if change_ratio > 2 and curr["total"] >= 10:
                    trends.append({
                        "date": curr["date"],
                        "type": "spike",
                        "description": f"리뷰 급증 ({prev['total']} → {curr['total']})",
                        "positive_rate": curr["positive_rate"]
                    })
        
        return trends


# ============================================
# Pain Points 매트릭스 엔진
# ============================================

class PainPointsEngine:
    """Pain Points 우선순위 매트릭스"""
    
    def analyze(self, keyword_results: dict, total_reviews: int) -> dict:
        """
        Pain Points를 빈도 × 영향도로 분류
        
        4분면 매트릭스:
        - Critical (긴급): 높은 빈도 + 높은 영향도
        - Important (중요): 낮은 빈도 + 높은 영향도
        - Monitor (모니터링): 높은 빈도 + 낮은 영향도
        - Minor (경미): 낮은 빈도 + 낮은 영향도
        """
        
        pain_points = []
        
        # 키워드에서 부정적인 것들 추출
        for kw in keyword_results.get("top_keywords", []):
            if not kw.get("is_positive_keyword") and kw["negative_reviews"] > 0:
                frequency = kw["count"] / total_reviews * 100
                # 영향도 = 부정 리뷰에서의 출현율
                neg_ratio = kw["negative_reviews"] / kw["count"] * 100 if kw["count"] > 0 else 0
                
                pain_points.append({
                    "keyword": kw["keyword"],
                    "category": kw["category"],
                    "frequency": round(frequency, 2),
                    "impact": round(neg_ratio, 1),
                    "count": kw["count"],
                    "negative_count": kw["negative_reviews"]
                })
        
        # 카테고리별 Pain Points
        for cat, scores in keyword_results.get("category_scores", {}).items():
            if scores["negative_mentions"] > scores["positive_mentions"]:
                frequency = scores["total_mentions"] / total_reviews * 100
                impact = abs(scores["sentiment_score"])
                
                pain_points.append({
                    "keyword": cat,
                    "category": cat,
                    "frequency": round(frequency, 2),
                    "impact": impact,
                    "count": scores["total_mentions"],
                    "negative_count": scores["negative_mentions"],
                    "is_category": True
                })
        
        # 분류
        matrix = {
            "critical": [],    # 높은 빈도 + 높은 영향도
            "important": [],   # 낮은 빈도 + 높은 영향도
            "monitor": [],     # 높은 빈도 + 낮은 영향도
            "minor": []        # 낮은 빈도 + 낮은 영향도
        }
        
        freq_threshold = 5  # 5% 이상이면 높은 빈도
        impact_threshold = 50  # 50% 이상이면 높은 영향도
        
        for pp in pain_points:
            high_freq = pp["frequency"] >= freq_threshold
            high_impact = pp["impact"] >= impact_threshold
            
            if high_freq and high_impact:
                matrix["critical"].append(pp)
            elif not high_freq and high_impact:
                matrix["important"].append(pp)
            elif high_freq and not high_impact:
                matrix["monitor"].append(pp)
            else:
                matrix["minor"].append(pp)
        
        # 정렬 (빈도 × 영향도)
        for key in matrix:
            matrix[key].sort(key=lambda x: x["frequency"] * x["impact"], reverse=True)
            matrix[key] = matrix[key][:5]  # 각 카테고리 최대 5개
        
        # 스프린트 추천
        sprints = self._generate_sprint_plan(matrix)
        
        return {
            "matrix": matrix,
            "all_pain_points": sorted(pain_points, key=lambda x: x["frequency"] * x["impact"], reverse=True)[:20],
            "sprint_plan": sprints
        }
    
    def _generate_sprint_plan(self, matrix: dict) -> List[dict]:
        """스프린트 실행 계획 생성"""
        sprints = []
        
        # Sprint 1 (긴급 - 1-2주)
        if matrix["critical"]:
            sprint1_items = [p["keyword"] for p in matrix["critical"][:3]]
            sprints.append({
                "sprint": "Sprint 1 (긴급 - 1-2주)",
                "focus": "Critical Issues",
                "items": sprint1_items,
                "goal": "주요 불만 요소 즉시 대응"
            })
        
        # Sprint 2-3 (단기 - 3-6주)
        important_items = [p["keyword"] for p in matrix["important"][:3]]
        if important_items:
            sprints.append({
                "sprint": "Sprint 2-3 (단기 - 3-6주)",
                "focus": "Important Issues",
                "items": important_items,
                "goal": "영향도 높은 이슈 해결"
            })
        
        return sprints


# ============================================
# 메인 분석기 클래스
# ============================================

class ReviewAnalyzer:
    """통합 리뷰 분석기"""
    
    def __init__(self, api_key: Optional[str] = None, provider: str = "claude"):
        self.api_key = api_key
        self.provider = provider.lower()
        
        # 분석 엔진 초기화
        self.keyword_engine = KeywordEngine()
        self.playtime_engine = PlaytimeEngine()
        self.regional_engine = RegionalEngine()
        self.timeseries_engine = TimeSeriesEngine()
        self.painpoints_engine = PainPointsEngine()
        
        # API 설정
        if self.provider == "openai":
            self.api_url = "https://api.openai.com/v1/chat/completions"
            self.model = "gpt-4o"
        elif self.provider == "gemini":
            self.api_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"
            self.model = "gemini-1.5-flash"
        else:
            self.api_url = "https://api.anthropic.com/v1/messages"
            self.model = "claude-sonnet-4-20250514"
    
    def analyze(self, crawl_result: dict) -> dict:
        """전체 분석 수행"""
        
        if not crawl_result.get('success'):
            return {"success": False, "error": "크롤링 결과가 없습니다."}
        
        reviews = crawl_result.get('reviews', [])
        if not reviews:
            return {"success": False, "error": "분석할 리뷰가 없습니다."}
        
        # 1. 정량 분석 (API 키 없이도 가능)
        quantitative = self._run_quantitative_analysis(reviews)
        
        # 2. AI 정성 분석 (API 키 필요)
        qualitative = {}
        if self.api_key:
            try:
                qualitative = self._run_ai_analysis(crawl_result, quantitative)
            except Exception as e:
                qualitative = {"error": str(e), "note": "AI 분석 실패, 정량 분석 결과만 제공"}
        
        return {
            "success": True,
            "game_info": crawl_result['game_info'],
            "statistics": crawl_result['statistics'],
            "analysis": {
                **quantitative,
                "ai_insights": qualitative
            }
        }
    
    def analyze_without_api(self, crawl_result: dict) -> dict:
        """API 없이 정량 분석만 수행"""
        
        if not crawl_result.get('success'):
            return {"success": False, "error": "크롤링 결과가 없습니다."}
        
        reviews = crawl_result.get('reviews', [])
        quantitative = self._run_quantitative_analysis(reviews)
        
        return {
            "success": True,
            "game_info": crawl_result['game_info'],
            "statistics": crawl_result['statistics'],
            "analysis": {
                **quantitative,
                "note": "전체 AI 인사이트를 위해 API 키를 설정해주세요."
            }
        }
    
    def _run_quantitative_analysis(self, reviews: List[dict]) -> dict:
        """정량 분석 실행"""
        
        total_reviews = len(reviews)
        
        # 키워드 분석
        keyword_results = self.keyword_engine.analyze_reviews(reviews)
        
        # 플레이타임 분석
        playtime_results = self.playtime_engine.analyze(reviews)
        
        # 지역별 분석
        regional_results = self.regional_engine.analyze(reviews, self.keyword_engine)
        
        # 시계열 분석
        timeseries_results = self.timeseries_engine.analyze(reviews)
        
        # Pain Points 매트릭스
        painpoints_results = self.painpoints_engine.analyze(keyword_results, total_reviews)
        
        # Executive Summary 생성
        executive_summary = self._generate_executive_summary(
            reviews, keyword_results, playtime_results, regional_results, painpoints_results
        )
        
        return {
            "executive_summary": executive_summary,
            "keyword_analysis": keyword_results,
            "playtime_analysis": playtime_results,
            "regional_analysis": regional_results,
            "timeseries_analysis": timeseries_results,
            "pain_points": painpoints_results
        }
    
    def _generate_executive_summary(self, reviews, keyword_results, playtime_results, 
                                     regional_results, painpoints_results) -> dict:
        """Executive Summary 생성"""
        
        total = len(reviews)
        positive = sum(1 for r in reviews if r.get('recommended'))
        positive_rate = round(positive / total * 100, 1) if total > 0 else 0
        
        # Risk Score 계산 (치명적 키워드 비율)
        critical_keywords = ["crash", "bug", "refund", "broken", "unplayable", "튕김", "버그", "환불"]
        critical_count = sum(1 for r in reviews 
                           for kw in critical_keywords 
                           if kw in r.get('review_text', '').lower())
        risk_score = min(round(critical_count / total * 100), 100) if total > 0 else 0
        
        # Price Valuation
        value_positive = ["worth", "value", "free", "가성비", "혜자", "돈값"]
        value_negative = ["overpriced", "expensive", "창렬", "비쌈"]
        value_pos_count = sum(1 for r in reviews for kw in value_positive if kw in r.get('review_text', '').lower())
        value_neg_count = sum(1 for r in reviews for kw in value_negative if kw in r.get('review_text', '').lower())
        
        if value_pos_count > value_neg_count * 2:
            price_valuation = "혜자"
        elif value_neg_count > value_pos_count * 2:
            price_valuation = "창렬"
        else:
            price_valuation = "적정"
        
        # 3대 전략 인사이트
        strategic_insights = []
        
        # 1. 온보딩 이슈 체크
        onboarding_group = next((g for g in playtime_results.get("groups", []) if g["range"] == "0-2h"), None)
        if onboarding_group and onboarding_group["positive_rate"] < 40:
            strategic_insights.append({
                "title": "🚨 초기 이탈 위험",
                "description": f"0-2시간 플레이어 긍정률 {onboarding_group['positive_rate']}%로 심각",
                "priority": "critical",
                "action": "온보딩 경험 즉시 개선 필요"
            })
        
        # 2. Critical Pain Points
        critical_pains = painpoints_results.get("matrix", {}).get("critical", [])
        if critical_pains:
            strategic_insights.append({
                "title": "⚠️ 핵심 불만 요소",
                "description": f"주요 이슈: {', '.join([p['keyword'] for p in critical_pains[:3]])}",
                "priority": "high",
                "action": "스프린트 1에서 즉시 대응"
            })
        
        # 3. 지역별 이슈
        low_regions = [r for r in regional_results.get("by_language", []) 
                      if r["total_reviews"] >= 50 and r["positive_rate"] < 60]
        if low_regions:
            strategic_insights.append({
                "title": "🌍 지역별 도전 과제",
                "description": f"저평가 시장: {', '.join([r['region'] for r in low_regions[:2]])}",
                "priority": "medium",
                "action": "현지화 및 지역 특화 이슈 분석"
            })
        
        # 긍정적 인사이트 추가
        if positive_rate >= 80:
            strategic_insights.append({
                "title": "✅ 전반적 호평",
                "description": f"긍정률 {positive_rate}%로 우수한 평가",
                "priority": "positive",
                "action": "현재 강점 유지 및 마케팅 강화"
            })
        
        # 최대 3개만
        strategic_insights = strategic_insights[:3]
        
        return {
            "total_reviews": total,
            "positive_rate": positive_rate,
            "risk_score": risk_score,
            "price_valuation": price_valuation,
            "strategic_insights": strategic_insights,
            "review_velocity": playtime_results.get("velocity", {})
        }
    
    def _run_ai_analysis(self, crawl_result: dict, quantitative: dict) -> dict:
        """AI 기반 정성 분석"""
        
        prompt = self._build_ai_prompt(crawl_result, quantitative)
        
        try:
            if self.provider == "openai":
                response = self._call_openai_api(prompt)
            elif self.provider == "gemini":
                response = self._call_gemini_api(prompt)
            else:
                response = self._call_claude_api(prompt)
            
            return self._parse_ai_response(response)
        except Exception as e:
            return {"error": str(e)}
    
    def _build_ai_prompt(self, crawl_result: dict, quantitative: dict) -> str:
        """AI 분석 프롬프트 생성"""
        
        game_info = crawl_result['game_info']
        stats = crawl_result['statistics']
        reviews = crawl_result['reviews']
        
        # 샘플 리뷰 (긍정/부정 각각)
        positive_samples = [r for r in reviews if r.get('recommended')][:10]
        negative_samples = [r for r in reviews if not r.get('recommended')][:10]
        
        reviews_text = "\n## 긍정 리뷰 샘플\n"
        for r in positive_samples:
            reviews_text += f"- [{r.get('language_name')}] {r.get('review_text', '')[:300]}\n"
        
        reviews_text += "\n## 부정 리뷰 샘플\n"
        for r in negative_samples:
            reviews_text += f"- [{r.get('language_name')}] {r.get('review_text', '')[:300]}\n"
        
        # Pain Points 정보
        pain_points_text = ""
        for pp in quantitative.get("pain_points", {}).get("matrix", {}).get("critical", [])[:5]:
            pain_points_text += f"- {pp['keyword']}: {pp['count']}회 언급, 영향도 {pp['impact']}%\n"
        
        prompt = f"""당신은 게임 업계 최고의 데이터 분석 전문가입니다.
아래 데이터를 분석하여 PM이 즉시 활용할 수 있는 심층 인사이트를 제공해주세요.

# 게임 정보
- 게임명: {game_info.get('name')}
- 개발사: {', '.join(game_info.get('developers', []))}
- 출시일: {game_info.get('release_date')}

# 통계 요약
- 총 리뷰: {stats.get('total_reviews')}개
- 긍정률: {stats.get('positive_rate')}%
- 평균 플레이타임: {stats.get('average_playtime_hours')}시간

# 정량 분석 결과
## Critical Pain Points
{pain_points_text}

## 플레이타임 분석
{json.dumps(quantitative.get('playtime_analysis', {}).get('groups', []), ensure_ascii=False, indent=2)}

# 리뷰 샘플
{reviews_text}

---

위 데이터를 바탕으로 다음 JSON 형식으로 인사이트를 제공해주세요:

```json
{{
  "deep_insights": [
    {{
      "title": "인사이트 제목",
      "description": "상세 설명",
      "evidence": "근거 데이터",
      "recommendation": "권장 액션"
    }}
  ],
  "competitor_analysis": {{
    "mentioned_games": ["경쟁작 목록"],
    "our_position": "우리 게임의 포지셔닝",
    "differentiation": "차별화 포인트"
  }},
  "action_roadmap": {{
    "immediate": ["즉시 액션"],
    "short_term": ["단기 액션 (1-3개월)"],
    "long_term": ["장기 액션 (3개월+)"]
  }},
  "risk_assessment": {{
    "level": "high/medium/low",
    "main_risks": ["주요 리스크"],
    "mitigation": ["완화 전략"]
  }}
}}
```

JSON만 반환하세요."""

        return prompt
    
    def _call_claude_api(self, prompt: str) -> str:
        """Claude API 호출"""
        headers = {
            "Content-Type": "application/json",
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01"
        }
        
        data = {
            "model": self.model,
            "max_tokens": 4000,
            "messages": [{"role": "user", "content": prompt}]
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
            "max_tokens": 4000,
            "messages": [
                {"role": "system", "content": "You are a game industry expert. Respond only in JSON."},
                {"role": "user", "content": prompt}
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
        """Gemini API 호출"""
        url = f"{self.api_url}?key={self.api_key}"
        headers = {"Content-Type": "application/json"}
        
        data = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"maxOutputTokens": 4000}
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
    
    def _parse_ai_response(self, response: str) -> dict:
        """AI 응답 파싱"""
        response = response.strip()
        
        if '```json' in response:
            start = response.find('```json') + 7
            end = response.find('```', start)
            response = response[start:end].strip()
        elif '```' in response:
            start = response.find('```') + 3
            end = response.find('```', start)
            response = response[start:end].strip()
        
        try:
            return json.loads(response)
        except:
            return {"raw_response": response}


# ============================================
# 테스트
# ============================================

if __name__ == "__main__":
    print("🔬 Advanced Analyzer Test")
    print("=" * 50)
    
    # 샘플 데이터로 테스트
    from sample_data import get_sample_data
    
    sample = get_sample_data()
    analyzer = ReviewAnalyzer()
    
    result = analyzer.analyze_without_api(sample)
    
    if result['success']:
        print(f"✅ 게임: {result['game_info']['name']}")
        print(f"\n📊 Executive Summary:")
        exec_sum = result['analysis']['executive_summary']
        print(f"   - 긍정률: {exec_sum['positive_rate']}%")
        print(f"   - Risk Score: {exec_sum['risk_score']}")
        print(f"   - Price Valuation: {exec_sum['price_valuation']}")
        
        print(f"\n🎯 Strategic Insights:")
        for insight in exec_sum['strategic_insights']:
            print(f"   - {insight['title']}: {insight['description']}")
        
        print(f"\n⚠️ Critical Pain Points:")
        critical = result['analysis']['pain_points']['matrix']['critical']
        for pp in critical[:3]:
            print(f"   - {pp['keyword']}: {pp['count']}회, 영향도 {pp['impact']}%")
    else:
        print(f"❌ Error: {result.get('error')}")
