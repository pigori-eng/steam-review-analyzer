import { useApp } from '../App'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import PageHeader from '../components/PageHeader'
import AIInsightCard from '../components/AIInsightCard'

export default function JourneyPage() {
  const { data } = useApp()
  if (!data) return null
  const pt = data.playtime_analysis || {}
  const buckets = pt.buckets || {}
  const ai = data.analysis || {}
  const journey = ai.player_journey || {}
  const aiInsights = journey.ai_insights || []
  const timeline = journey.sentiment_timeline || [
    { phase:'0~2h', positive_rate: buckets['0_2h']?.positive_rate || 16, label:'Onboarding' },
    { phase:'2~10h', positive_rate: buckets['2_10h']?.positive_rate || 71, label:'Learning' },
    { phase:'10~50h', positive_rate: buckets['10_50h']?.positive_rate || 90, label:'Core' },
    { phase:'50h+', positive_rate: buckets['50h_plus']?.positive_rate || 92, label:'Endgame' },
  ]

  const PHASE_COLORS = ['var(--red)','var(--orange)','var(--blue)','var(--green)']
  const PHASE_ICONS = ['🚪','📈','🎮','👑']

  return (
    <div style={{ background:'var(--bg)' }}>
      <PageHeader icon="🗺️" title="플레이어 여정 분석" subtitle="플레이타임에 따른 감정 및 피드백 변화" iconBg="rgba(227,179,65,.15)" />
      <div style={{ padding:'20px 28px' }}>
        {/* Phase Cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:16 }}>
          {timeline.map((t:any,i:number)=>(
            <div key={i} style={{ borderRadius:10, padding:'14px 16px', background:i===0?'rgba(248,81,73,.07)':i===1?'rgba(227,179,65,.07)':i===2?'rgba(88,166,255,.07)':'rgba(63,185,80,.08)', border:`1px solid ${i===0?'rgba(248,81,73,.25)':i===1?'rgba(227,179,65,.2)':i===2?'rgba(88,166,255,.2)':'rgba(63,185,80,.2)'}` }}>
              <div style={{ fontSize:18, marginBottom:4 }}>{PHASE_ICONS[i]}</div>
              <div style={{ fontSize:12, fontWeight:700, color:PHASE_COLORS[i] }}>{t.phase}</div>
              <div style={{ fontSize:10, color:'var(--text2)', fontFamily:'IBM Plex Mono', marginBottom:8 }}>{t.label}</div>
              <div style={{ fontSize:26, fontWeight:900, color:PHASE_COLORS[i], fontFamily:'IBM Plex Mono', lineHeight:1 }}>{t.positive_rate}%</div>
              <div style={{ fontSize:10, color:'var(--text2)', marginTop:4 }}>{(buckets[['0_2h','2_10h','10_50h','50h_plus'][i]]?.count||0).toLocaleString()}건</div>
            </div>
          ))}
        </div>

        {/* Timeline Chart */}
        <div className="card" style={{ marginBottom:16 }}>
          <div className="card-title">📈 감정 변화 타임라인</div>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={timeline} margin={{ top:10, right:10, bottom:0, left:0 }}>
              <XAxis dataKey="phase" tick={{ fill:'var(--text2)', fontSize:10 }} />
              <YAxis domain={[0,100]} tick={{ fill:'var(--text2)', fontSize:10 }} />
              <Tooltip contentStyle={{ background:'var(--s2)', border:'1px solid var(--border)', borderRadius:8 }} formatter={(v:number)=>`${v}%`} />
              <Area type="monotone" dataKey="positive_rate" name="긍정률" stroke="var(--green)" fill="rgba(63,185,80,.15)" strokeWidth={3} dot={{ fill:'var(--green)', r:5 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Onboarding Pain Points */}
        {journey.onboarding?.top_pain_points?.length > 0 && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
            <div className="card">
              <div className="card-title">⚠️ Onboarding 위기 — 주요 Pain Points</div>
              {journey.onboarding.top_pain_points.slice(0,6).map((p:any,i:number)=>(
                <div key={i} style={{ marginBottom:10 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:4 }}>
                    <span style={{ fontWeight:600 }}>{p.keyword}</span>
                    <span style={{ color:'var(--red)', fontFamily:'IBM Plex Mono', fontWeight:700 }}>{p.positive_rate}% 긍정</span>
                  </div>
                  <div style={{ height:5, background:'var(--s2)', borderRadius:3, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${p.positive_rate}%`, background:'var(--red)', borderRadius:3 }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background:'rgba(248,81,73,.07)', border:'1px solid rgba(248,81,73,.25)', borderLeft:'4px solid var(--red)', borderRadius:10, padding:'14px 16px' }}>
              <div style={{ fontSize:13, fontWeight:700, color:'var(--red)', marginBottom:8 }}>⚠️ Playtime Paradox</div>
              <div style={{ fontSize:11, color:'var(--text2)', lineHeight:1.8 }}>
                {journey.playtime_paradox?.description || '초기 이탈률이 매우 높습니다. 0~2h 구간의 낮은 긍정률이 장기 유저의 높은 만족도와 대비됩니다.'}
              </div>
              {journey.playtime_paradox?.main_reasons?.map((r:string,i:number)=>(
                <div key={i} style={{ fontSize:11, color:'var(--orange)', marginTop:4 }}>→ {r}</div>
              ))}
            </div>
          </div>
        )}

        <AIInsightCard insights={aiInsights} title="🤖 플레이어 여정 AI 인사이트" />
      </div>
    </div>
  )
}
