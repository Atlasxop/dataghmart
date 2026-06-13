"use client"

import { useEffect } from "react"
import { useAppStore } from "@/store/useAppStore"
import dynamic from "next/dynamic"
import { Toaster, toast } from "sonner"
import { Loader2 } from "lucide-react"

// Dynamic imports to reduce initial bundle size
const Header = dynamic(() => import("@/components/databundles/layout/Header"), { ssr: false })
const Footer = dynamic(() => import("@/components/databundles/layout/Footer"), { ssr: false })
const HomePage = dynamic(() => import("@/components/databundles/home/HomePage"), { ssr: false })
const BundlesPage = dynamic(() => import("@/components/databundles/bundles/BundlesPage"), { ssr: false })
const BuyDataPage = dynamic(() => import("@/components/databundles/order/BuyDataPage"), { ssr: false })
const MyOrdersPage = dynamic(() => import("@/components/databundles/order/MyOrdersPage"), { ssr: false })
const MyProfilePage = dynamic(() => import("@/components/databundles/order/MyProfilePage"), { ssr: false })
const OrderTrackerPage = dynamic(() => import("@/components/databundles/tracker/OrderTrackerPage"), { ssr: false })
const HowItWorksPage = dynamic(() => import("@/components/databundles/pages/HowItWorksPage"), { ssr: false })
const PricingPage = dynamic(() => import("@/components/databundles/pages/PricingPage"), { ssr: false })
const FAQPage = dynamic(() => import("@/components/databundles/pages/FAQPage"), { ssr: false })
const ContactPage = dynamic(() => import("@/components/databundles/pages/ContactPage"), { ssr: false })
const AboutPage = dynamic(() => import("@/components/databundles/pages/AboutPage"), { ssr: false })
const TermsPage = dynamic(() => import("@/components/databundles/pages/TermsPage"), { ssr: false })
const PrivacyPage = dynamic(() => import("@/components/databundles/pages/PrivacyPage"), { ssr: false })
const AuthPage = dynamic(() => import("@/components/databundles/auth/AuthPage"), { ssr: false })
const AgentPortal = dynamic(() => import("@/components/databundles/agent/AgentPortal"), { ssr: false })
const AgentRegisterPage = dynamic(() => import("@/components/databundles/agent/AgentRegisterPage"), { ssr: false })
const AdminDashboard = dynamic(() => import("@/components/databundles/admin/AdminDashboard"), { ssr: false })

export default function AppPage() {
  const currentView = useAppStore((s) => s.currentView)
  const isAdmin = useAppStore((s) => s.isAdmin)
  const hasHydrated = useAppStore((s) => s._hasHydrated)
  const setUser = useAppStore((s) => s.setUser)
  const setAdmin = useAppStore((s) => s.setAdmin)
  const setHasHydrated = useAppStore((s) => s.setHasHydrated)

  // Recover session from cookies on mount
  useEffect(() => {
    if (!hasHydrated) return
    const store = useAppStore.getState()
    if (store.user) return

    const checkSession = async () => {
      try {
        const res = await fetch("/api/auth/session")
        if (res.ok) {
          const data = await res.json()
          if (data.user) {
            const u = {
              id: data.user.id,
              email: data.user.email,
              fullName: data.user.full_name ?? null,
              phone: data.user.phone ?? null,
              role: data.user.role ?? "customer",
              avatarUrl: data.user.avatar_url ?? null,
              balance: Number(data.user.balance ?? 0),
            }
            setUser(u)
          }
        }
      } catch {
        // Session recovery failed
      }
    }
    checkSession()
  }, [hasHydrated, setUser])

  // Validate admin token on hydration
  useEffect(() => {
    if (!hasHydrated) return
    if (isAdmin) {
      const token = localStorage.getItem("admin-token")
      if (token) {
        fetch("/api/admin/dashboard", { headers: { "admin-token": token } })
          .then((res) => {
            if (!res.ok) {
              localStorage.removeItem("admin-token")
              setAdmin(false)
            }
          })
          .catch(() => {})
      } else {
        setAdmin(false)
      }
    }
  }, [hasHydrated, isAdmin, setAdmin])

  // Safety: force hydration after 3 seconds
  useEffect(() => {
    if (hasHydrated) return
    const timer = setTimeout(() => {
      const store = useAppStore.getState()
      if (!store._hasHydrated) {
        store.setHasHydrated(true)
      }
    }, 3000)
    return () => clearTimeout(timer)
  }, [hasHydrated])

  if (!hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FFC107] to-[#E5AC00] flex items-center justify-center animate-pulse">
            <Loader2 className="w-7 h-7 text-[#0A0A0A] animate-spin" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <p className="text-sm font-medium text-white">Dataghmart Data Bundles</p>
            <p className="text-xs text-gray-500">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  const renderView = () => {
    switch (currentView) {
      case "home": return <HomePage />
      case "bundles": return <BundlesPage />
      case "buy-data": return <BuyDataPage />
      case "tracker": return <OrderTrackerPage />
      case "how-it-works": return <HowItWorksPage />
      case "pricing": return <PricingPage />
      case "faq": return <FAQPage />
      case "contact": return <ContactPage />
      case "about": return <AboutPage />
      case "terms": return <TermsPage />
      case "privacy": return <PrivacyPage />
      case "auth": return <AuthPage />
      case "my-orders": return <MyOrdersPage />
      case "my-profile": return <MyProfilePage />
      case "agent-portal": return <AgentPortal />
      case "agent-register": return <AgentRegisterPage />
      case "admin-dashboard":
      case "admin-users":
      case "admin-orders":
      case "admin-bundles":
      case "admin-agents":
      case "admin-analytics":
      case "admin-settings":
      case "admin-withdrawals":
      case "admin-announcements":
        return <AdminDashboard />
      default: return <HomePage />
    }
  }

  const isDashboard =
    currentView === "admin-dashboard" ||
    currentView.startsWith("admin-") ||
    currentView === "agent-portal"

  if (isDashboard) {
    return (
      <>
        {renderView()}
        <Toaster position="top-right" richColors />
      </>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{renderView()}</main>
      <Footer />
      <Toaster position="top-right" richColors />
    </div>
  )
}
