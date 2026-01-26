"""
Steam Review Analyzer - Advanced Analysis Engine v2.0
=====================================================
PM을 위한 심층 게임 리뷰 분석 엔진

5개 핵심 모듈:
1. Executive Dashboard - 의사결정을 위한 1분 요약
2. Game UX Deep-dive - 재미와 완성도 정밀 진단
3. Player Journey - 플레이타임별 유저 경험 분석
4. Tech & Market Hygiene - 기술 안정성 및 국가별 반응
5. LiveOps & Meta - 업데이트 및 경쟁작 분석

Author: Chang yoon
Version: 2.0.0
"""

import json
import re
import math
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Optional, Dict, List, Tuple, Any
import urllib.request
import urllib.error

# ============================================
# 시드 키워드 사전 (확장판)
# ============================================

SEED_KEYWORDS = {
    # ===== MODULE 2: GAME UX DEEP-DIVE =====
    
    # Group A. Core Gameplay (핵심 재미)
    "combat": {
        "name": "Combat (전투/액션)",
        "group": "Core Gameplay",
        "positive": [
            "combat", "fighting", "gunplay", "shooting", "action",
            "impactful", "satisfying", "tight", "responsive", "smooth",
            "hit feedback", "melee", "fluid",
            "전투", "타격감", "손맛", "액션", "조작감", "쏘는맛", "타격"
        ],
        "negative": [
            "clunky", "sluggish", "unresponsive", "floaty", "weak",
            "hitbox", "hit detection", "input lag", "delay", "stiff",
            "느림", "답답", "둔탁", "판정", "렉", "딜레이"
        ]
    },
    "loop_difficulty": {
        "name": "Loop & Difficulty (게임성/반복)",
        "group": "Core Gameplay",
        "positive": [
            "addictive", "engaging", "fun loop", "challenging", "fair",
            "balanced", "rewarding", "skill-based", "replayable",
            "중독", "재미", "도전", "공정", "밸런스", "보람"
        ],
        "negative": [
            "repetitive", "boring", "tedious", "grindy", "grind",
            "unfair", "unbalanced", "frustrating", "cheap", "bullet sponge",
            "반복", "노가다", "숙제", "불공정", "밸붕", "억까"
        ]
    },
    
    # Group B. Content & Progression (볼륨/성장)
    "content_volume": {
        "name": "Content Volume (콘텐츠 양)",
        "group": "Content & Progression",
        "positive": [
            "content", "lots of content", "tons of content", "endgame",
            "replayable", "variety", "diverse", "hours of content",
            "콘텐츠", "볼륨", "할거많", "엔드게임", "다양"
        ],
        "negative": [
            "lack of content", "no content", "empty", "shallow", "short",
            "nothing to do", "no endgame", "needs more content",
            "콘텐츠부족", "할게없", "짧", "얕", "볼륨부족"
        ]
    },
    "progression_loot": {
        "name": "Progression & Loot (성장/파밍)",
        "group": "Content & Progression",
        "positive": [
            "progression", "rewarding", "satisfying progression",
            "build variety", "character growth", "exciting loot", "good drops",
            "성장", "육성", "빌드", "파밍", "보람", "득템"
        ],
        "negative": [
            "paywall", "pay to win", "p2w", "timegate", "time-gated",
            "pointless", "rng hell", "bad rng", "no drops",
            "현질", "과금", "페이월", "성장벽", "확률", "랜덤지옥"
        ]
    },
    "story_narrative": {
        "name": "Story & Narrative (서사)",
        "group": "Content & Progression",
        "positive": [
            "story", "narrative", "lore", "immersive", "emotional",
            "characters", "world building", "plot",
            "스토리", "서사", "세계관", "몰입", "캐릭터", "감동"
        ],
        "negative": [
            "no story", "boring story", "cringe", "bad writing",
            "generic", "cliche", "bad localization", "translation",
            "스토리없", "유치", "오글", "진부", "번역"
        ]
    },
    
    # Group C. Polish & System (완성도)
    "immersion": {
        "name": "Immersion (Audio/Art)",
        "group": "Polish & System",
        "positive": [
            "graphics", "beautiful", "stunning", "gorgeous", "visual",
            "art style", "sound", "audio", "music", "ost", "soundtrack",
            "atmosphere", "immersive",
            "그래픽", "예쁜", "비주얼", "아트", "사운드", "음악", "분위기"
        ],
        "negative": [
            "ugly", "outdated", "bad graphics", "generic art",
            "bad sound", "no music", "sound bug",
            "못생긴", "구린", "양산형", "사운드버그"
        ]
    },
    "ui_ux_qol": {
        "name": "UI/UX & QoL",
        "group": "Polish & System",
        "positive": [
            "ui", "ux", "interface", "intuitive", "clean", "qol",
            "quality of life", "user friendly", "accessible",
            "ui좋", "인터페이스", "직관적", "편의성"
        ],
        "negative": [
            "bad ui", "clunky ui", "confusing", "unintuitive",
            "menu", "inventory", "too many clicks", "cluttered",
            "ui불편", "인벤토리", "메뉴", "복잡", "불편", "클릭"
        ]
    },
    
    # Group D. Mode Specific (조건부)
    "multiplayer": {
        "name": "Multiplayer",
        "group": "Mode Specific",
        "positive": [
            "coop", "co-op", "multiplayer", "friends", "team", "squad",
            "matchmaking", "pvp", "online",
            "협동", "코옵", "멀티", "친구", "팀", "파티"
        ],
        "negative": [
            "solo unfriendly", "forced coop", "no matchmaking", "dead game",
            "toxic", "no players", "empty servers",
            "솔로불가", "강제파티", "매칭안됨", "유저없"
        ]
    },
    "singleplayer": {
        "name": "Singleplayer",
        "group": "Mode Specific",
        "positive": [
            "single player", "solo", "offline", "story mode",
            "싱글", "솔로", "오프라인"
        ],
        "negative": [
            "always online", "forced online", "no offline",
            "상시온라인", "오프라인안됨"
        ]
    },
    
    # ===== MODULE 4: TECH HEALTH =====
    "crash_freeze": {
        "name": "Crash/Freeze (튕김)",
        "group": "Technical",
        "positive": ["stable", "no crashes", "solid", "안정", "안튕김"],
        "negative": [
            "crash", "crashes", "crashing", "freeze", "freezing",
            "ctd", "not launching", "won't start",
            "튕김", "크래시", "멈춤", "프리징", "실행안됨"
        ]
    },
    "fps_optimization": {
        "name": "FPS/Stutter (최적화)",
        "group": "Technical",
        "positive": [
            "smooth", "optimized", "stable fps", "60fps", "144fps",
            "runs well", "good performance",
            "최적화", "부드러움", "프레임좋"
        ],
        "negative": [
            "lag", "stutter", "stuttering", "fps drop", "frame drop",
            "poorly optimized", "unoptimized", "low fps",
            "렉", "스터터", "프레임드랍", "최적화안됨"
        ]
    },
    "network_server": {
        "name": "Network (서버/핑)",
        "group": "Technical",
        "positive": [
            "stable server", "good connection", "low ping",
            "서버안정", "핑좋", "연결좋"
        ],
        "negative": [
            "server", "servers down", "disconnect", "connection",
            "high ping", "desync", "netcode", "lag",
            "서버", "연결끊김", "핑높", "렉", "싱크"
        ]
    },
    "cheating": {
        "name": "Cheating (핵)",
        "group": "Technical",
        "positive": [
            "no cheaters", "anti-cheat", "fair play",
            "핵없", "안티치트"
        ],
        "negative": [
            "cheater", "cheaters", "hacker", "hackers", "hack",
            "cheat", "cheating", "exploit", "aimbot",
            "핵", "치터", "해커", "핵쟁이"
        ]
    },
    
    # ===== MODULE 1: EXECUTIVE DASHBOARD =====
    "value_price": {
        "name": "BM/Price Valuation",
        "group": "Executive",
        "positive": [
            "worth", "worth it", "value", "free to play", "f2p friendly",
            "fair price", "good deal", "bang for buck",
            "가성비", "혜자", "무료게임", "돈값", "착한가격"
        ],
        "negative": [
            "overpriced", "expensive", "cash grab", "cashgrab",
            "greedy", "predatory", "dlc", "microtransaction",
            "비쌈", "창렬", "과금유도", "현질", "탐욕"
        ]
    },
    
    # ===== MODULE 3: PLAYER JOURNEY (Onboarding) =====
    "onboarding": {
        "name": "Onboarding (초반 경험)",
        "group": "Player Journey",
        "positive": [
            "tutorial", "easy to learn", "beginner friendly",
            "accessible", "good tutorial", "helpful",
            "튜토리얼좋", "입문쉬움", "초보친화"
        ],
        "negative": [
            "confusing", "no tutorial", "bad tutorial",
            "steep learning curve", "hard to learn", "overwhelming",
            "refund", "uninstall", "quit",
            "튜토리얼없", "설명없", "입문어려움", "환불", "삭제"
        ]
    },
    
    # ===== MODULE 5: LIVEOPS & META =====
    "updates_patches": {
        "name": "Updates & Patches",
        "group": "LiveOps",
        "positive": [
            "update", "updates", "patch", "new content", "dev support",
            "listening", "responsive devs", "roadmap",
            "업데이트", "패치", "신규콘텐츠", "개발자"
        ],
        "negative": [
            "no updates", "abandoned", "dead game", "no support",
            "broken patch", "nerf", "nerfed",
            "업데이트없음", "버려진", "망겜", "너프"
        ]
    }
}

