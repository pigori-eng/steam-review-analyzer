import { Outlet, useNavigate } from 'react-router-dom'
import { useApp } from '../App'
import Sidebar from '../components/Sidebar'

export default function DashboardLayout() {
  const { data } = useApp()
  const navigate = useNavigate()

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar />
      <div style={{ flex: 1, overflow: 'auto' }}>
        {!data ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 16 }}>
            <div style={{ fontSize: 48 }}>📊</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>분석 결과가 없습니다</div>
            <div style={{ color: 'var(--text2)', fontSize: 13 }}>제어판에서 게임 URL을 입력하고 분석을 시작해주세요.</div>
            <button
              onClick={() => navigate('/')}
              style={{ marginTop: 8, padding: '10px 24px', background: 'var(--blue2)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}
            >
              제어판으로 이동
            </button>
          </div>
        ) : (
          <Outlet />
        )}
      </div>
    </div>
  )
}
