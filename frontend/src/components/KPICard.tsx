interface Props {
  icon: string
  label: string
  value: string | number
  sub: string
  color: 'blue' | 'green' | 'red' | 'orange' | 'purple' | 'cyan'
}

const COLOR_MAP = {
  blue:   { text: 'var(--blue)',   bg: 'rgba(88,166,255,.1)', top: 'var(--blue)' },
  green:  { text: 'var(--green)',  bg: 'rgba(63,185,80,.1)',  top: 'var(--green)' },
  red:    { text: 'var(--red)',    bg: 'rgba(248,81,73,.1)',  top: 'var(--red)' },
  orange: { text: 'var(--orange)', bg: 'rgba(227,179,65,.1)', top: 'var(--orange)' },
  purple: { text: 'var(--purple)', bg: 'rgba(188,140,255,.1)',top: 'var(--purple)' },
  cyan:   { text: 'var(--cyan)',   bg: 'rgba(57,208,216,.1)', top: 'var(--cyan)' },
}

export default function KPICard({ icon, label, value, sub, color }: Props) {
  const c = COLOR_MAP[color]
  return (
    <div style={{ background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: c.top }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 42, height: 42, borderRadius: 11, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
          {icon}
        </div>
        <div>
          <div style={{ fontSize: 10, color: 'var(--text2)', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 2 }}>{label}</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: c.text, lineHeight: 1, fontFamily: 'IBM Plex Mono' }}>{value}</div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>{sub}</div>
        </div>
      </div>
    </div>
  )
}
