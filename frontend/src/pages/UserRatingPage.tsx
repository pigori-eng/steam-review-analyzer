import { useApp } from '../App'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import PageHeader from '../components/PageHeader'
import KPICard from '../components/KPICard'
import AIInsightCard from '../components/AIInsightCard'

export default function UserRatingPage() {
  const { data } = useApp()
  if (!data) return null
  const stats = data.statistics || {}
  const langAnalysis = data.language_analysis || {}
  const ai = data.analysis || {}

  const pieData = [
    { name: '긍정', value: stats.positive_reviews || 0 },
    { name: '부정', value: stats.negative_reviews || 0 },
  ]

  const langArr = Object.entries(langAnalysis)
    .map(([lang, d]: [string, any]) => ({ lang, ...d }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)

  const barData = langArr.map(l => ({ name: l.lang.replace('schinese','ZH-CN').replace('english','EN').replace('russian','RU').replace('german','DE').replace('french','FR').replace('brazilian','PT-BR').replace('spanish','ES').replace('polish','PL').replace('koreana','KO').replace('turkish','TR'), value: l.total }))

  const aiInsights = ai.tech_market?.ai_insights || []

  return (
    <div style={{ background: 'var(--bg)' }}>
      <PageHeader icon="👤" title="사용자 평가 분석" subtitle={`Steam Review Analytics Dashboard · 총 ${(stats.total_reviews||0).toLocaleString()}건`} iconBg="rgba(88,166,255,.15)" />
      <div style={{ padding: '20px 28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
          <KPICard icon="💬" label="총 리뷰 수" value={(stats.total_reviews||0).toLocaleString()} sub="수집 기간 전체" color="blue" />
          <KPICard icon="👍" label="긍정 비율" value={`${stats.positive_rate||0}%`} sub={`${(stats.positive_reviews||0).toLocaleString()}건 긍정`} color="green" />
          <KPICard icon="👎" label="부정 비율" value={`${stats.negative_rate||0}%`} sub={`${(stats.negative_reviews||0).toLocaleString()}건 부정`} color="red" />
          <KPICard icon="🌍" label="지원 언어" value={stats.supported_languages||0} sub="분석된 언어 수" color="purple" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div className="card">
            <div className="card-title">📊 전체 평가 분포</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value">
                    <Cell fill="#3fb950" /><Cell fill="#f85149" />
                  </Pie>
                  <Tooltip formatter={(v: number) => v.toLocaleString()+'건'} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--green)', fontFamily: 'IBM Plex Mono' }}>{(stats.positive_reviews||0).toLocaleString()}</div>
                  <div style={{ fontSize: 11, color: 'var(--text2)' }}>긍정 리뷰</div>
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--red)', fontFamily: 'IBM Plex Mono' }}>{(stats.negative_reviews||0).toLocaleString()}</div>
                  <div style={{ fontSize: 11, color: 'var(--text2)' }}>부정 리뷰</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-title">🌐 언어별 리뷰 분포 (Top 10)</div>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={barData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <XAxis dataKey="name" tick={{ fill: 'var(--text2)', fontSize: 9 }} />
                <YAxis tick={{ fill: 'var(--text2)', fontSize: 9 }} />
                <Tooltip formatter={(v: number) => v.toLocaleString()} contentStyle={{ background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: 8 }} />
                <Bar dataKey="value" fill="var(--blue)" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Language Table */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-title">📋 언어별 상세 분석</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                {['순위','언어','총 리뷰 수','긍정 리뷰','긍정률','평가'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text2)', fontSize: 10, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', background: 'var(--s2)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {langArr.map((l, i) => {
                const grade = l.positive_rate >= 90 ? {label:'우수',color:'var(--green)',bg:'rgba(63,185,80,.12)'} : l.positive_rate >= 80 ? {label:'보통',color:'var(--orange)',bg:'rgba(227,179,65,.12)'} : {label:'주의',color:'var(--red)',bg:'rgba(248,81,73,.12)'}
                return (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text2)', fontFamily: 'IBM Plex Mono' }}>{i+1}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: l.positive_rate < 70 ? 'var(--red)' : 'var(--text)' }}>{l.lang}</td>
                    <td style={{ padding: '10px 12px', fontFamily: 'IBM Plex Mono', color: 'var(--text2)' }}>{l.total?.toLocaleString()}</td>
                    <td style={{ padding: '10px 12px', fontFamily: 'IBM Plex Mono', color: 'var(--text2)' }}>{l.positive?.toLocaleString()}</td>
                    <td style={{ padding: '10px 12px', fontFamily: 'IBM Plex Mono', fontWeight: 700, color: grade.color, fontSize: 13 }}>{l.positive_rate}%</td>
                    <td style={{ padding: '10px 12px' }}><span style={{ background: grade.bg, color: grade.color, fontSize: 10, padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>{grade.label}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <AIInsightCard insights={aiInsights} title="🤖 사용자 평가 AI 인사이트" />
      </div>
    </div>
  )
}
