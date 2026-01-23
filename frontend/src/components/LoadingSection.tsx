import React from 'react'

interface LoadingSectionProps {
  message: string
}

function LoadingSection({ message }: LoadingSectionProps) {
  const steps = [
    { icon: '🔍', text: 'URL 분석 중...' },
    { icon: '📥', text: 'Steam에서 리뷰 수집 중...' },
    { icon: '🧠', text: 'AI가 분석 중...' },
    { icon: '📊', text: '대시보드 생성 중...' },
  ]

  return (
    <div className="max-w-xl mx-auto text-center">
      <div className="card py-16">
        {/* 로딩 스피너 */}
        <div className="flex justify-center mb-8">
          <div className="loading-spinner"></div>
        </div>

        {/* 메시지 */}
        <h2 className="text-2xl font-bold text-white mb-2">
          분석 중...
        </h2>
        <p className="text-steam-light/70 mb-8">
          {message}
        </p>

        {/* 단계 표시 */}
        <div className="space-y-3">
          {steps.map((step, i) => (
            <div 
              key={i}
              className="flex items-center gap-3 justify-center text-steam-light/50"
              style={{ 
                animation: 'fadeIn 0.5s ease-out forwards',
                animationDelay: `${i * 0.3}s`,
                opacity: 0 
              }}
            >
              <span className="text-xl">{step.icon}</span>
              <span>{step.text}</span>
            </div>
          ))}
        </div>

        {/* 팁 */}
        <div className="mt-10 p-4 bg-steam-dark/50 rounded-lg">
          <p className="text-sm text-steam-light/50">
            💡 팁: 리뷰가 많을수록 분석 시간이 길어질 수 있습니다
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoadingSection
