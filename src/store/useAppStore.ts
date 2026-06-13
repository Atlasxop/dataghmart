// DataMart - Zustand Store for Data Bundle Sales Platform

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ViewMode =
  | 'home'
  | 'bundles'
  | 'buy-data'
  | 'tracker'
  | 'how-it-works'
  | 'pricing'
  | 'faq'
  | 'contact'
  | 'about'
  | 'terms'
  | 'privacy'
  | 'auth'
  | 'my-orders'
  | 'my-profile'
  | 'agent-portal'
  | 'agent-register'
  | 'admin-dashboard'
  | 'admin-users'
  | 'admin-orders'
  | 'admin-bundles'
  | 'admin-agents'
  | 'admin-analytics'
  | 'admin-settings'
  | 'admin-withdrawals'
  | 'admin-announcements'

export type AdminSubView =
  | 'overview'
  | 'orders'
  | 'users'
  | 'agents'
  | 'bundles'
  | 'analytics'
  | 'withdrawals'
  | 'announcements'
  | 'settings'

export type AgentSubView =
  | 'overview'
  | 'place-order'
  | 'orders'
  | 'wallet'
  | 'commissions'
  | 'referrals'
  | 'api-access'
  | 'white-label'
  | 'profile'

export interface AppUser {
  id: string
  email: string
  fullName: string | null
  phone: string | null
  role: 'customer' | 'agent' | 'admin'
  avatarUrl: string | null
  balance: number
  agentProfile?: {
    tier: string
    status: string
    commissionRate: number
    apiKey: string | null
  } | null
}

interface CartItemData {
  bundleId: string
  network: string
  bundleName: string
  dataAmount: string
  price: number
  quantity: number
}

interface AppState {
  // Navigation
  currentView: ViewMode
  previousView: ViewMode | null
  adminSubView: AdminSubView
  agentSubView: AgentSubView

  // User
  user: AppUser | null
  isAdmin: boolean

  // Cart (local state for quick updates)
  cartItems: CartItemData[]

  // Hydration
  _hasHydrated: boolean

  // Actions
  navigate: (view: ViewMode) => void
  goBack: () => void
  setUser: (user: AppUser | null) => void
  setAdmin: (isAdmin: boolean) => void
  setAdminSubView: (view: AdminSubView) => void
  setAgentSubView: (view: AgentSubView) => void
  setCartItems: (items: CartItemData[]) => void
  addToCart: (item: CartItemData) => void
  removeFromCart: (bundleId: string) => void
  clearCart: () => void
  logout: () => void
  setHasHydrated: (state: boolean) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentView: 'home',
      previousView: null,
      adminSubView: 'overview',
      agentSubView: 'overview',
      user: null,
      isAdmin: false,
      cartItems: [],
      _hasHydrated: false,

      navigate: (view) =>
        set((state) => ({
          previousView: state.currentView,
          currentView: view,
        })),

      goBack: () =>
        set((state) => ({
          currentView: state.previousView || 'home',
          previousView: null,
        })),

      setUser: (user) => set({ user }),
      setAdmin: (isAdmin) => set({ isAdmin }),
      setAdminSubView: (view) => set({ adminSubView: view }),
      setAgentSubView: (view) => set({ agentSubView: view }),

      setCartItems: (items) => set({ cartItems: items }),

      addToCart: (item) =>
        set((state) => {
          const existing = state.cartItems.find((i) => i.bundleId === item.bundleId)
          if (existing) {
            return {
              cartItems: state.cartItems.map((i) =>
                i.bundleId === item.bundleId ? { ...i, quantity: i.quantity + item.quantity } : i
              ),
            }
          }
          return { cartItems: [...state.cartItems, item] }
        }),

      removeFromCart: (bundleId) =>
        set((state) => ({
          cartItems: state.cartItems.filter((i) => i.bundleId !== bundleId),
        })),

      clearCart: () => set({ cartItems: [] }),

      logout: () =>
        set({
          user: null,
          isAdmin: false,
          cartItems: [],
        }),

      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'datamart-auth',
      // Only persist user, isAdmin, and cartItems
      partialize: (state) => ({
        user: state.user,
        isAdmin: state.isAdmin,
        cartItems: state.cartItems,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
