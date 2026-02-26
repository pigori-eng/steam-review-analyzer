import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, createContext, useContext } from 'react'
import ControlView from './pages/ControlView'
import DashboardLayout from './pages/DashboardLayout'
import ExecutivePage from './pages/ExecutivePage'
import UserRatingPage from './pages/UserRatingPage'
import SentimentPage from './pages/SentimentPage'
import PlaytimePage from './pages/PlaytimePage'
import KeywordPage from './pages/KeywordPage'
import RegionalPage from './pages/RegionalPage'
import JourneyPage from './pages/JourneyPage'
import LootPage from './pages/LootPage'
import PvpPage from './pages/PvpPage'
import CompetitorPage from './pages/CompetitorPage'
import GameplayPage from './pages/GameplayPage'
import PainPointsPage from './pages/PainPointsPage'
import TimeTrendPage from './pages/TimeTrendPage'
import LiveFeedPage from './pages/LiveFeedPage'

// ── Global Analysis Context ──
export interface AnalysisData {
  game_info: any
  statistics: any
  category_analysis: any
  language_analysis: any
  playtime_analysis: any
  time_trends: any
  analysis: any
  reviews: any[]
  note?: string
}

interface AppContextType {
  data: AnalysisData | null
  setData: (d: AnalysisData) => void
  taskId: string | null
  setTaskId: (id: string) => void
}

export const AppContext = createContext<AppContextType>({
  data: null, setData: () => {}, taskId: null, setTaskId: () => {}
})

export const useApp = () => useContext(AppContext)

export default function App() {
  const [data, setData] = useState<AnalysisData | null>(null)
  const [taskId, setTaskId] = useState<string | null>(null)

  return (
    <AppContext.Provider value={{ data, setData, taskId, setTaskId }}>
      <Routes>
        <Route path="/" element={<ControlView />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Navigate to="executive" replace />} />
          <Route path="executive"   element={<ExecutivePage />} />
          <Route path="user-rating" element={<UserRatingPage />} />
          <Route path="sentiment"   element={<SentimentPage />} />
          <Route path="playtime"    element={<PlaytimePage />} />
          <Route path="keyword"     element={<KeywordPage />} />
          <Route path="regional"    element={<RegionalPage />} />
          <Route path="journey"     element={<JourneyPage />} />
          <Route path="loot"        element={<LootPage />} />
          <Route path="pvp"         element={<PvpPage />} />
          <Route path="competitor"  element={<CompetitorPage />} />
          <Route path="gameplay"    element={<GameplayPage />} />
          <Route path="painpoints"  element={<PainPointsPage />} />
          <Route path="timetrend"   element={<TimeTrendPage />} />
          <Route path="livefeed"    element={<LiveFeedPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppContext.Provider>
  )
}
