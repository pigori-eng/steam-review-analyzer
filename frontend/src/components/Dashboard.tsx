/**
 * Steam Review Analyzer - Advanced Dashboard v2.0
 * ================================================
 * PM을 위한 심층 게임 리뷰 분석 대시보드
 * 
 * 5개 핵심 모듈:
 * 1. Executive Dashboard - 의사결정을 위한 1분 요약
 * 2. Game UX Deep-dive - 재미와 완성도 정밀 진단
 * 3. Player Journey - 플레이타임별 유저 경험 분석
 * 4. Tech & Market - 기술 안정성 및 국가별 반응
 * 5. LiveOps & Meta - 업데이트 및 경쟁작 분석
 * 
 * Author: Chang yoon
 * Version: 2.0.0
 */

import React, { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid, Legend
} from 'recharts'

// ============================================
// 타입 정의
// ============================================

interface DashboardProps {
  data: {
    game_info: any
    statistics: any
    analysis: any
  }
}

// ============================================
// 색상 시스템
// ============================================

const COLORS = {
  positive: '#22c55e',
  negative: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  purple: '#8b5cf6',
  cyan: '#06b6d4',
  gray: '#64748b',
  critical: '#ef4444',
  safe: '#22c55e',
  mixed: '#f59e0b',
}

const getRatingColor = (rate: number): string => {
  if (rate >= 80) return COLORS.positive
  if (rate >= 60) return '#84cc16'
  if (rate >= 40) return COLORS.warning
  return COLORS.negative
}

// ============================================
// 메인 Dashboard 컴포넌트
// ============================================

function Dashboard({ data }: DashboardProps) {
  const { game_info, statistics, analysis } = data
  const [activeModule, setActiveModule] = useState('executive')

  const modules = [
    { id: 'executive', name: 'Executive Dashboard', icon: '🎯', question: '지금 상황이 어때?', color: 'from-blue-600 to-cyan-600' },
    { id: 'ux', name: 'Game UX Deep-dive', icon: '🎮', question: '왜 재미없대?', color: 'from-purple-600 to-pink-600' },
    { id: 'journey', name: 'Player Journey', icon: '🚀', question: '언제 이탈해?', color: 'from-orange-600 to-red-600' },
    { id: 'tech', name: 'Tech & Market', icon: '🔧', question: '서버 터졌어?', color: 'from-green-600 to-teal-600' },
    { id: 'liveops', name: 'LiveOps & Meta', icon: '📡', question: '패치 반응 어때?', color: 'from-indigo-600 to-purple-600' },
  ]

  return (
    <div className="space-y-6">
      <GameHeader gameInfo={game_info} statistics={statistics} />

      {/* 모듈 탭 */}
      <div className="grid grid-cols-5 gap-3">
        {modules.map(module => (
          <button
            key={module.id}
            onClick={() => setActiveModule(module.id)}
            className={`relative p-4 rounded-xl transition-all duration-300 ${
              activeModule === module.id
                ? `bg-gradient-to-br ${module.color} shadow-lg scale-105`
                : 'bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50'
            }`}
          >
            <div className="text-2xl mb-1">{module.icon}</div>
            <div className={`text-sm font-medium ${activeModule === module.id ? 'text-white' : 'text-slate-300'}`}>
              {module.name}
            </div>
            <div className={`text-xs mt-1 ${activeModule === module.id ? 'text-white/70' : 'text-slate-500'}`}>
              "{module.question}"
            </div>
          </button>
        ))}
      </div>

      {/* 모듈 컨텐츠 */}
      <div className="min-h-[700px]">
        {activeModule === 'executive' && <ExecutiveDashboard data={analysis?.executive_dashboard} statistics={statistics} />}
        {activeModule === 'ux' && <GameUXDeepDive data={analysis?.game_ux} />}
        {activeModule === 'journey' && <PlayerJourney data={analysis?.player_journey} />}
        {activeModule === 'tech' && <TechMarket data={analysis?.tech_market} />}
        {activeModule === 'liveops' && <LiveOpsMeta data={analysis?.liveops_meta} />}
      </div>

      {analysis?.note && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center">
          <span className="text-amber-400">💡 {analysis.note}</span>
        </div>
      )}
    </div>
  )
}

