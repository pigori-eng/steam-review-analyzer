import { useApp } from '../App'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import PageHeader from '../components/PageHeader'
import KPICard from '../components/KPICard'
import AIInsightCard from '../components/AIInsightCard'

const CATEGORY_COLS = ['combat','gameplay','graphics','performance','content']

export default function RegionalPage() {
  const { data } = useApp()
  if (!data) return null
  const langAnalysis = data.language_analysis || {}
  const ai = data.analysis || {}
  const tech = ai.tech_market || {}
  const globalSentiment = tech.global_sentiment || []
  const lqaAnalysis = tech.lqa_analysis || {}
  const aiInsights = tech.ai_insights || []

  const langArr = Object.entries(langAnalysis)
    .map(([lang, d]: [string, any]) => ({ lang, ...d }))
    .sort((a, b) => b.total - a.total).slice(0, 10)

  const barData = langArr.map(l => ({
    name: l.lang.slice(0,8), value: l.positive_rate,
    fill: l.positive_rate >= 90 ? '#3fb950' : l.positive_rate >= 80 ? '#58a6ff' : l.positive_rate >= 70 ? '#e3b341' : '#f85149'
  }))

  const getHeatColor = (rate: number) => {
    if (rate >= 90) return { bg:'rgba(63,185,80,.2)', color:'#3fb950' }
    if (rate >= 80) return { bg:'rgba(63,185,80,.1)', color:'#6ee7b7' }
    if (rate >= 70) return { bg:'rgba(227,179,65,.15)', color:'#e3b341' }
    if (rate >= 60) return { bg:'rgba(249,115,22,.15)', color:'#fb923c' }
    return { bg:'rgba(248,81,73,.2)', color:'#f85149' }
  }

  return (
    <div style={{ background: 'var(--bg)' }}>
      <PageHeader icon="🌍" title="지역별 시장 분석" subtitle="지역별 심리 및 긍/부정 평가 분석 · LQA 품질 추적" iconBg="rgba(88,166,255,.15)" />
      <div style={{ padding: '20px 28px' }}>
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-title">📊 언어별 긍정률 비교</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={barData} margin={{ top:0, right:10, bottom:0, left:0 }}>
              <XAxis dataKey="name" tick={{ fill:'var(--text2)', fontSize:9 }} />
              <YAxis domain={[0,100]} tick={{ fill:'var(--text2)', fontSize:9 }} />
              <Tooltip contentStyle={{ background:'var(--s2)', border:'1px solid var(--border)', borderRadius:8 }} formatter={(v:number) => `${v}%`} />
              <Bar dataKey="value" name="긍정률" radius={[3,3,0,0]}>
                {barData.map((d,i) => <Cell key={i} fill={d.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Heatmap */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-title">🗺️ 언어×카테고리 감정 분석 히트맵</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11 }}>
              <thead>
                <tr style={{ background:'var(--s2)' }}>
                  <th style={{ padding:'7px 12px', textAlign:'left', color:'var(--text2)', fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em', borderBottom:'2px solid var(--border)' }}>언어</th>
                  {CATEGORY_COLS.map(c => (
                    <th key={c} style={{ padding:'7px 10px', textAlign:'center', color:'var(--text2)', fontSize:9, fontWeight:700, textTransform:'uppercase', borderBottom:'2px solid var(--border)' }}>{c.toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {langArr.map((l, i) => (
                  <tr key={i} style={{ borderBottom:'1px solid var(--border2)' }}>
                    <td style={{ padding:'7px 12px', fontWeight:600, color: l.positive_rate < 70 ? 'var(--red)' : 'var(--text)' }}>{l.lang}</td>
                    {CATEGORY_COLS.map(cat => {
                      const rate = l.category_rates?.[cat]
                      const style = rate ? getHeatColor(rate) : { bg:'var(--s2)', color:'var(--text3)' }
                      return (
                        <td key={cat} style={{ padding:'7px 10px', textAlign:'center', fontFamily:'IBM Plex Mono', fontWeight:700, background:style.bg, color:style.color }}>
                          {rate ? `${rate}%` : '—'}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ display:'flex', gap:12, marginTop:10, fontSize:10, fontWeight:700 }}>
              {[{c:'rgba(63,185,80,.2)',t:'#3fb950',l:'92%+'},{c:'rgba(63,185,80,.1)',t:'#6ee7b7',l:'80~92%'},{c:'rgba(227,179,65,.15)',t:'#e3b341',l:'70~80%'},{c:'rgba(248,81,73,.2)',t:'#f85149',l:'<70%'}].map(s=>(
                <span key={s.l}><span style={{ display:'inline-block', width:12, height:12, background:s.c, borderRadius:2, marginRight:4, verticalAlign:'middle' }}></span><span style={{ color:s.t }}>{s.l}</span></span>
              ))}
            </div>
          </div>
        </div>

        <AIInsightCard insights={aiInsights} title="🤖 지역별 분석 AI 인사이트" />
      </div>
    </div>
  )
}
