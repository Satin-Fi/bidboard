import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import ListingPage from './pages/ListingPage'
import SellPage from './pages/SellPage'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import MapPage from './pages/MapPage'
import { useAuthStore } from './store/useAuthStore'
import { useBidStore } from './store/useBidStore'
import { connectWs } from './lib/ws'
import { loadMarket } from './store/marketActions'

export default function App() {
  const initAuth = useAuthStore((s) => s.init)

  useEffect(() => {
    initAuth()
    // hydrate market + subscribe to live updates once
    loadMarket()
    connectWs((evt) => {
      const store = useBidStore.getState()
      if (evt.type === 'listing.updated' || evt.type === 'auction.ended') store.applyListing(evt.payload)
      else if (evt.type === 'bid.placed') store.applyBid(evt.payload.bid, evt.payload.listing)
    })
  }, [initAuth])

  // second per-second tick to re-render countdowns
  useEffect(() => {
    const t = setInterval(() => useBidStore.setState({}), 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/listing/:id" element={<ListingPage />} />
        <Route path="/sell" element={<SellPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