// ============================================
// 게임 헤더
// ============================================

function GameHeader({ gameInfo, statistics }: { gameInfo: any, statistics: any }) {
  const positiveRate = statistics?.positive_rate || 0

  return (
    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50">
      {gameInfo?.header_image && (
        <div 
          className="absolute inset-0 opacity-20"
          style={{ backgroundImage: `url(${gameInfo.header_image})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(30px)' }}
        />
      )}
      
      <div className="relative p-6 flex gap-6">
        {gameInfo?.header_image && (
          <img src={gameInfo.header_image} alt={gameInfo?.name} className="w-72 rounded-xl shadow-2xl" />
        )}
        
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-white mb-2">{gameInfo?.name || 'Unknown Game'}</h1>
          <p className="text-slate-400 mb-4">{gameInfo?.developers?.join(', ')} • {gameInfo?.release_date}</p>
          
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-slate-800/50 rounded-xl p-4 backdrop-blur">
              <div className="text-sm text-slate-400 mb-1">전체 평가</div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold" style={{ color: getRatingColor(positiveRate) }}>{positiveRate}%</span>
                <span className="text-sm text-slate-500">긍정</span>
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 backdrop-blur">
              <div className="text-sm text-slate-400 mb-1">총 리뷰</div>
              <div className="text-3xl font-bold text-white">{statistics?.total_reviews?.toLocaleString() || 0}<span className="text-sm text-slate-500 ml-1">개</span></div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 backdrop-blur">
              <div className="text-sm text-slate-400 mb-1">평균 플레이타임</div>
              <div className="text-3xl font-bold text-purple-400">{statistics?.average_playtime_hours || 0}<span className="text-sm text-slate-500 ml-1">시간</span></div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 backdrop-blur">
              <div className="text-sm text-slate-400 mb-1">분석 언어</div>
              <div className="text-3xl font-bold text-cyan-400">{Object.keys(statistics?.language_distribution || {}).length}<span className="text-sm text-slate-500 ml-1">개국</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// Module 1: Executive Dashboard
// ============================================

function ExecutiveDashboard({ data, statistics }: { data: any, statistics: any }) {
  if (!data) return <EmptyState message="Executive Dashboard 데이터 로딩 중..." />

  const { review_velocity, risk_score, price_valuation, strategic_insights, word_cloud } = data

  return (
    <div className="space-y-6">
      {/* KPI 스냅샷 */}
      <div className="grid grid-cols-4 gap-4">
        {/* Review Velocity */}
        <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-2xl">📈</div>
            <div>
              <div className="text-sm text-blue-300">Review Velocity</div>
              <div className="text-xs text-slate-500">최근 2주</div>
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{review_velocity?.recent_2w_count || 0}<span className="text-sm text-slate-400 ml-1">개</span></div>
          <div className={`text-sm ${(review_velocity?.change_rate || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {(review_velocity?.change_rate || 0) >= 0 ? '↑' : '↓'} {Math.abs(review_velocity?.change_rate || 0)}% 
            <span className="text-slate-500 ml-1">{review_velocity?.trend}</span>
          </div>
        </Card>

        {/* Risk Score */}
        <Card className={`bg-gradient-to-br ${risk_score?.level === 'critical' ? 'from-red-900/50 to-red-800/30' : risk_score?.level === 'warning' ? 'from-amber-900/50 to-amber-800/30' : 'from-green-900/50 to-green-800/30'}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${risk_score?.level === 'critical' ? 'bg-red-500/20' : risk_score?.level === 'warning' ? 'bg-amber-500/20' : 'bg-green-500/20'}`}>⚠️</div>
            <div>
              <div className={`text-sm ${risk_score?.level === 'critical' ? 'text-red-300' : risk_score?.level === 'warning' ? 'text-amber-300' : 'text-green-300'}`}>Risk Score</div>
              <div className="text-xs text-slate-500">치명적 키워드</div>
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{risk_score?.score || 0}<span className="text-sm text-slate-400 ml-1">/100</span></div>
          <div className={`text-sm ${risk_score?.level === 'critical' ? 'text-red-400' : risk_score?.level === 'warning' ? 'text-amber-400' : 'text-green-400'}`}>
            {risk_score?.level === 'critical' ? '🔴 위험' : risk_score?.level === 'warning' ? '🟡 주의' : '🟢 안전'}
          </div>
        </Card>

        {/* Price Valuation */}
        <Card className={`bg-gradient-to-br ${price_valuation?.sentiment === 'positive' ? 'from-green-900/50 to-green-800/30' : price_valuation?.sentiment === 'negative' ? 'from-red-900/50 to-red-800/30' : 'from-slate-800/50 to-slate-700/30'}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center text-2xl">💰</div>
            <div>
              <div className="text-sm text-yellow-300">BM/Price</div>
              <div className="text-xs text-slate-500">가격 만족도</div>
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{price_valuation?.valuation || 'N/A'}</div>
          <div className="text-sm text-slate-400">👍 {price_valuation?.positive_mentions || 0} / 👎 {price_valuation?.negative_mentions || 0}</div>
        </Card>

        {/* 긍정률 */}
        <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-2xl">👍</div>
            <div>
              <div className="text-sm text-purple-300">긍정률</div>
              <div className="text-xs text-slate-500">전체 평균</div>
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{statistics?.positive_rate || 0}%</div>
          <div className="text-sm text-slate-400">{statistics?.positive_reviews?.toLocaleString() || 0} / {statistics?.total_reviews?.toLocaleString() || 0}</div>
        </Card>
      </div>

      {/* 3대 전략 인사이트 */}
      <Card>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">💡 3대 전략 인사이트 <span className="text-sm font-normal text-slate-500">PM 의사결정을 위한 핵심</span></h3>
        <div className="grid grid-cols-3 gap-4">
          {(strategic_insights || []).map((insight: any, i: number) => (
            <div key={i} className={`p-4 rounded-xl border ${insight.type === 'critical' ? 'bg-red-500/10 border-red-500/30' : insight.type === 'warning' ? 'bg-amber-500/10 border-amber-500/30' : insight.type === 'positive' ? 'bg-green-500/10 border-green-500/30' : 'bg-blue-500/10 border-blue-500/30'}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs px-2 py-1 rounded-full ${insight.type === 'critical' ? 'bg-red-500/20 text-red-400' : insight.type === 'warning' ? 'bg-amber-500/20 text-amber-400' : insight.type === 'positive' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>#{insight.priority || i + 1}</span>
              </div>
              <h4 className="font-bold text-white mb-2">{insight.title}</h4>
              <p className="text-sm text-slate-400 mb-2">{insight.description}</p>
              <div className="text-xs text-slate-500 mb-2">📊 {insight.metric}</div>
              <div className="text-xs text-cyan-400">💡 {insight.action}</div>
            </div>
          ))}
          {(!strategic_insights || strategic_insights.length === 0) && (
            <div className="col-span-3 text-center text-slate-500 py-8">인사이트 생성을 위한 데이터가 부족합니다.</div>
          )}
        </div>
      </Card>

      {/* 차트 영역 */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-bold text-white mb-4">📊 전체 평가 분포</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={[{ name: '긍정', value: statistics?.positive_reviews || 0 }, { name: '부정', value: statistics?.negative_reviews || 0 }]} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                  <Cell fill={COLORS.positive} />
                  <Cell fill={COLORS.negative} />
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-bold text-white mb-4">☁️ 키워드 클라우드</h3>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-green-400 mb-2 font-medium">👍 긍정 키워드</div>
              <div className="flex flex-wrap gap-2">
                {(word_cloud?.positive || []).slice(0, 10).map((item: any, i: number) => (
                  <span key={i} className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">{item.word} ({item.count})</span>
                ))}
              </div>
            </div>
            <div>
              <div className="text-sm text-red-400 mb-2 font-medium">👎 부정 키워드</div>
              <div className="flex flex-wrap gap-2">
                {(word_cloud?.negative || []).slice(0, 10).map((item: any, i: number) => (
                  <span key={i} className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm">{item.word} ({item.count})</span>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {risk_score?.critical_keywords?.length > 0 && (
        <Card className="border-red-500/30">
          <h3 className="text-lg font-bold text-red-400 mb-4">🚨 치명적 키워드 감지</h3>
          <div className="flex flex-wrap gap-3">
            {risk_score.critical_keywords.map((kw: any, i: number) => (
              <div key={i} className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2">
                <span className="text-red-400 font-medium">{kw.keyword}</span>
                <span className="text-slate-500 ml-2">{kw.count}회</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

// ============================================
// Module 2: Game UX Deep-dive
// ============================================

function GameUXDeepDive({ data }: { data: any }) {
  if (!data) return <EmptyState message="Game UX 데이터 로딩 중..." />

  const { groups, overall_score, top_strengths, top_weaknesses } = data

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-purple-900/30 to-purple-800/20">
          <div className="text-center">
            <div className="text-sm text-purple-300 mb-2">Overall UX Score</div>
            <div className="text-5xl font-bold text-white mb-2">{overall_score || 0}</div>
            <div className="text-sm text-slate-500">-100 ~ +100</div>
          </div>
        </Card>
        
        <Card>
          <div className="text-sm text-green-400 mb-3 font-medium">💪 강점 Top 3</div>
          <div className="space-y-2">
            {(top_strengths || []).map((item: any, i: number) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-white">{item.category}</span>
                <span className="text-green-400">+{item.score}</span>
              </div>
            ))}
          </div>
        </Card>
        
        <Card>
          <div className="text-sm text-red-400 mb-3 font-medium">⚠️ 약점 Top 3</div>
          <div className="space-y-2">
            {(top_weaknesses || []).map((item: any, i: number) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-white">{item.category}</span>
                <span className="text-red-400">{item.score}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {Object.entries(groups || {}).map(([groupName, groupData]: [string, any]) => (
        <Card key={groupName}>
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            {groupName === 'Core Gameplay' && '🎯'}
            {groupName === 'Content & Progression' && '📦'}
            {groupName === 'Polish & System' && '✨'}
            {groupName === 'Mode Specific' && '🎭'}
            {groupName}
            <span className="text-sm font-normal text-slate-500 ml-2">평균 점수: {groupData.group_score || 0}</span>
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {(groupData.categories || []).map((cat: any) => (
              <CategoryCard key={cat.key} category={cat} />
            ))}
          </div>
        </Card>
      ))}
    </div>
  )
}

function CategoryCard({ category }: { category: any }) {
  const score = category.sentiment_score || 0
  const isPositive = score >= 0
  
  return (
    <div className={`p-4 rounded-xl border ${score > 20 ? 'bg-green-500/5 border-green-500/20' : score < -20 ? 'bg-red-500/5 border-red-500/20' : 'bg-slate-800/50 border-slate-700/50'}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-medium text-white">{category.name}</h4>
          <p className="text-xs text-slate-500">{category.total_mentions || 0}회 언급</p>
        </div>
        <div className={`text-xl font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>{isPositive ? '+' : ''}{score}</div>
      </div>
      
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-400">긍정률</span>
          <span style={{ color: getRatingColor(category.positive_rate || 0) }}>{category.positive_rate || 0}%</span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${category.positive_rate || 0}%`, backgroundColor: getRatingColor(category.positive_rate || 0) }} />
        </div>
      </div>
      
      <div className="space-y-2">
        {category.top_positive?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {category.top_positive.slice(0, 3).map(([kw, count]: [string, number], i: number) => (
              <span key={i} className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded">{kw}</span>
            ))}
          </div>
        )}
        {category.top_negative?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {category.top_negative.slice(0, 3).map(([kw, count]: [string, number], i: number) => (
              <span key={i} className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded">{kw}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// Module 3: Player Journey
// ============================================

function PlayerJourney({ data }: { data: any }) {
  if (!data) return <EmptyState message="Player Journey 데이터 로딩 중..." />

  const { phases, playtime_paradox, sentiment_curve, insights } = data
  const phaseIcons: Record<string, string> = { onboarding: '🚪', learning: '📚', core: '🎮', veteran: '👑' }
  const phaseColors: Record<string, string> = { onboarding: '#ef4444', learning: '#f59e0b', core: '#3b82f6', veteran: '#8b5cf6' }

  return (
    <div className="space-y-6">
      {playtime_paradox?.exists && (
        <Card className={`border-l-4 ${playtime_paradox.type === 'veteran_burnout' ? 'border-l-red-500 bg-red-500/5' : 'border-l-amber-500 bg-amber-500/5'}`}>
          <div className="flex items-start gap-4">
            <div className="text-4xl">{playtime_paradox.type === 'veteran_burnout' ? '🔥' : '⏳'}</div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">⚠️ Playtime Paradox 발견!</h3>
              <p className="text-slate-300 mb-2">{playtime_paradox.description}</p>
              {playtime_paradox.top_complaints?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {playtime_paradox.top_complaints.slice(0, 5).map((c: any, i: number) => (
                    <span key={i} className="px-2 py-1 bg-slate-800 text-slate-300 rounded text-sm">{c.keyword} ({c.count})</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      <Card>
        <h3 className="text-xl font-bold text-white mb-4">📈 플레이타임별 긍정률 변화</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sentiment_curve || []}>
              <defs>
                <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="phase" stroke="#64748b" />
              <YAxis domain={[0, 100]} stroke="#64748b" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} formatter={(value: any) => [`${value}%`, '긍정률']} />
              <Area type="monotone" dataKey="positive_rate" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRate)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-4 gap-4">
        {Object.entries(phases || {}).map(([key, phase]: [string, any]) => (
          <Card key={key} className="border-t-4" style={{ borderTopColor: phaseColors[key] || '#64748b' }}>
            <div className="text-3xl mb-2">{phaseIcons[key] || '📍'}</div>
            <div className="text-xl font-bold text-white">{phase.name}</div>
            <div className="text-xs text-slate-500 mb-4">{phase.label}</div>
            <div className="text-4xl font-bold mb-2" style={{ color: getRatingColor(phase.positive_rate || 0) }}>{phase.positive_rate || 0}%</div>
            <div className="text-sm text-slate-400 mb-4">{phase.total_reviews || 0}개 리뷰</div>
            {phase.pain_points?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-700">
                <div className="text-xs text-red-400 mb-2">주요 불만:</div>
                <div className="flex flex-wrap gap-1">
                  {phase.pain_points.slice(0, 3).map((pp: any, i: number) => (
                    <span key={i} className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded">{pp.keyword}</span>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {insights?.length > 0 && (
        <Card>
          <h3 className="text-xl font-bold text-white mb-4">🔍 Journey 인사이트</h3>
          <div className="space-y-3">
            {insights.map((insight: any, i: number) => (
              <div key={i} className={`p-4 rounded-xl border ${insight.type === 'critical' ? 'bg-red-500/10 border-red-500/30' : insight.type === 'warning' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-green-500/10 border-green-500/30'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded text-xs ${insight.type === 'critical' ? 'bg-red-500/20 text-red-400' : insight.type === 'warning' ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/20 text-green-400'}`}>{insight.phase}</span>
                  <span className="font-medium text-white">{insight.title}</span>
                </div>
                <p className="text-sm text-slate-400">{insight.description}</p>
                <p className="text-xs text-cyan-400 mt-2">💡 {insight.action}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

// ============================================
// Module 4: Tech & Market
// ============================================

function TechMarket({ data }: { data: any }) {
  if (!data) return <EmptyState message="Tech & Market 데이터 로딩 중..." />

  const { tech_health, global_sentiment } = data
  const techIcons: Record<string, string> = { crash_freeze: '💥', fps_optimization: '🖥️', network_server: '🌐', cheating: '🚫' }

  return (
    <div className="space-y-6">
      <Card className={`border-l-4 ${tech_health?.overall_status === 'critical' ? 'border-l-red-500' : tech_health?.overall_status === 'warning' ? 'border-l-amber-500' : 'border-l-green-500'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white">🔧 Tech Health Index</h3>
            <p className="text-slate-400 text-sm">기술적 안정성 종합 점수</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold" style={{ color: tech_health?.overall_score >= 80 ? COLORS.positive : tech_health?.overall_score >= 50 ? COLORS.warning : COLORS.negative }}>
              {tech_health?.overall_score || 0}<span className="text-lg text-slate-500">/100</span>
            </div>
            <div className={`text-sm ${tech_health?.overall_status === 'healthy' ? 'text-green-400' : tech_health?.overall_status === 'warning' ? 'text-amber-400' : 'text-red-400'}`}>
              {tech_health?.overall_status === 'healthy' ? '✅ Healthy' : tech_health?.overall_status === 'warning' ? '⚠️ Warning' : '🔴 Critical'}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-4 gap-4">
        {Object.entries(tech_health?.categories || {}).map(([key, cat]: [string, any]) => (
          <Card key={key} className={`${cat.severity === 'critical' ? 'bg-red-500/5 border-red-500/30' : cat.severity === 'warning' ? 'bg-amber-500/5 border-amber-500/30' : cat.severity === 'minor' ? 'bg-slate-800/50 border-slate-700/50' : 'bg-green-500/5 border-green-500/30'}`}>
            <div className="text-3xl mb-2">{techIcons[key] || '🔧'}</div>
            <div className="text-lg font-bold text-white">{cat.name}</div>
            <div className={`text-2xl font-bold mt-2 ${cat.severity === 'critical' ? 'text-red-400' : cat.severity === 'warning' ? 'text-amber-400' : cat.severity === 'healthy' ? 'text-green-400' : 'text-slate-400'}`}>
              {cat.negative_mentions || 0}<span className="text-sm text-slate-500 ml-1">이슈</span>
            </div>
            <div className={`text-xs mt-2 px-2 py-1 rounded-full inline-block ${cat.severity === 'critical' ? 'bg-red-500/20 text-red-400' : cat.severity === 'warning' ? 'bg-amber-500/20 text-amber-400' : cat.severity === 'healthy' ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}`}>{cat.severity}</div>
            {cat.top_keywords?.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-700">
                <div className="flex flex-wrap gap-1">
                  {cat.top_keywords.slice(0, 3).map(([kw, count]: [string, number], i: number) => (
                    <span key={i} className="text-xs px-2 py-0.5 bg-slate-800 text-slate-400 rounded">{kw}</span>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      <Card>
        <h3 className="text-xl font-bold text-white mb-4">🌍 Global Sentiment Map</h3>
        <div className="mb-4 text-sm text-slate-400">
          전체 평균 긍정률: <span className="text-white font-medium">{global_sentiment?.average_positive_rate || 0}%</span>
          <span className="ml-4">분석 언어: {global_sentiment?.total_languages || 0}개</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-slate-400 font-medium">언어</th>
                <th className="text-right py-3 px-4 text-slate-400 font-medium">리뷰 수</th>
                <th className="text-right py-3 px-4 text-slate-400 font-medium">긍정률</th>
                <th className="text-right py-3 px-4 text-slate-400 font-medium">평균 대비</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">주요 불만</th>
              </tr>
            </thead>
            <tbody>
              {(global_sentiment?.by_language || []).slice(0, 10).map((lang: any, i: number) => (
                <tr key={i} className="border-b border-slate-800 hover:bg-slate-800/50">
                  <td className="py-3 px-4"><span className="font-medium text-white">{lang.language_name}</span></td>
                  <td className="py-3 px-4 text-right text-slate-300">{lang.total_reviews?.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right"><span style={{ color: getRatingColor(lang.positive_rate || 0) }} className="font-medium">{lang.positive_rate}%</span></td>
                  <td className="py-3 px-4 text-right"><span className={lang.diff_from_avg >= 0 ? 'text-green-400' : 'text-red-400'}>{lang.diff_from_avg >= 0 ? '+' : ''}{lang.diff_from_avg}%p</span></td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      {(lang.top_complaints || []).map((c: string, j: number) => (
                        <span key={j} className="text-xs px-2 py-0.5 bg-slate-700 text-slate-400 rounded">{c}</span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {global_sentiment?.problem_markets?.length > 0 && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <h4 className="font-medium text-red-400 mb-2">⚠️ 주의 필요 시장</h4>
            <div className="flex gap-4">
              {global_sentiment.problem_markets.map((market: any, i: number) => (
                <div key={i} className="text-sm">
                  <span className="text-white">{market.language_name}</span>
                  <span className="text-red-400 ml-2">{market.positive_rate}%</span>
                  <span className="text-slate-500 ml-1">(평균 대비 {market.diff_from_avg}%p)</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

// ============================================
// Module 5: LiveOps & Meta
// ============================================

function LiveOpsMeta({ data }: { data: any }) {
  if (!data) return <EmptyState message="LiveOps & Meta 데이터 로딩 중..." />

  const { patch_impact, competitive_mentions, update_sentiment } = data

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <h3 className="text-xl font-bold text-white mb-4">📦 패치/업데이트 반응</h3>
          {patch_impact?.mentioned ? (
            <div>
              <div className="text-4xl font-bold text-white mb-2">{patch_impact.count}<span className="text-lg text-slate-500 ml-1">개 언급</span></div>
              <div className="flex gap-4 mb-4">
                <div className="text-green-400">👍 {patch_impact.positive}</div>
                <div className="text-red-400">👎 {patch_impact.negative}</div>
              </div>
              <div className={`inline-block px-3 py-1 rounded-full text-sm ${patch_impact.sentiment === 'positive' ? 'bg-green-500/20 text-green-400' : patch_impact.sentiment === 'negative' ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-400'}`}>
                {patch_impact.sentiment === 'positive' ? '✅ 긍정적 반응' : patch_impact.sentiment === 'negative' ? '❌ 부정적 반응' : '➖ 복합적'}
              </div>
            </div>
          ) : (
            <div className="text-slate-500">패치/업데이트 관련 언급이 없습니다.</div>
          )}
        </Card>

        <Card>
          <h3 className="text-xl font-bold text-white mb-4">📡 운영/업데이트 감정</h3>
          <div className="flex items-center gap-8">
            <div>
              <div className="text-green-400 text-3xl font-bold">{update_sentiment?.positive_mentions || 0}</div>
              <div className="text-sm text-slate-500">긍정 언급</div>
            </div>
            <div>
              <div className="text-red-400 text-3xl font-bold">{update_sentiment?.negative_mentions || 0}</div>
              <div className="text-sm text-slate-500">부정 언급</div>
            </div>
            <div className={`px-4 py-2 rounded-xl ${update_sentiment?.sentiment === 'positive' ? 'bg-green-500/20 text-green-400' : update_sentiment?.sentiment === 'negative' ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-400'}`}>
              {update_sentiment?.sentiment === 'positive' ? '👍 호의적' : update_sentiment?.sentiment === 'negative' ? '👎 비호의적' : '➖ 복합적'}
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="text-xl font-bold text-white mb-4">🎮 경쟁작 언급 분석</h3>
        {competitive_mentions?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">게임</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">언급 수</th>
                  <th className="text-center py-3 px-4 text-slate-400 font-medium">맥락</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">우리가 더 좋음</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">경쟁작이 더 좋음</th>
                </tr>
              </thead>
              <tbody>
                {competitive_mentions.map((comp: any, i: number) => (
                  <tr key={i} className="border-b border-slate-800 hover:bg-slate-800/50">
                    <td className="py-3 px-4 font-medium text-white capitalize">{comp.game}</td>
                    <td className="py-3 px-4 text-right text-slate-300">{comp.mentions}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${comp.context === 'favorable' ? 'bg-green-500/20 text-green-400' : comp.context === 'unfavorable' ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-400'}`}>
                        {comp.context === 'favorable' ? '우위' : comp.context === 'unfavorable' ? '열위' : '중립'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-green-400">{comp.positive_context}</td>
                    <td className="py-3 px-4 text-right text-red-400">{comp.negative_context}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-slate-500 py-8">경쟁작 언급이 감지되지 않았습니다.</div>
        )}
      </Card>

      {competitive_mentions?.length > 0 && (
        <Card className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30">
          <h3 className="text-xl font-bold text-white mb-4">🏆 경쟁 포지셔닝 요약</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">{competitive_mentions.filter((c: any) => c.context === 'favorable').length}</div>
              <div className="text-sm text-slate-400">우위 평가</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-400">{competitive_mentions.filter((c: any) => c.context === 'neutral').length}</div>
              <div className="text-sm text-slate-400">중립 평가</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-400">{competitive_mentions.filter((c: any) => c.context === 'unfavorable').length}</div>
              <div className="text-sm text-slate-400">열위 평가</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

// ============================================
// 공통 컴포넌트
// ============================================

function Card({ children, className = '', style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`bg-slate-900/50 backdrop-blur rounded-2xl border border-slate-700/50 p-6 ${className}`} style={style}>
      {children}
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <div className="text-4xl mb-4">📊</div>
        <div className="text-slate-400">{message}</div>
      </div>
    </div>
  )
}

export default Dashboard
