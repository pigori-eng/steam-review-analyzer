# 🎮 Steam Review Analyzer v3.0

> Steam 게임 리뷰를 AI로 심층 분석하는 엔터프라이즈급 대시보드

**Made by CHANG YOON**

🌐 **Live Demo**: https://steam-review-analyzer-woad.vercel.app

---

## 📌 개요

Steam 게임 URL만 입력하면 AI가 자동으로 리뷰를 크롤링하고, 15개 페이지의 인터랙티브 대시보드로 심층 분석 결과를 제공합니다. 게임 개발사 PM과 퍼블리셔를 위한 데이터 기반 의사결정 툴입니다.

---

## ✨ 주요 기능

### 🤖 AI 심층 분석 엔진
- **Semantic Clustering**: 의미 기반 이슈 자동 군집화 ("튕긴다" = "바탕화면으로 나가지네" = Crash로 통합)
- **User Persona 분류**: 하드코어 PvP / 캐주얼 / LQA 민감 / 성능 중시 / 콘텐츠 추구 유저 자동 태깅
- **AI Insight Generator**: 우선순위 + 근거 + 권장액션 세트로 딥한 인사이트 자동 생성
- **멀티 LLM 지원**: Claude / ChatGPT (GPT-4o) / Gemini 선택 가능

### 📊 15개 분석 대시보드
| # | 페이지 | 핵심 기능 |
|---|--------|----------|
| 1 | 🎯 핵심 요약 | KPI 스냅샷, Risk Score, BM Valuation, 전략 인사이트 6개 |
| 2 | 👤 사용자 평가 | 파이차트, 언어별 바차트, 상세 테이블 |
| 3 | 💬 감정 분석 | 스택 바차트, 9개 카테고리 카드 |
| 4 | ⏱️ 플레이타임 | 구간별 긍정률, Playtime Paradox 감지 |
| 5 | 🔑 핵심 키워드 | 레이더차트, TOP 20 키워드 그리드 |
| 6 | 🌍 지역별 분석 | LQA 히트맵, 언어×카테고리 교차 분석 |
| 7 | 🗺️ 플레이어 여정 | 감정 타임라인, Onboarding 위기 분석 |
| 8 | 🎰 Loot 시스템 | Loot 키워드 심층 분석 |
| 9 | ⚔️ PvP vs PvE | 모드별 비교 분석 |
| 10 | 🆚 타 게임 비교 | 경쟁작 언급 분석, 장르 포지셔닝 |
| 11 | 🎮 게임플레이 피드백 | Combat/Gameplay/Multiplayer 종합 |
| 12 | ⚠️ Pain Points | 버블 산점도 매트릭스, Sprint 계획 |
| 13 | 📈 시간 트렌드 | **패치 핀 기능** (날짜별 마커 + 전후 감정 변화) |
| 14 | 📡 실시간 피드 | 유저 리뷰 실시간 피드, 필터/검색 |

### 🛠️ 기타 기능
- **다중 플랫폼**: Steam / App Store / Google Play / YouTube (예정)
- **Export**: CSV / XLSX / TXT 다운로드
- **실시간 로그**: 크롤링 및 AI 분석 진행 상황 실시간 표시
- **API 키 저장**: localStorage 기반 영구 저장

---

## 🏗️ 기술 스택

### 프론트엔드
| 기술 | 용도 |
|------|------|
| React 18 + Vite | 프레임워크 |
| TypeScript | 타입 안전성 |
| React Router v6 | 페이지 라우팅 |
| Recharts | 데이터 시각화 |
| Tailwind CSS | 스타일링 |
| Axios | API 통신 |

### 백엔드
| 기술 | 용도 |
|------|------|
| FastAPI | API 서버 |
| Python 3.11 | 런타임 |
| Anthropic SDK | Claude AI |
| OpenAI SDK | GPT-4o |
| Google Generative AI | Gemini |
| openpyxl | Excel 내보내기 |
| pandas | 데이터 처리 |

### 배포
| 서비스 | 용도 |
|--------|------|
| Vercel | 프론트엔드 호스팅 |
| Render | 백엔드 API 서버 |
| GitHub | 소스 코드 관리 |

