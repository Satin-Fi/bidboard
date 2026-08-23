import { create } from 'zustand'
import type { LeaderboardListing, ActivityEvent, GlobalStats } from '../types'
import { seedListings, seedActivities } from '../data/seed'
import { cleanUrl } from '../lib/format'

interface OutbidModalState {
  open: boolean
  targetListing?: LeaderboardListing | null
  targetRank?: number
  initialUrl?: string
  initialAmount?: number
  categorySlug?: string
}

interface LeaderboardState {
  listings: LeaderboardListing[]
  activities: ActivityEvent[]
  stats: GlobalStats
  activeCategory: string
  searchQuery: string
  modal: OutbidModalState
  loaded: boolean

  // Actions
  setCategory: (slug: string) => void
  setSearch: (q: string) => void
  openModal: (params?: Partial<OutbidModalState>) => void
  closeModal: () => void
  trackClick: (id: string) => void
  placeBid: (params: {
    listingId?: string
    url: string
    title?: string
    description?: string
    categorySlug?: string
    amount: number
    bidder?: string
  }) => { rank: number; listing: LeaderboardListing }
  fetchLeaderboard: () => Promise<void>
  hydrate: (listings: LeaderboardListing[], activities?: ActivityEvent[]) => void
}

function recalculateRanks(list: LeaderboardListing[]): LeaderboardListing[] {
  // Sort descending by currentBid, then ascending by createdAt
  const sorted = [...list].sort((a, b) => {
    if (b.currentBid !== a.currentBid) return b.currentBid - a.currentBid
    return a.createdAt - b.createdAt
  })
  return sorted.map((item, index) => ({
    ...item,
    rank: index + 1,
  }))
}

export const useBidStore = create<LeaderboardState>((set, get) => ({
  listings: recalculateRanks(seedListings),
  activities: seedActivities,
  stats: {
    onlineCount: 1,
    totalVisitors: 1,
    totalRevenue: seedListings.reduce((acc, l) => acc + l.currentBid, 0),
    launchHoursAgo: 1,
    totalListings: seedListings.length,
    totalClicks: seedListings.reduce((acc, l) => acc + l.clickCount, 0),
  },
  activeCategory: 'all',
  searchQuery: '',
  modal: { open: false },
  loaded: true,

  setCategory: (slug) => set({ activeCategory: slug }),
  setSearch: (q) => set({ searchQuery: q }),

  openModal: (params = {}) =>
    set({
      modal: {
        open: true,
        targetListing: params.targetListing || null,
        targetRank: params.targetRank,
        initialUrl: params.initialUrl || params.targetListing?.url || '',
        initialAmount: params.initialAmount || (params.targetListing ? params.targetListing.currentBid + 1 : 1),
        categorySlug: params.categorySlug || params.targetListing?.categorySlug || 'all',
      },
    }),

  closeModal: () => set({ modal: { open: false, targetListing: null } }),

  trackClick: (id) =>
    set((state) => ({
      listings: state.listings.map((l) => (l.id === id ? { ...l, clickCount: l.clickCount + 1 } : l)),
      stats: { ...state.stats, totalClicks: state.stats.totalClicks + 1 },
    })),

  placeBid: ({ listingId, url, title, description, categorySlug, amount, bidder = 'Anonymous' }) => {
    const state = get()
    const cleaned = cleanUrl(url)
    let currentListings = [...state.listings]
    let existing = listingId
      ? currentListings.find((l) => l.id === listingId)
      : currentListings.find((l) => l.displayUrl.toLowerCase() === cleaned.toLowerCase() || l.url.toLowerCase() === url.toLowerCase())

    let oldRank: number | undefined = existing?.rank
    let targetItem: LeaderboardListing

    if (existing) {
      targetItem = {
        ...existing,
        currentBid: amount,
        owner: bidder,
        updatedAt: Date.now(),
      }
      if (title) targetItem.title = title
      if (description) targetItem.description = description
      if (categorySlug && categorySlug !== 'all') targetItem.categorySlug = categorySlug
      currentListings = currentListings.map((l) => (l.id === existing!.id ? targetItem : l))
    } else {
      const id = 'rank-' + Date.now()
      const domainParts = cleaned.split('.')
      const name = title || (domainParts.length > 1 ? domainParts[0] : cleaned)
      targetItem = {
        id,
        rank: 999,
        title: name,
        url: url.startsWith('http') ? url : `https://${url}`,
        displayUrl: cleaned,
        description: description || `Discover ${name} on the public leaderboard.`,
        logoText: name.slice(0, 2).toUpperCase(),
        logoBg: 'bg-zinc-800 text-white',
        category: categorySlug || 'Other',
        categorySlug: categorySlug || 'other',
        currentBid: amount,
        clickCount: 1,
        createdAt: Date.now(),
        owner: bidder,
      }
      currentListings = [targetItem, ...currentListings]
    }

    const reRanked = recalculateRanks(currentListings)
    const finalItem = reRanked.find((l) => l.id === targetItem.id)!
    const newRank = finalItem.rank

    const newActivity: ActivityEvent = {
      id: 'act-' + Date.now(),
      type: newRank === 1 ? 'claim_top' : oldRank ? 'outbid' : 'new_spot',
      listingId: finalItem.id,
      listingTitle: finalItem.title,
      displayUrl: finalItem.displayUrl,
      amount,
      oldRank,
      newRank,
      createdAt: Date.now(),
    }

    set({
      listings: reRanked,
      activities: [newActivity, ...state.activities.slice(0, 19)],
      stats: {
        ...state.stats,
        totalRevenue: reRanked.reduce((acc, l) => acc + l.currentBid, 0),
        totalListings: reRanked.length,
        totalClicks: reRanked.reduce((acc, l) => acc + l.clickCount, 0),
      },
    })

    return { rank: newRank, listing: finalItem }
  },

  fetchLeaderboard: async () => {
    try {
      const res = await fetch('/api/leaderboard')
      if (res.ok) {
        const data = await res.json()
        if (data.listings && data.listings.length > 0) {
          const reRanked = recalculateRanks(data.listings)
          set((s) => ({
            listings: reRanked,
            activities: data.activities || s.activities,
            stats: data.stats || {
              ...s.stats,
              totalRevenue: reRanked.reduce((acc, l) => acc + l.currentBid, 0),
              totalListings: reRanked.length,
              totalClicks: reRanked.reduce((acc, l) => acc + l.clickCount, 0),
            },
            loaded: true,
          }))
        }
      }
    } catch {
      // Fallback to memory store if backend endpoint offline
    }
  },

  hydrate: (listings, activities) => {
    const reRanked = recalculateRanks(listings)
    set((s) => ({
      listings: reRanked,
      activities: activities || s.activities,
      stats: {
        ...s.stats,
        totalRevenue: reRanked.reduce((acc, l) => acc + l.currentBid, 0),
        totalListings: reRanked.length,
        totalClicks: reRanked.reduce((acc, l) => acc + l.clickCount, 0),
      },
      loaded: true,
    }))
  },
}))

export type { LeaderboardListing, ActivityEvent, GlobalStats }
