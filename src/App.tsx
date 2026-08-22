import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import ListingPage from './pages/ListingPage'
import SellPage from './pages/SellPage'
import { useBidStore } from './store/useBidStore'

export default function App() {
  const tick = useBidStore((s) => s.tick)

  // advance auction clocks once a second
  useEffect(() => {
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [tick])

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/listing/:id" element={<ListingPage />} />
        <Route path="/sell" element={<SellPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