---

## 📁 프로젝트 구조

```
steam-review-analyzer/
├── frontend/
│   ├── src/
│   │   ├── App.tsx              # 라우터 설정
│   │   ├── main.tsx             # 엔트리포인트
│   │   ├── styles/
│   │   │   └── global.css       # 글로벌 스타일 (다크 테마)
│   │   ├── components/
│   │   │   ├── Sidebar.tsx      # 15개 메뉴 사이드바
│   │   │   ├── AIInsightCard.tsx # AI 인사이트 공통 컴포넌트
│   │   │   ├── KPICard.tsx      # KPI 카드 컴포넌트
│   │   │   └── PageHeader.tsx   # 페이지 헤더 컴포넌트
│   │   └── pages/
│   │       ├── ControlView.tsx  # 제어판
│   │       ├── DashboardLayout.tsx # 대시보드 레이아웃
│   │       ├── ExecutivePage.tsx
│   │       ├── UserRatingPage.tsx
│   │       ├── SentimentPage.tsx
│   │       ├── PlaytimePage.tsx
│   │       ├── KeywordPage.tsx
│   │       ├── RegionalPage.tsx
│   │       ├── JourneyPage.tsx
│   │       ├── LootPage.tsx
│   │       ├── PvpPage.tsx
│   │       ├── CompetitorPage.tsx
│   │       ├── GameplayPage.tsx
│   │       ├── PainPointsPage.tsx
│   │       ├── TimeTrendPage.tsx
│   │       └── LiveFeedPage.tsx
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
│
└── backend/
    ├── main.py          # FastAPI 서버 + 엔드포인트
    ├── ai_engine.py     # AI 분석 엔진 (7개 프롬프트 체인)
    ├── analyzer.py      # 통계 분석 + AI 연동
    ├── crawler.py       # Steam 크롤러
    ├── sample_data.py   # 샘플 데이터
    └── requirements.txt
```

---

## 🚀 로컬 실행

### 백엔드
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 프론트엔드
```bash
cd frontend
npm install
npm run dev
```

### 환경변수
```bash
# frontend/.env
VITE_API_URL=http://localhost:8000
```

---

## 🔑 API 키 설정

분석 시 AI API 키가 필요합니다. 키 없이도 기본 통계 분석은 가능합니다.

| 제공사 | 발급 링크 |
|--------|----------|
| Claude | https://console.anthropic.com/ |
| ChatGPT | https://platform.openai.com/api-keys |
| Gemini | https://aistudio.google.com/app/apikey |

---

## 📡 API 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/health` | 서버 상태 확인 |
| GET | `/api/sample` | 샘플 데이터 로드 |
| POST | `/api/analyze` | 동기 분석 |
| POST | `/api/analyze/async` | 비동기 분석 시작 |
| GET | `/api/task/{task_id}` | 분석 진행 상황 조회 |
| POST | `/api/export` | 데이터 내보내기 (CSV/XLSX/TXT) |

---

## 📈 분석 모듈 구조

```
AI Engine (ai_engine.py)
├── Semantic Clustering     → 의미 기반 이슈 군집화
├── Persona Classification  → 유저 페르소나 자동 분류
├── Executive Dashboard     → 핵심 요약 + Risk Score
├── UX Deep-dive           → 4개 그룹 게임플레이 분석
├── Player Journey         → 플레이타임별 여정 분석
├── Tech & Market          → 기술 이슈 + 글로벌 시장
├── LiveOps & Meta         → 패치 영향 + 경쟁작 분석
└── Pain Points Matrix     → 빈도×영향도 매트릭스
```

---

## 🗺️ 업데이트 로드맵

- [ ] App Store / Google Play 크롤러 추가
- [ ] YouTube 댓글 분석
- [ ] 패치 노트 자동 감지
- [ ] 경쟁작 자동 비교
- [ ] 다국어 번역 (MyMemory API)
- [ ] 리포트 PDF 자동 생성

---

## 📄 라이선스

MIT License © 2025 CHANG YOON
