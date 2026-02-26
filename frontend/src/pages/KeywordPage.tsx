import { useApp } from '../App'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts'
import PageHeader from '../components/PageHeader'
import AIInsightCard from '../components/AIInsightCard'

export default function KeywordPage() {
  const { data } = useApp()
  if (!data) return null
  const cats = data.category_analysis || {}
  const ai = data.analysis || {}
  const ux = ai.game_ux || {}
  const aiInsights = ux.ai_insights || []

  const radarData = Object.entries(cats).map(([k,v]:any) => ({ subject: k.toUpperCase(), rate: v.positive_rate || 0, fullMark: 100 }))

  const allKws = Object.entries(cats).flatMap(([cat, v]: any) =>
    (v.top_keywords || []).map((kw: any, i: number) => ({ rank: i+1, cat, word: kw.word, count: kw.count }))
  ).sort((a,b) => b.count - a.count).slice(0, 20)

  return (
    <div style={{ background: 'var(--bg)' }}>
      <PageHeader icon="🔑" title="핵심 키워드 분석" subtitle="Keyword Analysis · Core Issues & Insights · 카테고리별 분석" iconBg="rgba(188,140,255,.15)" />
      <div style={{ padding: '20px 28px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
          <div className="card">
            <div className="card-title">🎯 카테고리별 긍정률 비교 (레이더)</div>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill:'var(--text2)', fontSize:10 }} />
                <PolarRadiusAxis angle={30} domain={[0,100]} tick={{ fill:'var(--text3)', fontSize:8 }} />
                <Radar name="긍정률" dataKey="rate" stroke="var(--blue)" fill="var(--blue)" fillOpacity={0.25} />
                <Tooltip contentStyle={{ background:'var(--s2)', border:'1px solid var(--border)', borderRadius:8 }} formatter={(v:number) => `${v}%`} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <div className="card-title">🔑 TOP 20 키워드</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:6 }}>
              {allKws.slice(0,20).map((kw,i) => (
                <div key={i} style={{ background:'var(--s2)', border:'1px solid var(--border)', borderRadius:8, padding:'8px 10px' }}>
                  <div style={{ fontSize:9, color:'var(--text3)', fontFamily:'IBM Plex Mono', fontWeight:700 }}>#{kw.rank}</div>
                  <div style={{ fontSize:14, fontWeight:800, color:'var(--text)', margin:'2px 0' }}>{kw.word}</div>
                  <div style={{ fontSize:9, color:'var(--blue)', fontWeight:700 }}>{kw.cat}</div>
                  <div style={{ fontSize:10, color:'var(--text2)', fontFamily:'IBM Plex Mono' }}>{kw.count?.toLocaleString()}건</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:16 }}>
          {Object.entries(cats).map(([cat,v]:any,i)=>(
            <div key={i} style={{ background:'var(--s2)', border:'1px solid var(--border)', borderRadius:9, padding:'14px 16px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                <div style={{ fontSize:13, fontWeight:700, color:'var(--text)', textTransform:'uppercase' }}>{cat}</div>
                <div style={{ fontSize:16, fontWeight:800, color: v.positive_rate>=85?'var(--green)':v.positive_rate>=75?'var(--orange)':'var(--red)', fontFamily:'IBM Plex Mono' }}>{v.positive_rate}%</div>
              </div>
              <div style={{ fontSize:11, color:'var(--text2)', marginBottom:8 }}>총 언급 {v.mention_count?.toLocaleString()}건</div>
              <div style={{ height:4, background:'var(--bg)', borderRadius:3, overflow:'hidden', marginBottom:8 }}>
                <div style={{ height:'100%', width:`${v.positive_rate}%`, background:v.positive_rate>=85?'var(--green)':v.positive_rate>=75?'var(--orange)':'var(--red)', borderRadius:3 }} />
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
                {(v.top_keywords||[]).slice(0,5).map((kw:any,j:number)=>(
                  <div key={j} style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'var(--text2)' }}>
                    <span style={{ fontFamily:'IBM Plex Mono' }}>{kw.word}</span>
                    <span style={{ color:'var(--text3)', fontFamily:'IBM Plex Mono' }}>{kw.count}</span>
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', gap:10, marginTop:8, fontSize:10, fontFamily:'IBM Plex Mono', fontWeight:700, borderTop:'1px solid var(--border2)', paddingTop:8 }}>
                <span style={{ color:'var(--green)' }}>긍정 {v.positive_count?.toLocaleString()}</span>
                <span style={{ color:'var(--red)' }}>부정 {v.negative_count?.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>

        <AIInsightCard insights={aiInsights} title="🤖 키워드 분석 AI 인사이트" />
      </div>
    </div>
  )
}
