interface Insight {
  priority: '긴급' | '중요' | '모니터링'
  title: string
  evidence: string
  action_plan: string
  expected_impact?: string
}

interface Props {
  insights: Insight[]
  title?: string
}

const PRIORITY_STYLES = {
  '긴급':    { bg: 'rgba(248,81,73,.08)', border: 'rgba(248,81,73,.3)', accent: '#f85149', tag: 'rgba(248,81,73,.15)', tagText: '#f85149' },
  '중요':    { bg: 'rgba(227,179,65,.07)', border: 'rgba(227,179,65,.25)', accent: '#e3b341', tag: 'rgba(227,179,65,.15)', tagText: '#e3b341' },
  '모니터링': { bg: 'rgba(88,166,255,.07)', border: 'rgba(88,166,255,.2)', accent: '#58a6ff', tag: 'rgba(88,166,255,.15)', tagText: '#58a6ff' },
}

const PRIORITY_ICON = { '긴급': '🚨', '중요': '⚡', '모니터링': '👁️' }

export default function AIInsightCard({ insights, title = '🤖 AI 심층 인사이트' }: Props) {
  if (!insights || insights.length === 0) return null

  return (
    <div style={{ background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, marginTop: 16 }}>
      <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 24, height: 24, background: 'rgba(88,166,255,.15)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>🤖</span>
        {title}
        <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text3)', fontFamily: 'IBM Plex Mono' }}>AI Generated</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: insights.length === 1 ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
        {insights.map((ins, i) => {
          const s = PRIORITY_STYLES[ins.priority] || PRIORITY_STYLES['모니터링']
          return (
            <div key={i} style={{ background: s.bg, border: `1px solid ${s.border}`, borderLeft: `4px solid ${s.accent}`, borderRadius: 10, padding: '14px 16px' }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <span style={{ background: s.tag, color: s.tagText, fontSize: 9, padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>
                  {PRIORITY_ICON[ins.priority]} {ins.priority}
                </span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>{ins.title}</div>

              {/* Evidence */}
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 3 }}>📊 근거</div>
                <div style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.7 }}>{ins.evidence}</div>
              </div>

              {/* Action Plan */}
              <div style={{ marginBottom: ins.expected_impact ? 8 : 0 }}>
                <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 3 }}>🎯 권장 액션</div>
                <div style={{ fontSize: 11, color: s.tagText, lineHeight: 1.7, fontWeight: 600 }}>
                  {ins.action_plan.split('\n').map((line, j) => (
                    <div key={j}>{line.startsWith('•') ? line : `→ ${line}`}</div>
                  ))}
                </div>
              </div>

              {/* Expected Impact */}
              {ins.expected_impact && (
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 3 }}>✨ 예상 효과</div>
                  <div style={{ fontSize: 11, color: 'var(--green)', lineHeight: 1.6 }}>{ins.expected_impact}</div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
