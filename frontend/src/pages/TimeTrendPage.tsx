import { useState } from 'react'
import { useApp } from '../App'
import { ComposedChart, Line, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Area } from 'recharts'
import PageHeader from '../components/PageHeader'
import KPICard from '../components/KPICard'
import AIInsightCard from '../components/AIInsightCard'

interface PatchPin { date: string; type: string; note: string }

export default function TimeTrendPage() {
  const { data } = useApp()
  const [pins, setPins] = useState<PatchPin[]>([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ date: '', type: 'Patch Release', note: '' })
  if (!data) return null
  const trends = data.time_trends || {}
  const daily = trends.daily || []
  const periods = trends.periods || []
  const ai = data.analysis || {}
  const aiInsights = (ai.liveops_meta?.ai_insights) || []
  const sentChange = trends.sentiment_change || 0
  const volChange = trends.volume_change_pct || 0

  return (
    <div style={{ background: 'var(--bg)' }}>
      <PageHeader icon="📈" title="시간 트렌드 분석" subtitle="시간에 따른 감정 및 리뷰 볼륨 변화 · 패치 핀 기능 지원" iconBg="rgba(188,140,255,.15)" />
      <div style={{ padding: '20px 28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
          <KPICard icon="📅" label="시간 기간" value={periods.length||5} sub="분석 기간 수" color="blue" />
          <KPICard icon="📉" label="감정 변화" value={`${sentChange>=0?'+':''}${sentChange}%`} sub="전체 기간 비교" color={sentChange>=0?'green':'red'} />
          <KPICard icon="📊" label="볼륨 변화" value={`${volChange>=0?'+':''}${volChange}%`} sub="리뷰 수 트렌드" color={volChange>=0?'green':'orange'} />
          <KPICard icon="⏰" label="전체 기간" value={`${daily.length}일`} sub="수집된 데이터" color="purple" />
        </div>
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
            <div className="card-title" style={{ margin:0, flex:1 }}>📈 시간 기반 감정 트렌드</div>
            <button onClick={()=>setShowModal(true)} style={{ padding:'6px 14px', background:'rgba(227,179,65,.1)', border:'1px solid var(--orange)', borderRadius:7, color:'var(--orange)', fontSize:11, cursor:'pointer', fontWeight:700 }}>📌 패치 핀 추가</button>
          </div>
          {pins.length > 0 && (
            <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:12 }}>
              {pins.map((p,i)=>(
                <div key={i} style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(227,179,65,.1)', border:'1px solid var(--orange)', borderRadius:20, padding:'3px 10px', fontSize:10 }}>
                  <span style={{ color:'var(--orange)', fontWeight:700 }}>📌 {p.date}</span>
                  <span style={{ color:'var(--text2)' }}>{p.type}</span>
                  <span onClick={()=>setPins(ps=>ps.filter(x=>x.date!==p.date))} style={{ color:'var(--red)', cursor:'pointer', fontWeight:700 }}>×</span>
                </div>
              ))}
            </div>
          )}
          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart data={daily} margin={{ top:10, right:20, bottom:0, left:0 }}>
              <XAxis dataKey="date" tick={{ fill:'var(--text2)', fontSize:9 }} interval={Math.max(1,Math.floor(daily.length/6))} />
              <YAxis yAxisId="left" orientation="left" tick={{ fill:'var(--text2)', fontSize:9 }} domain={[60,100]} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill:'var(--text2)', fontSize:9 }} />
              <Tooltip contentStyle={{ background:'var(--s2)', border:'1px solid var(--border)', borderRadius:8 }} />
              <Area yAxisId="left" type="monotone" dataKey="positive_rate" name="긍정률(%)" stroke="var(--purple)" fill="rgba(188,140,255,.15)" strokeWidth={2} />
              <Bar yAxisId="right" dataKey="count" name="리뷰 수" fill="rgba(88,166,255,.3)" />
              {pins.map((p,i)=><ReferenceLine key={i} yAxisId="left" x={p.date} stroke="var(--orange)" strokeDasharray="4 2" />)}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        {periods.length > 0 && (
          <div style={{ display:'flex', gap:8, marginBottom:16, overflowX:'auto' }}>
            {periods.map((p:any,i:number)=>{
              const hi=p.positive_rate>=89, lo=p.positive_rate<87
              return (
                <div key={i} style={{ flex:'1 0 160px', borderRadius:9, padding:'12px 14px', background:hi?'rgba(63,185,80,.08)':lo?'rgba(248,81,73,.07)':'var(--s2)', border:`1px solid ${hi?'rgba(63,185,80,.3)':lo?'rgba(248,81,73,.25)':'var(--border)'}` }}>
                  <div style={{ fontSize:9, color:'var(--text2)', fontFamily:'IBM Plex Mono', marginBottom:3 }}>{p.start_date} ~ {p.end_date}</div>
                  <div style={{ fontSize:20, fontWeight:900, color:hi?'var(--green)':lo?'var(--red)':'var(--blue)', fontFamily:'IBM Plex Mono' }}>{p.positive_rate}%</div>
                  <div style={{ fontSize:10, color:'var(--text2)' }}>{p.total_reviews?.toLocaleString()}건</div>
                  {hi&&<div style={{ fontSize:9, color:'var(--green)', marginTop:3, fontWeight:700 }}>🔼 최고점</div>}
                  {lo&&<div style={{ fontSize:9, color:'var(--red)', marginTop:3, fontWeight:700 }}>🔽 최저점</div>}
                </div>
              )
            })}
          </div>
        )}
        <AIInsightCard insights={aiInsights} title="🤖 시간 트렌드 AI 인사이트" />
        {showModal && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
            <div style={{ background:'var(--s1)', border:'1px solid var(--border)', borderRadius:14, padding:24, width:380 }}>
              <div style={{ fontSize:15, fontWeight:800, marginBottom:16 }}>📌 패치 핀 추가</div>
              {[{label:'날짜 (YYYY-MM-DD)',key:'date',ph:'2025-11-08'},{label:'메모',key:'note',ph:'v1.2.3 - 버그 수정'}].map(f=>(
                <div key={f.key} style={{ marginBottom:12 }}>
                  <label style={{ fontSize:10, color:'var(--text2)', fontWeight:700, letterSpacing:'.06em', textTransform:'uppercase', display:'block', marginBottom:5 }}>{f.label}</label>
                  <input value={(form as any)[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} placeholder={f.ph} style={{ width:'100%', background:'var(--bg)', border:'1.5px solid var(--border)', borderRadius:8, padding:'8px 12px', color:'var(--text)', fontSize:12, outline:'none' }} />
                </div>
              ))}
              <div style={{ marginBottom:16 }}>
                <label style={{ fontSize:10, color:'var(--text2)', fontWeight:700, letterSpacing:'.06em', textTransform:'uppercase', display:'block', marginBottom:5 }}>이벤트 유형</label>
                <select value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))} style={{ width:'100%', background:'var(--bg)', border:'1.5px solid var(--border)', borderRadius:8, padding:'8px 12px', color:'var(--text)', fontSize:12, outline:'none' }}>
                  <option>Patch Release</option><option>Hotfix</option><option>Season Update</option>
                </select>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={()=>{if(form.date)setPins(p=>[...p.filter(x=>x.date!==form.date),{...form}]);setShowModal(false);setForm({date:'',type:'Patch Release',note:''})}} style={{ flex:1, padding:'10px', background:'var(--blue2)', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:700 }}>추가</button>
                <button onClick={()=>setShowModal(false)} style={{ flex:1, padding:'10px', background:'transparent', color:'var(--text2)', border:'1px solid var(--border)', borderRadius:8, cursor:'pointer', fontWeight:700 }}>취소</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
