import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import ListingPage from './pages/ListingPage'
import CategoriesPage from './pages/CategoriesPage'
import ActivityPage from './pages/ActivityPage'
import RulesPage from './pages/RulesPage'
import { useBidStore } from './store/useBidStore'
import { connectWs } from './lib/ws'

export default function App() {
  useEffect(() => {
    connectWs((evt) => {
      const store = useBidStore.getState()
      if (evt.type === 'outbid' || evt.type === 'bid.placed') {
        store.placeBid({
          listingId: evt.payload.listingId,
          url: evt.payload.url,
          amount: evt.payload.amount,
          bidder: evt.payload.bidder,
        })
      }
    })
  }, [])

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/category/:slug" element={<HomePage />} />
        <Route path="/activity" element={<ActivityPage />} />
        <Route path="/rules" element={<RulesPage />} />
        <Route path="/listing/:id" element={<ListingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

