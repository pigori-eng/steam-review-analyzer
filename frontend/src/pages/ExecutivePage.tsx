import { useApp } from '../App'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import PageHeader from '../components/PageHeader'
import KPICard from '../components/KPICard'
import AIInsightCard from '../components/AIInsightCard'

export default function ExecutivePage() {
  const { data } = useApp()
  if (!data) return null

  const stats = data.statistics || {}
  const ai = data.analysis || {}
  const exec = ai.executive_dashboard || {}

  const pieData = [
    { name: '긍정', value: stats.positive_reviews || 0 },
    { name: '부정', value: stats.negative_reviews || 0 },
  ]

  const riskScore = exec.risk_score?.score ?? Math.max(0, 100 - Math.floor(stats.positive_rate || 76))
  const bm = exec.bm_valuation || {}
  const strategicInsights = exec.strategic_insights || []
  const aiInsights = exec.ai_insights || ai.ai_insights || []
  const wordCloud = exec.word_cloud || {}
  const coreInsights = ai.computed_stats ? [] : []

  const INSIGHT_ICONS: Record<string,string> = {
    'Regional Analysis': '🌍', 'Player Journey': '🗺️', 'Loot System': '🎰',
    'PvP vs PvE': '⚔️', 'Pain Points': '⚠️', 'Time Trends': '📈'
  }

  return (
    <div style={{ background: 'var(--bg)' }}>
      <PageHeader icon="🎯" title="핵심 요약" subtitle={`${data.game_info?.name} Steam 리뷰 분석 · 총 ${(stats.total_reviews||0).toLocaleString()}건 · 마지막 업데이트: ${new Date().toLocaleDateString('ko-KR')}`} />

      <div style={{ padding: '20px 28px' }}>
        {/* KPI Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
          <KPICard icon="💬" label="총 유저 평가" value={(stats.total_reviews||0).toLocaleString()} sub="수집 기간 전체" color="blue" />
          <KPICard icon="👍" label="긍정 비율" value={`${stats.positive_rate||0}%`} sub={`긍정 ${(stats.positive_reviews||0).toLocaleString()}건`} color="green" />
          <KPICard icon="⚠️" label="Risk Score" value={riskScore} sub={`${exec.risk_score?.level || (riskScore > 50 ? 'high' : 'medium')} 위험도`} color={riskScore > 60 ? 'red' : 'orange'} />
          <KPICard icon="⏱️" label="평균 플레이타임" value={`${stats.avg_playtime||0}h`} sub="전체 유저 평균" color="purple" />
        </div>

        {/* Strategic Insights 6 cards */}
        {strategicInsights.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)', marginBottom: 12 }}>📊 전략적 핵심 인사이트</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
              {strategicInsights.slice(0,6).map((ins: any, i: number) => {
                const COLORS_MAP: Record<string,{bg:string,border:string,accent:string}> = {
                  '긴급': { bg:'rgba(248,81,73,.07)', border:'rgba(248,81,73,.25)', accent:'var(--red)' },
                  '중요': { bg:'rgba(227,179,65,.07)', border:'rgba(227,179,65,.2)', accent:'var(--orange)' },
                  '모니터링': { bg:'rgba(88,166,255,.07)', border:'rgba(88,166,255,.2)', accent:'var(--blue)' },
                }
                const c = COLORS_MAP[ins.priority] || COLORS_MAP['모니터링']
                const icon = INSIGHT_ICONS[ins.category || ins.title] || '📌'
                return (
                  <div key={i} style={{ background: c.bg, border: `1px solid ${c.border}`, borderLeft: `3px solid ${c.accent}`, borderRadius: 10, padding: '14px 16px' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>{icon}</span> {ins.title || ins.category}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 8 }}>
                      {ins.evidence?.split('\n').map((line: string, j: number) => <div key={j}>• {line}</div>)}
                    </div>
                    <div style={{ fontSize: 11, color: c.accent, fontWeight: 700, cursor: 'pointer' }}>→ 상세 분석 보기</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Charts Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          {/* Pie */}
          <div className="card">
            <div className="card-title">📊 긍정/부정 비율</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value">
                    <Cell fill="#3fb950" />
                    <Cell fill="#f85149" />
                  </Pie>
                  <Tooltip formatter={(v: number) => v.toLocaleString()+'건'} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, background: 'var(--green)', borderRadius: 2 }} />
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--green)', fontFamily: 'IBM Plex Mono' }}>{stats.positive_rate}%</div>
                    <div style={{ fontSize: 11, color: 'var(--text2)' }}>긍정 {(stats.positive_reviews||0).toLocaleString()}건</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, background: 'var(--red)', borderRadius: 2 }} />
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--red)', fontFamily: 'IBM Plex Mono' }}>{stats.negative_rate}%</div>
                    <div style={{ fontSize: 11, color: 'var(--text2)' }}>부정 {(stats.negative_reviews||0).toLocaleString()}건</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Word Cloud */}
          <div className="card">
            <div className="card-title">☁️ 키워드 클라우드</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {(wordCloud.positive || []).slice(0,8).map((w: string, i: number) => (
                <span key={i} style={{ padding: '4px 10px', background: 'rgba(63,185,80,.15)', color: 'var(--green)', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{w}</span>
              ))}
              {(wordCloud.negative || []).slice(0,6).map((w: string, i: number) => (
                <span key={i} style={{ padding: '4px 10px', background: 'rgba(248,81,73,.15)', color: 'var(--red)', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{w}</span>
              ))}
              {(!wordCloud.positive && !wordCloud.negative) && (
                <div style={{ color: 'var(--text3)', fontSize: 12 }}>AI 분석 후 키워드가 표시됩니다.</div>
              )}
            </div>
          </div>
        </div>

        {/* BM Valuation */}
        {bm.label && (
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-title">💰 BM/Price Valuation</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 900, fontFamily: 'IBM Plex Mono', color: bm.label === '혜자' ? 'var(--green)' : bm.label === '창렬' ? 'var(--red)' : 'var(--orange)' }}>{bm.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text2)' }}>가격 인식</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--green)', fontFamily: 'IBM Plex Mono' }}>{bm.worth_it_mentions || 0}</div>
                <div style={{ fontSize: 11, color: 'var(--text2)' }}>Worth it 언급</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--red)', fontFamily: 'IBM Plex Mono' }}>{bm.overpriced_mentions || 0}</div>
                <div style={{ fontSize: 11, color: 'var(--text2)' }}>Overpriced 언급</div>
              </div>
            </div>
            {bm.description && <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text2)', borderTop: '1px solid var(--border)', paddingTop: 10 }}>{bm.description}</div>}
          </div>
        )}

        {/* AI Insight Card */}
        <AIInsightCard insights={aiInsights} title="🤖 Executive AI 심층 인사이트" />
      </div>
    </div>
  )
}
