"""
Steam Review Analyzer API Server
================================
크롤링 및 분석 API를 제공하는 FastAPI 서버입니다.

실행 방법:
    uvicorn main:app --reload --port 8000

API 엔드포인트:
    POST /api/analyze - 리뷰 크롤링 및 분석
    GET  /api/health  - 서버 상태 확인
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import asyncio
import uuid
from datetime import datetime

from crawler import SteamCrawler
from analyzer import ReviewAnalyzer
from sample_data import get_sample_data

# ============================================
# FastAPI 앱 설정
# ============================================

app = FastAPI(
    title="Steam Review Analyzer API",
    description="Steam 게임 리뷰를 크롤링하고 AI로 분석하는 API",
    version="1.0.0"
)

# CORS 설정 (프론트엔드와 통신 허용)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 실제 배포 시에는 특정 도메인만 허용
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 전역 인스턴스
crawler = SteamCrawler()
analyzer = ReviewAnalyzer()

# 작업 상태 저장 (실제 배포 시 Redis 등 사용)
tasks = {}

# ============================================
# 요청/응답 모델
# ============================================

class AnalyzeRequest(BaseModel):
    """분석 요청 모델"""
    url: str  # Steam URL 또는 App ID
    review_count: int = 100  # 수집할 리뷰 개수 (기본 100개)
    day_range: Optional[int] = None  # 기간 필터 (7, 14, 30, 90일)
    api_key: Optional[str] = None  # API 키 (선택)
    ai_provider: str = "claude"  # AI 제공자: "claude" 또는 "openai"
    
    class Config:
        json_schema_extra = {
            "example": {
                "url": "https://store.steampowered.com/app/2621690/Arc_Raiders/",
                "review_count": 100,
                "day_range": 30,
                "api_key": "sk-ant-...",
                "ai_provider": "claude"
            }
        }

class TaskStatus(BaseModel):
    """작업 상태 모델"""
    task_id: str
    status: str  # pending, crawling, analyzing, completed, failed
    progress: int  # 0-100
    message: str
    result: Optional[dict] = None

# ============================================
# API 엔드포인트
# ============================================

@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "Steam Review Analyzer API",
        "docs": "/docs",
        "endpoints": {
            "analyze": "POST /api/analyze",
            "health": "GET /api/health",
            "sample": "GET /api/sample"
        }
    }

@app.get("/api/health")
async def health_check():
    """서버 상태 확인"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/sample")
async def get_sample():
    """샘플 데이터 반환 (테스트용)"""
    sample = get_sample_data()
    
    # 기본 분석 수행
    result = analyzer.analyze_without_api(sample)
    
    return {
        "success": True,
        "data": result
    }

@app.post("/api/analyze")
async def analyze_reviews(request: AnalyzeRequest):
    """
    Steam 리뷰 크롤링 및 분석
    
    1. URL에서 App ID 추출
    2. Steam 리뷰 크롤링
    3. AI 분석 수행 (API 키 있을 경우)
    4. 결과 반환
    """
    try:
        # 1. App ID 추출 및 검증
        app_id = crawler.extract_app_id(request.url)
        if not app_id:
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "invalid_url",
                    "message": "올바른 Steam URL 또는 App ID를 입력해주세요.",
                    "example": "https://store.steampowered.com/app/2621690/Arc_Raiders/"
                }
            )
        
        # 2. 크롤링
        crawl_result = crawler.crawl(
            url_or_id=app_id,
            count=min(request.review_count, 10000),  # 최대 10000개 제한
            day_range=request.day_range
        )
        
        if not crawl_result['success']:
            raise HTTPException(
                status_code=500,
                detail={
                    "error": "crawl_failed",
                    "message": crawl_result.get('error', '크롤링에 실패했습니다.')
                }
            )
        
        # 3. 분석
        if request.api_key:
            # API 키로 전체 분석 (Claude 또는 OpenAI)
            analyzer_with_key = ReviewAnalyzer(
                api_key=request.api_key,
                provider=request.ai_provider
            )
            analysis_result = analyzer_with_key.analyze(crawl_result)
        else:
            # API 키 없으면 기본 분석
            analysis_result = analyzer.analyze_without_api(crawl_result)
        
        if not analysis_result['success']:
            raise HTTPException(
                status_code=500,
                detail={
                    "error": "analysis_failed",
                    "message": analysis_result.get('error', '분석에 실패했습니다.')
                }
            )
        
        # 4. 결과 반환
        return {
            "success": True,
            "data": analysis_result
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "error": "server_error",
                "message": str(e)
            }
        )

@app.post("/api/analyze/async")
async def analyze_reviews_async(request: AnalyzeRequest, background_tasks: BackgroundTasks):
    """
    비동기 분석 시작 (대량 리뷰 처리 시 사용)
    
    Returns:
        task_id: 작업 상태 조회에 사용
    """
    task_id = str(uuid.uuid4())
    
    tasks[task_id] = {
        "status": "pending",
        "progress": 0,
        "message": "작업 대기 중...",
        "result": None
    }
    
    # 백그라운드에서 실행
    background_tasks.add_task(
        run_analysis_task,
        task_id,
        request.url,
        request.review_count,
        request.day_range,
        request.api_key
    )
    
    return {
        "task_id": task_id,
        "status_url": f"/api/task/{task_id}"
    }

@app.get("/api/task/{task_id}")
async def get_task_status(task_id: str):
    """비동기 작업 상태 조회"""
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="작업을 찾을 수 없습니다.")
    
    return tasks[task_id]

# ============================================
# 백그라운드 작업
# ============================================

async def run_analysis_task(task_id: str, url: str, count: int, 
                           day_range: Optional[int], api_key: Optional[str]):
    """백그라운드에서 분석 실행"""
    try:
        # 크롤링 진행
        tasks[task_id]["status"] = "crawling"
        tasks[task_id]["message"] = "리뷰를 수집하고 있습니다..."
        
        def progress_callback(current, total):
            tasks[task_id]["progress"] = int(current / total * 50)
        
        crawl_result = crawler.crawl(
            url_or_id=url,
            count=count,
            day_range=day_range,
            progress_callback=progress_callback
        )
        
        if not crawl_result['success']:
            tasks[task_id]["status"] = "failed"
            tasks[task_id]["message"] = crawl_result.get('error', '크롤링 실패')
            return
        
        # 분석 진행
        tasks[task_id]["status"] = "analyzing"
        tasks[task_id]["progress"] = 60
        tasks[task_id]["message"] = "AI가 분석하고 있습니다..."
        
        if api_key:
            analyzer_with_key = ReviewAnalyzer(api_key=api_key)
            analysis_result = analyzer_with_key.analyze(crawl_result)
        else:
            analysis_result = analyzer.analyze_without_api(crawl_result)
        
        tasks[task_id]["progress"] = 100
        
        if analysis_result['success']:
            tasks[task_id]["status"] = "completed"
            tasks[task_id]["message"] = "분석 완료!"
            tasks[task_id]["result"] = analysis_result
        else:
            tasks[task_id]["status"] = "failed"
            tasks[task_id]["message"] = analysis_result.get('error', '분석 실패')
            
    except Exception as e:
        tasks[task_id]["status"] = "failed"
        tasks[task_id]["message"] = str(e)


# ============================================
# 실행
# ============================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
