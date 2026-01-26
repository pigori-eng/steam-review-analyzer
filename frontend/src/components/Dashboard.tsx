/**
 * Steam Review Analyzer - Advanced Dashboard
 * ==========================================
 * 박사급 심층 분석 시각화 대시보드
 * 
 * Features:
 * - 6개 핵심 모듈 탭 구조
 * - 인터랙티브 차트 및 시각화
 * - Pain Points 매트릭스
 * - 플레이타임별 코호트 분석
 * - 국가별 히트맵
 * 
 * Author: Chang yoon
 * Version: 2.0.0
 */

import React, { useState, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, ZAxis, Legend, CartesianGrid
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
// 색상 팔레트
// ============================================

const COLORS = {
  positive: '#22c55e',
  negative: '#ef4444',
  neutral: '#f59e0b',
  blue: '#3b82f6',
  purple: '#8b5cf6',
  cyan: '#06b6d4',
  pink: '#ec4899',
  
  // 그라데이션
  gradient: {
    green: ['#22c55e', '#16a34a'],
    red: ['#ef4444', '#dc2626'],
    blue: ['#3b82f6', '#2563eb'],
    purple: ['#8b5cf6', '#7c3aed'],
  },
  
  // 히트맵
  heatmap: {
    excellent: '#22c55e',
    good: '#84cc16',
    mixed: '#f59e0b',
    poor: '#ef4444',
  }
}

// 등급별 색상
const getRatingColor = (rate: number) => {
  if (rate >= 85) return COLORS.heatmap.excellent
  if (rate >= 70) return COLORS.heatmap.good
  if (rate >= 50) return COLORS.heatmap.mixed
  return COLORS.heatmap.poor
}

const getRatingLabel = (rate: number) => {
  if (rate >= 85) return '매우 긍정적'
  if (rate >= 70) return '대체로 긍정적'
  if (rate >= 50) return '복합적'
  return '부정적'
}

// ============================================
// 메인 Dashboard 컴포넌트
// ============================================

function Dashboard({ data }: DashboardProps) {
  const { game_info, statistics, analysis } = data
  const [activeTab, setActiveTab] = useState('executive')

  const tabs = [
    { id: 'executive', name: '핵심 요약', icon: '🎯', desc: 'Executive Summary' },
    { id: 'sentiment', name: '감정 분석', icon: '💬', desc: 'Sentiment Deep-dive' },
    { id: 'journey', name: '플레이어 여정', icon: '🚀', desc: 'Player Journey' },
    { id: 'regional', name: '지역별 분석', icon: '🌍', desc: 'Regional Intelligence' },
    { id: 'technical', name: '기술 분석', icon: '🔧', desc: 'Technical Health' },
    { id: 'painpoints', name: 'Pain Points', icon: '⚠️', desc: 'Priority Matrix' },
  ]

  return (
    <div className="space-y-6">
      {/* 게임 헤더 */}
      <GameHeader gameInfo={game_info} statistics={statistics} />

      {/* 탭 네비게이션 */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-shrink-0 px-4 py-3 rounded-xl transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-white border border-slate-700/50'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{tab.icon}</span>
              <div className="text-left">
                <div className="font-medium text-sm">{tab.name}</div>
                <div className="text-xs opacity-70">{tab.desc}</div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* 탭 컨텐츠 */}
      <div className="min-h-[600px]">
        {activeTab === 'executive' && (
          <ExecutiveSummary analysis={analysis} statistics={statistics} />
        )}
        {activeTab === 'sentiment' && (
          <SentimentDeepDive analysis={analysis} />
        )}
        {activeTab === 'journey' && (
          <PlayerJourney analysis={analysis} />
        )}
        {activeTab === 'regional' && (
          <RegionalIntelligence analysis={analysis} statistics={statistics} />
        )}
        {activeTab === 'technical' && (
          <TechnicalHealth analysis={analysis} />
        )}
        {activeTab === 'painpoints' && (
          <PainPointsMatrix analysis={analysis} />
        )}
      </div>

      {/* API 키 없음 안내 */}
      {analysis?.note && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
          <p className="text-amber-400 text-center flex items-center justify-center gap-2">
            <span>💡</span>
            {analysis.note}
          </p>
        </div>
      )}
    </div>
  )
}

// ============================================
// 게임 헤더 컴포넌트
// ============================================

