"""
AI Engine - Semantic Review Analysis
Claude/GPT/Gemini 프롬프트 체인 기반 심층 분석 엔진
"""
import json
import re
from typing import Optional
from collections import Counter, defaultdict


# ─────────────────────────────────────────
# LLM Adapter (Claude / OpenAI / Gemini)
# ─────────────────────────────────────────
class LLMAdapter:
    def __init__(self, provider: str, api_key: str):
        self.provider = provider
        self.api_key = api_key

    def call(self, prompt: str, max_tokens: int = 4000) -> str:
        if self.provider == "claude":
            return self._call_claude(prompt, max_tokens)
        elif self.provider == "openai":
            return self._call_openai(prompt, max_tokens)
        elif self.provider == "gemini":
            return self._call_gemini(prompt, max_tokens)
        raise ValueError(f"Unknown provider: {self.provider}")

    def _call_claude(self, prompt: str, max_tokens: int) -> str:
        import anthropic
        client = anthropic.Anthropic(api_key=self.api_key)
        msg = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=max_tokens,
            messages=[{"role": "user", "content": prompt}]
        )
        return msg.content[0].text

    def _call_openai(self, prompt: str, max_tokens: int) -> str:
        from openai import OpenAI
        client = OpenAI(api_key=self.api_key)
        resp = client.chat.completions.create(
            model="gpt-4o",
            max_tokens=max_tokens,
            messages=[{"role": "user", "content": prompt}]
        )
        return resp.choices[0].message.content

    def _call_gemini(self, prompt: str, max_tokens: int) -> str:
        import google.generativeai as genai
        genai.configure(api_key=self.api_key)
        model = genai.GenerativeModel("gemini-1.5-pro")
        resp = model.generate_content(prompt)
        return resp.text


def parse_json(text: str) -> dict:
    """Extract JSON from LLM response safely"""
    text = text.strip()
    # Remove markdown code fences
    text = re.sub(r"```(?:json)?", "", text).replace("```", "").strip()
    # Find first { ... } or [ ... ]
    for pattern in [r'\{[\s\S]*\}', r'\[[\s\S]*\]']:
        m = re.search(pattern, text)
        if m:
            try:
                return json.loads(m.group())
            except:
                pass
    return {}


# ─────────────────────────────────────────
# Semantic Clustering (AI-based)
# ─────────────────────────────────────────
CLUSTER_PROMPT = """당신은 게임 리뷰 분석 전문가입니다.
아래 Steam 게임 리뷰 샘플 {sample_count}개를 분석하여, 의미적으로 동일한 이슈들을 클러스터링하세요.

예시:
- "튕긴다", "바탕화면으로 나가지네", "로딩 멈춤" → Client Stability
- "조작이 어렵다", "튜토리얼 없음", "처음엔 어렵지만" → Onboarding Difficulty

리뷰 샘플:
{reviews_text}

반드시 아래 JSON 형식으로만 응답하세요:
{{
  "clusters": [
    {{
      "cluster_id": "고유ID",
      "cluster_name": "클러스터 이름 (영문)",
      "cluster_name_ko": "클러스터 이름 (한국어)",
      "category": "Stability|Performance|Gameplay|Content|UX|Monetization|Social|Story|Other",
      "keywords": ["관련 키워드 목록"],
      "issue_type": "bug|feature|praise|complaint|suggestion",
      "sentiment_tendency": "positive|negative|mixed",
      "review_indices": [해당하는 리뷰 인덱스 번호들],
      "representative_quote": "가장 대표적인 리뷰 문장"
    }}
  ],
  "total_clusters": 숫자
}}"""


def semantic_clustering(reviews: list, llm: LLMAdapter) -> dict:
    """AI 기반 의미 군집화"""
    sample = reviews[:200]
    reviews_text = "\n".join([
        f"[{i}] ({r.get('language','?')}, {r.get('playtime_hours',0):.0f}h, {'👍' if r.get('voted_up') else '👎'}) {r.get('review','')[:200]}"
        for i, r in enumerate(sample)
    ])
    prompt = CLUSTER_PROMPT.format(
        sample_count=len(sample),
        reviews_text=reviews_text
    )
    raw = llm.call(prompt, max_tokens=4000)
    result = parse_json(raw)
    return result if result else {"clusters": [], "total_clusters": 0}


