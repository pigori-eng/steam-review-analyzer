"""
Analyzer - AI Engine 연동 분석기
기존 통계 분석 + AI Engine 심층 분석 통합
"""
import json
from collections import Counter, defaultdict
from typing import Optional
from ai_engine import AIEngine


CATEGORY_KEYWORDS = {
    "combat":      ["shoot","kill","fight","gun","weapon","combat","pvp","aim","shooting","damage","hit","fire","sniper"],
    "gameplay":    ["game","play","fun","boring","addictive","repetitive","grind","loop","mechanic","design","gameplay","satisfying"],
    "graphics":    ["graphics","art","visual","look","beautiful","ugly","fps","render","texture","animation","style"],
    "performance": ["performance","optimize","lag","stutter","crash","freeze","bug","error","fps drop","memory"],
    "content":     ["content","loot","quest","story","endgame","update","progression","mission","map","mode","season"],
    "difficulty":  ["hard","easy","difficult","challenge","balance","fair","unfair","frustrat","learning curve"],
    "story":       ["story","lore","narrative","character","plot","world","immersion","cutscene"],
    "multiplayer": ["multiplayer","pvp","pve","solo","team","squad","coop","matchmaking","lobby","server"],
    "comparison":  ["tarkov","extraction","looter","division","destiny","warzone","apex","better than","worse than","like","similar"]
}

TECH_KEYWORDS = {
    "crash":   ["crash","freeze","stuck","error","bug","crashing","멈춤","튕김","오류"],
    "fps":     ["fps","stutter","lag","performance","optimize","frame drop","최적화","프레임"],
    "network": ["server","ping","disconnect","timeout","connection","서버","핑","렉"],
    "cheat":   ["cheat","hack","aimbot","wallhack","anticheat","cheater","핵","치터"]
}