# 카테고리 그룹 정의
CATEGORY_GROUPS = {
    "Core Gameplay": ["combat", "loop_difficulty"],
    "Content & Progression": ["content_volume", "progression_loot", "story_narrative"],
    "Polish & System": ["immersion", "ui_ux_qol"],
    "Mode Specific": ["multiplayer", "singleplayer"],
    "Technical": ["crash_freeze", "fps_optimization", "network_server", "cheating"],
}

# Risk Score 계산용 치명적 키워드
CRITICAL_KEYWORDS = [
    "crash", "crashes", "crashing", "bug", "bugs", "buggy",
    "broken", "unplayable", "refund", "p2w", "pay to win",
    "scam", "fraud", "don't buy", "avoid",
    "튕김", "버그", "환불", "현질", "사기", "구매금지"
]

# 경쟁작 키워드 (자주 비교되는 게임들)
COMPETITOR_GAMES = [
    "destiny", "warframe", "division", "anthem", "outriders",
    "diablo", "path of exile", "poe", "monster hunter",
    "elden ring", "dark souls", "borderlands", "looter shooter",
    "데스티니", "워프레임", "디비전", "앤썸", "디아블로"
]


# ============================================
# Module 1: Executive Dashboard Engine
# ============================================

class ExecutiveDashboardEngine:
    """Executive Dashboard 분석 엔진"""
    
    def analyze(self, reviews: List[dict], statistics: dict) -> dict:
        """Executive Dashboard 데이터 생성"""
        
        total_reviews = len(reviews)
        if total_reviews == 0:
            return self._empty_result()
        
        # 1. Review Velocity (최근 2주 리뷰 추세)
        review_velocity = self._calculate_review_velocity(reviews)
        
        # 2. Risk Score (치명적 키워드 비율)
        risk_score = self._calculate_risk_score(reviews)
        
        # 3. BM/Price Valuation
        price_valuation = self._analyze_price_valuation(reviews)
        
        # 4. 3대 전략 인사이트
        strategic_insights = self._generate_strategic_insights(
            reviews, statistics, risk_score, price_valuation
        )
        
        # 5. 워드 클라우드 데이터
        word_cloud = self._generate_word_cloud(reviews)
        
        return {
            "review_velocity": review_velocity,
            "risk_score": risk_score,
            "price_valuation": price_valuation,
            "strategic_insights": strategic_insights,
            "word_cloud": word_cloud,
            "summary": {
                "total_reviews": total_reviews,
                "positive_rate": statistics.get("positive_rate", 0),
                "average_playtime": statistics.get("average_playtime_hours", 0)
            }
        }
    
    def _calculate_review_velocity(self, reviews: List[dict]) -> dict:
        """최근 2주 리뷰 속도 분석"""
        now = datetime.now()
        two_weeks_ago = now - timedelta(days=14)
        four_weeks_ago = now - timedelta(days=28)
        
        recent_2w = []
        prev_2w = []
        
        for review in reviews:
            ts = review.get("timestamp_created", 0)
            if ts:
                dt = datetime.fromtimestamp(ts)
                if dt >= two_weeks_ago:
                    recent_2w.append(review)
                elif dt >= four_weeks_ago:
                    prev_2w.append(review)
        
        recent_count = len(recent_2w)
        prev_count = len(prev_2w)
        
        # 변화율 계산
        if prev_count > 0:
            change_rate = round((recent_count - prev_count) / prev_count * 100, 1)
        else:
            change_rate = 100 if recent_count > 0 else 0
        
        # 최근 2주 긍정률
        recent_positive = sum(1 for r in recent_2w if r.get("recommended"))
        recent_positive_rate = round(recent_positive / recent_count * 100, 1) if recent_count > 0 else 0
        
        return {
            "recent_2w_count": recent_count,
            "prev_2w_count": prev_count,
            "change_rate": change_rate,
            "trend": "급증" if change_rate > 50 else "증가" if change_rate > 10 else "유지" if change_rate > -10 else "감소",
            "recent_positive_rate": recent_positive_rate
        }
    
    def _calculate_risk_score(self, reviews: List[dict]) -> dict:
        """Risk Score 계산 (0-100)"""
        total = len(reviews)
        if total == 0:
            return {"score": 0, "level": "safe", "critical_keywords": []}
        
        # 치명적 키워드 카운트
        keyword_counts = defaultdict(int)
        affected_reviews = 0
        
        for review in reviews:
            text = review.get("review_text", "").lower()
            found_any = False
            for kw in CRITICAL_KEYWORDS:
                if kw.lower() in text:
                    keyword_counts[kw] += 1
                    found_any = True
            if found_any:
                affected_reviews += 1
        
        # Risk Score = 영향받은 리뷰 비율 × 가중치
        raw_score = (affected_reviews / total) * 100
        score = min(round(raw_score * 1.5), 100)  # 가중치 1.5
        
        # 레벨 판정
        if score >= 60:
            level = "critical"
        elif score >= 30:
            level = "warning"
        else:
            level = "safe"
        
        # 상위 키워드
        top_keywords = sorted(keyword_counts.items(), key=lambda x: -x[1])[:5]
        
        return {
            "score": score,
            "level": level,
            "affected_reviews": affected_reviews,
            "critical_keywords": [{"keyword": k, "count": v} for k, v in top_keywords]
        }
    
    def _analyze_price_valuation(self, reviews: List[dict]) -> dict:
        """BM/가격 만족도 분석"""
        positive_kw = SEED_KEYWORDS["value_price"]["positive"]
        negative_kw = SEED_KEYWORDS["value_price"]["negative"]
        
        pos_count = 0
        neg_count = 0
        pos_keywords = defaultdict(int)
        neg_keywords = defaultdict(int)
        
        for review in reviews:
            text = review.get("review_text", "").lower()
            for kw in positive_kw:
                if kw.lower() in text:
                    pos_count += 1
                    pos_keywords[kw] += 1
            for kw in negative_kw:
                if kw.lower() in text:
                    neg_count += 1
                    neg_keywords[kw] += 1
        
        # 판정
        if pos_count > neg_count * 2:
            valuation = "혜자"
            sentiment = "positive"
        elif neg_count > pos_count * 2:
            valuation = "창렬"
            sentiment = "negative"
        elif pos_count > neg_count:
            valuation = "양호"
            sentiment = "positive"
        elif neg_count > pos_count:
            valuation = "불만"
            sentiment = "negative"
        else:
            valuation = "적정"
            sentiment = "neutral"
        
        return {
            "valuation": valuation,
            "sentiment": sentiment,
            "positive_mentions": pos_count,
            "negative_mentions": neg_count,
            "top_positive": sorted(pos_keywords.items(), key=lambda x: -x[1])[:3],
            "top_negative": sorted(neg_keywords.items(), key=lambda x: -x[1])[:3]
        }
    
    def _generate_strategic_insights(self, reviews: List[dict], statistics: dict,
                                      risk_score: dict, price_valuation: dict) -> List[dict]:
        """3대 전략 인사이트 생성 (Onboarding 이슈 최우선)"""
        insights = []
        
        # 1. Onboarding 이슈 체크 (최우선)
        onboarding_issues = self._check_onboarding_issues(reviews)
        if onboarding_issues["has_issue"]:
            insights.append({
                "priority": 1,
                "type": "critical",
                "title": "🚨 초기 이탈 위험",
                "description": onboarding_issues["description"],
                "metric": f"0-2h 긍정률 {onboarding_issues['rate']}%",
                "action": "온보딩 경험 즉시 개선 - 튜토리얼 강화, 초반 보상 추가"
            })
        
        # 2. Risk Score 기반
        if risk_score["level"] == "critical":
            insights.append({
                "priority": 2,
                "type": "critical",
                "title": "⚠️ 치명적 이슈 다수 발견",
                "description": f"리뷰의 {risk_score['affected_reviews']}개에서 심각한 문제 키워드 발견",
                "metric": f"Risk Score {risk_score['score']}/100",
                "action": f"긴급 점검 필요: {', '.join([k['keyword'] for k in risk_score['critical_keywords'][:3]])}"
            })
        elif risk_score["level"] == "warning":
            insights.append({
                "priority": 2,
                "type": "warning",
                "title": "⚠️ 주의 필요한 이슈",
                "description": "일부 리뷰에서 문제점 언급",
                "metric": f"Risk Score {risk_score['score']}/100",
                "action": "모니터링 및 점진적 개선 필요"
            })
        
        # 3. 가격 만족도
        if price_valuation["sentiment"] == "negative":
            insights.append({
                "priority": 3,
                "type": "warning",
                "title": "💰 가격 만족도 낮음",
                "description": f"'{price_valuation['valuation']}' 평가 - 가격 대비 가치 불만",
                "metric": f"부정 {price_valuation['negative_mentions']}회 vs 긍정 {price_valuation['positive_mentions']}회",
                "action": "가격 정책 재검토 또는 콘텐츠 보강"
            })
        elif price_valuation["sentiment"] == "positive":
            insights.append({
                "priority": 3,
                "type": "positive",
                "title": "💰 가격 만족도 높음",
                "description": f"'{price_valuation['valuation']}' 평가 - 가성비 호평",
                "metric": f"긍정 {price_valuation['positive_mentions']}회",
                "action": "현재 가격 정책 유지, 마케팅 강화"
            })
        
        # 4. 긍정률 기반
        positive_rate = statistics.get("positive_rate", 0)
        if positive_rate >= 85:
            insights.append({
                "priority": 4,
                "type": "positive",
                "title": "✅ 전반적 호평",
                "description": "유저 평가 매우 긍정적",
                "metric": f"긍정률 {positive_rate}%",
                "action": "현재 방향 유지, 신규 유저 유입에 집중"
            })
        elif positive_rate < 50:
            insights.append({
                "priority": 1,
                "type": "critical",
                "title": "🔴 심각한 평가 하락",
                "description": "과반수 유저가 부정적 평가",
                "metric": f"긍정률 {positive_rate}%",
                "action": "근본적인 문제 파악 및 대대적 개선 필요"
            })
        
        # 우선순위 정렬 후 상위 3개
        insights.sort(key=lambda x: x["priority"])
        return insights[:3]
    
    def _check_onboarding_issues(self, reviews: List[dict]) -> dict:
        """Onboarding 이슈 체크"""
        onboarding_reviews = [r for r in reviews if r.get("playtime_total_hours", 0) < 2]
        
        if len(onboarding_reviews) < 5:
            return {"has_issue": False, "rate": 0, "description": "샘플 부족"}
        
        positive = sum(1 for r in onboarding_reviews if r.get("recommended"))
        rate = round(positive / len(onboarding_reviews) * 100, 1)
        
        # 초반 키워드 분석
        onboarding_kw = SEED_KEYWORDS["onboarding"]["negative"]
        issue_count = 0
        for r in onboarding_reviews:
            text = r.get("review_text", "").lower()
            if any(kw.lower() in text for kw in onboarding_kw):
                issue_count += 1
        
        has_issue = rate < 40 or issue_count > len(onboarding_reviews) * 0.3
        
        return {
            "has_issue": has_issue,
            "rate": rate,
            "total": len(onboarding_reviews),
            "issue_mentions": issue_count,
            "description": f"0-2시간 플레이어 긍정률 {rate}%, {issue_count}개 리뷰에서 초반 문제 언급"
        }
    
    def _generate_word_cloud(self, reviews: List[dict]) -> dict:
        """워드 클라우드 데이터 (긍정/부정 분리)"""
        positive_words = defaultdict(int)
        negative_words = defaultdict(int)
        
        for review in reviews:
            text = review.get("review_text", "").lower()
            is_positive = review.get("recommended", False)
            
            # 모든 카테고리 키워드 검색
            for cat_key, cat_data in SEED_KEYWORDS.items():
                for kw in cat_data["positive"]:
                    if kw.lower() in text:
                        if is_positive:
                            positive_words[kw] += 1
                        else:
                            negative_words[kw] += 1
                
                for kw in cat_data["negative"]:
                    if kw.lower() in text:
                        if is_positive:
                            positive_words[kw] += 1
                        else:
                            negative_words[kw] += 1
        
        return {
            "positive": [{"word": w, "count": c} for w, c in 
                        sorted(positive_words.items(), key=lambda x: -x[1])[:20]],
            "negative": [{"word": w, "count": c} for w, c in 
                        sorted(negative_words.items(), key=lambda x: -x[1])[:20]]
        }
    
    def _empty_result(self) -> dict:
        return {
            "review_velocity": {"recent_2w_count": 0, "change_rate": 0, "trend": "N/A"},
            "risk_score": {"score": 0, "level": "safe"},
            "price_valuation": {"valuation": "N/A", "sentiment": "neutral"},
            "strategic_insights": [],
            "word_cloud": {"positive": [], "negative": []}
        }