# ─────────────────────────────────────────
# User Persona Classification
# ─────────────────────────────────────────
PERSONA_PROMPT = """당신은 게임 유저 페르소나 분류 전문가입니다.
아래 Steam 리뷰들을 분석하여 작성자를 페르소나로 분류하세요.

페르소나 유형:
1. HARDCORE_PVP: 경쟁/PvP 중심, 메타/밸런스 민감, 고플레이타임
2. CASUAL_EXPLORER: 스토리/세계관 중시, 캐주얼 플레이, 저~중 플레이타임
3. LQA_SENSITIVE: 번역 품질/현지화 민감, 주로 비영어권
4. PERFORMANCE_FOCUSED: 최적화/버그 민감, 기술적 피드백 상세
5. CONTENT_SEEKER: 콘텐츠 볼륨/업데이트 중시, 장기 플레이어

리뷰 데이터:
{reviews_text}

반드시 아래 JSON 형식으로만 응답하세요:
{{
  "personas": {{
    "HARDCORE_PVP": {{
      "count": 숫자,
      "percentage": 숫자,
      "avg_playtime": 숫자,
      "positive_rate": 숫자,
      "top_concerns": ["주요 관심사 목록"],
      "top_praises": ["주요 칭찬 목록"],
      "representative_reviews": ["대표 리뷰 1-2개"]
    }},
    "CASUAL_EXPLORER": {{ ... }},
    "LQA_SENSITIVE": {{ ... }},
    "PERFORMANCE_FOCUSED": {{ ... }},
    "CONTENT_SEEKER": {{ ... }}
  }},
  "lqa_insights": {{
    "languages_with_issues": ["번역 이슈가 있는 언어들"],
    "common_lqa_complaints": ["공통 LQA 불만 사항"],
    "tone_by_region": {{
      "언어코드": "톤 설명"
    }}
  }}
}}"""


def classify_personas(reviews: list, llm: LLMAdapter) -> dict:
    """유저 페르소나 자동 분류"""
    sample = reviews[:150]
    reviews_text = "\n".join([
        f"[{i}] (lang:{r.get('language','?')}, {r.get('playtime_hours',0):.0f}h, {'pos' if r.get('voted_up') else 'neg'}) {r.get('review','')[:300]}"
        for i, r in enumerate(sample)
    ])
    prompt = PERSONA_PROMPT.format(reviews_text=reviews_text)
    raw = llm.call(prompt, max_tokens=3000)
    result = parse_json(raw)
    return result if result else {"personas": {}, "lqa_insights": {}}


# ─────────────────────────────────────────
# Executive Dashboard Analysis
# ─────────────────────────────────────────
EXECUTIVE_PROMPT = """당신은 게임 프로덕트 매니저(PM)를 위한 전략 분석가입니다.
아래 Steam 리뷰 통계와 샘플을 바탕으로 경영진 보고용 핵심 인사이트를 생성하세요.

게임: {game_name}
총 리뷰: {total_reviews}건
긍정률: {positive_rate}%
평균 플레이타임: {avg_playtime}h
언어 분포: {lang_dist}
플레이타임별 긍정률: {playtime_sentiment}

리뷰 샘플 (최신 50건):
{sample_reviews}

반드시 아래 JSON 형식으로만 응답하세요:
{{
  "review_velocity": {{
    "trend": "increasing|decreasing|stable",
    "description": "설명"
  }},
  "risk_score": {{
    "score": 0~100,
    "level": "low|medium|high|critical",
    "main_risks": ["주요 위험 요소들"],
    "reasoning": "산출 근거"
  }},
  "bm_valuation": {{
    "score": -100~100,
    "label": "혜자|적정|창렬",
    "worth_it_mentions": 숫자,
    "overpriced_mentions": 숫자,
    "description": "가격 인식 설명"
  }},
  "strategic_insights": [
    {{
      "title": "인사이트 제목",
      "category": "카테고리",
      "priority": "긴급|중요|모니터링",
      "evidence": "구체적 데이터 근거",
      "action_plan": "구체적 실행 방안",
      "expected_impact": "예상 효과"
    }}
  ],
  "word_cloud": {{
    "positive": ["긍정 키워드 15개"],
    "negative": ["부정 키워드 10개"]
  }},
  "ai_insights": [
    {{
      "priority": "긴급|중요|모니터링",
      "title": "인사이트 제목",
      "evidence": "데이터 기반 구체적 근거 (수치 포함)",
      "action_plan": "구체적 실행 플랜 (Sprint 단위)",
      "expected_impact": "예상 효과"
    }}
  ]
}}"""


