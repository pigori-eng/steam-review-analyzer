import React, { useState } from 'react'

interface InputSectionProps {
  onAnalyze: (url: string, reviewCount: number, dayRange: number | null, apiKey: string | null, aiProvider: string) => void
  onSampleTest: () => void
}

function InputSection({ onAnalyze, onSampleTest }: InputSectionProps) {
  const [url, setUrl] = useState('')
  const [reviewCount, setReviewCount] = useState(100)
  const [dayRange, setDayRange] = useState<number | null>(null)
  const [apiKey, setApiKey] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [aiProvider, setAiProvider] = useState<'claude' | 'openai' | 'gemini'>('claude')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (url.trim()) {
      onAnalyze(url.trim(), reviewCount, dayRange, apiKey.trim() || null, aiProvider)
    }
  }

  // AI 제공자별 정보
  const aiProviders = {
    claude: {
      name: 'Claude',
      emoji: '🟠',
      color: 'orange',
      placeholder: 'sk-ant-api03-xxxxxxxxxxxx...',
      url: 'https://console.anthropic.com'
    },
    openai: {
      name: 'ChatGPT',
      emoji: '🟢',
      color: 'green',
      placeholder: 'sk-proj-xxxxxxxxxxxx...',
      url: 'https://platform.openai.com/api-keys'
    },
    gemini: {
      name: 'Gemini',
      emoji: '🔵',
      color: 'blue',
      placeholder: 'AIzaSyxxxxxxxxxxxx...',
      url: 'https://aistudio.google.com/apikey'
    }
  }

  const currentProvider = aiProviders[aiProvider]

  // 리뷰 개수 옵션
  const reviewCountOptions = [
    { value: 50, label: '50개 (빠름)' },
    { value: 100, label: '100개' },
    { value: 300, label: '300개' },
    { value: 500, label: '500개' },
    { value: 1000, label: '1,000개 (정확)' },
  ]

  // 기간 필터 옵션
  const dayRangeOptions = [
    { value: null, label: '전체 기간' },
    { value: 7, label: '최근 7일' },
    { value: 14, label: '최근 14일' },
    { value: 30, label: '최근 30일' },
    { value: 90, label: '최근 90일' },
  ]

  return (
    <div className="max-w-3xl mx-auto">
      {/* 타이틀 섹션 */}
      <div className="text-center mb-10 fade-in">
        <h2 className="text-4xl font-bold text-white mb-4">
          🔍 Steam 리뷰 분석
        </h2>
        <p className="text-steam-light/70 text-lg">
          Steam 게임 URL만 입력하면 AI가 자동으로 리뷰를 분석합니다
        </p>
      </div>

      {/* 입력 폼 */}
      <form onSubmit={handleSubmit} className="card fade-in" style={{ animationDelay: '0.1s' }}>
        {/* URL 입력 */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-steam-light">
            📎 Steam 게임 URL 또는 App ID
          </label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://store.steampowered.com/app/2621690/Arc_Raiders/"
            className="input-field text-lg"
          />
          <p className="text-xs text-steam-light/50 mt-2">
            예시: https://store.steampowered.com/app/게임ID 또는 숫자만 입력
          </p>
        </div>

        {/* 옵션 섹션 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* 리뷰 개수 */}
          <div>
            <label className="block text-sm font-medium mb-2 text-steam-light">
              📊 수집할 리뷰 개수
            </label>
            <select
              value={reviewCount}
              onChange={(e) => setReviewCount(Number(e.target.value))}
              className="input-field"
            >
              {reviewCountOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* 기간 필터 */}
          <div>
            <label className="block text-sm font-medium mb-2 text-steam-light">
              📅 기간 필터
            </label>
            <select
              value={dayRange ?? ''}
              onChange={(e) => setDayRange(e.target.value ? Number(e.target.value) : null)}
              className="input-field"
            >
              {dayRangeOptions.map(opt => (
                <option key={opt.value ?? 'all'} value={opt.value ?? ''}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* API 키 입력 (선택사항) */}
        <div className="mb-6">
          {/* AI 선택 */}
          <label className="block text-sm font-medium mb-2 text-steam-light">
            🤖 AI 선택
          </label>
          <div className="flex gap-3 mb-4">
            {/* Claude */}
            <button
              type="button"
              onClick={() => setAiProvider('claude')}
              className={`flex-1 py-3 px-3 rounded-lg border transition flex flex-col items-center justify-center gap-1 ${
                aiProvider === 'claude'
                  ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                  : 'border-steam-blue/30 text-steam-light/70 hover:border-steam-blue/50'
              }`}
            >
              <span className="text-xl">🟠</span>
              <span className="font-medium text-sm">Claude</span>
            </button>
            
            {/* ChatGPT */}
            <button
              type="button"
              onClick={() => setAiProvider('openai')}
              className={`flex-1 py-3 px-3 rounded-lg border transition flex flex-col items-center justify-center gap-1 ${
                aiProvider === 'openai'
                  ? 'bg-green-500/20 border-green-500 text-green-400'
                  : 'border-steam-blue/30 text-steam-light/70 hover:border-steam-blue/50'
              }`}
            >
              <span className="text-xl">🟢</span>
              <span className="font-medium text-sm">ChatGPT</span>
            </button>
            
            {/* Gemini */}
            <button
              type="button"
              onClick={() => setAiProvider('gemini')}
              className={`flex-1 py-3 px-3 rounded-lg border transition flex flex-col items-center justify-center gap-1 ${
                aiProvider === 'gemini'
                  ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                  : 'border-steam-blue/30 text-steam-light/70 hover:border-steam-blue/50'
              }`}
            >
              <span className="text-xl">🔵</span>
              <span className="font-medium text-sm">Gemini</span>
            </button>
          </div>

          {/* API 키 입력 */}
          <label className="block text-sm font-medium mb-2 text-steam-light">
            🔑 {currentProvider.name} API 키 (선택사항)
          </label>
          <div className="relative">
            <input
              type={showApiKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={currentProvider.placeholder}
              className="input-field pr-20"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs text-steam-light/70 hover:text-steam-light"
            >
              {showApiKey ? '숨기기' : '보기'}
            </button>
          </div>
          <p className="text-xs text-steam-light/50 mt-2">
            💡 API 키가 있으면 13개 항목 전체 AI 분석이 가능합니다. 
            <a 
              href={currentProvider.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-steam-blue hover:underline ml-1"
            >
              {currentProvider.name} API 키 발급받기 →
            </a>
          </p>
        </div>

        {/* 버튼 영역 */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={!url.trim()}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            <span>🚀</span>
            <span>분석 시작</span>
          </button>
          
          <button
            type="button"
            onClick={onSampleTest}
            className="px-6 py-3 border border-steam-blue/50 rounded-lg hover:bg-steam-blue/10 transition"
          >
            📦 샘플 테스트
          </button>
        </div>
      </form>

      {/* 분석 항목 안내 */}
      <div className="mt-8 fade-in" style={{ animationDelay: '0.2s' }}>
        <h3 className="text-center text-lg font-medium mb-4 text-steam-light">
          📋 분석되는 13개 항목
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            '핵심 요약',
            '사용자 평가',
            '감정 분석',
            '플레이타임',
            '키워드 분석',
            '지역별 분석',
            '플레이어 여정',
            '루팅 시스템',
            '난이도 밸런스',
            '기술 이슈',
            '커뮤니티',
            '경쟁작 비교',
            '액션 아이템',
          ].map((item, i) => (
            <div 
              key={item}
              className="text-center py-2 px-3 bg-steam-dark/50 rounded-lg text-sm text-steam-light/70"
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default InputSection
