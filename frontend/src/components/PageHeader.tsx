interface Props {
  icon: string
  title: string
  subtitle: string
  iconBg?: string
}

export default function PageHeader({ icon, title, subtitle, iconBg = 'rgba(88,166,255,.15)' }: Props) {
  return (
    <div style={{ background: 'var(--s1)', padding: '18px 28px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
          {icon}
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>{title}</div>
      </div>
      <div style={{ fontSize: 11, color: 'var(--text2)', paddingBottom: 14 }}>{subtitle}</div>
    </div>
  )
}