# ─────────────────────────────────────────
# UX Deep-dive Analysis
# ─────────────────────────────────────────
UX_PROMPT = """당신은 게임 UX 분석 전문가입니다.
아래 리뷰 데이터를 바탕으로 게임플레이 UX를 4개 그룹으로 심층 분석하세요.

게임: {game_name}
리뷰 샘플:
{sample_reviews}

카테고리별 키워드 빈도:
{keyword_stats}

반드시 아래 JSON 형식으로만 응답하세요:
{{
  "group_a_core_gameplay": {{
    "combat": {{
      "score": -100~100,
      "positive_rate": 0~100,
      "mention_count": 숫자,
      "positive_keywords": ["키워드들"],
      "negative_keywords": ["키워드들"],
      "summary": "분석 요약",
      "semantic_clusters": ["의미 군집들"]
    }},
    "loop_difficulty": {{
      "score": 숫자,
      "positive_rate": 숫자,
      "mention_count": 숫자,
      "positive_keywords": [],
      "negative_keywords": [],
      "summary": "분석 요약",
      "addictive_vs_repetitive": "중독성/반복성 분석"
    }}
  }},
  "group_b_content": {{
    "content_volume": {{ "score": 숫자, "positive_rate": 숫자, "mention_count": 숫자, "summary": "요약" }},
    "progression_loot": {{ "score": 숫자, "positive_rate": 숫자, "mention_count": 숫자, "rewarding_vs_paywall": "분석", "summary": "요약" }},
    "story_narrative": {{ "score": 숫자, "positive_rate": 숫자, "mention_count": 숫자, "localization_issues": [], "summary": "요약" }}
  }},
  "group_c_polish": {{
    "immersion_audio_art": {{ "score": 숫자, "positive_rate": 숫자, "mention_count": 숫자, "summary": "요약" }},
    "ui_ux_qol": {{ "score": 숫자, "positive_rate": 숫자, "mention_count": 숫자, "qol_issues": [], "summary": "요약" }}
  }},
  "group_d_mode_specific": {{
    "pvp": {{ "score": 숫자, "positive_rate": 숫자, "mention_count": 숫자, "summary": "요약" }},
    "pve": {{ "score": 숫자, "positive_rate": 숫자, "mention_count": 숫자, "summary": "요약" }},
    "solo": {{ "score": 숫자, "positive_rate": 숫자, "mention_count": 숫자, "summary": "요약" }}
  }},
  "ai_insights": [
    {{
      "priority": "긴급|중요|모니터링",
      "title": "제목",
      "evidence": "근거",
      "action_plan": "실행 플랜",
      "expected_impact": "예상 효과"
    }}
  ]
}}"""