# ============================================
# Module 2: Game UX Deep-dive Engine
# ============================================

class GameUXEngine:
    """Game UX 심층 분석 엔진"""
    
    def analyze(self, reviews: List[dict]) -> dict:
        """4개 그룹별 UX 분석"""
        
        results = {
            "groups": {},
            "overall_score": 0,
            "top_strengths": [],
            "top_weaknesses": []
        }
        
        group_scores = []
        all_categories = []
        
        for group_name, categories in CATEGORY_GROUPS.items():
            if group_name == "Technical":  # Tech는 Module 4에서 처리
                continue
                
            group_data = {
                "name": group_name,
                "categories": [],
                "group_score": 0
            }
            
            category_scores = []
            
            for cat_key in categories:
                if cat_key not in SEED_KEYWORDS:
                    continue
                    
                cat_data = SEED_KEYWORDS[cat_key]
                analysis = self._analyze_category(reviews, cat_key, cat_data)
                group_data["categories"].append(analysis)
                category_scores.append(analysis["sentiment_score"])
                all_categories.append(analysis)
            
            # 그룹 평균 점수
            if category_scores:
                group_data["group_score"] = round(sum(category_scores) / len(category_scores))
                group_scores.append(group_data["group_score"])
            
            results["groups"][group_name] = group_data
        
        # 전체 평균
        if group_scores:
            results["overall_score"] = round(sum(group_scores) / len(group_scores))
        
        # 강점/약점 Top 3
        sorted_cats = sorted(all_categories, key=lambda x: x["sentiment_score"], reverse=True)
        results["top_strengths"] = [
            {"category": c["name"], "score": c["sentiment_score"], "keywords": c["top_positive"][:3]}
            for c in sorted_cats[:3] if c["sentiment_score"] > 0
        ]
        results["top_weaknesses"] = [
            {"category": c["name"], "score": c["sentiment_score"], "keywords": c["top_negative"][:3]}
            for c in sorted_cats[-3:] if c["sentiment_score"] < 0
        ]
        
        return results
    
    def _analyze_category(self, reviews: List[dict], cat_key: str, cat_data: dict) -> dict:
        """개별 카테고리 분석"""
        pos_kw = cat_data["positive"]
        neg_kw = cat_data["negative"]
        
        pos_mentions = defaultdict(int)
        neg_mentions = defaultdict(int)
        pos_in_positive_reviews = 0
        neg_in_negative_reviews = 0
        total_mentions = 0
        
        for review in reviews:
            text = review.get("review_text", "").lower()
            is_positive = review.get("recommended", False)
            
            found_pos = False
            found_neg = False
            
            for kw in pos_kw:
                if kw.lower() in text:
                    pos_mentions[kw] += 1
                    found_pos = True
            
            for kw in neg_kw:
                if kw.lower() in text:
                    neg_mentions[kw] += 1
                    found_neg = True
            
            if found_pos and is_positive:
                pos_in_positive_reviews += 1
            if found_neg and not is_positive:
                neg_in_negative_reviews += 1
            if found_pos or found_neg:
                total_mentions += 1
        
        total_pos = sum(pos_mentions.values())
        total_neg = sum(neg_mentions.values())
        
        # Sentiment Score (-100 ~ +100)
        if total_pos + total_neg > 0:
            sentiment_score = round((total_pos - total_neg) / (total_pos + total_neg) * 100)
        else:
            sentiment_score = 0
        
        # 긍정률
        if total_mentions > 0:
            positive_rate = round(pos_in_positive_reviews / total_mentions * 100, 1)
        else:
            positive_rate = 50  # 기본값
        
        return {
            "key": cat_key,
            "name": cat_data["name"],
            "group": cat_data["group"],
            "sentiment_score": sentiment_score,
            "positive_rate": positive_rate,
            "total_mentions": total_mentions,
            "positive_mentions": total_pos,
            "negative_mentions": total_neg,
            "top_positive": sorted(pos_mentions.items(), key=lambda x: -x[1])[:5],
            "top_negative": sorted(neg_mentions.items(), key=lambda x: -x[1])[:5]
        }


# ============================================
# Module 3: Player Journey Engine
# ============================================

class PlayerJourneyEngine:
    """플레이어 여정 분석 엔진"""
    
    JOURNEY_PHASES = [
        {"key": "onboarding", "name": "0-2h", "label": "Onboarding / Refund Zone", "min": 0, "max": 2},
        {"key": "learning", "name": "2-10h", "label": "Learning Curve", "min": 2, "max": 10},
        {"key": "core", "name": "10-50h", "label": "Core Experience", "min": 10, "max": 50},
        {"key": "veteran", "name": "50h+", "label": "Retention / Endgame", "min": 50, "max": float("inf")},
    ]
    
    def analyze(self, reviews: List[dict]) -> dict:
        """플레이타임별 여정 분석"""
        
        phases = {}
        
        for phase in self.JOURNEY_PHASES:
            phase_reviews = [
                r for r in reviews
                if phase["min"] <= r.get("playtime_total_hours", 0) < phase["max"]
            ]
            
            phases[phase["key"]] = self._analyze_phase(phase, phase_reviews)
        
        # Playtime Paradox 분석
        paradox = self._analyze_playtime_paradox(reviews, phases)
        
        # 감정 곡선 데이터
        sentiment_curve = [
            {
                "phase": p["name"],
                "label": p["label"],
                "positive_rate": phases[p["key"]]["positive_rate"],
                "review_count": phases[p["key"]]["total_reviews"]
            }
            for p in self.JOURNEY_PHASES
        ]
        
        # 핵심 인사이트
        insights = self._generate_journey_insights(phases, paradox)
        
        return {
            "phases": phases,
            "playtime_paradox": paradox,
            "sentiment_curve": sentiment_curve,
            "insights": insights
        }
    
    def _analyze_phase(self, phase_info: dict, reviews: List[dict]) -> dict:
        """개별 단계 분석"""
        total = len(reviews)
        if total == 0:
            return {
                "name": phase_info["name"],
                "label": phase_info["label"],
                "total_reviews": 0,
                "positive_reviews": 0,
                "negative_reviews": 0,
                "positive_rate": 0,
                "pain_points": [],
                "highlights": []
            }
        
        positive = sum(1 for r in reviews if r.get("recommended"))
        negative = total - positive
        positive_rate = round(positive / total * 100, 1)
        
        # 단계별 Pain Points 분석
        pain_points = self._extract_pain_points(reviews, phase_info["key"])
        highlights = self._extract_highlights(reviews, phase_info["key"])
        
        return {
            "name": phase_info["name"],
            "label": phase_info["label"],
            "total_reviews": total,
            "positive_reviews": positive,
            "negative_reviews": negative,
            "positive_rate": positive_rate,
            "pain_points": pain_points,
            "highlights": highlights
        }
    
    def _extract_pain_points(self, reviews: List[dict], phase_key: str) -> List[dict]:
        """단계별 Pain Points 추출"""
        # 부정 리뷰만 대상
        negative_reviews = [r for r in reviews if not r.get("recommended")]
        if not negative_reviews:
            return []
        
        keyword_counts = defaultdict(int)
        
        # 단계별 주요 키워드
        if phase_key == "onboarding":
            focus_categories = ["onboarding", "ui_ux_qol", "crash_freeze"]
        elif phase_key == "learning":
            focus_categories = ["loop_difficulty", "combat", "ui_ux_qol"]
        elif phase_key == "core":
            focus_categories = ["content_volume", "progression_loot", "loop_difficulty"]
        else:  # veteran
            focus_categories = ["content_volume", "updates_patches", "progression_loot"]
        
        for r in negative_reviews:
            text = r.get("review_text", "").lower()
            for cat in focus_categories:
                if cat in SEED_KEYWORDS:
                    for kw in SEED_KEYWORDS[cat]["negative"]:
                        if kw.lower() in text:
                            keyword_counts[kw] += 1
        
        return [
            {"keyword": k, "count": v}
            for k, v in sorted(keyword_counts.items(), key=lambda x: -x[1])[:5]
        ]
    
    def _extract_highlights(self, reviews: List[dict], phase_key: str) -> List[dict]:
        """단계별 Highlights 추출"""
        positive_reviews = [r for r in reviews if r.get("recommended")]
        if not positive_reviews:
            return []
        
        keyword_counts = defaultdict(int)
        
        for r in positive_reviews:
            text = r.get("review_text", "").lower()
            for cat_key, cat_data in SEED_KEYWORDS.items():
                for kw in cat_data["positive"]:
                    if kw.lower() in text:
                        keyword_counts[kw] += 1
        
        return [
            {"keyword": k, "count": v}
            for k, v in sorted(keyword_counts.items(), key=lambda x: -x[1])[:5]
        ]
    
    def _analyze_playtime_paradox(self, reviews: List[dict], phases: dict) -> dict:
        """Playtime Paradox 분석 (100시간+ 비추천 유저)"""
        # 50시간 이상 플레이 후 비추천
        veteran_negative = [
            r for r in reviews
            if r.get("playtime_total_hours", 0) >= 50 and not r.get("recommended")
        ]
        
        # 100시간 이상은 더 심각
        hardcore_negative = [
            r for r in reviews
            if r.get("playtime_total_hours", 0) >= 100 and not r.get("recommended")
        ]
        
        if len(veteran_negative) < 3:
            return {
                "exists": False,
                "type": None,
                "description": "베테랑 비추천 데이터 부족"
            }
        
        # 불만 키워드 분석
        complaint_keywords = defaultdict(int)
        for r in veteran_negative:
            text = r.get("review_text", "").lower()
            # 운영/업데이트 관련
            for kw in ["update", "nerf", "patch", "abandoned", "dead", "업데이트", "너프", "망겜"]:
                if kw in text:
                    complaint_keywords[kw] += 1
            # 밸런스 관련
            for kw in ["balance", "unfair", "broken", "밸런스", "불공정"]:
                if kw in text:
                    complaint_keywords[kw] += 1
            # 콘텐츠 관련
            for kw in ["content", "endgame", "boring", "repetitive", "콘텐츠", "할게없"]:
                if kw in text:
                    complaint_keywords[kw] += 1
        
        top_complaints = sorted(complaint_keywords.items(), key=lambda x: -x[1])[:5]
        
        # 온보딩 vs 베테랑 비교
        onboarding_rate = phases.get("onboarding", {}).get("positive_rate", 50)
        veteran_rate = phases.get("veteran", {}).get("positive_rate", 50)
        
        if veteran_rate < 50 and len(hardcore_negative) >= 5:
            paradox_type = "veteran_burnout"
            description = f"{len(hardcore_negative)}명의 100시간+ 플레이어가 비추천. 주요 불만: {', '.join([k for k, v in top_complaints[:3]])}"
        elif onboarding_rate < 30 and veteran_rate > 80:
            paradox_type = "slow_burn"
            description = f"초반 긍정률 {onboarding_rate}%로 낮지만, 베테랑은 {veteran_rate}%로 높음. 'Slow Burn' 게임 특성"
        else:
            return {
                "exists": False,
                "type": None,
                "description": "정상적인 플레이타임-만족도 상관관계"
            }
        
        return {
            "exists": True,
            "type": paradox_type,
            "description": description,
            "veteran_negative_count": len(veteran_negative),
            "hardcore_negative_count": len(hardcore_negative),
            "top_complaints": [{"keyword": k, "count": v} for k, v in top_complaints]
        }
    
    def _generate_journey_insights(self, phases: dict, paradox: dict) -> List[dict]:
        """여정 인사이트 생성"""
        insights = []
        
        # 온보딩 이슈
        onboarding = phases.get("onboarding", {})
        if onboarding.get("total_reviews", 0) >= 5 and onboarding.get("positive_rate", 100) < 40:
            insights.append({
                "type": "critical",
                "phase": "0-2h",
                "title": "초기 이탈 위험",
                "description": f"긍정률 {onboarding['positive_rate']}%로 환불 가능 구간에서 이탈 위험 높음",
                "action": "튜토리얼 개선, 초반 보상 강화, 첫 인상 최적화"
            })
        
        # 학습 곡선 이슈
        learning = phases.get("learning", {})
        if learning.get("total_reviews", 0) >= 5 and learning.get("positive_rate", 100) < 60:
            insights.append({
                "type": "warning",
                "phase": "2-10h",
                "title": "학습 곡선 장벽",
                "description": f"적응 단계 긍정률 {learning['positive_rate']}%",
                "action": "난이도 조정, 가이드 시스템 강화"
            })
        
        # 베테랑 만족도
        veteran = phases.get("veteran", {})
        if veteran.get("total_reviews", 0) >= 5:
            if veteran.get("positive_rate", 0) > 85:
                insights.append({
                    "type": "positive",
                    "phase": "50h+",
                    "title": "우수한 장기 리텐션",
                    "description": f"베테랑 긍정률 {veteran['positive_rate']}%",
                    "action": "핵심 게임플레이 유지, 엔드게임 콘텐츠 확장"
                })
            elif veteran.get("positive_rate", 0) < 50:
                insights.append({
                    "type": "critical",
                    "phase": "50h+",
                    "title": "베테랑 불만족",
                    "description": f"장기 플레이어조차 {veteran['positive_rate']}%만 긍정",
                    "action": "엔드게임 콘텐츠 및 밸런스 긴급 점검"
                })
        
        # Paradox
        if paradox.get("exists"):
            insights.append({
                "type": "warning" if paradox["type"] == "slow_burn" else "critical",
                "phase": "전체",
                "title": f"Playtime Paradox: {paradox['type'].replace('_', ' ').title()}",
                "description": paradox["description"],
                "action": "장기 플레이어 피드백 심층 분석 및 대응"
            })
        
        return insights


# ============================================
# Module 4: Tech & Market Engine
# ============================================

class TechMarketEngine:
    """기술 및 시장 분석 엔진"""
    
    def analyze(self, reviews: List[dict], statistics: dict) -> dict:
        """Tech Health + Global Sentiment 분석"""
        
        tech_health = self._analyze_tech_health(reviews)
        global_sentiment = self._analyze_global_sentiment(reviews, statistics)
        
        return {
            "tech_health": tech_health,
            "global_sentiment": global_sentiment
        }
    
    def _analyze_tech_health(self, reviews: List[dict]) -> dict:
        """Tech Health Index 분석"""
        tech_categories = {
            "crash_freeze": SEED_KEYWORDS["crash_freeze"],
            "fps_optimization": SEED_KEYWORDS["fps_optimization"],
            "network_server": SEED_KEYWORDS["network_server"],
            "cheating": SEED_KEYWORDS["cheating"]
        }
        
        results = {}
        total_tech_issues = 0
        
        for cat_key, cat_data in tech_categories.items():
            neg_count = 0
            pos_count = 0
            keyword_counts = defaultdict(int)
            
            for r in reviews:
                text = r.get("review_text", "").lower()
                for kw in cat_data["negative"]:
                    if kw.lower() in text:
                        neg_count += 1
                        keyword_counts[kw] += 1
                for kw in cat_data["positive"]:
                    if kw.lower() in text:
                        pos_count += 1
            
            # 심각도 판정
            if neg_count > len(reviews) * 0.1:
                severity = "critical"
            elif neg_count > len(reviews) * 0.05:
                severity = "warning"
            elif neg_count > 0:
                severity = "minor"
            else:
                severity = "healthy"
            
            total_tech_issues += neg_count
            
            results[cat_key] = {
                "name": cat_data["name"],
                "negative_mentions": neg_count,
                "positive_mentions": pos_count,
                "severity": severity,
                "top_keywords": sorted(keyword_counts.items(), key=lambda x: -x[1])[:5]
            }
        
        # 전체 Tech Health Score
        if len(reviews) > 0:
            health_score = max(0, 100 - (total_tech_issues / len(reviews) * 200))
        else:
            health_score = 100
        
        return {
            "overall_score": round(health_score),
            "overall_status": "healthy" if health_score >= 80 else "warning" if health_score >= 50 else "critical",
            "categories": results,
            "total_issues": total_tech_issues
        }
    
    def _analyze_global_sentiment(self, reviews: List[dict], statistics: dict) -> dict:
        """국가별 감정 분석"""
        by_language = defaultdict(lambda: {
            "reviews": [],
            "positive": 0,
            "negative": 0,
            "total": 0
        })
        
        for r in reviews:
            lang = r.get("language", "unknown")
            by_language[lang]["reviews"].append(r)
            by_language[lang]["total"] += 1
            if r.get("recommended"):
                by_language[lang]["positive"] += 1
            else:
                by_language[lang]["negative"] += 1
        
        # 언어별 분석 결과
        results = []
        
        # 전체 평균 계산
        total_positive = sum(d["positive"] for d in by_language.values())
        total_all = sum(d["total"] for d in by_language.values())
        avg_positive_rate = (total_positive / total_all * 100) if total_all > 0 else 0
        
        for lang, data in sorted(by_language.items(), key=lambda x: -x[1]["total"]):
            if data["total"] < 3:
                continue
            
            positive_rate = round(data["positive"] / data["total"] * 100, 1)
            diff_from_avg = round(positive_rate - avg_positive_rate, 1)
            
            # 해당 언어 리뷰의 top complaints
            top_complaints = self._get_top_complaints(data["reviews"])
            
            results.append({
                "language": lang,
                "language_name": self._get_language_name(lang),
                "total_reviews": data["total"],
                "positive_reviews": data["positive"],
                "negative_reviews": data["negative"],
                "positive_rate": positive_rate,
                "diff_from_avg": diff_from_avg,
                "status": "above" if diff_from_avg > 5 else "below" if diff_from_avg < -5 else "average",
                "top_complaints": top_complaints
            })
        
        return {
            "by_language": results[:15],  # 상위 15개
            "average_positive_rate": round(avg_positive_rate, 1),
            "total_languages": len(results),
            "problem_markets": [r for r in results if r["diff_from_avg"] < -10][:3]
        }
    
    def _get_top_complaints(self, reviews: List[dict]) -> List[str]:
        """해당 언어 리뷰의 주요 불만"""
        negative_reviews = [r for r in reviews if not r.get("recommended")]
        if not negative_reviews:
            return []
        
        category_mentions = defaultdict(int)
        
        for r in negative_reviews:
            text = r.get("review_text", "").lower()
            for cat_key, cat_data in SEED_KEYWORDS.items():
                for kw in cat_data["negative"]:
                    if kw.lower() in text:
                        category_mentions[cat_data["name"]] += 1
                        break  # 카테고리당 1회만
        
        return [k for k, v in sorted(category_mentions.items(), key=lambda x: -x[1])[:3]]
    
    def _get_language_name(self, code: str) -> str:
        """언어 코드 → 이름"""
        names = {
            "korean": "한국어", "english": "English", "schinese": "简体中文",
            "tchinese": "繁體中文", "japanese": "日本語", "russian": "Русский",
            "german": "Deutsch", "french": "Français", "spanish": "Español",
            "brazilian": "Português-BR", "polish": "Polski", "turkish": "Türkçe"
        }
        return names.get(code, code)


