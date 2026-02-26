import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../App'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function ControlView() {
  const { setData, setTaskId } = useApp()
  const navigate = useNavigate()

  const [url, setUrl] = useState('')
  const [reviewCount, setReviewCount] = useState(100)
  const [dayRange, setDayRange] = useState<number | null>(null)
  const [provider, setProvider] = useState<'claude'|'openai'|'gemini'>('openai')
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [savedKeys, setSavedKeys] = useState<Record<string,string>>({ claude:'', openai:'', gemini:'' })
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [logs, setLogs] = useState<{type:string,text:string}[]>([])
  const [miniStats, setMiniStats] = useState<any>(null)
  const logRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const saved = { claude: localStorage.getItem('ak_claude')||'', openai: localStorage.getItem('ak_openai')||'', gemini: localStorage.getItem('ak_gemini')||'' }
    setSavedKeys(saved)
    setApiKey(saved[provider])
  }, [])

  useEffect(() => { setApiKey(savedKeys[provider]) }, [provider])

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [logs])

  const addLog = (type: string, text: string) => setLogs(p => [...p, { type, text }])

  const saveKey = () => {
    localStorage.setItem(`ak_${provider}`, apiKey)
    setSavedKeys(p => ({ ...p, [provider]: apiKey }))
    addLog('ok', `✔ ${provider.toUpperCase()} API 키 저장 완료`)
  }

  const handleSample = async () => {
    setLoading(true); setLogs([]); setProgress(10)
    addLog('info', '▶ 샘플 데이터 로드 중...')
    try {
      const res = await axios.get(`${API}/api/sample`)
      setProgress(100)
      addLog('ok', '✔ 샘플 데이터 로드 완료')
      setData(res.data)
      setMiniStats(res.data.statistics)
      setTimeout(() => navigate('/dashboard/executive'), 800)
    } catch (e: any) {
      addLog('err', `✖ 오류: ${e.message}`)
    }
    setLoading(false)
  }

  const handleAnalyze = async () => {
    if (!url.trim()) { addLog('err', '✖ URL을 입력해주세요'); return }
    setLoading(true); setLogs([]); setProgress(5)
    addLog('info', '▶ 크롤러 초기화...')

    try {
      const payload = { url, review_count: reviewCount, day_range: dayRange, api_key: apiKey || null, ai_provider: provider }

      // Async mode
      const startRes = await axios.post(`${API}/api/analyze/async`, payload)
      const tid = startRes.data.task_id
      setTaskId(tid)
      addLog('ok', `✔ 태스크 시작: ${tid.slice(0,8)}...`)

      // Poll
      const poll = setInterval(async () => {
        try {
          const taskRes = await axios.get(`${API}/api/task/${tid}`)
          const t = taskRes.data
          setProgress(t.progress || 0)
          addLog('info', `→ ${t.message}`)

          if (t.status === 'completed') {
            clearInterval(poll)
            addLog('ok', '✔ 분석 완료!')
            setData(t.result)
            setMiniStats(t.result?.statistics)
            setProgress(100)
            setTimeout(() => navigate('/dashboard/executive'), 800)
          } else if (t.status === 'error') {
            clearInterval(poll)
            addLog('err', `✖ 오류: ${t.message}`)
            setLoading(false)
          }
        } catch { clearInterval(poll); setLoading(false) }
      }, 2000)
    } catch (e: any) {
      addLog('err', `✖ ${e.response?.data?.detail || e.message}`)
      setLoading(false)
    }
  }

  const LOG_COLORS: Record<string,string> = { info: 'var(--cyan)', ok: 'var(--green)', warn: 'var(--orange)', err: 'var(--red)', dim: 'var(--text3)' }
  const PROVIDER_NAMES: Record<string,string> = { claude: 'Claude', openai: 'ChatGPT', gemini: 'Gemini' }
  const REVIEW_COUNTS = [100, 500, 1000, 5000, 10000, 99999]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>

      {/* LEFT PANEL */}
      <div style={{ width: 270, minWidth: 270, background: 'var(--s1)', borderRight: '1px solid var(--border)', padding: 20, display: 'flex', flexDirection: 'column', gap: 18, overflowY: 'auto' }}>

        {/* Platform */}
        <div>
          <div style={{ fontSize: 10, color: 'var(--text2)', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 6 }}>플랫폼 선택</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {['🎮 Steam', '🍎 App Store', '🤖 Google Play', '▶️ YouTube'].map((p, i) => (
              <div key={i} style={{ padding: '8px 6px', borderRadius: 8, border: `1.5px solid ${i === 0 ? 'var(--blue)' : 'var(--border)'}`, fontSize: 11, textAlign: 'center', cursor: 'pointer', color: i === 0 ? 'var(--blue)' : 'var(--text2)', background: i === 0 ? 'rgba(88,166,255,.1)' : 'transparent', fontWeight: i === 0 ? 700 : 500 }}>
                {p}
              </div>
            ))}
          </div>
        </div>

        {/* URL */}
        <div>
          <div style={{ fontSize: 10, color: 'var(--text2)', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 6 }}>게임 URL / App ID</div>
          <input value={url} onChange={e => setUrl(e.target.value)} placeholder="store.steampowered.com/app/2621690" style={{ width: '100%', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 8, padding: '9px 12px', color: 'var(--cyan)', fontSize: 11, outline: 'none', fontFamily: 'IBM Plex Mono' }} onFocus={e => (e.target.style.borderColor = 'var(--blue)')} onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
        </div>

        {/* Review Count */}
        <div>
          <div style={{ fontSize: 10, color: 'var(--text2)', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
            수집 리뷰 개수
            <span style={{ color: 'var(--cyan)', fontFamily: 'IBM Plex Mono' }}>{reviewCount === 99999 ? '모든 리뷰' : reviewCount.toLocaleString()+'개'}</span>
          </div>
          <select value={reviewCount} onChange={e => setReviewCount(Number(e.target.value))} style={{ width: '100%', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 8, padding: '9px 12px', color: 'var(--text)', fontSize: 12, outline: 'none' }}>
            <option value={100}>100개 (빠름)</option>
            <option value={500}>500개</option>
            <option value={1000}>1,000개</option>
            <option value={5000}>5,000개</option>
            <option value={10000}>10,000개</option>
            <option value={99999}>모든 리뷰 (느림)</option>
          </select>
        </div>

        {/* Period */}
        <div>
          <div style={{ fontSize: 10, color: 'var(--text2)', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 6 }}>수집 기간</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {[{label:'전체',val:null},{label:'7일',val:7},{label:'14일',val:14},{label:'30일',val:30},{label:'90일',val:90}].map(p => (
              <div key={p.label} onClick={() => setDayRange(p.val)} style={{ padding: '4px 10px', borderRadius: 20, border: `1.5px solid ${dayRange===p.val ? 'var(--cyan)' : 'var(--border)'}`, fontSize: 10, cursor: 'pointer', color: dayRange===p.val ? 'var(--cyan)' : 'var(--text2)', background: dayRange===p.val ? 'rgba(57,208,216,.1)' : 'transparent', fontWeight: 700 }}>
                {p.label}
              </div>
            ))}
          </div>
        </div>

        {/* AI Provider */}
        <div>
          <div style={{ fontSize: 10, color: 'var(--text2)', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 6 }}>AI 모델</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
            {(['claude','openai','gemini'] as const).map(p => (
              <div key={p} onClick={() => setProvider(p)} style={{ padding: '10px 4px', borderRadius: 9, border: `1.5px solid ${provider===p ? 'var(--orange)' : 'var(--border)'}`, textAlign: 'center', cursor: 'pointer', background: provider===p ? 'rgba(227,179,65,.1)' : 'transparent' }}>
                <div style={{ fontSize: 18, marginBottom: 3 }}>{p==='claude'?'🟠':p==='openai'?'🟢':'🔵'}</div>
                <div style={{ fontSize: 10, color: provider===p ? 'var(--orange)' : 'var(--text2)', fontWeight: 700 }}>{PROVIDER_NAMES[p]}</div>
              </div>
            ))}
          </div>
        </div>

        {/* API Key */}
        <div>
          <div style={{ fontSize: 10, color: 'var(--text2)', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 6 }}>API 키 — {PROVIDER_NAMES[provider]}</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input type={showKey ? 'text' : 'password'} value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder={`${PROVIDER_NAMES[provider]} API 키`} style={{ width: '100%', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 8, padding: '9px 42px 9px 12px', color: 'var(--text)', fontSize: 11, outline: 'none' }} />
              <button onClick={() => setShowKey(!showKey)} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontSize: 11 }}>{showKey ? '숨김' : '보기'}</button>
            </div>
            <button onClick={saveKey} style={{ padding: '9px 12px', background: 'rgba(63,185,80,.1)', border: '1.5px solid var(--green)', borderRadius: 8, color: 'var(--green)', fontSize: 11, cursor: 'pointer', fontWeight: 700, whiteSpace: 'nowrap' }}>저장</button>
          </div>
          {savedKeys[provider] && <div style={{ fontSize: 10, color: 'var(--green)', marginTop: 4 }}>✅ 저장된 키 있음</div>}
        </div>
      </div>

      {/* CENTER */}
      <div style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Game preview */}
        {url && (
          <div style={{ background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 28 }}>🎮</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Steam 게임 분석</div>
              <div style={{ fontSize: 11, color: 'var(--text2)', fontFamily: 'IBM Plex Mono' }}>{url}</div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <span style={{ background: 'rgba(63,185,80,.15)', color: 'var(--green)', fontSize: 10, padding: '3px 9px', borderRadius: 20, fontWeight: 700 }}>URL 입력됨</span>
            </div>
          </div>
        )}

        {/* Log Console */}
        <div style={{ fontSize: 10, color: 'var(--text2)', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: -6 }}>실시간 크롤링 로그</div>
        <div ref={logRef} style={{ background: 'var(--text)', borderRadius: 10, padding: 14, flex: 1, minHeight: 220, fontFamily: 'IBM Plex Mono', fontSize: 11, overflowY: 'auto', color: '#e6edf3' }}>
          {logs.length === 0 ? (
            <div style={{ color: '#484f58' }}>────────────────────────────────────<br/>분석을 시작하면 로그가 여기에 표시됩니다.</div>
          ) : (
            logs.map((l, i) => (
              <div key={i} style={{ marginBottom: 3, color: LOG_COLORS[l.type] || '#e6edf3' }}>{l.text}</div>
            ))
          )}
        </div>

        {/* Progress */}
        {loading && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 5 }}>
              <span style={{ color: 'var(--text2)', fontWeight: 600 }}>전체 진행률</span>
              <span style={{ color: 'var(--blue)', fontWeight: 700, fontFamily: 'IBM Plex Mono' }}>{progress}%</span>
            </div>
            <div style={{ height: 6, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg,var(--green),var(--blue))', transition: '.3s', borderRadius: 4 }} />
            </div>
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button onClick={handleAnalyze} disabled={loading} style={{ padding: 12, borderRadius: 9, background: loading ? 'var(--border)' : 'linear-gradient(135deg,var(--blue2),#0f4c8a)', color: '#fff', fontSize: 13, fontWeight: 800, border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? '⏳ 분석 중...' : '🚀 크롤링 + AI 분석 시작'}
          </button>
          <button onClick={handleSample} disabled={loading} style={{ padding: 12, borderRadius: 9, border: '1.5px solid var(--border)', color: 'var(--text2)', fontSize: 12, fontWeight: 700, background: 'transparent', cursor: 'pointer' }}>
            📦 샘플 데이터로 테스트
          </button>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={{ width: 230, minWidth: 230, background: 'var(--s1)', borderLeft: '1px solid var(--border)', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 10, color: 'var(--text2)', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase' }}>데이터 내보내기</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
          {[{label:'CSV',color:'var(--green)'},{label:'XLSX',color:'#22c55e'},{label:'TXT',color:'var(--text2)'}].map(f => (
            <div key={f.label} style={{ padding: '8px 4px', borderRadius: 7, border: `1.5px solid ${f.color}`, fontSize: 10, textAlign: 'center', fontWeight: 700, cursor: 'pointer', color: f.color, background: f.label === 'TXT' ? 'transparent' : `${f.color}15` }}>
              {f.label}
            </div>
          ))}
        </div>

        <div style={{ height: 1, background: 'var(--border)' }} />
        <div style={{ fontSize: 10, color: 'var(--text2)', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase' }}>분석 결과 미리보기</div>

        {[
          { label: 'RISK SCORE', val: miniStats ? `${Math.max(0, 100 - Math.floor(miniStats.positive_rate))}` : '—', color: 'var(--orange)' },
          { label: '긍정률', val: miniStats ? `${miniStats.positive_rate}%` : '—', color: 'var(--green)' },
          { label: '수집 리뷰', val: miniStats ? `${miniStats.total_reviews?.toLocaleString()}건` : '—', color: 'var(--blue)' },
          { label: '평균 플레이타임', val: miniStats ? `${miniStats.avg_playtime}h` : '—', color: 'var(--purple)' },
        ].map(m => (
          <div key={m.label} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 9, padding: '10px 13px' }}>
            <div style={{ fontSize: 9, color: 'var(--text2)', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 3 }}>{m.label}</div>
            <div style={{ fontSize: 20, fontWeight: 900, fontFamily: 'IBM Plex Mono', color: m.color }}>{m.val}</div>
          </div>
        ))}

        <div style={{ height: 1, background: 'var(--border)' }} />
        <button onClick={() => navigate('/dashboard/executive')} style={{ width: '100%', padding: 11, borderRadius: 9, background: 'linear-gradient(135deg,var(--blue2),#0f4c8a)', color: '#fff', fontSize: 12, fontWeight: 800, border: 'none', cursor: 'pointer' }}>
          📊 대시보드 보기 →
        </button>
      </div>
    </div>
  )
}
