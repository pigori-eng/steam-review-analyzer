import { useApp } from '../App'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import PageHeader from '../components/PageHeader'
import KPICard from '../components/KPICard'
import AIInsightCard from '../components/AIInsightCard'

export default function SentimentPage() {
  const { data } = useApp()
  if (!data) return null
  const stats = data.statistics || {}
  const cats = data.category_analysis || {}
  const ai = data.analysis || {}
  const ux = ai.game_ux || {}

  const catArr = Object.entries(cats).map(([k, v]: [string, any]) => ({
    name: k.toUpperCase(), pos: v.positive_count || 0, neg: v.negative_count || 0,
    rate: v.positive_rate || 0, count: v.mention_count || 0,
    keywords: v.top_keywords || []
  }))

  const aiInsights = ux.ai_insights || []

  const CAT_ICONS: Record<string,string> = { combat:'⚔️', gameplay:'🎮', graphics:'🎨', performance:'⚡', content:'📦', difficulty:'🎯', story:'📖', multiplayer:'👥', comparison:'🆚' }

  return (
    <div style={{ background: 'var(--bg)' }}>
      <PageHeader icon="💬" title="감정 분석" subtitle="Sentiment Analysis · Keyword Categories · 카테고리별 심층 분석" iconBg="rgba(188,140,255,.15)" />
      <div style={{ padding: '20px 28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
          <KPICard icon="👍" label="전체 긍정률" value={`${stats.positive_rate||0}%`} sub={`${(stats.positive_reviews||0).toLocaleString()}건`} color="green" />
          <KPICard icon="👎" label="전체 부정률" value={`${stats.negative_rate||0}%`} sub={`${(stats.negative_reviews||0).toLocaleString()}건`} color="red" />
          <KPICard icon="🏷️" label="분석 카테고리" value={catArr.length} sub="주요 키워드 분석" color="purple" />
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-title">📊 카테고리별 감정 분포</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={catArr} margin={{ top: 0, right: 10, bottom: 0, left: 0 }}>
              <XAxis dataKey="name" tick={{ fill: 'var(--text2)', fontSize: 9 }} />
              <YAxis tick={{ fill: 'var(--text2)', fontSize: 9 }} />
              <Tooltip contentStyle={{ background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: 8 }} />
              <Legend />
              <Bar dataKey="pos" name="긍정" fill="var(--green)" radius={[2,2,0,0]} stackId="a" />
              <Bar dataKey="neg" name="부정" fill="var(--red)" radius={[2,2,0,0]} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
          {catArr.map((c, i) => (
            <div key={i} style={{ background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: 9, padding: '14px 16px' }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, color: 'var(--text)' }}>{CAT_ICONS[c.name.toLowerCase()]||'📌'} {c.name}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: c.rate >= 85 ? 'var(--green)' : c.rate >= 75 ? 'var(--orange)' : 'var(--red)', fontFamily: 'IBM Plex Mono' }}>{c.rate}%</span>
                <span style={{ fontSize: 11, color: 'var(--text2)' }}>{c.count.toLocaleString()}건</span>
              </div>
              <div style={{ height: 6, background: 'var(--bg)', borderRadius: 3, overflow: 'hidden', marginBottom: 8 }}>
                <div style={{ height: '100%', width: `${c.rate}%`, background: c.rate >= 85 ? 'var(--green)' : c.rate >= 75 ? 'var(--orange)' : 'var(--red)', borderRadius: 3 }} />
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {c.keywords.slice(0,4).map((kw: any, j: number) => (
                  <span key={j} style={{ fontSize: 9, padding: '2px 7px', borderRadius: 10, background: 'rgba(88,166,255,.1)', color: 'var(--blue)', fontWeight: 600 }}>{kw.word}</span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 10, fontFamily: 'IBM Plex Mono', fontWeight: 700 }}>
                <span style={{ color: 'var(--green)' }}>긍정 {c.pos.toLocaleString()}</span>
                <span style={{ color: 'var(--red)' }}>부정 {c.neg.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>

        <AIInsightCard insights={aiInsights} title="🤖 감정 분석 AI 인사이트" />
      </div>
    </div>
  )
}
