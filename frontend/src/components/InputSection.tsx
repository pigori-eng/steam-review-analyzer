import { useState, useEffect } from 'react'

interface InputSectionProps {
  onAnalyze: (url: string, reviewCount: number, dayRange: number | null, apiKey: string | null, aiProvider: string) => void
  onSampleTest: () => void
}

export default function InputSection({ onAnalyze, onSampleTest }: InputSectionProps) {
  const [url, setUrl] = useState('')
  const [reviewCount, setReviewCount] = useState(100)
  const [dayRange, setDayRange] = useState<number | null>(null)
  const [apiKey, setApiKey] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [aiProvider, setAiProvider] = useState<'claude' | 'openai' | 'gemini'>('openai')
  const [savedKeys, setSavedKeys] = useState<{claude: string, openai: string, gemini: string}>({
    claude: '',
    openai: '',
    gemini: ''
  })

  // 페이지 로드 시 저장된 API 키 불러오기
  useEffect(() => {
    const saved = {
      claude: localStorage.getItem('api_key_claude') || '',
      openai: localStorage.getItem('api_key_openai') || '',
      gemini: localStorage.getItem('api_key_gemini') || ''
    }
    setSavedKeys(saved)
    setApiKey(saved[aiProvider])
  }, [])

  // AI 제공자 변경 시 해당 키 불러오기
  useEffect(() => {
    setApiKey(savedKeys[aiProvider])
  }, [aiProvider, savedKeys])

  // API 키 저장
  const handleSaveApiKey = () => {
    localStorage.setItem(`api_key_${aiProvider}`, apiKey)
    setSavedKeys(prev => ({
      ...prev,
      [aiProvider]: apiKey
    }))
    alert(`${aiProvider.toUpperCase()} API 키가 저장되었습니다.`)
  }

  const handleSubmit = () => {
    if (!url.trim()) {
      alert('Steam URL을 입력해주세요.')
      return
    }
    onAnalyze(url, reviewCount, dayRange, apiKey || null, aiProvider)
  }

  const getProviderName = () => {
    switch (aiProvider) {
      case 'claude': return 'Claude'
      case 'openai': return 'ChatGPT'
      case 'gemini': return 'Gemini'
    }
  }

  const getProviderLink = () => {
    switch (aiProvider) {
      case 'claude': return 'https://console.anthropic.com/'
      case 'openai': return 'https://platform.openai.com/api-keys'
      case 'gemini': return 'https://aistudio.google.com/app/apikey'
    }
  }

  const analysisItems = [
    '핵심 요약', '사용자 평가', '감정 분석', '플레이타임',
    '키워드 분석', '지역별 분석', '플레이어 여정', '루팅 시스템',
    '난이도 밸런스', '기술 이슈', '커뮤니티', '경쟁작 비교', '액션 아이템'
  ]

  return (
    <div className="space-y-8">
      {/* 히어로 섹션 */}
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold mb-4">
          <span className="mr-2">🔍</span>
          Steam 리뷰 분석
        </h2>
        <p className="text-steam-light/70">
          Steam 게임 URL만 입력하면 AI가 자동으로 리뷰를 분석합니다
        </p>
      </div>

      {/* 입력 카드 */}
      <div className="card max-w-2xl mx-auto">
        {/* URL 입력 */}
        <div className="mb-6">
          <label className="block text-steam-light/80 text-sm mb-2">
            📎 Steam 게임 URL 또는 App ID
          </label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://store.steampowered.com/app/2621690/Arc_Raiders/"
            className="w-full px-4 py-3 bg-steam-dark/50 border border-steam-blue/30 rounded-lg text-white placeholder-steam-light/40 focus:outline-none focus:border-steam-blue"
          />
          <p className="text-steam-light/40 text-xs mt-1">
            예시: https://store.steampowered.com/app/게임ID 또는 숫자만 입력
          </p>
        </div>

        {/* 리뷰 개수 & 기간 필터 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-steam-light/80 text-sm mb-2">
              📊 수집할 리뷰 개수
            </label>
            <select
              value={reviewCount}
              onChange={(e) => setReviewCount(Number(e.target.value))}
              className="w-full px-4 py-3 bg-steam-dark/50 border border-steam-blue/30 rounded-lg text-white focus:outline-none focus:border-steam-blue"
            >
              <option value={50}>50개</option>
              <option value={100}>100개</option>
              <option value={200}>200개</option>
              <option value={500}>500개</option>
              <option value={1000}>1,000개</option>
            </select>
          </div>
          <div>
            <label className="block text-steam-light/80 text-sm mb-2">
              📅 기간 필터
            </label>
            <select
              value={dayRange || ''}
              onChange={(e) => setDayRange(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-4 py-3 bg-steam-dark/50 border border-steam-blue/30 rounded-lg text-white focus:outline-none focus:border-steam-blue"
            >
              <option value="">전체 기간</option>
              <option value={7}>최근 7일</option>
              <option value={14}>최근 14일</option>
              <option value={30}>최근 30일</option>
              <option value={90}>최근 90일</option>
            </select>
          </div>
        </div>

        {/* AI 선택 */}
        <div className="mb-6">
          <label className="block text-steam-light/80 text-sm mb-2">
            🤖 AI 선택
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setAiProvider('claude')}
              className={`py-3 px-4 rounded-lg border-2 transition-all ${
                aiProvider === 'claude'
                  ? 'border-orange-500 bg-orange-500/20 text-orange-400'
                  : 'border-steam-blue/30 bg-steam-dark/50 text-steam-light/60 hover:border-steam-blue/50'
              }`}
            >
              🟠 Claude
            </button>
            <button
              onClick={() => setAiProvider('openai')}
              className={`py-3 px-4 rounded-lg border-2 transition-all ${
                aiProvider === 'openai'
                  ? 'border-green-500 bg-green-500/20 text-green-400'
                  : 'border-steam-blue/30 bg-steam-dark/50 text-steam-light/60 hover:border-steam-blue/50'
              }`}
            >
              🟢 ChatGPT
            </button>
            <button
              onClick={() => setAiProvider('gemini')}
              className={`py-3 px-4 rounded-lg border-2 transition-all ${
                aiProvider === 'gemini'
                  ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                  : 'border-steam-blue/30 bg-steam-dark/50 text-steam-light/60 hover:border-steam-blue/50'
              }`}
            >
              🔵 Gemini
            </button>
          </div>
        </div>

        {/* API 키 입력 + 저장 버튼 */}
        <div className="mb-6">
          <label className="block text-steam-light/80 text-sm mb-2">
            🔑 {getProviderName()} API 키 (선택사항)
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={`${getProviderName()} API 키를 입력하세요`}
                className="w-full px-4 py-3 bg-steam-dark/50 border border-steam-blue/30 rounded-lg text-white placeholder-steam-light/40 focus:outline-none focus:border-steam-blue pr-16"
              />
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-steam-light/60 hover:text-steam-light text-sm"
              >
                {showApiKey ? '숨기기' : '보기'}
              </button>
            </div>
            <button
              onClick={handleSaveApiKey}
              className="px-4 py-3 bg-steam-blue/30 border border-steam-blue/50 rounded-lg text-steam-light hover:bg-steam-blue/50 transition-colors"
            >
              저장
            </button>
          </div>
          <p className="text-steam-light/50 text-xs mt-2">
            💡 API 키가 있으면 13개 항목 전체 AI 분석이 가능합니다.
            <a
              href={getProviderLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-steam-blue hover:underline ml-2"
            >
              {getProviderName()} API 키 발급받기 →
            </a>
          </p>
          {savedKeys[aiProvider] && (
            <p className="text-green-400/70 text-xs mt-1">
              ✅ 저장된 API 키가 있습니다.
            </p>
          )}
        </div>

        {/* 버튼들 */}
        <div className="flex gap-4">
          <button
            onClick={handleSubmit}
            className="flex-1 py-4 bg-gradient-to-r from-steam-blue to-steam-blue/80 rounded-lg text-white font-bold text-lg hover:from-steam-blue/90 hover:to-steam-blue/70 transition-all shadow-lg shadow-steam-blue/25"
          >
            🚀 분석 시작
          </button>
          <button
            onClick={onSampleTest}
            className="px-6 py-4 bg-steam-dark/50 border border-steam-blue/30 rounded-lg text-steam-light hover:bg-steam-dark/70 transition-colors"
          >
            📦 샘플 테스트
          </button>
        </div>
      </div>

      {/* 분석 항목 미리보기 */}
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-4">📋 분석되는 13개 항목</h3>
        <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
          {analysisItems.map((item, index) => (
            <span
              key={index}
              className="px-4 py-2 bg-steam-dark/50 border border-steam-blue/20 rounded-full text-steam-light/70 text-sm"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
```
