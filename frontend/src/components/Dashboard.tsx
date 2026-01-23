import React from 'react'
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts'

interface DashboardProps {
  data: {
    game_info: any
    statistics: any
    analysis: any
  }
}

// 색상 팔레트
const COLORS = {
  positive: '#4ade80',
  negative: '#f87171',
  neutral: '#fbbf24',
  blue: '#66c0f4',
  purple: '#a78bfa',
}

function Dashboard({ data }: DashboardProps) {
  const { game_info, statistics, analysis } = data

  return (
    <div className="space-y-6">
      {/* 게임 헤더 */}
      <div className="card flex items-center gap-6 fade-in">
        {game_info.header_image && (
          <img 
            src={game_info.header_image} 
            alt={game_info.name}
            className="w-48 h-auto rounded-lg"
          />
        )}
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">
            {game_info.name}
          </h2>
          <p className="text-steam-light/70">
            {game_info.developers?.join(', ')} • {game_info.release_date}
          </p>
        </div>
      </div>

      {/* 핵심 지표 카드 4개 */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          icon="👍"
          label="긍정률"
          value={`${statistics.positive_rate}%`}
          color={statistics.positive_rate >= 70 ? 'positive' : statistics.positive_rate >= 50 ? 'neutral' : 'negative'}
        />
        <MetricCard
          icon="📝"
          label="총 리뷰"
          value={`${statistics.total_reviews.toLocaleString()}개`}
          color="blue"
        />
        <MetricCard
          icon="⏱️"
          label="평균 플레이타임"
          value={`${statistics.average_playtime_hours}시간`}
          color="purple"
        />
        <MetricCard
          icon="📊"
          label="분석 점수"
          value={analysis.executive_summary?.overall_score || '-'}
          color="blue"
        />
      </div>

      {/* 핵심 인사이트 */}
      {analysis.executive_summary?.key_insights && (
        <InsightsSection insights={analysis.executive_summary.key_insights} />
      )}

      {/* 차트 영역 */}
      <div className="grid grid-cols-2 gap-6">
        {/* 긍정/부정 파이 차트 */}
        <div className="card fade-in">
          <h3 className="text-lg font-bold mb-4">📊 긍정/부정 비율</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={[
                  { name: '긍정', value: statistics.positive_reviews },
                  { name: '부정', value: statistics.negative_reviews },
                ]}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                <Cell fill={COLORS.positive} />
                <Cell fill={COLORS.negative} />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 언어별 분포 */}
        <div className="card fade-in">
          <h3 className="text-lg font-bold mb-4">🌍 언어별 분포</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart 
              data={Object.entries(statistics.language_distribution || {})
                .slice(0, 7)
                .map(([lang, count]) => ({ language: lang, count }))}
              layout="vertical"
            >
              <XAxis type="number" />
              <YAxis type="category" dataKey="language" width={80} />
              <Tooltip />
              <Bar dataKey="count" fill={COLORS.blue} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 플레이타임 분석 */}
      {analysis.playtime_analysis && (
        <PlaytimeSection data={analysis.playtime_analysis} />
      )}

      {/* 감정 분석 */}
      {analysis.sentiment_analysis && (
        <SentimentSection data={analysis.sentiment_analysis} />
      )}

      {/* 언어별 상세 분석 */}
      {analysis.user_rating?.by_language && (
        <LanguageSection data={analysis.user_rating.by_language} />
      )}

      {/* 액션 아이템 */}
      {analysis.action_items && (
        <ActionItemsSection data={analysis.action_items} />
      )}

      {/* API 키 없음 안내 */}
      {analysis.note && (
        <div className="card bg-yellow-500/10 border-yellow-500/30">
          <p className="text-yellow-400 text-center">
            💡 {analysis.note}
          </p>
        </div>
      )}
    </div>
  )
}

// 지표 카드 컴포넌트
function MetricCard({ icon, label, value, color }: { 
  icon: string, label: string, value: string, color: string 
}) {
  const colorClasses: Record<string, string> = {
    positive: 'text-green-400',
    negative: 'text-red-400',
    neutral: 'text-yellow-400',
    blue: 'text-steam-blue',
    purple: 'text-purple-400',
  }

  return (
    <div className="card text-center fade-in">
      <div className="text-3xl mb-2">{icon}</div>
      <div className={`text-3xl font-bold ${colorClasses[color]}`}>
        {value}
      </div>
      <div className="text-sm text-steam-light/60 mt-1">{label}</div>
    </div>
  )
}

