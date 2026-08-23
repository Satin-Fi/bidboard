import type { CheckoutSessionRequest, CheckoutSessionResponse, CompletedOrder } from '../types'
import { calculateRank } from './rules'

const PENDING_ORDER_KEY = 'bidboard_pending_order'
const COMPLETED_ORDERS_KEY = 'bidboard_completed_orders'

export async function createCheckoutSession(
  request: CheckoutSessionRequest,
  currentListings: { currentBid: number }[]
): Promise<CheckoutSessionResponse> {
  const estimatedRank = calculateRank(currentListings, request.amount)

  // Save current order in localStorage in case of page transition / payment redirect
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(
        PENDING_ORDER_KEY,
        JSON.stringify({
          ...request,
          estimatedRank,
          createdAt: Date.now(),
        })
      )
    } catch (e) {
      console.warn('Could not store pending order in localStorage:', e)
    }
  }

  // Attempt serverless backend checkout creation
  if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...request,
          estimatedRank,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.checkoutUrl) {
          return {
            sessionId: data.sessionId || 'session_' + Date.now(),
            checkoutUrl: data.checkoutUrl,
            status: 'redirect',
            amount: request.amount,
            estimatedRank,
          }
        }
      }
    } catch {
      // Direct checkout fallback
    }
  }

  // Direct checkout session ID
  const sessionId = 'polar_c_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36)
  return {
    sessionId,
    status: 'pending',
    amount: request.amount,
    estimatedRank,
  }
}

export function getPendingOrder(): (CheckoutSessionRequest & { estimatedRank?: number; createdAt?: number }) | null {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem(PENDING_ORDER_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function saveCompletedOrder(order: CompletedOrder) {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return
  try {
    const existing = getCompletedOrders()
    localStorage.setItem(COMPLETED_ORDERS_KEY, JSON.stringify([order, ...existing]))
    localStorage.removeItem(PENDING_ORDER_KEY)
  } catch (e) {
    console.warn('Could not save completed order:', e)
  }
}

export function getCompletedOrders(): CompletedOrder[] {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(COMPLETED_ORDERS_KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

