# 🎮 Steam Review Analyzer

Steam 게임 리뷰를 자동으로 크롤링하고 AI로 분석하는 웹 대시보드입니다.

## ✨ 주요 기능

- 🔗 Steam URL만 입력하면 자동 분석
- 📊 13개 항목 심층 분석
- 📈 예쁜 대시보드로 시각화
- 🤖 Claude AI 연동 (선택)

---

## 🚀 빠른 시작 (3분이면 끝!)

### 1단계: 프로젝트 다운로드

```bash
# 원하는 폴더에서
git clone https://github.com/YOUR_USERNAME/steam-review-analyzer.git
cd steam-review-analyzer
```

### 2단계: 백엔드 실행

```bash
# 백엔드 폴더로 이동
cd backend

# 패키지 설치
pip install -r requirements.txt

# 서버 실행
uvicorn main:app --reload --port 8000
```

✅ 성공하면: `Uvicorn running on http://127.0.0.1:8000`

### 3단계: 프론트엔드 실행 (새 터미널)

```bash
# 프론트엔드 폴더로 이동
cd frontend

# 패키지 설치
npm install

# 개발 서버 실행
npm run dev
```

✅ 성공하면: `Local: http://localhost:3000`

### 4단계: 브라우저에서 열기

```
http://localhost:3000
```

---

## 📁 프로젝트 구조

```
steam-review-analyzer/
│
├── backend/                 ← Python 백엔드
│   ├── main.py             ← API 서버 (FastAPI)
│   ├── crawler.py          ← Steam 리뷰 크롤러
│   ├── analyzer.py         ← AI 분석기
│   ├── sample_data.py      ← 테스트용 샘플 데이터
│   └── requirements.txt    ← Python 패키지 목록
│
├── frontend/               ← React 프론트엔드
│   ├── src/
│   │   ├── App.tsx         ← 메인 앱
│   │   ├── components/     ← UI 컴포넌트
│   │   └── styles/         ← CSS 스타일
│   ├── package.json        ← npm 패키지 목록
│   └── index.html          ← HTML 템플릿
│
└── README.md               ← 이 파일
```

---

## 🔧 필수 설치 항목

### Python (백엔드)
- Python 3.8 이상
- pip (패키지 관리자)

### Node.js (프론트엔드)
- Node.js 18 이상
- npm (패키지 관리자)

### 설치 확인
```bash
python --version   # Python 3.8+
node --version     # v18+
npm --version      # 9+
```

---

## 📊 분석되는 13개 항목

| # | 항목 | 설명 |
|---|------|------|
| 1 | Executive Summary | 전체 점수, 핵심 인사이트 |
| 2 | 사용자 평가 | 언어별 긍정률 |
| 3 | 감정 분석 | 카테고리별 점수 |
| 4 | 플레이타임 | 시간대별 만족도 |
| 5 | 키워드 | 긍정/부정 키워드 |
| 6 | 지역 분석 | 시장별 특성 |
| 7 | 플레이어 여정 | 단계별 피드백 |
| 8 | 루팅 시스템 | 보상 관련 |
| 9 | 난이도 | 밸런스 분석 |
| 10 | 기술 이슈 | 버그/성능 |
| 11 | 커뮤니티 | 멀티플레이 |
| 12 | 경쟁작 비교 | 다른 게임 |
| 13 | 액션 아이템 | 개선 추천 |

---

## 🔑 Claude API 설정 (선택)

전체 13개 항목 분석을 위해 Claude API 키가 필요합니다.

1. https://console.anthropic.com 접속
2. API 키 발급
3. 분석 요청 시 API 키 입력

> API 키 없이도 기본 분석(긍정률, 언어별 분포, 플레이타임)은 가능합니다.

---

## 🌐 배포하기

### Vercel (프론트엔드)
```bash
cd frontend
npm run build
# Vercel에 dist 폴더 배포
```

### Railway (백엔드)
```bash
# Railway에 backend 폴더 연결
# 자동으로 배포됨
```

---

## ❓ 문제 해결

### "서버에 연결할 수 없습니다"
→ 백엔드 서버가 실행 중인지 확인 (port 8000)

### "크롤링 실패"
→ Steam URL이 올바른지 확인
→ 인터넷 연결 확인

### "npm install 오류"
→ Node.js 버전 확인 (18 이상 필요)

---

## 📝 라이선스

MIT License

---

Made with ❤️ by Kyle @ Bluehole Studio