# ─────────────────────────────────────────
# Player Journey Analysis
# ─────────────────────────────────────────
JOURNEY_PROMPT = """당신은 게임 플레이어 여정 분석 전문가입니다.
플레이타임별 리뷰를 분석하여 유저 생애주기를 심층 분석하세요.

게임: {game_name}
플레이타임 구간별 데이터:
{playtime_data}

반드시 아래 JSON 형식으로만 응답하세요:
{{
  "onboarding": {{
    "positive_rate": 숫자,
    "review_count": 숫자,
    "top_pain_points": [
      {{"keyword": "키워드", "mention_count": 숫자, "positive_rate": 숫자, "impact": "high|medium|low"}}
    ],
    "top_praises": [
      {{"keyword": "키워드", "mention_count": 숫자, "positive_rate": 숫자}}
    ],
    "refund_risk_score": 0~100,
    "critical_issues": ["긴급 이슈들"],
    "improvement_suggestions": ["개선 제안들"]
  }},
  "learning_curve": {{
    "positive_rate": 숫자,
    "review_count": 숫자,
    "difficulty_assessment": "too_easy|balanced|too_hard",
    "key_barriers": ["주요 장벽들"],
    "summary": "요약"
  }},
  "core_experience": {{
    "positive_rate": 숫자,
    "review_count": 숫자,
    "main_loop_assessment": "excellent|good|average|poor",
    "retention_factors": ["리텐션 요소들"],
    "summary": "요약"
  }},
  "endgame": {{
    "positive_rate": 숫자,
    "review_count": 숫자,
    "content_sufficiency": "abundant|adequate|lacking",
    "veteran_complaints": ["베테랑 불만들"],
    "summary": "요약"
  }},
  "playtime_paradox": {{
    "exists": true/false,
    "description": "설명",
    "negative_veteran_count": 숫자,
    "main_reasons": ["주요 이유들"],
    "severity": "critical|moderate|minor"
  }},
  "sentiment_timeline": [
    {{"phase": "0-2h", "positive_rate": 숫자, "label": "레이블"}},
    {{"phase": "2-10h", "positive_rate": 숫자, "label": "레이블"}},
    {{"phase": "10-50h", "positive_rate": 숫자, "label": "레이블"}},
    {{"phase": "50h+", "positive_rate": 숫자, "label": "레이블"}}
  ],
  "ai_insights": [
    {{
      "priority": "긴급|중요|모니터링",
      "title": "제목",
      "evidence": "근거",
      "action_plan": "실행 플랜",
      "expected_impact": "예상 효과"
    }}
  ]
}}"""


# ─────────────────────────────────────────
# Tech & Market Analysis
# ─────────────────────────────────────────
TECH_MARKET_PROMPT = """당신은 게임 기술 분석 및 글로벌 시장 전문가입니다.
기술적 이슈와 지역별 반응을 심층 분석하세요.

게임: {game_name}
언어별 통계:
{lang_stats}

기술 관련 키워드:
{tech_keywords}

리뷰 샘플:
{sample_reviews}

반드시 아래 JSON 형식으로만 응답하세요:
{{
  "tech_health": {{
    "overall_score": 0~100,
    "crash_freeze": {{
      "mention_count": 숫자,
      "severity": "critical|high|medium|low",
      "positive_rate": 숫자,
      "top_issues": ["주요 이슈들"],
      "trend": "improving|stable|worsening"
    }},
    "fps_performance": {{
      "mention_count": 숫자,
      "severity": "critical|high|medium|low",
      "positive_rate": 숫자,
      "top_issues": ["주요 이슈들"]
    }},
    "network_server": {{
      "mention_count": 숫자,
      "severity": "critical|high|medium|low",
      "positive_rate": 숫자,
      "top_issues": ["주요 이슈들"]
    }},
    "cheating_anticheat": {{
      "mention_count": 숫자,
      "severity": "critical|high|medium|low",
      "positive_rate": 숫자,
      "community_concern_level": "high|medium|low"
    }}
  }},
  "global_sentiment": [
    {{
      "language": "언어명",
      "language_code": "코드",
      "review_count": 숫자,
      "positive_rate": 숫자,
      "grade": "excellent|good|average|poor",
      "top_complaints": ["주요 불만 키워드들"],
      "top_praises": ["주요 칭찬 키워드들"],
      "lqa_issues": ["번역/현지화 이슈들"],
      "unique_regional_concerns": "지역 특이 관심사"
    }}
  ],
  "lqa_analysis": {{
    "overall_lqa_score": 0~100,
    "problematic_languages": ["문제 언어들"],
    "common_translation_issues": ["공통 번역 이슈들"],
    "regional_tone_map": {{"언어": "톤 설명"}}
  }},
  "ai_insights": [
    {{
      "priority": "긴급|중요|모니터링",
      "title": "제목",
      "evidence": "근거",
      "action_plan": "실행 플랜",
      "expected_impact": "예상 효과"
    }}
  ]
}}"""


