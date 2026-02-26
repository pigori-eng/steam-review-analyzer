import { useState } from 'react'
import { useApp } from '../App'
import PageHeader from '../components/PageHeader'

export default function LiveFeedPage() {
  const { data } = useApp()
  const [filter, setFilter] = useState<'all'|'pos'|'neg'>('all')
  const [search, setSearch] = useState('')
  if (!data) return null
  const reviews = data.reviews || []

  const filtered = reviews.filter(r => {
    if (filter === 'pos' && !r.voted_up) return false
    if (filter === 'neg' && r.voted_up) return false
    if (search && !r.review?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div style={{ background: 'var(--bg)' }}>
      <PageHeader icon="📡" title="실시간 유저 평가 피드" subtitle={`최신 유저 리뷰 피드 · 총 ${reviews.length}건 · AI 번역 지원`} iconBg="rgba(88,166,255,.15)" />
      <div style={{ padding:'20px 28px' }}>
        {/* Controls */}
        <div style={{ display:'flex', gap:10, marginBottom:16, alignItems:'center', flexWrap:'wrap' }}>
          {[{k:'all',l:'전체'},{k:'pos',l:'긍정만'},{k:'neg',l:'부정만'}].map(f=>(
            <button key={f.k} onClick={()=>setFilter(f.k as any)} style={{ padding:'6px 14px', borderRadius:20, border:`1.5px solid ${filter===f.k?'var(--blue)':'var(--border)'}`, background:filter===f.k?'rgba(88,166,255,.1)':'transparent', color:filter===f.k?'var(--blue)':'var(--text2)', fontSize:11, cursor:'pointer', fontWeight:700 }}>
              {f.l}
            </button>
          ))}
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="리뷰 검색..." style={{ flex:1, minWidth:200, background:'var(--s1)', border:'1.5px solid var(--border)', borderRadius:8, padding:'7px 12px', color:'var(--text)', fontSize:12, outline:'none' }} />
          <span style={{ fontSize:11, color:'var(--text2)', fontFamily:'IBM Plex Mono' }}>{filtered.length}건</span>
        </div>

        {/* Feed */}
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {filtered.slice(0,100).map((r:any, i:number) => (
            <div key={i} style={{ background:'var(--s1)', border:'1px solid var(--border)', borderRadius:10, padding:'14px 16px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                <span style={{ fontSize:16 }}>{r.voted_up ? '👍' : '👎'}</span>
                <span style={{ fontSize:10, color:'var(--text2)', fontFamily:'IBM Plex Mono' }}>{r.author_id?.slice(0,8)}...</span>
                <span style={{ fontSize:10, color:'var(--text3)', fontFamily:'IBM Plex Mono' }}>🌐 {r.language}</span>
                <span style={{ fontSize:10, color:'var(--text3)', fontFamily:'IBM Plex Mono' }}>⏱️ {Math.floor(r.playtime_hours||0)}h</span>
                <span style={{ marginLeft:'auto', fontSize:10, color:'var(--text3)' }}>
                  {r.timestamp_created ? new Date(r.timestamp_created*1000).toLocaleDateString('ko-KR') : ''}
                </span>
              </div>
              <div style={{ fontSize:12, color:'var(--text)', lineHeight:1.7 }}>{r.review?.slice(0,400)}{(r.review?.length||0)>400?'...':''}</div>
              {r.votes_up > 0 && <div style={{ marginTop:6, fontSize:10, color:'var(--text3)' }}>👍 도움됨 {r.votes_up}명</div>}
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign:'center', padding:'40px 0', color:'var(--text3)' }}>검색 결과가 없습니다.</div>
          )}
        </div>
      </div>
    </div>
  )
}
