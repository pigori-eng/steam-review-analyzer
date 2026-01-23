import React, { useState } from 'react'
import InputSection from './components/InputSection'
import LoadingSection from './components/LoadingSection'
import Dashboard from './components/Dashboard'

// 앱의 상태 타입
type AppStatus = 'input' | 'loading' | 'result' | 'error'

// 분석 결과 타입
interface AnalysisResult {
  game_info: {
    name: string
    developers: string[]
    release_date: string
    header_image: string
  }
  statistics: {
    total_reviews: number
    positive_reviews: number
    negative_reviews: number
    positive_rate: number
    average_playtime_hours: number
    language_distribution: Record<string, number>
  }
  analysis: any
}

function App() {
  // 상태 관리
  const [status, setStatus] = useState<AppStatus>('input')
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string>('')
  const [progress, setProgress] = useState<string>('')

  // 분석 시작 함수
  const handleAnalyze = async (url: string, reviewCount: number, dayRange: number | null, apiKey: string | null, aiProvider: string) => {
    setStatus('loading')
    setProgress('Steam에서 리뷰를 수집하고 있습니다...')
    setError('')

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url,
          review_count: reviewCount,
          day_range: dayRange,
          api_key: apiKey,
          ai_provider: aiProvider,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setResult(data.data)
        setStatus('result')
      } else {
        setError(data.detail?.message || '분석 중 오류가 발생했습니다.')
        setStatus('error')
      }
    } catch (err) {
      setError('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.')
      setStatus('error')
    }
  }

  // 다시 시작
  const handleReset = () => {
    setStatus('input')
    setResult(null)
    setError('')
  }

  // 샘플 데이터로 테스트
  const handleSampleTest = async () => {
    setStatus('loading')
    setProgress('샘플 데이터를 불러오고 있습니다...')

    try {
      const response = await fetch('/api/sample')
      const data = await response.json()

      if (data.success) {
        setResult(data.data)
        setStatus('result')
      } else {
        setError('샘플 데이터를 불러올 수 없습니다.')
        setStatus('error')
      }
    } catch (err) {
      setError('서버에 연결할 수 없습니다.')
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen">
      {/* 헤더 */}
      <header className="py-6 px-8 border-b border-steam-blue/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎮</span>
            <div>
              <h1 className="text-2xl font-bold text-white">Steam Review Analyzer</h1>
              <p className="text-sm text-steam-light/60">스팀 리뷰 심층 분석 도구</p>
            </div>
          </div>
          
          {status === 'result' && (
            <button 
              onClick={handleReset}
              className="px-4 py-2 text-sm border border-steam-blue/50 rounded-lg hover:bg-steam-blue/10 transition"
            >
              🔄 새로운 분석
            </button>
          )}
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* 입력 화면 */}
        {status === 'input' && (
          <InputSection 
            onAnalyze={handleAnalyze} 
            onSampleTest={handleSampleTest}
          />
        )}

        {/* 로딩 화면 */}
        {status === 'loading' && (
          <LoadingSection message={progress} />
        )}

        {/* 에러 화면 */}
        {status === 'error' && (
          <div className="card max-w-2xl mx-auto text-center py-12">
            <div className="text-6xl mb-4">😵</div>
            <h2 className="text-xl font-bold text-red-400 mb-2">오류 발생</h2>
            <p className="text-steam-light/70 mb-6">{error}</p>
            <button onClick={handleReset} className="btn-primary">
              다시 시도
            </button>
          </div>
        )}

        {/* 결과 대시보드 */}
        {status === 'result' && result && (
          <Dashboard data={result} />
        )}
      </main>

      {/* 푸터 */}
      <footer className="py-6 text-center text-steam-light/40 text-sm">
        <p>Made with ❤️ for Game Developers & PMs</p>
      </footer>
    </div>
  )
}

export default App