# ─────────────────────────────────────────
# LiveOps & Meta Analysis
# ─────────────────────────────────────────
LIVEOPS_PROMPT = """당신은 게임 운영 및 경쟁 분석 전문가입니다.
패치 영향도와 경쟁작 언급을 심층 분석하세요.

게임: {game_name}
시계열 데이터 (기간별):
{time_series_data}

경쟁작 관련 키워드:
{competitor_keywords}

리뷰 샘플:
{sample_reviews}

반드시 아래 JSON 형식으로만 응답하세요:
{{
  "patch_impact": {{
    "detected_events": [
      {{
        "period": "기간",
        "event_type": "launch|patch|hotfix|season|event",
        "sentiment_before": 숫자,
        "sentiment_after": 숫자,
        "sentiment_delta": 숫자,
        "volume_before": 숫자,
        "volume_after": 숫자,
        "positive_flip_rate": 숫자,
        "description": "설명"
      }}
    ],
    "overall_trend": "improving|stable|declining",
    "peak_period": "최고 기간",
    "low_period": "최저 기간"
  }},
  "competitive_analysis": {{
    "total_competitor_mentions": 숫자,
    "competitors": [
      {{
        "name": "게임명",
        "mention_count": 숫자,
        "context": "superior|inferior|similar|replacement",
        "sentiment": "positive|negative|neutral",
        "key_comparisons": ["주요 비교 포인트들"]
      }}
    ],
    "genre_positioning": "장르 내 포지셔닝 분석",
    "competitive_advantages": ["경쟁 우위들"],
    "competitive_disadvantages": ["경쟁 열위들"]
  }},
  "action_items": {{
    "critical": [
      {{"title": "제목", "description": "설명", "deadline": "즉시/1주/2주"}}
    ],
    "short_term": [
      {{"title": "제목", "description": "설명", "deadline": "1개월/2개월/3개월"}}
    ],
    "long_term": [
      {{"title": "제목", "description": "설명", "deadline": "3개월+/6개월+"}}
    ]
  }},
  "ai_insights": [
    {{
      "priority": "긴급|중요|모니터링",
      "title": "제목",
      "evidence": "근거",
      "action_plan": "실행 플랜",
      "expected_impact": "예상 효과"
    }}
  ]
}}"""


# ─────────────────────────────────────────
# Pain Points Matrix
# ─────────────────────────────────────────
PAIN_POINTS_PROMPT = """당신은 게임 이슈 우선순위 분석 전문가입니다.
리뷰에서 발견된 Pain Points를 빈도와 영향도로 매트릭스화하세요.

게임: {game_name}
전체 리뷰 수: {total_reviews}
부정 리뷰 샘플:
{negative_reviews}

반드시 아래 JSON 형식으로만 응답하세요:
{{
  "pain_points": [
    {{
      "id": "고유ID",
      "issue": "이슈명",
      "cluster_name": "의미 군집명",
      "frequency": 언급횟수_숫자,
      "impact_score": 0~100,
      "negative_rate": 0~100,
      "category": "Stability|Performance|Gameplay|Content|UX|Monetization|Social",
      "severity": "critical|important|monitor|minor",
      "sprint": "Sprint 1|Sprint 2|Sprint 3|Backlog",
      "sample_quotes": ["대표 리뷰 1-2개"],
      "root_cause": "근본 원인 분석",
      "fix_suggestion": "수정 제안",
      "affected_personas": ["영향받는 페르소나들"]
    }}
  ],
  "sprint_plan": {{
    "sprint_1": {{
      "duration": "1-2주",
      "items": ["이슈 ID들"],
      "goal": "목표",
      "expected_improvement": "예상 긍정률 개선치"
    }},
    "sprint_2_3": {{
      "duration": "3-6주",
      "items": ["이슈 ID들"],
      "goal": "목표"
    }},
    "backlog": {{
      "items": ["이슈 ID들"],
      "review_date": "검토 일정"
    }}
  }},
  "success_metrics": {{
    "target_reduction": "언급 40% 감소 목표",
    "target_sentiment_improvement": "긍정률 목표치",
    "kpis": ["KPI 목록들"]
  }},
  "ai_insights": [
    {{
      "priority": "긴급|중요|모니터링",
      "title": "제목",
      "evidence": "근거",
      "action_plan": "실행 플랜",
      "expected_impact": "예상 효과"
    }}
  ]
}}"""


