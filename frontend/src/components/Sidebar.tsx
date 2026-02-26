import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../App'

const MENU = [
  { section: '개요' },
  { path: '/dashboard/executive',   icon: '🎯', label: '핵심 요약',       badge: '!!' },
  { section: '심층 분석' },
  { path: '/dashboard/user-rating', icon: '👤', label: '사용자 평가' },
  { path: '/dashboard/sentiment',   icon: '💬', label: '감정 분석' },
  { path: '/dashboard/playtime',    icon: '⏱️', label: '플레이타임' },
  { section: '키워드 분석' },
  { path: '/dashboard/keyword',     icon: '🔑', label: '핵심 키워드' },
  { path: '/dashboard/regional',    icon: '🌍', label: '지역별 분석' },
  { section: '플레이어 분석' },
  { path: '/dashboard/journey',     icon: '🗺️', label: '플레이어 여정' },
  { path: '/dashboard/loot',        icon: '🎰', label: 'Loot 시스템' },
  { path: '/dashboard/pvp',         icon: '⚔️', label: 'PvP vs PvE' },
  { section: '경쟁·기술' },
  { path: '/dashboard/competitor',  icon: '🆚', label: '타 게임 비교' },
  { path: '/dashboard/gameplay',    icon: '🎮', label: '게임플레이 피드백' },
  { section: '이슈 관리' },
  { path: '/dashboard/painpoints',  icon: '⚠️', label: 'Pain Points',    badgeType: 'red' },
  { path: '/dashboard/timetrend',   icon: '📈', label: '시간 트렌드' },
  { path: '/dashboard/livefeed',    icon: '📡', label: '실시간 피드' },
]

export default function Sidebar() {
  const { data } = useApp()
  const navigate = useNavigate()
  const location = useLocation()

  const gameName = data?.game_info?.name || 'Arc Raiders'
  const totalReviews = data?.statistics?.total_reviews || 0
  const posRate = data?.statistics?.positive_rate || 0

  return (
    <div style={{
      width: 220, minWidth: 220, background: 'var(--s1)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', height: '100vh',
      position: 'sticky', top: 0, overflowY: 'auto'
    }}>
      {/* Logo */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg,#58a6ff,#bc8cff)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>📊</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)' }}>Steam Analytics</div>
          <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'IBM Plex Mono' }}>v3.0.0</div>
        </div>
      </div>

      {/* Game Info */}
      <div style={{ padding: '10px 14px', background: 'rgba(88,166,255,.07)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--blue)' }}>{gameName}</div>
        <div style={{ fontSize: 10, color: 'var(--text2)', fontFamily: 'IBM Plex Mono', marginTop: 2 }}>
          Steam · {totalReviews.toLocaleString()}건 · {posRate}%
        </div>
      </div>

      {/* Menu */}
      <div style={{ flex: 1, paddingBottom: 12 }}>
        {MENU.map((item, i) => {
          if ('section' in item) {
            return (
              <div key={i} style={{ padding: '10px 14px 4px', fontSize: 10, color: 'var(--text3)', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', marginTop: 4 }}>
                {item.section}
              </div>
            )
          }
          const active = location.pathname === item.path
          return (
            <div
              key={i}
              onClick={() => navigate(item.path!)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '7px 14px', cursor: 'pointer', transition: '.12s',
                borderLeft: `3px solid ${active ? 'var(--blue)' : 'transparent'}`,
                background: active ? 'rgba(88,166,255,.08)' : 'transparent',
                color: active ? 'var(--blue)' : 'var(--text2)',
                fontWeight: active ? 700 : 500, fontSize: 12
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--s2)' }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              <span style={{ width: 16, textAlign: 'center', fontSize: 13 }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span style={{ background: 'rgba(248,81,73,.2)', color: 'var(--red)', fontSize: 9, padding: '1px 6px', borderRadius: 10, fontFamily: 'IBM Plex Mono', fontWeight: 700 }}>
                  {item.badge}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border)', fontSize: 10, color: 'var(--text3)', fontFamily: 'IBM Plex Mono' }}>
        Made by CHANG YOON
      </div>
    </div>
  )
}
