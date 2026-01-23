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

  useEffect(() => {
    const saved = {
      claude: localStorage.getItem('api_key_claude') || '',
      openai: localStorage.getItem('api_key_openai') || '',
      gemini: localStorage.getItem('api_key_gemini') || ''
    }
    setSavedKeys(saved)
    setApiKey(saved[aiProvider])
  }, [])

  useEffect(() => {
    setApiKey(savedKeys[aiProvider])
  }, [aiProvider, savedKeys])

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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-steam-dark/60 backdrop-blur-sm rounded-2xl p-8 border border-steam-blue/20 shadow-xl">
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

        <div className="mb-6">
          <label className="block text-steam-light/80 text-sm mb-2">
            🤖 AI 선택
          </label>
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => setAiProvider('claude')}
              className={`py-5 px-6 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 min-h-[100px] ${
                aiProvider === 'claude'
                  ? 'border-orange-500 bg-orange-500/20 text-orange-400'
                  : 'border-steam-blue/30 bg-steam-dark/50 text-steam-light/60 hover:border-steam-blue/50'
              }`}
            >
              <span className="text-3xl">🟠</span>
              <span className="font-semibold text-lg">Claude</span>
            </button>
            <button
              onClick={() => setAiProvider('openai')}
              className={`py-5 px-6 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 min-h-[100px] ${
                aiProvider === 'openai'
                  ? 'border-green-500 bg-green-500/20 text-green-400'
                  : 'border-steam-blue/30 bg-steam-dark/50 text-steam-light/60 hover:border-steam-blue/50'
              }`}
            >
              <span className="text-3xl">🟢</span>
              <span className="font-semibold text-lg">ChatGPT</span>
            </button>
            <button
              onClick={() => setAiProvider('gemini')}
              className={`py-5 px-6 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 min-h-[100px] ${
                aiProvider === 'gemini'
                  ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                  : 'border-steam-blue/30 bg-steam-dark/50 text-steam-light/60 hover:border-steam-blue/50'
              }`}
            >
              <span className="text-3xl">🔵</span>
              <span className="font-semibold text-lg">Gemini</span>
            </button>
          </div>
        </div>

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

      <div className="mt-8 bg-steam-dark/40 backdrop-blur-sm rounded-2xl p-6 border border-steam-blue/10">
        <h3 className="text-center text-steam-light/80 mb-4 text-lg">📋 분석되는 13개 항목</h3>
        <div className="grid grid-cols-4 gap-3">
          {['핵심 요약', '사용자 평가', '감정 분석', '플레이타임', '키워드 분석', '지역별 분석', '플레이어 여정', '루팅 시스템', '난이도 밸런스', '기술 이슈', '커뮤니티', '경쟁작 비교', '액션 아이템'].map((item, index) => (
            <span
              key={index}
              className="px-4 py-3 bg-steam-dark/60 border border-steam-blue/20 rounded-lg text-steam-light/70 text-sm text-center"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