# ─────────────────────────────────────────
# Main AI Engine Class
# ─────────────────────────────────────────
class AIEngine:
    def __init__(self, provider: str, api_key: str):
        self.llm = LLMAdapter(provider, api_key)

    def run_full_analysis(self, reviews: list, game_info: dict, statistics: dict) -> dict:
        """전체 AI 분석 파이프라인 실행"""
        game_name = game_info.get("name", "Unknown Game")
        print(f"\n🤖 AI 분석 시작: {game_name} ({len(reviews)}건)")

        # ── 기본 통계 계산 ──
        stats = self._compute_basic_stats(reviews, statistics)

        # ── 1. Semantic Clustering ──
        print("  → [1/7] Semantic Clustering...")
        clusters = semantic_clustering(reviews, self.llm)

        # ── 2. Persona Classification ──
        print("  → [2/7] Persona Classification...")
        personas = classify_personas(reviews, self.llm)

        # ── 3. Executive Dashboard ──
        print("  → [3/7] Executive Dashboard...")
        executive = self._run_executive(reviews, game_name, stats)

        # ── 4. UX Deep-dive ──
        print("  → [4/7] UX Deep-dive...")
        ux = self._run_ux(reviews, game_name, stats)

        # ── 5. Player Journey ──
        print("  → [5/7] Player Journey...")
        journey = self._run_journey(reviews, game_name, stats)

        # ── 6. Tech & Market ──
        print("  → [6/7] Tech & Market...")
        tech = self._run_tech(reviews, game_name, stats)

        # ── 7. LiveOps & Pain Points ──
        print("  → [7/7] LiveOps & Pain Points...")
        liveops = self._run_liveops(reviews, game_name, stats)
        pain_points = self._run_pain_points(reviews, game_name, stats)

        print("  ✅ AI 분석 완료!\n")

        return {
            "clusters": clusters,
            "personas": personas,
            "executive_dashboard": executive,
            "game_ux": ux,
            "player_journey": journey,
            "tech_market": tech,
            "liveops_meta": liveops,
            "pain_points_matrix": pain_points,
            "computed_stats": stats
        }

    def _compute_basic_stats(self, reviews: list, statistics: dict) -> dict:
        """기본 통계 계산"""
        total = len(reviews)
        positive = sum(1 for r in reviews if r.get("voted_up"))
        positive_rate = round(positive / total * 100, 1) if total > 0 else 0

        # 플레이타임 구간
        buckets = {"0_2h": [], "2_10h": [], "10_50h": [], "50h_plus": []}
        for r in reviews:
            pt = r.get("playtime_hours", 0)
            if pt < 2:
                buckets["0_2h"].append(r)
            elif pt < 10:
                buckets["2_10h"].append(r)
            elif pt < 50:
                buckets["10_50h"].append(r)
            else:
                buckets["50h_plus"].append(r)

        playtime_sentiment = {}
        for k, rs in buckets.items():
            if rs:
                pos = sum(1 for r in rs if r.get("voted_up"))
                playtime_sentiment[k] = {
                    "count": len(rs),
                    "positive_rate": round(pos / len(rs) * 100, 1)
                }

        # 언어별
        lang_dist = Counter(r.get("language", "unknown") for r in reviews)

        # 시계열 (날짜별)
        from collections import defaultdict
        daily = defaultdict(list)
        for r in reviews:
            ts = r.get("timestamp_created", 0)
            if ts:
                import datetime
                date = datetime.datetime.fromtimestamp(ts).strftime("%Y-%m-%d")
                daily[date].append(r)

        time_series = []
        for date in sorted(daily.keys()):
            rs = daily[date]
            pos = sum(1 for r in rs if r.get("voted_up"))
            time_series.append({
                "date": date,
                "count": len(rs),
                "positive_rate": round(pos / len(rs) * 100, 1) if rs else 0
            })

        # 언어별 상세
        lang_stats = {}
        for r in reviews:
            lang = r.get("language", "unknown")
            if lang not in lang_stats:
                lang_stats[lang] = {"total": 0, "positive": 0}
            lang_stats[lang]["total"] += 1
            if r.get("voted_up"):
                lang_stats[lang]["positive"] += 1

        for lang in lang_stats:
            t = lang_stats[lang]["total"]
            p = lang_stats[lang]["positive"]
            lang_stats[lang]["positive_rate"] = round(p / t * 100, 1) if t > 0 else 0

        return {
            "total": total,
            "positive": positive,
            "positive_rate": positive_rate,
            "playtime_sentiment": playtime_sentiment,
            "lang_dist": dict(lang_dist.most_common(15)),
            "lang_stats": lang_stats,
            "time_series": time_series,
            "avg_playtime": statistics.get("avg_playtime", 0),
            "original_stats": statistics
        }

    def _run_executive(self, reviews: list, game_name: str, stats: dict) -> dict:
        sample = reviews[:50]
        sample_text = "\n".join([
            f"({'긍정' if r.get('voted_up') else '부정'}, {r.get('playtime_hours',0):.0f}h, {r.get('language','?')}) {r.get('review','')[:200]}"
            for r in sample
        ])
        lang_dist_str = json.dumps(stats["lang_dist"], ensure_ascii=False)
        playtime_str = json.dumps(stats["playtime_sentiment"], ensure_ascii=False)

        prompt = EXECUTIVE_PROMPT.format(
            game_name=game_name,
            total_reviews=stats["total"],
            positive_rate=stats["positive_rate"],
            avg_playtime=stats["avg_playtime"],
            lang_dist=lang_dist_str,
            playtime_sentiment=playtime_str,
            sample_reviews=sample_text
        )
        raw = self.llm.call(prompt, max_tokens=4000)
        result = parse_json(raw)
        return result if result else {}

    def _run_ux(self, reviews: list, game_name: str, stats: dict) -> dict:
        sample = reviews[:100]
        sample_text = "\n".join([
            f"({'pos' if r.get('voted_up') else 'neg'}, {r.get('playtime_hours',0):.0f}h) {r.get('review','')[:200]}"
            for r in sample
        ])
        # 간단한 키워드 통계
        ux_keywords = {
            "combat": ["shoot", "kill", "fight", "gun", "weapon", "combat", "pvp", "aim", "shooting"],
            "gameplay": ["game", "play", "fun", "boring", "addictive", "repetitive", "grind", "loop"],
            "graphics": ["graphics", "art", "visual", "look", "fps", "performance", "beautiful"],
            "content": ["content", "loot", "quest", "story", "endgame", "update", "progression"],
            "ui_ux": ["ui", "interface", "menu", "controls", "tutorial", "HUD", "inventory"]
        }
        kw_stats = {}
        for cat, kws in ux_keywords.items():
            count = sum(1 for r in reviews for kw in kws if kw.lower() in r.get("review", "").lower())
            kw_stats[cat] = count

        prompt = UX_PROMPT.format(
            game_name=game_name,
            sample_reviews=sample_text,
            keyword_stats=json.dumps(kw_stats, ensure_ascii=False)
        )
        raw = self.llm.call(prompt, max_tokens=4000)
        result = parse_json(raw)
        return result if result else {}

    def _run_journey(self, reviews: list, game_name: str, stats: dict) -> dict:
        pt = stats["playtime_sentiment"]
        playtime_data = {}
        buckets = {"0_2h": [], "2_10h": [], "10_50h": [], "50h_plus": []}
        for r in reviews:
            h = r.get("playtime_hours", 0)
            if h < 2:
                buckets["0_2h"].append(r)
            elif h < 10:
                buckets["2_10h"].append(r)
            elif h < 50:
                buckets["10_50h"].append(r)
            else:
                buckets["50h_plus"].append(r)

        for k, rs in buckets.items():
            pos = sum(1 for r in rs if r.get("voted_up"))
            sample_texts = [r.get("review", "")[:150] for r in rs[:10]]
            playtime_data[k] = {
                "count": len(rs),
                "positive_rate": round(pos / len(rs) * 100, 1) if rs else 0,
                "sample_reviews": sample_texts
            }

        prompt = JOURNEY_PROMPT.format(
            game_name=game_name,
            playtime_data=json.dumps(playtime_data, ensure_ascii=False)
        )
        raw = self.llm.call(prompt, max_tokens=4000)
        result = parse_json(raw)
        return result if result else {}

    def _run_tech(self, reviews: list, game_name: str, stats: dict) -> dict:
        tech_kws = {
            "crash": ["crash", "freeze", "stuck", "bug", "error", "crashing", "튕김", "멈춤"],
            "fps": ["fps", "lag", "stutter", "performance", "optimize", "frame", "최적화"],
            "network": ["server", "ping", "disconnect", "lag", "network", "connection", "서버"],
            "cheat": ["cheat", "hack", "aimbot", "wallhack", "anticheat", "핵"]
        }
        tech_stats = {}
        for cat, kws in tech_kws.items():
            matching = [r for r in reviews if any(kw.lower() in r.get("review","").lower() for kw in kws)]
            pos = sum(1 for r in matching if r.get("voted_up"))
            tech_stats[cat] = {
                "count": len(matching),
                "positive_rate": round(pos/len(matching)*100,1) if matching else 0,
                "samples": [r.get("review","")[:100] for r in matching[:5]]
            }

        sample_reviews = "\n".join([
            f"({r.get('language','?')}, {'pos' if r.get('voted_up') else 'neg'}) {r.get('review','')[:150]}"
            for r in reviews[:80]
        ])

        prompt = TECH_MARKET_PROMPT.format(
            game_name=game_name,
            lang_stats=json.dumps(stats["lang_stats"], ensure_ascii=False),
            tech_keywords=json.dumps(tech_stats, ensure_ascii=False),
            sample_reviews=sample_reviews
        )
        raw = self.llm.call(prompt, max_tokens=4000)
        result = parse_json(raw)
        return result if result else {}

    def _run_liveops(self, reviews: list, game_name: str, stats: dict) -> dict:
        competitor_kws = ["tarkov", "division", "destiny", "warzone", "apex", "escape from tarkov",
                          "hunt showdown", "dark and darker", "extraction", "looter shooter"]
        comp_mentions = {}
        for kw in competitor_kws:
            count = sum(1 for r in reviews if kw.lower() in r.get("review","").lower())
            if count > 0:
                comp_mentions[kw] = count

        time_data = json.dumps(stats["time_series"][:30], ensure_ascii=False)
        sample = "\n".join([r.get("review","")[:100] for r in reviews[:40]])

        prompt = LIVEOPS_PROMPT.format(
            game_name=game_name,
            time_series_data=time_data,
            competitor_keywords=json.dumps(comp_mentions, ensure_ascii=False),
            sample_reviews=sample
        )
        raw = self.llm.call(prompt, max_tokens=4000)
        result = parse_json(raw)
        return result if result else {}

    def _run_pain_points(self, reviews: list, game_name: str, stats: dict) -> dict:
        neg_reviews = [r for r in reviews if not r.get("voted_up")][:100]
        neg_text = "\n".join([
            f"({r.get('language','?')}, {r.get('playtime_hours',0):.0f}h) {r.get('review','')[:200]}"
            for r in neg_reviews
        ])
        prompt = PAIN_POINTS_PROMPT.format(
            game_name=game_name,
            total_reviews=stats["total"],
            negative_reviews=neg_text
        )
        raw = self.llm.call(prompt, max_tokens=4000)
        result = parse_json(raw)
        return result if result else {}