# ============================================
# Module 5: LiveOps & Meta Engine
# ============================================

class LiveOpsEngine:
    """LiveOps & Meta 분석 엔진"""
    
    def analyze(self, reviews: List[dict]) -> dict:
        """패치 영향 + 경쟁작 분석"""
        
        patch_impact = self._analyze_patch_mentions(reviews)
        competitive = self._analyze_competitive_mentions(reviews)
        update_sentiment = self._analyze_update_sentiment(reviews)
        
        return {
            "patch_impact": patch_impact,
            "competitive_mentions": competitive,
            "update_sentiment": update_sentiment
        }
    
    def _analyze_patch_mentions(self, reviews: List[dict]) -> dict:
        """패치/업데이트 언급 분석"""
        patch_keywords = ["patch", "update", "hotfix", "fix", "패치", "업데이트", "핫픽스"]
        
        patch_reviews = []
        for r in reviews:
            text = r.get("review_text", "").lower()
            if any(kw in text for kw in patch_keywords):
                patch_reviews.append(r)
        
        if not patch_reviews:
            return {"mentioned": False, "count": 0}
        
        positive = sum(1 for r in patch_reviews if r.get("recommended"))
        negative = len(patch_reviews) - positive
        
        return {
            "mentioned": True,
            "count": len(patch_reviews),
            "positive": positive,
            "negative": negative,
            "positive_rate": round(positive / len(patch_reviews) * 100, 1),
            "sentiment": "positive" if positive > negative else "negative" if negative > positive else "mixed"
        }
    
    def _analyze_competitive_mentions(self, reviews: List[dict]) -> List[dict]:
        """경쟁작 언급 분석"""
        competitor_mentions = defaultdict(lambda: {
            "total": 0,
            "positive_context": 0,
            "negative_context": 0
        })
        
        for r in reviews:
            text = r.get("review_text", "").lower()
            is_positive = r.get("recommended", False)
            
            for game in COMPETITOR_GAMES:
                if game.lower() in text:
                    competitor_mentions[game]["total"] += 1
                    # 긍정 리뷰에서 언급 = 우리가 더 좋다
                    # 부정 리뷰에서 언급 = 경쟁작이 더 좋다
                    if is_positive:
                        competitor_mentions[game]["positive_context"] += 1
                    else:
                        competitor_mentions[game]["negative_context"] += 1
        
        results = []
        for game, data in sorted(competitor_mentions.items(), key=lambda x: -x[1]["total"]):
            if data["total"] >= 2:
                context = "favorable" if data["positive_context"] > data["negative_context"] else \
                         "unfavorable" if data["negative_context"] > data["positive_context"] else "neutral"
                results.append({
                    "game": game,
                    "mentions": data["total"],
                    "context": context,
                    "positive_context": data["positive_context"],
                    "negative_context": data["negative_context"]
                })
        
        return results[:10]
    
    def _analyze_update_sentiment(self, reviews: List[dict]) -> dict:
        """업데이트/운영에 대한 감정"""
        update_cat = SEED_KEYWORDS.get("updates_patches", {})
        
        pos_count = 0
        neg_count = 0
        
        for r in reviews:
            text = r.get("review_text", "").lower()
            for kw in update_cat.get("positive", []):
                if kw.lower() in text:
                    pos_count += 1
            for kw in update_cat.get("negative", []):
                if kw.lower() in text:
                    neg_count += 1
        
        return {
            "positive_mentions": pos_count,
            "negative_mentions": neg_count,
            "sentiment": "positive" if pos_count > neg_count * 1.5 else \
                        "negative" if neg_count > pos_count * 1.5 else "mixed"
        }


