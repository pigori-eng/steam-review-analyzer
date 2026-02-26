import { useApp } from '../App'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import PageHeader from '../components/PageHeader'
import KPICard from '../components/KPICard'
import AIInsightCard from '../components/AIInsightCard'

export default function PlaytimePage() {
  const { data } = useApp()
  if (!data) return null
  const stats = data.statistics || {}
  const pt = data.playtime_analysis || {}
  const buckets = pt.buckets || {}
  const ai = data.analysis || {}
  const journey = ai.player_journey || {}
  const aiInsights = journey.ai_insights || []

  const LABELS: Record<string,string> = { '0_2h':'0~2h', '2_10h':'2~10h', '10_50h':'10~50h', '50h_plus':'50h+' }
  const COLORS = { '0_2h':'var(--red)', '2_10h':'var(--orange)', '10_50h':'var(--blue)', '50h_plus':'var(--green)' }

  const bucketArr = Object.entries(LABELS).map(([k,label]) => ({
    label, key: k,
    count: buckets[k]?.count || 0,
    rate: buckets[k]?.positive_rate || 0,
    color: COLORS[k as keyof typeof COLORS]
  }))

  const ptByCount = [0,'0_2h','2_10h','10_50h','50h_plus'].slice(1).map(k => ({ name: LABELS[k], value: buckets[k]?.count || 0 }))

  return (
    <div style={{ background: 'var(--bg)' }}>
      <PageHeader icon="⏱️" title="플레이타임 분석" subtitle={`Playtime Analysis · User Retention Insights · 평균 ${stats.avg_playtime||0}시간 / 최대 ${stats.max_playtime||0}시간`} iconBg="rgba(188,140,255,.15)" />
      <div style={{ padding: '20px 28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
          <KPICard icon="⏱️" label="평균 플레이타임" value={`${stats.avg_playtime||0}h`} sub="전체 유저 평균" color="purple" />
          {bucketArr.slice(0,3).map((b,i) => (
            <KPICard key={i} icon={i===0?'🚪':i===1?'📈':'🎮'} label={`${b.label} 긍정률`} value={`${b.rate}%`} sub={`${b.count.toLocaleString()} 유저`} color={i===0?'red':i===1?'orange':'blue'} />
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div className="card">
            <div className="card-title">📊 플레이타임별 긍정률</div>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={bucketArr.map(b => ({ name: b.label, rate: b.rate }))}>
                <XAxis dataKey="name" tick={{ fill:'var(--text2)',fontSize:10 }} />
                <YAxis domain={[0,100]} tick={{ fill:'var(--text2)',fontSize:10 }} />
                <Tooltip contentStyle={{ background:'var(--s2)',border:'1px solid var(--border)',borderRadius:8 }} formatter={(v:number) => `${v}%`} />
                <Bar dataKey="rate" name="긍정률" radius={[3,3,0,0]}>
                  {bucketArr.map((b,i) => <rect key={i} style={{ fill: b.color }} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <div className="card-title">👥 플레이타임별 유저 분포</div>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={ptByCount}>
                <XAxis dataKey="name" tick={{ fill:'var(--text2)',fontSize:10 }} />
                <YAxis tick={{ fill:'var(--text2)',fontSize:10 }} />
                <Tooltip contentStyle={{ background:'var(--s2)',border:'1px solid var(--border)',borderRadius:8 }} formatter={(v:number) => v.toLocaleString()+'명'} />
                <Bar dataKey="value" fill="var(--purple)" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detail bars */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-title">📋 플레이타임별 상세 분석</div>
          {bucketArr.map((b, i) => (
            <div key={i} style={{ marginBottom: i < bucketArr.length-1 ? 16 : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{b.label}</span>
                  <span style={{ fontSize: 11, color: 'var(--text2)', marginLeft: 8 }}>{b.count.toLocaleString()} 유저</span>
                </div>
                <span style={{ fontSize: 16, fontWeight: 800, color: b.color, fontFamily: 'IBM Plex Mono' }}>{b.rate}%</span>
              </div>
              <div style={{ height: 8, background: 'var(--s2)', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${b.rate}%`, background: b.color, borderRadius: 6, transition: '.5s' }} />
              </div>
            </div>
          ))}
        </div>

        {pt.playtime_paradox && (
          <div style={{ background: 'rgba(248,81,73,.07)', border: '1px solid rgba(248,81,73,.25)', borderLeft: '4px solid var(--red)', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--red)', marginBottom: 6 }}>⚠️ Playtime Paradox 감지!</div>
            <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.7 }}>
              초기 이탈률이 매우 높습니다. 0~2h 구간의 낮은 긍정률이 장기 유저의 높은 만족도와 큰 차이를 보입니다.<br/>
              → 튜토리얼 강화 및 초반 경험 최적화가 최우선 과제입니다.
            </div>
          </div>
        )}

        <AIInsightCard insights={aiInsights} title="🤖 플레이타임 AI 인사이트" />
      </div>
    </div>
  )
}
