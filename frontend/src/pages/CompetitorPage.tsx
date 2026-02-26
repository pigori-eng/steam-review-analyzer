import { useApp } from '../App'
import PageHeader from '../components/PageHeader'
import KPICard from '../components/KPICard'
import AIInsightCard from '../components/AIInsightCard'

export default function CompetitorPage() {
  const { data } = useApp()
  if (!data) return null
  const ai = data.analysis || {}
  const aiInsights = (ai.game_ux?.ai_insights || ai.liveops_meta?.ai_insights || []).slice(0,3)
  return (
    <div style={{ background: "var(--bg)" }}>
      <PageHeader icon="📊" title="타 게임 비교 분석" subtitle="분석 데이터 · AI 인사이트 포함" />
      <div style={{ padding: "20px 28px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:20 }}>
          <KPICard icon="💬" label="총 리뷰" value={(data.statistics?.total_reviews||0).toLocaleString()} sub="전체 기간" color="blue" />
          <KPICard icon="👍" label="긍정률" value={data.statistics?.positive_rate+"%"||"0%"} sub="전체 평균" color="green" />
          <KPICard icon="⏱️" label="평균 플레이타임" value={data.statistics?.avg_playtime+"h"||"0h"} sub="전체 유저" color="purple" />
        </div>
        <div className="card" style={{ marginBottom:16 }}>
          <div className="card-title">분석 데이터</div>
          <div style={{ color:"var(--text2)", fontSize:13, padding:"20px 0" }}>AI 분석 완료 후 상세 데이터가 표시됩니다.</div>
        </div>
        <AIInsightCard insights={aiInsights} />
      </div>
    </div>
  )
}