# ============================================
# 메인 분석기 클래스
# ============================================

class ReviewAnalyzer:
    """통합 리뷰 분석기"""
    
    def __init__(self, api_key: Optional[str] = None, provider: str = "claude"):
        self.api_key = api_key
        self.provider = provider.lower()
        
        # 분석 엔진 초기화
        self.executive_engine = ExecutiveDashboardEngine()
        self.ux_engine = GameUXEngine()
        self.journey_engine = PlayerJourneyEngine()
        self.tech_market_engine = TechMarketEngine()
        self.liveops_engine = LiveOpsEngine()
        
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
        statistics = crawl_result.get('statistics', {})
        
        if not reviews:
            return {"success": False, "error": "분석할 리뷰가 없습니다."}
        
        # 5개 모듈 분석 실행
        analysis = {
            "executive_dashboard": self.executive_engine.analyze(reviews, statistics),
            "game_ux": self.ux_engine.analyze(reviews),
            "player_journey": self.journey_engine.analyze(reviews),
            "tech_market": self.tech_market_engine.analyze(reviews, statistics),
            "liveops_meta": self.liveops_engine.analyze(reviews)
        }
        
        # AI 추가 분석 (API 키 있을 경우)
        if self.api_key:
            try:
                ai_insights = self._run_ai_analysis(crawl_result, analysis)
                analysis["ai_insights"] = ai_insights
            except Exception as e:
                analysis["ai_insights"] = {"error": str(e)}
        
        return {
            "success": True,
            "game_info": crawl_result.get('game_info', {}),
            "statistics": statistics,
            "analysis": analysis
        }
    
    def analyze_without_api(self, crawl_result: dict) -> dict:
        """API 없이 분석"""
        result = self.analyze(crawl_result)
        if result.get("success"):
            result["analysis"]["note"] = "AI 심층 인사이트를 위해 API 키를 설정해주세요."
        return result
    
    def _run_ai_analysis(self, crawl_result: dict, analysis: dict) -> dict:
        """AI 추가 분석"""
        # 프롬프트 생성 및 API 호출
        prompt = self._build_ai_prompt(crawl_result, analysis)
        
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
    
    def _build_ai_prompt(self, crawl_result: dict, analysis: dict) -> str:
        """AI 분석 프롬프트"""
        game_info = crawl_result.get('game_info', {})
        stats = crawl_result.get('statistics', {})
        
        # 샘플 리뷰
        reviews = crawl_result.get('reviews', [])
        positive_samples = [r['review_text'][:200] for r in reviews if r.get('recommended')][:5]
        negative_samples = [r['review_text'][:200] for r in reviews if not r.get('recommended')][:5]
        
        prompt = f"""당신은 게임 업계 최고의 데이터 분석 전문가입니다.

# 게임: {game_info.get('name', 'Unknown')}
# 통계: 총 {stats.get('total_reviews', 0)}개 리뷰, 긍정률 {stats.get('positive_rate', 0)}%

# 분석 결과 요약:
- Risk Score: {analysis['executive_dashboard']['risk_score']['score']}/100
- 가격 만족도: {analysis['executive_dashboard']['price_valuation']['valuation']}
- Tech Health: {analysis['tech_market']['tech_health']['overall_score']}/100

# 긍정 리뷰 샘플:
{chr(10).join(['- ' + s for s in positive_samples])}

# 부정 리뷰 샘플:
{chr(10).join(['- ' + s for s in negative_samples])}

위 데이터를 바탕으로 다음 JSON을 생성해주세요:
```json
{{
  "executive_summary": "1-2문장 핵심 요약",
  "top_3_actions": [
    {{"priority": 1, "action": "액션", "reason": "이유", "impact": "예상 효과"}}
  ],
  "hidden_insights": ["발견한 숨겨진 인사이트"],
  "risk_assessment": "리스크 평가"
}}
```

JSON만 반환하세요."""

        return prompt
    
    def _call_claude_api(self, prompt: str) -> str:
        headers = {
            "Content-Type": "application/json",
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01"
        }
        data = {"model": self.model, "max_tokens": 2000, "messages": [{"role": "user", "content": prompt}]}
        req = urllib.request.Request(self.api_url, data=json.dumps(data).encode('utf-8'), headers=headers, method='POST')
        with urllib.request.urlopen(req, timeout=60) as response:
            result = json.loads(response.read().decode('utf-8'))
            return result['content'][0]['text']
    
    def _call_openai_api(self, prompt: str) -> str:
        headers = {"Content-Type": "application/json", "Authorization": f"Bearer {self.api_key}"}
        data = {"model": self.model, "max_tokens": 2000, "messages": [{"role": "user", "content": prompt}]}
        req = urllib.request.Request(self.api_url, data=json.dumps(data).encode('utf-8'), headers=headers, method='POST')
        with urllib.request.urlopen(req, timeout=60) as response:
            result = json.loads(response.read().decode('utf-8'))
            return result['choices'][0]['message']['content']
    
    def _call_gemini_api(self, prompt: str) -> str:
        url = f"{self.api_url}?key={self.api_key}"
        headers = {"Content-Type": "application/json"}
        data = {"contents": [{"parts": [{"text": prompt}]}]}
        req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers=headers, method='POST')
        with urllib.request.urlopen(req, timeout=60) as response:
            result = json.loads(response.read().decode('utf-8'))
            return result['candidates'][0]['content']['parts'][0]['text']
    
    def _parse_ai_response(self, response: str) -> dict:
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
            return {"raw": response}


# ============================================
# 테스트
# ============================================

if __name__ == "__main__":
    print("🔬 Steam Review Analyzer v2.0 Test")
    print("=" * 50)
    
    from sample_data import get_sample_data
    sample = get_sample_data()
    
    analyzer = ReviewAnalyzer()
    result = analyzer.analyze_without_api(sample)
    
    if result['success']:
        print(f"✅ Game: {result['game_info']['name']}")
        print(f"\n📊 Executive Dashboard:")
        exec_data = result['analysis']['executive_dashboard']
        print(f"   - Risk Score: {exec_data['risk_score']['score']}/100 ({exec_data['risk_score']['level']})")
        print(f"   - Price Valuation: {exec_data['price_valuation']['valuation']}")
        print(f"   - Review Velocity: {exec_data['review_velocity']['trend']}")
        
        print(f"\n🎮 Game UX Score: {result['analysis']['game_ux']['overall_score']}")
        
        print(f"\n🚀 Player Journey Paradox: {result['analysis']['player_journey']['playtime_paradox']['exists']}")
        
        print(f"\n🔧 Tech Health: {result['analysis']['tech_market']['tech_health']['overall_score']}/100")
    else:
        print(f"❌ Error: {result.get('error')}")