function GameHeader({ gameInfo, statistics }: { gameInfo: any, statistics: any }) {
  const positiveRate = statistics?.positive_rate || 0

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50">
      {/* 배경 이미지 (블러) */}
      {gameInfo?.header_image && (
        <div 
          className="absolute inset-0 opacity-20 bg-cover bg-center"
          style={{ backgroundImage: `url(${gameInfo.header_image})`, filter: 'blur(20px)' }}
        />
      )}
      
      <div className="relative p-6 flex flex-col md:flex-row gap-6">
        {/* 게임 이미지 */}
        {gameInfo?.header_image && (
          <img 
            src={gameInfo.header_image} 
            alt={gameInfo.name}
            className="w-full md:w-64 h-auto rounded-xl shadow-2xl"
          />
        )}
        
        {/* 게임 정보 */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white mb-2">
            {gameInfo?.name || 'Unknown Game'}
          </h1>
          <p className="text-slate-400 mb-4">
            {gameInfo?.developers?.join(', ')} • {gameInfo?.release_date}
          </p>
          
          {/* KPI 카드들 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KPICard
              label="전체 평가"
              value={getRatingLabel(positiveRate)}
              subValue={`${positiveRate}%`}
              color={getRatingColor(positiveRate)}
              icon="👍"
            />
            <KPICard
              label="총 리뷰"
              value={statistics?.total_reviews?.toLocaleString() || '0'}
              subValue="개"
              color={COLORS.blue}
              icon="📝"
            />
            <KPICard
              label="평균 플레이타임"
              value={statistics?.average_playtime_hours || '0'}
              subValue="시간"
              color={COLORS.purple}
              icon="⏱️"
            />
            <KPICard
              label="분석 언어"
              value={Object.keys(statistics?.language_distribution || {}).length}
              subValue="개국"
              color={COLORS.cyan}
              icon="🌐"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function KPICard({ label, value, subValue, color, icon }: {
  label: string
  value: string | number
  subValue: string
  color: string
  icon: string
}) {
  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-xl p-3 border border-slate-700/50">
      <div className="flex items-center gap-2 mb-1">
        <span>{icon}</span>
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-bold" style={{ color }}>{value}</span>
        <span className="text-sm text-slate-500">{subValue}</span>
      </div>
    </div>
  )
}

// ============================================
// Module 1: Executive Summary
// ============================================

function ExecutiveSummary({ analysis, statistics }: { analysis: any, statistics: any }) {
  const execSummary = analysis?.executive_summary || {}
  const keywordAnalysis = analysis?.keyword_analysis || {}
  const painPoints = analysis?.pain_points || {}

  return (
    <div className="space-y-6">
      {/* 상단 KPI 대시보드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Risk Score"
          value={execSummary.risk_score || 0}
          unit="/100"
          description="치명적 키워드 비율"
          type={execSummary.risk_score > 30 ? 'danger' : execSummary.risk_score > 15 ? 'warning' : 'success'}
          icon="⚠️"
        />
        <MetricCard
          title="Price Valuation"
          value={execSummary.price_valuation || '분석중'}
          description="가격 만족도"
          type={execSummary.price_valuation === '혜자' ? 'success' : execSummary.price_valuation === '창렬' ? 'danger' : 'neutral'}
          icon="💰"
        />
        <MetricCard
          title="긍정률"
          value={execSummary.positive_rate || statistics?.positive_rate || 0}
          unit="%"
          description="전체 평균"
          type={(execSummary.positive_rate || statistics?.positive_rate || 0) >= 70 ? 'success' : 'warning'}
          icon="👍"
        />
        <MetricCard
          title="분석 리뷰"
          value={execSummary.total_reviews || statistics?.total_reviews || 0}
          unit="개"
          description="수집된 리뷰"
          type="info"
          icon="📊"
        />
      </div>

      {/* 3대 전략 인사이트 */}
      <Card title="💡 전략적 핵심 인사이트" subtitle="PM 의사결정을 위한 Top 3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(execSummary.strategic_insights || []).map((insight: any, i: number) => (
            <InsightCard key={i} insight={insight} index={i + 1} />
          ))}
          {(!execSummary.strategic_insights || execSummary.strategic_insights.length === 0) && (
            <div className="col-span-3 text-center text-slate-500 py-8">
              인사이트를 생성하려면 더 많은 리뷰 데이터가 필요합니다.
            </div>
          )}
        </div>
      </Card>

      {/* 차트 영역 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 긍정/부정 파이차트 */}
        <Card title="📊 전체 평가 분포">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: '긍정', value: statistics?.positive_reviews || 0 },
                    { name: '부정', value: statistics?.negative_reviews || 0 },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill={COLORS.positive} />
                  <Cell fill={COLORS.negative} />
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #334155',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-8 mt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {statistics?.positive_reviews?.toLocaleString() || 0}
              </div>
              <div className="text-sm text-slate-400">긍정 리뷰</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">
                {statistics?.negative_reviews?.toLocaleString() || 0}
              </div>
              <div className="text-sm text-slate-400">부정 리뷰</div>
            </div>
          </div>
        </Card>

        {/* 워드 클라우드 (키워드 태그) */}
        <Card title="☁️ 핵심 키워드">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-green-400 mb-2">👍 긍정 키워드</h4>
              <div className="flex flex-wrap gap-2">
                {(keywordAnalysis.top_keywords || [])
                  .filter((k: any) => k.is_positive_keyword)
                  .slice(0, 10)
                  .map((kw: any, i: number) => (
                    <KeywordTag key={i} keyword={kw.keyword} count={kw.count} type="positive" />
                  ))}
                {(!keywordAnalysis.top_keywords || keywordAnalysis.top_keywords.filter((k: any) => k.is_positive_keyword).length === 0) && (
                  <span className="text-slate-500 text-sm">데이터 수집 중...</span>
                )}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-red-400 mb-2">👎 부정 키워드</h4>
              <div className="flex flex-wrap gap-2">
                {(keywordAnalysis.top_keywords || [])
                  .filter((k: any) => !k.is_positive_keyword)
                  .slice(0, 10)
                  .map((kw: any, i: number) => (
                    <KeywordTag key={i} keyword={kw.keyword} count={kw.count} type="negative" />
                  ))}
                {(!keywordAnalysis.top_keywords || keywordAnalysis.top_keywords.filter((k: any) => !k.is_positive_keyword).length === 0) && (
                  <span className="text-slate-500 text-sm">데이터 수집 중...</span>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Critical Issues 요약 */}
      {painPoints.matrix?.critical?.length > 0 && (
        <Card title="🚨 긴급 대응 필요" subtitle="Critical Issues" type="danger">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {painPoints.matrix.critical.slice(0, 3).map((pp: any, i: number) => (
              <div key={i} className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-white">{pp.keyword}</span>
                  <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded-full">
                    {pp.count}회
                  </span>
                </div>
                <div className="text-sm text-slate-400">
                  영향도: {pp.impact}% | 빈도: {pp.frequency}%
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

// ============================================
// Module 2: Sentiment Deep-dive
// ============================================

function SentimentDeepDive({ analysis }: { analysis: any }) {
  const keywordAnalysis = analysis?.keyword_analysis || {}
  const categoryGroups = keywordAnalysis.category_groups || {}
  const categoryScores = keywordAnalysis.category_scores || {}

  // 레이더 차트 데이터
  const radarData = useMemo(() => {
    const categories = ['combat', 'gameplay', 'content', 'performance', 'graphics', 'value']
    return categories.map(cat => ({
      category: cat.charAt(0).toUpperCase() + cat.slice(1),
      score: Math.max(0, (categoryScores[cat]?.positive_rate || 50)),
      fullMark: 100
    }))
  }, [categoryScores])

  return (
    <div className="space-y-6">
      {/* 카테고리별 레이더 차트 */}
      <Card title="🎯 카테고리별 긍정률 비교">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="category" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b' }} />
              <Radar
                name="긍정률"
                dataKey="score"
                stroke={COLORS.blue}
                fill={COLORS.blue}
                fillOpacity={0.3}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #334155',
                  borderRadius: '8px'
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* 카테고리 그룹별 상세 */}
      {Object.entries(categoryGroups).map(([groupName, categories]: [string, any]) => (
        <Card key={groupName} title={`📁 ${groupName}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat: any) => (
              <CategoryCard key={cat.category} data={cat} />
            ))}
          </div>
        </Card>
      ))}

      {/* Top 20 키워드 상세 */}
      <Card title="🔤 가장 많이 언급된 키워드 TOP 20">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-slate-400 font-medium">순위</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">키워드</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">카테고리</th>
                <th className="text-right py-3 px-4 text-slate-400 font-medium">언급 횟수</th>
                <th className="text-right py-3 px-4 text-slate-400 font-medium">긍정 리뷰</th>
                <th className="text-right py-3 px-4 text-slate-400 font-medium">부정 리뷰</th>
                <th className="text-center py-3 px-4 text-slate-400 font-medium">유형</th>
              </tr>
            </thead>
            <tbody>
              {(keywordAnalysis.top_keywords || []).slice(0, 20).map((kw: any, i: number) => (
                <tr key={i} className="border-b border-slate-800 hover:bg-slate-800/50">
                  <td className="py-3 px-4 text-slate-500">{i + 1}</td>
                  <td className="py-3 px-4 font-medium text-white">{kw.keyword}</td>
                  <td className="py-3 px-4 text-slate-400">{kw.category}</td>
                  <td className="py-3 px-4 text-right text-white">{kw.count}</td>
                  <td className="py-3 px-4 text-right text-green-400">{kw.positive_reviews}</td>
                  <td className="py-3 px-4 text-right text-red-400">{kw.negative_reviews}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      kw.is_positive_keyword 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {kw.is_positive_keyword ? '긍정' : '부정'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function CategoryCard({ data }: { data: any }) {
  const score = data.sentiment_score || 0
  const positiveRate = data.positive_rate || 0
  
  return (
    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-medium text-white capitalize">{data.category}</h4>
          <p className="text-xs text-slate-500">{data.total_mentions || 0}회 언급</p>
        </div>
        <div className={`text-lg font-bold ${score >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {score >= 0 ? '+' : ''}{score}
        </div>
      </div>
      
      {/* 긍정률 바 */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-400">긍정률</span>
          <span style={{ color: getRatingColor(positiveRate) }}>{positiveRate}%</span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-500"
            style={{ 
              width: `${positiveRate}%`,
              backgroundColor: getRatingColor(positiveRate)
            }}
          />
        </div>
      </div>
      
      {/* 언급 비율 */}
      <div className="flex gap-2 text-xs">
        <span className="text-green-400">👍 {data.positive_mentions || 0}</span>
        <span className="text-red-400">👎 {data.negative_mentions || 0}</span>
      </div>
    </div>
  )
}

// ============================================
// Module 3: Player Journey
// ============================================

function PlayerJourney({ analysis }: { analysis: any }) {
  const playtimeAnalysis = analysis?.playtime_analysis || {}
  const groups = playtimeAnalysis.groups || []
  const paradox = playtimeAnalysis.playtime_paradox || {}
  const insights = playtimeAnalysis.insights || []

  // 차트 데이터
  const chartData = groups.map((g: any) => ({
    name: g.range,
    긍정률: g.positive_rate,
    리뷰수: g.total_reviews
  }))

  return (
    <div className="space-y-6">
      {/* Playtime Paradox 알림 */}
      {paradox.exists && (
        <Card type={paradox.type === 'veteran_burnout' ? 'danger' : 'warning'}>
          <div className="flex items-start gap-4">
            <div className="text-4xl">
              {paradox.type === 'veteran_burnout' ? '🔥' : '⏳'}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">
                Playtime Paradox 발견!
              </h3>
              <p className="text-slate-300 mb-2">{paradox.description}</p>
              <p className="text-sm text-amber-400">
                💡 권장 액션: {paradox.recommendation}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* 감정 변화 타임라인 */}
      <Card title="📈 플레이타임별 긍정률 변화" subtitle="감정 전환 타임라인">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorPositive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.blue} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={COLORS.blue} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis domain={[0, 100]} stroke="#64748b" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #334155',
                  borderRadius: '8px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="긍정률" 
                stroke={COLORS.blue} 
                fillOpacity={1} 
                fill="url(#colorPositive)" 
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* 플레이타임 구간별 상세 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {groups.map((group: any, i: number) => (
          <PlaytimeGroupCard key={i} group={group} index={i} />
        ))}
      </div>

      {/* 인사이트 */}
      {insights.length > 0 && (
        <Card title="🔍 플레이타임 분석 인사이트">
          <div className="space-y-3">
            {insights.map((insight: any, i: number) => (
              <div 
                key={i}
                className={`p-4 rounded-xl border ${
                  insight.type === 'critical' ? 'bg-red-500/10 border-red-500/30' :
                  insight.type === 'warning' ? 'bg-amber-500/10 border-amber-500/30' :
                  insight.type === 'positive' ? 'bg-green-500/10 border-green-500/30' :
                  'bg-blue-500/10 border-blue-500/30'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-sm font-medium ${
                    insight.type === 'critical' ? 'text-red-400' :
                    insight.type === 'warning' ? 'text-amber-400' :
                    insight.type === 'positive' ? 'text-green-400' :
                    'text-blue-400'
                  }`}>
                    {insight.title}
                  </span>
                  <span className="text-xs text-slate-500">
                    ({insight.affected_reviews}개 리뷰 영향)
                  </span>
                </div>
                <p className="text-sm text-slate-300">{insight.description}</p>
                <p className="text-xs text-slate-500 mt-1">💡 {insight.recommendation}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

function PlaytimeGroupCard({ group, index }: { group: any, index: number }) {
  const icons = ['🚪', '📈', '🎮', '👑']
  const colors = ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6']
  
  return (
    <div 
      className="rounded-xl p-4 border-l-4"
      style={{ 
        borderLeftColor: colors[index],
        backgroundColor: `${colors[index]}10`
      }}
    >
      <div className="text-2xl mb-2">{icons[index]}</div>
      <div className="text-lg font-bold text-white">{group.range}</div>
      <div className="text-xs text-slate-400 mb-3">{group.label}</div>
      
      <div 
        className="text-3xl font-bold mb-1"
        style={{ color: getRatingColor(group.positive_rate) }}
      >
        {group.positive_rate}%
      </div>
      <div className="text-xs text-slate-500">
        {group.total_reviews?.toLocaleString() || 0}개 리뷰
      </div>
    </div>
  )
}

// ============================================
// Module 4: Regional Intelligence
// ============================================

function RegionalIntelligence({ analysis, statistics }: { analysis: any, statistics: any }) {
  const regionalAnalysis = analysis?.regional_analysis || {}
  const byLanguage = regionalAnalysis.by_language || []
  const insights = regionalAnalysis.insights || []
  const categoryMatrix = regionalAnalysis.category_matrix || []

  // 바 차트 데이터
  const chartData = byLanguage.slice(0, 10).map((lang: any) => ({
    name: lang.language_name || lang.language,
    긍정률: lang.positive_rate,
    리뷰수: lang.total_reviews
  }))

  return (
    <div className="space-y-6">
      {/* 언어별 긍정률 차트 */}
      <Card title="🌍 언어별 긍정률 비교">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" domain={[0, 100]} stroke="#64748b" />
              <YAxis type="category" dataKey="name" width={100} stroke="#64748b" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #334155',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="긍정률" radius={[0, 4, 4, 0]}>
                {chartData.map((entry: any, index: number) => (
                  <Cell key={index} fill={getRatingColor(entry.긍정률)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* 언어별 상세 테이블 */}
      <Card title="📋 언어별 상세 분석">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-slate-400 font-medium">순위</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">언어</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">시장</th>
                <th className="text-right py-3 px-4 text-slate-400 font-medium">총 리뷰</th>
                <th className="text-right py-3 px-4 text-slate-400 font-medium">긍정</th>
                <th className="text-right py-3 px-4 text-slate-400 font-medium">긍정률</th>
                <th className="text-center py-3 px-4 text-slate-400 font-medium">등급</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">주요 이슈</th>
              </tr>
            </thead>
            <tbody>
              {byLanguage.slice(0, 15).map((lang: any, i: number) => (
                <tr key={i} className="border-b border-slate-800 hover:bg-slate-800/50">
                  <td className="py-3 px-4 text-slate-500">{i + 1}</td>
                  <td className="py-3 px-4 font-medium text-white">
                    {lang.language_name || lang.language}
                  </td>
                  <td className="py-3 px-4 text-slate-400">{lang.region}</td>
                  <td className="py-3 px-4 text-right text-slate-300">
                    {lang.total_reviews?.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right text-green-400">
                    {lang.positive_reviews?.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span 
                      className="font-medium"
                      style={{ color: getRatingColor(lang.positive_rate) }}
                    >
                      {lang.positive_rate}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <RatingBadge rating={lang.rating} />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      {(lang.top_complaints || []).slice(0, 2).map((issue: string, j: number) => (
                        <span key={j} className="text-xs px-2 py-1 bg-slate-700 text-slate-300 rounded">
                          {issue}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 지역별 인사이트 */}
      {insights.length > 0 && (
        <Card title="💡 지역별 핵심 인사이트">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight: any, i: number) => (
              <div 
                key={i}
                className={`p-4 rounded-xl border ${
                  insight.type === 'warning' 
                    ? 'bg-amber-500/10 border-amber-500/30' 
                    : 'bg-green-500/10 border-green-500/30'
                }`}
              >
                <h4 className={`font-medium mb-1 ${
                  insight.type === 'warning' ? 'text-amber-400' : 'text-green-400'
                }`}>
                  {insight.title}
                </h4>
                <p className="text-sm text-slate-300 mb-2">{insight.description}</p>
                <p className="text-xs text-slate-500">💡 {insight.recommendation}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

function RatingBadge({ rating }: { rating: string }) {
  const config: Record<string, { bg: string, text: string, label: string }> = {
    excellent: { bg: 'bg-green-500/20', text: 'text-green-400', label: '우수' },
    good: { bg: 'bg-lime-500/20', text: 'text-lime-400', label: '양호' },
    mixed: { bg: 'bg-amber-500/20', text: 'text-amber-400', label: '보통' },
    poor: { bg: 'bg-red-500/20', text: 'text-red-400', label: '주의' },
  }
  
  const c = config[rating] || config.mixed
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  )
}

// ============================================
// Module 5: Technical Health
// ============================================

function TechnicalHealth({ analysis }: { analysis: any }) {
  const keywordAnalysis = analysis?.keyword_analysis || {}
  const categoryScores = keywordAnalysis.category_scores || {}
  
  const techCategories = [
    { key: 'performance', name: 'Performance', icon: '🖥️', desc: 'FPS/최적화' },
    { key: 'stability', name: 'Stability', icon: '💥', desc: '크래시/버그' },
    { key: 'network', name: 'Network', icon: '🌐', desc: '서버/연결' },
    { key: 'cheating', name: 'Cheating', icon: '🚫', desc: '핵/치팅' },
  ]

  return (
    <div className="space-y-6">
      {/* 기술 헬스 지표 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {techCategories.map((cat) => {
          const data = categoryScores[cat.key] || {}
          const severity = data.negative_mentions > data.positive_mentions ? 'critical' : 
                          data.negative_mentions > 0 ? 'warning' : 'good'
          
          return (
            <TechHealthCard
              key={cat.key}
              icon={cat.icon}
              name={cat.name}
              desc={cat.desc}
              mentions={data.total_mentions || 0}
              negativeRate={data.negative_mentions || 0}
              severity={severity}
            />
          )
        })}
      </div>

      {/* 기술 이슈 상세 */}
      <Card title="🔧 기술 이슈 상세 분석">
        <div className="space-y-4">
          {techCategories.map((cat) => {
            const data = categoryScores[cat.key] || {}
            if (data.total_mentions === 0) return null
            
            return (
              <div key={cat.key} className="bg-slate-800/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{cat.icon}</span>
                    <div>
                      <h4 className="font-medium text-white">{cat.name}</h4>
                      <p className="text-xs text-slate-500">{cat.desc}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold" style={{ 
                      color: data.sentiment_score >= 0 ? COLORS.positive : COLORS.negative 
                    }}>
                      {data.sentiment_score >= 0 ? '+' : ''}{data.sentiment_score || 0}
                    </div>
                    <div className="text-xs text-slate-500">감정 점수</div>
                  </div>
                </div>
                
                {/* 바 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-green-400">긍정</span>
                      <span className="text-green-400">{data.positive_mentions || 0}</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full"
                        style={{ 
                          width: `${(data.positive_mentions || 0) / Math.max(data.total_mentions || 1, 1) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-red-400">부정</span>
                      <span className="text-red-400">{data.negative_mentions || 0}</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-red-500 rounded-full"
                        style={{ 
                          width: `${(data.negative_mentions || 0) / Math.max(data.total_mentions || 1, 1) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}

function TechHealthCard({ icon, name, desc, mentions, negativeRate, severity }: {
  icon: string
  name: string
  desc: string
  mentions: number
  negativeRate: number
  severity: 'good' | 'warning' | 'critical'
}) {
  const colors = {
    good: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400' },
    warning: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' },
    critical: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' },
  }
  
  const c = colors[severity]
  
  return (
    <div className={`rounded-xl p-4 border ${c.bg} ${c.border}`}>
      <div className="text-2xl mb-2">{icon}</div>
      <div className="font-medium text-white">{name}</div>
      <div className="text-xs text-slate-500 mb-3">{desc}</div>
      <div className={`text-2xl font-bold ${c.text}`}>
        {mentions}
      </div>
      <div className="text-xs text-slate-500">
        부정 {negativeRate}건
      </div>
    </div>
  )
}

// ============================================
// Module 6: Pain Points Matrix
// ============================================

function PainPointsMatrix({ analysis }: { analysis: any }) {
  const painPoints = analysis?.pain_points || {}
  const matrix = painPoints.matrix || {}
  const allPainPoints = painPoints.all_pain_points || []
  const sprintPlan = painPoints.sprint_plan || []

  // 스캐터 차트 데이터
  const scatterData = allPainPoints.map((pp: any) => ({
    x: pp.frequency,
    y: pp.impact,
    z: pp.count,
    name: pp.keyword,
    category: pp.category
  }))

  return (
    <div className="space-y-6">
      {/* Pain Points 4분면 매트릭스 */}
      <Card title="📊 Pain Points 우선순위 매트릭스" subtitle="빈도 × 영향도">
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                type="number" 
                dataKey="x" 
                name="빈도" 
                unit="%" 
                stroke="#64748b"
                label={{ value: '빈도 (%)', position: 'bottom', fill: '#64748b' }}
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                name="영향도" 
                unit="%" 
                stroke="#64748b"
                label={{ value: '영향도 (%)', angle: -90, position: 'left', fill: '#64748b' }}
              />
              <ZAxis type="number" dataKey="z" range={[50, 500]} />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #334155',
                  borderRadius: '8px'
                }}
                formatter={(value: any, name: string) => [value, name]}
                labelFormatter={(label: any) => `${label}`}
              />
              <Scatter 
                name="Pain Points" 
                data={scatterData} 
                fill={COLORS.negative}
              >
                {scatterData.map((entry: any, index: number) => {
                  const isHigh = entry.x >= 5 && entry.y >= 50
                  return (
                    <Cell 
                      key={index} 
                      fill={isHigh ? COLORS.negative : COLORS.neutral}
                    />
                  )
                })}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        
        {/* 범례 */}
        <div className="flex justify-center gap-8 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-sm text-slate-400">Critical (높은 빈도 + 높은 영향도)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-sm text-slate-400">Monitor (중간)</span>
          </div>
        </div>
      </Card>

      {/* 4분면별 상세 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="🚨 Critical (긴급)" subtitle="높은 빈도 + 높은 영향도" type="danger">
          <PainPointList items={matrix.critical || []} type="critical" />
        </Card>
        <Card title="⚠️ Important (중요)" subtitle="낮은 빈도 + 높은 영향도" type="warning">
          <PainPointList items={matrix.important || []} type="important" />
        </Card>
        <Card title="👁️ Monitor (모니터링)" subtitle="높은 빈도 + 낮은 영향도">
          <PainPointList items={matrix.monitor || []} type="monitor" />
        </Card>
        <Card title="📝 Minor (경미)" subtitle="낮은 빈도 + 낮은 영향도">
          <PainPointList items={matrix.minor || []} type="minor" />
        </Card>
      </div>

      {/* 스프린트 실행 계획 */}
      {sprintPlan.length > 0 && (
        <Card title="📅 권장 실행 계획" subtitle="Sprint Roadmap">
          <div className="space-y-4">
            {sprintPlan.map((sprint: any, i: number) => (
              <div 
                key={i}
                className={`p-4 rounded-xl border ${
                  i === 0 
                    ? 'bg-red-500/10 border-red-500/30' 
                    : 'bg-blue-500/10 border-blue-500/30'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className={`font-medium ${i === 0 ? 'text-red-400' : 'text-blue-400'}`}>
                    {sprint.sprint}
                  </h4>
                  <span className="text-xs text-slate-500">{sprint.focus}</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {sprint.items.map((item: string, j: number) => (
                    <span 
                      key={j}
                      className="px-3 py-1 bg-slate-700/50 text-slate-300 rounded-full text-sm"
                    >
                      {item}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-slate-400">🎯 목표: {sprint.goal}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

function PainPointList({ items, type }: { items: any[], type: string }) {
  if (!items || items.length === 0) {
    return <div className="text-slate-500 text-center py-4">해당 항목 없음</div>
  }
  
  return (
    <div className="space-y-2">
      {items.map((item: any, i: number) => (
        <div 
          key={i}
          className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"
        >
          <div>
            <span className="font-medium text-white">{item.keyword}</span>
            <span className="text-xs text-slate-500 ml-2">({item.category})</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-slate-400">
              빈도: <span className="text-white">{item.frequency}%</span>
            </span>
            <span className="text-slate-400">
              영향도: <span className="text-white">{item.impact}%</span>
            </span>
            <span className={`px-2 py-1 rounded text-xs ${
              type === 'critical' ? 'bg-red-500/20 text-red-400' :
              type === 'important' ? 'bg-amber-500/20 text-amber-400' :
              'bg-slate-700 text-slate-400'
            }`}>
              {item.count}회
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

// ============================================
// 공통 컴포넌트
// ============================================

function Card({ 
  title, 
  subtitle, 
  children, 
  type 
}: { 
  title?: string
  subtitle?: string
  children: React.ReactNode
  type?: 'danger' | 'warning' | 'success' | 'info'
}) {
  const borderColors = {
    danger: 'border-red-500/30',
    warning: 'border-amber-500/30',
    success: 'border-green-500/30',
    info: 'border-blue-500/30',
  }
  
  return (
    <div className={`bg-slate-900/50 backdrop-blur rounded-2xl border ${
      type ? borderColors[type] : 'border-slate-700/50'
    } p-6`}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-bold text-white">{title}</h3>}
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  )
}

function MetricCard({ 
  title, 
  value, 
  unit, 
  description, 
  type, 
  icon 
}: {
  title: string
  value: string | number
  unit?: string
  description: string
  type: 'danger' | 'warning' | 'success' | 'neutral' | 'info'
  icon: string
}) {
  const colors = {
    danger: 'from-red-500/20 to-red-600/10 border-red-500/30 text-red-400',
    warning: 'from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400',
    success: 'from-green-500/20 to-green-600/10 border-green-500/30 text-green-400',
    neutral: 'from-slate-500/20 to-slate-600/10 border-slate-500/30 text-slate-400',
    info: 'from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400',
  }
  
  return (
    <div className={`rounded-xl p-4 bg-gradient-to-br border ${colors[type]}`}>
      <div className="flex items-center gap-2 mb-2">
        <span>{icon}</span>
        <span className="text-sm text-slate-400">{title}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-white">{value}</span>
        {unit && <span className="text-sm text-slate-500">{unit}</span>}
      </div>
      <div className="text-xs text-slate-500 mt-1">{description}</div>
    </div>
  )
}

function InsightCard({ insight, index }: { insight: any, index: number }) {
  const priorityConfig: Record<string, { bg: string, border: string, badge: string }> = {
    critical: { 
      bg: 'bg-red-500/10', 
      border: 'border-red-500/30', 
      badge: 'bg-red-500/20 text-red-400' 
    },
    high: { 
      bg: 'bg-amber-500/10', 
      border: 'border-amber-500/30', 
      badge: 'bg-amber-500/20 text-amber-400' 
    },
    medium: { 
      bg: 'bg-blue-500/10', 
      border: 'border-blue-500/30', 
      badge: 'bg-blue-500/20 text-blue-400' 
    },
    positive: { 
      bg: 'bg-green-500/10', 
      border: 'border-green-500/30', 
      badge: 'bg-green-500/20 text-green-400' 
    },
  }
  
  const config = priorityConfig[insight.priority] || priorityConfig.medium
  
  return (
    <div className={`rounded-xl p-4 border ${config.bg} ${config.border}`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs px-2 py-1 rounded-full ${config.badge}`}>
          #{index}
        </span>
      </div>
      <h4 className="font-medium text-white mb-2">{insight.title}</h4>
      <p className="text-sm text-slate-400 mb-3">{insight.description}</p>
      <div className="text-xs text-slate-500">
        💡 {insight.action}
      </div>
    </div>
  )
}

function KeywordTag({ keyword, count, type }: { 
  keyword: string
  count: number
  type: 'positive' | 'negative' 
}) {
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
      type === 'positive' 
        ? 'bg-green-500/20 text-green-400' 
        : 'bg-red-500/20 text-red-400'
    }`}>
      {keyword}
      <span className="text-xs opacity-70">({count})</span>
    </span>
  )
}

export default Dashboard