class ReviewAnalyzer:
    def __init__(self, api_key: Optional[str] = None, ai_provider: str = "openai"):
        self.api_key = api_key
        self.ai_provider = ai_provider
        self.ai_engine = AIEngine(ai_provider, api_key) if api_key else None

    def analyze(self, reviews: list, game_info: dict) -> dict:
        """전체 분석 파이프라인"""
        if not reviews:
            return self._empty_result()

        # ── 1. 기본 통계 ──
        statistics = self._compute_statistics(reviews)

        # ── 2. 카테고리 분석 ──
        category_analysis = self._analyze_categories(reviews)

        # ── 3. 언어별 분석 ──
        language_analysis = self._analyze_languages(reviews)

        # ── 4. 플레이타임 분석 ──
        playtime_analysis = self._analyze_playtime(reviews)

        # ── 5. 시간 트렌드 ──
        time_trends = self._analyze_time_trends(reviews)

        # ── 6. AI 심층 분석 ──
        ai_analysis = {}
        if self.ai_engine:
            try:
                ai_analysis = self.ai_engine.run_full_analysis(reviews, game_info, statistics)
            except Exception as e:
                print(f"⚠️ AI 분석 오류: {e}")
                ai_analysis = {"error": str(e)}
        else:
            ai_analysis = self._rule_based_insights(statistics, category_analysis, playtime_analysis)

        return {
            "statistics": statistics,
            "category_analysis": category_analysis,
            "language_analysis": language_analysis,
            "playtime_analysis": playtime_analysis,
            "time_trends": time_trends,
            "ai_analysis": ai_analysis,
            "note": None if self.api_key else "API 키를 입력하면 AI 심층 분석이 활성화됩니다."
        }

    def _compute_statistics(self, reviews: list) -> dict:
        total = len(reviews)
        positive = sum(1 for r in reviews if r.get("voted_up"))
        negative = total - positive
        positive_rate = round(positive / total * 100, 1) if total > 0 else 0

        playtimes = [r.get("playtime_hours", 0) for r in reviews if r.get("playtime_hours", 0) > 0]
        avg_pt = round(sum(playtimes) / len(playtimes), 1) if playtimes else 0
        max_pt = round(max(playtimes), 1) if playtimes else 0

        lang_counter = Counter(r.get("language", "unknown") for r in reviews)

        return {
            "total_reviews": total,
            "positive_reviews": positive,
            "negative_reviews": negative,
            "positive_rate": positive_rate,
            "negative_rate": round(100 - positive_rate, 1),
            "avg_playtime": avg_pt,
            "max_playtime": max_pt,
            "language_distribution": dict(lang_counter.most_common(15)),
            "supported_languages": len(lang_counter)
        }

    def _analyze_categories(self, reviews: list) -> dict:
        result = {}
        for cat, keywords in CATEGORY_KEYWORDS.items():
            matching = [r for r in reviews if any(kw.lower() in r.get("review","").lower() for kw in keywords)]
            if not matching:
                continue
            pos = sum(1 for r in matching if r.get("voted_up"))
            pos_rate = round(pos / len(matching) * 100, 1)

            # 키워드 빈도
            kw_counter = Counter()
            for r in matching:
                text = r.get("review","").lower()
                for kw in keywords:
                    cnt = text.count(kw.lower())
                    if cnt > 0:
                        kw_counter[kw] += cnt

            result[cat] = {
                "mention_count": len(matching),
                "positive_count": pos,
                "negative_count": len(matching) - pos,
                "positive_rate": pos_rate,
                "top_keywords": [{"word": w, "count": c} for w, c in kw_counter.most_common(8)],
                "sample_positive": [r.get("review","")[:100] for r in matching if r.get("voted_up")][:3],
                "sample_negative": [r.get("review","")[:100] for r in matching if not r.get("voted_up")][:3]
            }
        return result

    def _analyze_languages(self, reviews: list) -> dict:
        lang_data = defaultdict(lambda: {"total":0,"positive":0,"reviews":[]})
        for r in reviews:
            lang = r.get("language","unknown")
            lang_data[lang]["total"] += 1
            if r.get("voted_up"):
                lang_data[lang]["positive"] += 1
            lang_data[lang]["reviews"].append(r)

        result = {}
        for lang, data in lang_data.items():
            t, p = data["total"], data["positive"]
            pos_rate = round(p/t*100, 1) if t > 0 else 0
            grade = "excellent" if pos_rate>=90 else "good" if pos_rate>=80 else "average" if pos_rate>=70 else "poor"

            # 해당 언어의 카테고리별 분석
            cat_rates = {}
            for cat, kws in CATEGORY_KEYWORDS.items():
                cat_reviews = [r for r in data["reviews"] if any(kw.lower() in r.get("review","").lower() for kw in kws)]
                if cat_reviews:
                    cp = sum(1 for r in cat_reviews if r.get("voted_up"))
                    cat_rates[cat] = round(cp/len(cat_reviews)*100,1)

            result[lang] = {
                "total": t,
                "positive": p,
                "negative": t - p,
                "positive_rate": pos_rate,
                "grade": grade,
                "category_rates": cat_rates
            }
        return dict(sorted(result.items(), key=lambda x: x[1]["total"], reverse=True))

    def _analyze_playtime(self, reviews: list) -> dict:
        buckets = {
            "0_2h":     [r for r in reviews if r.get("playtime_hours",0) < 2],
            "2_10h":    [r for r in reviews if 2 <= r.get("playtime_hours",0) < 10],
            "10_50h":   [r for r in reviews if 10 <= r.get("playtime_hours",0) < 50],
            "50h_plus": [r for r in reviews if r.get("playtime_hours",0) >= 50]
        }
        result = {}
        for k, rs in buckets.items():
            if not rs:
                continue
            pos = sum(1 for r in rs if r.get("voted_up"))
            pos_rate = round(pos/len(rs)*100,1)

            # 해당 구간 키워드
            kw_counter = Counter()
            for r in rs:
                text = r.get("review","").lower()
                for cat_kws in CATEGORY_KEYWORDS.values():
                    for kw in cat_kws:
                        if kw in text:
                            kw_counter[kw] += 1

            result[k] = {
                "count": len(rs),
                "positive_rate": pos_rate,
                "top_keywords": [{"word": w, "count": c} for w, c in kw_counter.most_common(10)],
                "sample_negative": [r.get("review","")[:150] for r in rs if not r.get("voted_up")][:3]
            }

        # Playtime Paradox 감지
        r0 = result.get("0_2h",{}).get("positive_rate",100)
        r50 = result.get("50h_plus",{}).get("positive_rate",0)
        paradox = r50 > r0 + 30

        return {
            "buckets": result,
            "playtime_paradox": paradox,
            "paradox_severity": "critical" if r0 < 30 else "moderate" if r0 < 50 else "minor" if paradox else "none"
        }

    def _analyze_time_trends(self, reviews: list) -> dict:
        import datetime
        daily = defaultdict(list)
        for r in reviews:
            ts = r.get("timestamp_created", 0)
            if ts:
                try:
                    date = datetime.datetime.fromtimestamp(ts).strftime("%Y-%m-%d")
                    daily[date].append(r)
                except:
                    pass

        series = []
        for date in sorted(daily.keys()):
            rs = daily[date]
            pos = sum(1 for r in rs if r.get("voted_up"))
            series.append({
                "date": date,
                "count": len(rs),
                "positive": pos,
                "negative": len(rs) - pos,
                "positive_rate": round(pos/len(rs)*100,1) if rs else 0
            })

        # 기간별 그룹 (5등분)
        if len(series) >= 5:
            chunk = len(series) // 5
            periods = []
            for i in range(5):
                chunk_data = series[i*chunk:(i+1)*chunk] if i < 4 else series[i*chunk:]
                if chunk_data:
                    total_c = sum(d["count"] for d in chunk_data)
                    total_p = sum(d["positive"] for d in chunk_data)
                    periods.append({
                        "period": f"Period {i+1}",
                        "start_date": chunk_data[0]["date"],
                        "end_date": chunk_data[-1]["date"],
                        "total_reviews": total_c,
                        "positive_rate": round(total_p/total_c*100,1) if total_c else 0
                    })
        else:
            periods = []

        if not series:
            return {"daily": [], "periods": [], "trend": "unknown"}

        # 트렌드 분석
        if len(series) >= 2:
            first_half = series[:len(series)//2]
            second_half = series[len(series)//2:]
            fh_avg = sum(d["positive_rate"] for d in first_half) / len(first_half)
            sh_avg = sum(d["positive_rate"] for d in second_half) / len(second_half)
            trend = "improving" if sh_avg > fh_avg + 2 else "declining" if sh_avg < fh_avg - 2 else "stable"
            sentiment_change = round(sh_avg - fh_avg, 2)
        else:
            trend = "stable"
            sentiment_change = 0

        # 볼륨 변화
        if len(series) >= 2:
            vol_change = round((series[-1]["count"] - series[0]["count"]) / max(series[0]["count"],1) * 100, 1)
        else:
            vol_change = 0

        return {
            "daily": series,
            "periods": periods,
            "trend": trend,
            "sentiment_change": sentiment_change,
            "volume_change_pct": vol_change
        }

    def _rule_based_insights(self, stats, categories, playtime) -> dict:
        """API 키 없을 때 규칙 기반 인사이트"""
        insights = []
        pos_rate = stats["positive_rate"]
        buckets = playtime.get("buckets", {})

        # Onboarding
        onboard_rate = buckets.get("0_2h", {}).get("positive_rate", pos_rate)
        if onboard_rate < 50:
            insights.append({
                "priority": "긴급",
                "title": "초기 이탈률 높음",
                "evidence": f"0~2시간 구간 긍정률 {onboard_rate}% — 전체 대비 {round(pos_rate - onboard_rate, 1)}%p 낮음",
                "action_plan": "튜토리얼 개선, 초반 난이도 조정, 첫 경험 최적화",
                "expected_impact": "초기 이탈 30% 감소 목표"
            })

        # 장기 리텐션
        endgame_rate = buckets.get("50h_plus", {}).get("positive_rate", 0)
        if endgame_rate > 85:
            insights.append({
                "priority": "모니터링",
                "title": "우수한 장기 리텐션",
                "evidence": f"50h+ 구간 긍정률 {endgame_rate}% — 코어 게임플레이 성공",
                "action_plan": "엔드게임 콘텐츠 지속 투자, 장기 유저 커뮤니티 활성화",
                "expected_impact": "장기 유저 유지율 10% 추가 향상"
            })

        # 성능 이슈
        perf = categories.get("performance", {})
        if perf.get("positive_rate", 100) < 80:
            insights.append({
                "priority": "중요",
                "title": "성능 최적화 필요",
                "evidence": f"Performance 카테고리 긍정률 {perf.get('positive_rate')}%, {perf.get('mention_count')}건 언급",
                "action_plan": "크래시 패치 우선, FPS 최적화, 서버 안정성 개선",
                "expected_impact": "Performance 긍정률 85% 이상 목표"
            })

        return {
            "executive_dashboard": {
                "risk_score": {"score": max(0, 100 - int(pos_rate)), "level": "high" if pos_rate < 70 else "medium" if pos_rate < 85 else "low"},
                "ai_insights": insights
            },
            "note": "API 키가 없어 규칙 기반 인사이트입니다."
        }

    def _empty_result(self):
        return {"statistics": {}, "category_analysis": {}, "language_analysis": {},
                "playtime_analysis": {}, "time_trends": {}, "ai_analysis": {}, "note": "리뷰 데이터 없음"}