// 인사이트 섹션
function InsightsSection({ insights }: { insights: any[] }) {
  return (
    <div className="card fade-in">
      <h3 className="text-xl font-bold mb-4">💡 핵심 인사이트</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {insights.slice(0, 6).map((insight, i) => (
          <div 
            key={i}
            className={`p-4 rounded-lg border ${
              insight.sentiment === 'positive' 
                ? 'bg-green-500/10 border-green-500/30' 
                : insight.sentiment === 'negative'
                ? 'bg-red-500/10 border-red-500/30'
                : 'bg-yellow-500/10 border-yellow-500/30'
            }`}
          >
            <div className="font-medium text-white mb-1">{insight.title}</div>
            <div className="text-sm text-steam-light/70">{insight.description}</div>
            <div className={`text-xs mt-2 ${
              insight.impact === 'high' ? 'text-red-400' : 'text-steam-light/50'
            }`}>
              영향도: {insight.impact === 'high' ? '높음' : insight.impact === 'medium' ? '중간' : '낮음'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// 플레이타임 섹션
function PlaytimeSection({ data }: { data: any }) {
  return (
    <div className="card fade-in">
      <h3 className="text-xl font-bold mb-4">⏱️ 플레이타임별 분석</h3>
      <div className="grid grid-cols-4 gap-4 mb-6">
        {data.groups?.map((group: any) => (
          <div key={group.range} className="text-center p-4 bg-steam-dark/50 rounded-lg">
            <div className="text-lg font-medium text-white">{group.range}</div>
            <div className={`text-2xl font-bold ${
              group.positive_rate >= 70 ? 'text-green-400' : 
              group.positive_rate >= 50 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {group.positive_rate}%
            </div>
            <div className="text-sm text-steam-light/50">{group.count}개 리뷰</div>
          </div>
        ))}
      </div>
      
      {data.playtime_paradox?.exists && (
        <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
          <span className="font-medium text-purple-400">🎯 Playtime Paradox 발견!</span>
          <p className="text-sm text-steam-light/70 mt-1">{data.playtime_paradox.description}</p>
        </div>
      )}
    </div>
  )
}

// 감정 분석 섹션
function SentimentSection({ data }: { data: any }) {
  return (
    <div className="card fade-in">
      <h3 className="text-xl font-bold mb-4">😊 카테고리별 감정 분석</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {data.categories?.map((cat: any) => (
          <div key={cat.name} className="p-4 bg-steam-dark/50 rounded-lg">
            <div className="font-medium text-white mb-2">{cat.name}</div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 bg-steam-dark rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    cat.score > 0 ? 'bg-green-400' : 'bg-red-400'
                  }`}
                  style={{ width: `${Math.abs(cat.score)}%` }}
                />
              </div>
              <span className={cat.score > 0 ? 'text-green-400' : 'text-red-400'}>
                {cat.score > 0 ? '+' : ''}{cat.score}
              </span>
            </div>
            <div className="text-xs text-steam-light/50">
              {cat.keywords?.slice(0, 3).join(', ')}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// 언어별 분석 섹션
function LanguageSection({ data }: { data: any[] }) {
  return (
    <div className="card fade-in">
      <h3 className="text-xl font-bold mb-4">🌐 언어별 상세 분석</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-steam-blue/20">
              <th className="text-left py-3 px-4">언어</th>
              <th className="text-right py-3 px-4">리뷰 수</th>
              <th className="text-right py-3 px-4">긍정</th>
              <th className="text-right py-3 px-4">긍정률</th>
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 10).map((lang: any) => (
              <tr key={lang.language} className="border-b border-steam-dark/50">
                <td className="py-3 px-4 font-medium">{lang.language}</td>
                <td className="py-3 px-4 text-right text-steam-light/70">{lang.total}</td>
                <td className="py-3 px-4 text-right text-green-400">{lang.positive}</td>
                <td className="py-3 px-4 text-right">
                  <span className={`px-2 py-1 rounded text-sm ${
                    lang.positive_rate >= 70 
                      ? 'bg-green-500/20 text-green-400'
                      : lang.positive_rate >= 50
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {lang.positive_rate}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// 액션 아이템 섹션
function ActionItemsSection({ data }: { data: any }) {
  const sections = [
    { key: 'critical', title: '🚨 긴급 (Critical)', color: 'red' },
    { key: 'short_term', title: '📅 단기 (1-3개월)', color: 'yellow' },
    { key: 'long_term', title: '📆 장기 (3개월+)', color: 'blue' },
  ]

  return (
    <div className="card fade-in">
      <h3 className="text-xl font-bold mb-4">✅ 액션 아이템</h3>
      <div className="grid grid-cols-3 gap-4">
        {sections.map(section => (
          <div key={section.key}>
            <h4 className={`font-medium mb-3 text-${section.color}-400`}>
              {section.title}
            </h4>
            <div className="space-y-2">
              {data[section.key]?.map((item: any, i: number) => (
                <div 
                  key={i}
                  className={`p-3 rounded-lg bg-${section.color}-500/10 border border-${section.color}-500/20`}
                >
                  <div className="font-medium text-white text-sm">{item.title}</div>
                  <div className="text-xs text-steam-light/60 mt-1">{item.description}</div>
                </div>
              )) || (
                <div className="text-sm text-steam-light/50">없음</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Dashboard
