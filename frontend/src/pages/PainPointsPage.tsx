import { useApp } from '../App'
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, ZAxis, Cell } from 'recharts'
import PageHeader from '../components/PageHeader'
import AIInsightCard from '../components/AIInsightCard'

export default function PainPointsPage() {
  const { data } = useApp()
  if (!data) return null
  const ai = data.analysis || {}
  const pp = ai.pain_points_matrix || {}
  const painPoints = pp.pain_points || []
  const sprint = pp.sprint_plan || {}
  const aiInsights = pp.ai_insights || []

  const scatterData = painPoints.map((p: any) => ({
    x: p.frequency || 0, y: p.impact_score || 0, z: Math.max(10, (p.frequency||0)/10),
    name: p.issue, severity: p.severity, sprint: p.sprint
  }))

  const SEV_COLORS: Record<string,string> = { critical:'var(--red)', important:'var(--orange)', monitor:'var(--blue)', minor:'var(--text3)' }
  const SEV_LABELS: Record<string,string> = { critical:'긴급', important:'중요', monitor:'모니터링', minor:'경미' }

  return (
    <div style={{ background: 'var(--bg)' }}>
      <PageHeader icon="⚠️" title="Pain Points 우선순위 매트릭스" subtitle="빈도 및 영향도 기반 이슈 우선순위 분석 · X축: 빈도 / Y축: 영향도" iconBg="rgba(248,81,73,.15)" />
      <div style={{ padding: '20px 28px' }}>
        {/* Legend */}
        <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap' }}>
          {Object.entries(SEV_LABELS).map(([k,v])=>(
            <span key={k} style={{ background:`${SEV_COLORS[k]}20`, color:SEV_COLORS[k], border:`1px solid ${SEV_COLORS[k]}50`, fontSize:10, padding:'3px 10px', borderRadius:20, fontWeight:700 }}>
              {k==='critical'?'🚨':k==='important'?'⚡':k==='monitor'?'👁️':'💤'} {v} — {k==='critical'?'빈도↑ 영향↑':k==='important'?'빈도↑ 영향↓':k==='monitor'?'빈도↓ 영향↑':'빈도↓ 영향↓'}
            </span>
          ))}
        </div>

        {/* Scatter Plot */}
        <div className="card" style={{ marginBottom:16 }}>
          <div className="card-title">🎯 Pain Points 우선순위 매트릭스 (버블 차트)</div>
          {scatterData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <ScatterChart margin={{ top:20, right:20, bottom:20, left:20 }}>
                <XAxis type="number" dataKey="x" name="빈도(언급 횟수)" tick={{ fill:'var(--text2)', fontSize:10 }} label={{ value:'빈도 (언급 횟수) →', position:'insideBottom', offset:-5, fill:'var(--text2)', fontSize:10 }} />
                <YAxis type="number" dataKey="y" name="영향도(%)" tick={{ fill:'var(--text2)', fontSize:10 }} label={{ value:'영향도 →', angle:-90, position:'insideLeft', fill:'var(--text2)', fontSize:10 }} />
                <ZAxis type="number" dataKey="z" range={[40, 400]} />
                <Tooltip cursor={{ strokeDasharray:'3 3' }} content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const d = payload[0]?.payload
                  return (
                    <div style={{ background:'var(--s1)', border:'1px solid var(--border)', borderRadius:10, padding:'10px 14px' }}>
                      <div style={{ fontWeight:700, color:SEV_COLORS[d.severity]||'var(--text)', marginBottom:4 }}>{d.name}</div>
                      <div style={{ fontSize:11, color:'var(--text2)' }}>빈도: {d.x.toLocaleString()}건</div>
                      <div style={{ fontSize:11, color:'var(--text2)' }}>영향도: {d.y}%</div>
                      <div style={{ fontSize:11, color:SEV_COLORS[d.severity] }}>{SEV_LABELS[d.severity]} · {d.sprint}</div>
                    </div>
                  )
                }} />
                <Scatter data={scatterData} fill="var(--blue)">
                  {scatterData.map((d: any, i: number) => <Cell key={i} fill={SEV_COLORS[d.severity]||'var(--blue)'} fillOpacity={0.75} />)}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign:'center', padding:'40px 0', color:'var(--text3)' }}>AI 분석 후 Pain Points 데이터가 표시됩니다.</div>
          )}
        </div>

        {/* Sprint Cards */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
          {/* Critical */}
          <div style={{ background:'var(--s1)', border:'1px solid var(--border)', borderRadius:10, padding:16 }}>
            <div style={{ fontSize:12, fontWeight:700, marginBottom:12, display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ background:'rgba(248,81,73,.15)', color:'var(--red)', padding:'2px 8px', borderRadius:10, fontSize:10 }}>🚨 긴급 이슈 (즉시 수정)</span>
            </div>
            {painPoints.filter((p:any)=>p.severity==='critical').slice(0,3).map((p:any,i:number)=>(
              <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'9px 0', borderBottom:'1px solid var(--border2)' }}>
                <div style={{ background:'var(--blue2)', color:'#fff', width:20, height:20, borderRadius:'50%', fontSize:10, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, flexShrink:0, marginTop:1 }}>{i+1}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'var(--text)' }}>{p.issue}</div>
                  <div style={{ fontSize:10, color:'var(--text2)', fontFamily:'IBM Plex Mono', marginTop:2 }}>{p.frequency?.toLocaleString()}건 · {p.negative_rate||p.impact_score}% 부정</div>
                </div>
                <span style={{ background:'rgba(248,81,73,.15)', color:'var(--red)', fontSize:9, padding:'2px 7px', borderRadius:10, fontWeight:700, whiteSpace:'nowrap' }}>Sprint 1</span>
              </div>
            ))}
            {painPoints.filter((p:any)=>p.severity==='critical').length === 0 && <div style={{ color:'var(--text3)', fontSize:12 }}>AI 분석 후 표시됩니다.</div>}
          </div>

          {/* Important */}
          <div style={{ background:'var(--s1)', border:'1px solid var(--border)', borderRadius:10, padding:16 }}>
            <div style={{ fontSize:12, fontWeight:700, marginBottom:12 }}>
              <span style={{ background:'rgba(227,179,65,.12)', color:'var(--orange)', padding:'2px 8px', borderRadius:10, fontSize:10 }}>⚡ 중요 이슈 (조만간 처리)</span>
            </div>
            {painPoints.filter((p:any)=>p.severity==='important').slice(0,3).map((p:any,i:number)=>(
              <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'9px 0', borderBottom:'1px solid var(--border2)' }}>
                <div style={{ background:'var(--orange)', color:'#fff', width:20, height:20, borderRadius:'50%', fontSize:10, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, flexShrink:0, marginTop:1 }}>{i+1}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'var(--text)' }}>{p.issue}</div>
                  <div style={{ fontSize:10, color:'var(--text2)', fontFamily:'IBM Plex Mono', marginTop:2 }}>{p.frequency?.toLocaleString()}건 · {p.impact_score}% 영향도</div>
                </div>
                <span style={{ background:'rgba(227,179,65,.12)', color:'var(--orange)', fontSize:9, padding:'2px 7px', borderRadius:10, fontWeight:700, whiteSpace:'nowrap' }}>Sprint 2</span>
              </div>
            ))}
            {painPoints.filter((p:any)=>p.severity==='important').length === 0 && <div style={{ color:'var(--text3)', fontSize:12 }}>AI 분석 후 표시됩니다.</div>}
          </div>
        </div>

        <AIInsightCard insights={aiInsights} title="🤖 Pain Points AI 인사이트" />
      </div>
    </div>
  )
}
