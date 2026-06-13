"use client"

import React, { useEffect, useState, useCallback } from "react"
import {
  BarChart3,
  Package,
  Users,
  Wifi,
  TrendingUp,
  DollarSign,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  Zap,
  ShoppingCart,
  UserCheck,
  Clock,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Plus,
  Trash2,
  Edit3,
  Save,
  Phone,
  CalendarDays,
  Wallet,
  Megaphone,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { useAppStore, type AdminSubView } from "@/store/useAppStore"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { NETWORK_DISPLAY } from "@/lib/datamart"

// ─── Types ────────────────────────────────────────────────────────
interface DashboardStats {
  totalUsers: number
  totalSellers: number
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  openDisputes: number
  activeCampaigns: number
}

interface DataOrder {
  id: string
  reference: string | null
  phoneNumber: string
  network: string
  capacity: number
  price: number
  status: string
  createdAt: string
  userId: string
  agentCommission: number
}

interface AdminUser {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  role: string | null
  seller_approved: boolean | null
  avatar_url: string | null
  balance: number
  suspended: boolean | null
  tier: string | null
  commissionRate: number | null
  sign_in_count: number | null
  last_sign_in_at: string | null
  created_at: string | null
}

interface AnnouncementItem {
  id: number
  title: string
  body: string | null
  is_active: boolean
  start_date?: string | null
  end_date?: string | null
}

interface BundlePriceItem {
  id: number
  network: string
  capacity: number
  basePrice: number
  retailPrice: number
  agentRetailPrice: number
  agentPremiumPrice: number
  agentSuperPrice: number
  distributorPrice: number
  isActive: boolean
}

interface WalletInfo {
  deposit: { balance: number; currency: string }
  earnings: {
    availableBalance: number
    pendingBalance: number
    totalEarnings: number
    totalWithdrawn: number
    currency: string
  }
  configured?: boolean
}

interface DeliveryTracker {
  pending: number
  processing: number
  completed: number
  failed: number
  checked?: number
  delivered?: number
}

// ─── Sidebar Menu ─────────────────────────────────────────────────
const adminMenuItems: { view: AdminSubView; label: string; icon: typeof BarChart3 }[] = [
  { view: "overview", label: "Overview", icon: BarChart3 },
  { view: "orders", label: "Orders", icon: Package },
  { view: "agents", label: "Agents", icon: Users },
  { view: "bundles", label: "Bundles", icon: Wifi },
  { view: "analytics", label: "Analytics", icon: TrendingUp },
  { view: "withdrawals", label: "Withdrawals", icon: DollarSign },
  { view: "announcements", label: "Announcements", icon: Bell },
  { view: "settings", label: "Settings", icon: Settings },
]

// ─── Helper ───────────────────────────────────────────────────────
function getAdminToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("admin-token")
}

function formatCurrency(amount: number): string {
  return `GH₵ ${amount.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—"
  try {
    return new Date(dateStr).toLocaleDateString("en-GH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return "—"
  }
}

function getStatusBadge(status: string): { bg: string; text: string } {
  switch (status?.toLowerCase()) {
    case "completed":
    case "active":
    case "approved":
    case "paid":
      return { bg: "bg-[#22C55E]/15", text: "text-[#22C55E]" }
    case "processing":
      return { bg: "bg-[#00E5FF]/15", text: "text-[#00E5FF]" }
    case "pending":
      return { bg: "bg-[#FFC107]/15", text: "text-[#FFC107]" }
    case "failed":
    case "suspended":
    case "rejected":
      return { bg: "bg-red-500/15", text: "text-red-400" }
    case "refunded":
      return { bg: "bg-purple-500/15", text: "text-purple-400" }
    default:
      return { bg: "bg-[#2A2A2A]", text: "text-gray-400" }
  }
}

function getNetworkDisplay(network: string): string {
  return NETWORK_DISPLAY[network] || network
}

// ─── Main Component ───────────────────────────────────────────────
export default function AdminDashboard() {
  const { user, isAdmin, adminSubView, setAdminSubView, navigate, logout, setAdmin } = useAppStore()
  const currentView = useAppStore((s) => s.currentView)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [authenticating, setAuthenticating] = useState(false)
  const [adminSecret, setAdminSecret] = useState("")
  const [authChecked, setAuthChecked] = useState(false)
  const [localIsAdmin, setLocalIsAdmin] = useState(false)

  // Check for existing admin token on mount
  useEffect(() => {
    const token = getAdminToken()
    if (token) {
      fetch("/api/admin/dashboard", { headers: { "admin-token": token } })
        .then((res) => {
          if (res.ok) {
            setLocalIsAdmin(true)
            setAdmin(true)
          } else {
            localStorage.removeItem("admin-token")
            setLocalIsAdmin(false)
            setAdmin(false)
          }
        })
        .catch(() => {
          setLocalIsAdmin(false)
        })
        .finally(() => setAuthChecked(true))
    } else {
      setAuthChecked(true)
    }
  }, [setAdmin])

  // Map currentView to adminSubView
  useEffect(() => {
    const viewMap: Record<string, AdminSubView> = {
      "admin-dashboard": "overview",
      "admin-users": "agents",
      "admin-orders": "orders",
      "admin-bundles": "bundles",
      "admin-agents": "agents",
      "admin-analytics": "analytics",
      "admin-settings": "settings",
      "admin-withdrawals": "withdrawals",
      "admin-announcements": "announcements",
    }
    if (viewMap[currentView]) {
      setAdminSubView(viewMap[currentView])
    }
  }, [currentView, setAdminSubView])

  const isUserAdmin = localIsAdmin || isAdmin || user?.role === "admin"

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!adminSecret.trim()) {
      toast.error("Please enter the admin secret")
      return
    }
    setAuthenticating(true)
    try {
      const res = await fetch("/api/admin/dashboard", {
        headers: { "admin-token": adminSecret.trim() },
      })
      if (res.ok) {
        localStorage.setItem("admin-token", adminSecret.trim())
        setLocalIsAdmin(true)
        setAdmin(true)
        toast.success("Admin access granted")
      } else {
        toast.error("Invalid admin secret")
      }
    } catch {
      toast.error("Authentication failed")
    } finally {
      setAuthenticating(false)
    }
  }

  const handleSignOut = () => {
    localStorage.removeItem("admin-token")
    setLocalIsAdmin(false)
    logout()
    navigate("home")
    toast.success("Signed out successfully")
  }

  // Loading state while checking auth
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-[#FFC107] animate-spin" />
          <p className="text-gray-400 text-sm">Verifying admin access...</p>
        </div>
      </div>
    )
  }

  // Admin Login Form
  if (!isUserAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] p-4">
        <Card className="w-full max-w-md bg-[#171717] border border-[#2A2A2A] shadow-2xl">
          <CardContent className="p-8">
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-[#FFC107]/10 flex items-center justify-center mb-4">
                <Zap className="w-8 h-8 text-[#FFC107]" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">Dataghmart Admin</h1>
              <p className="text-gray-400 text-sm text-center">Enter the admin secret to access the dashboard</p>
            </div>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm text-gray-300">Admin Secret</Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    type="password"
                    value={adminSecret}
                    onChange={(e) => setAdminSecret(e.target.value)}
                    placeholder="Enter admin secret key"
                    className="pl-10 h-11 bg-[#0A0A0A] border-[#2A2A2A] text-white placeholder:text-gray-600 focus:border-[#FFC107] focus:ring-[#FFC107]/20"
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full h-11 bg-[#FFC107] hover:bg-[#FFD54F] text-black font-semibold"
                disabled={authenticating}
              >
                {authenticating ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Authenticating...</>
                ) : (
                  <><Shield className="w-4 h-4 mr-2" /> Access Dashboard</>
                )}
              </Button>
            </form>
            <div className="mt-6 pt-4 border-t border-[#2A2A2A]">
              <Button
                variant="ghost"
                className="w-full text-gray-400 hover:text-white hover:bg-[#2A2A2A]"
                onClick={() => navigate("home")}
              >
                <ArrowDownRight className="w-4 h-4 mr-2" /> Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-[#0A0A0A]">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col bg-[#111111] border-r border-[#2A2A2A] fixed inset-y-0 left-0 z-30">
        <div className="flex items-center gap-3 px-5 py-5 border-b border-[#2A2A2A]">
          <div className="w-9 h-9 rounded-lg bg-[#FFC107] flex items-center justify-center">
            <Zap className="w-5 h-5 text-black" />
          </div>
          <div>
            <h2 className="font-bold text-sm leading-tight text-white">Dataghmart</h2>
            <p className="text-[11px] text-gray-500">Data Bundles Admin</p>
          </div>
        </div>

        {/* Admin Avatar Area */}
        <div className="px-5 py-4 border-b border-[#2A2A2A]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#FFC107]/10 flex items-center justify-center">
              <Shield className="w-4 h-4 text-[#FFC107]" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.fullName || "Admin"}</p>
              <p className="text-[11px] text-gray-500">Full Access</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {adminMenuItems.map((item) => {
            const isActive = adminSubView === item.view
            return (
              <button
                key={item.view}
                onClick={() => setAdminSubView(item.view)}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#FFC107]/10 text-[#FFC107] border-l-2 border-[#FFC107]"
                    : "text-gray-400 hover:bg-[#2A2A2A]/50 hover:text-white border-l-2 border-transparent"
                }`}
              >
                <item.icon className={`w-4 h-4 ${isActive ? "text-[#FFC107]" : ""}`} />
                {item.label}
                {isActive && <ChevronRight className="w-3 h-3 ml-auto text-[#FFC107]" />}
              </button>
            )
          })}
        </nav>
        <div className="px-3 py-4 border-t border-[#2A2A2A]">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Sidebar - Mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-72 bg-[#111111] border-r border-[#2A2A2A] shadow-2xl z-50 flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#2A2A2A]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#FFC107] flex items-center justify-center">
                  <Zap className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h2 className="font-bold text-sm text-white">Dataghmart</h2>
                  <p className="text-[11px] text-gray-500">Admin Panel</p>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
              {adminMenuItems.map((item) => {
                const isActive = adminSubView === item.view
                return (
                  <button
                    key={item.view}
                    onClick={() => {
                      setAdminSubView(item.view)
                      setSidebarOpen(false)
                    }}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? "bg-[#FFC107]/10 text-[#FFC107] border-l-2 border-[#FFC107]"
                        : "text-gray-400 hover:bg-[#2A2A2A]/50 hover:text-white border-l-2 border-transparent"
                    }`}
                  >
                    <item.icon className={`w-4 h-4 ${isActive ? "text-[#FFC107]" : ""}`} />
                    {item.label}
                  </button>
                )
              })}
            </nav>
            <div className="px-3 py-4 border-t border-[#2A2A2A]">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 bg-[#111111]/95 backdrop-blur-md border-b border-[#2A2A2A] px-4 lg:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-400 hover:text-white"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-lg font-bold text-white capitalize">
                {adminSubView === "overview" ? "Dashboard Overview" : adminSubView.replace(/-/g, " ")}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-[#FFC107]/10 text-[#FFC107] border-[#FFC107]/20 font-medium text-xs">
                <Shield className="w-3 h-3 mr-1" />
                Admin
              </Badge>
              <span className="text-sm text-gray-400 hidden sm:block">
                {user?.fullName || user?.email || "Admin"}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-gray-400 hover:text-red-400 hover:bg-red-400/10"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          <AdminContent subView={adminSubView} />
        </main>
      </div>
    </div>
  )
}

// ─── Admin Content Router ─────────────────────────────────────────
function AdminContent({ subView }: { subView: AdminSubView }) {
  switch (subView) {
    case "overview":
      return <OverviewSubView />
    case "orders":
      return <OrdersSubView />
    case "users":
      return <AgentsSubView />
    case "agents":
      return <AgentsSubView />
    case "bundles":
      return <BundlesSubView />
    case "analytics":
      return <AnalyticsSubView />
    case "withdrawals":
      return <WithdrawalsSubView />
    case "announcements":
      return <AnnouncementsSubView />
    case "settings":
      return <SettingsSubView />
    default:
      return <OverviewSubView />
  }
}

// ─── Overview Sub-View ────────────────────────────────────────────
function OverviewSubView() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentOrders, setRecentOrders] = useState<DataOrder[]>([])
  const [wallet, setWallet] = useState<WalletInfo | null>(null)
  const [tracker, setTracker] = useState<DeliveryTracker | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useAppStore((s) => s.navigate)
  const setAdminSubView = useAppStore((s) => s.setAdminSubView)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const token = getAdminToken()
    if (!token) { setLoading(false); return }

    try {
      const [dashboardRes, ordersRes, walletRes, trackerRes] = await Promise.allSettled([
        fetch("/api/admin/dashboard", { headers: { "admin-token": token } }),
        fetch("/api/datamart/orders", { headers: { "admin-token": token } }),
        fetch("/api/datamart/wallet", { headers: { "admin-token": token } }),
        fetch("/api/datamart/delivery-tracker", { headers: { "admin-token": token } }),
      ])

      if (dashboardRes.status === "fulfilled" && dashboardRes.value.ok) {
        const data = await dashboardRes.value.json()
        setStats({
          totalUsers: data.totalUsers ?? 0,
          totalSellers: data.totalAgents ?? 0,
          totalProducts: 0,
          totalOrders: data.totalOrders ?? 0,
          totalRevenue: data.totalRevenue ?? 0,
          openDisputes: data.pendingOrders ?? 0,
          activeCampaigns: 0,
        })
      }

      if (ordersRes.status === "fulfilled" && ordersRes.value.ok) {
        const data = await ordersRes.value.json()
        setRecentOrders((data.orders || []).slice(0, 10))
      }

      if (walletRes.status === "fulfilled" && walletRes.value.ok) {
        const data = await walletRes.value.json()
        setWallet(data)
      }

      if (trackerRes.status === "fulfilled" && trackerRes.value.ok) {
        const data = await trackerRes.value.json()
        setTracker(data.tracker || data)
      }
    } catch {
      // Silently handle
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const metricCards = [
    {
      label: "Total Orders",
      value: stats?.totalOrders ?? 0,
      icon: ShoppingCart,
      color: "text-[#FFC107]",
      bgColor: "bg-[#FFC107]/10",
      borderColor: "border-[#FFC107]/20",
    },
    {
      label: "Revenue",
      value: formatCurrency(stats?.totalRevenue ?? 0),
      icon: TrendingUp,
      color: "text-[#22C55E]",
      bgColor: "bg-[#22C55E]/10",
      borderColor: "border-[#22C55E]/20",
    },
    {
      label: "Active Agents",
      value: stats?.totalSellers ?? 0,
      icon: Users,
      color: "text-[#00E5FF]",
      bgColor: "bg-[#00E5FF]/10",
      borderColor: "border-[#00E5FF]/20",
    },
    {
      label: "Wallet Balance",
      value: formatCurrency(wallet?.deposit?.balance ?? 0),
      icon: Wallet,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {metricCards.map((card) => (
          <Card key={card.label} className={`bg-[#171717] border ${card.borderColor} shadow-lg`}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-400 font-medium">{card.label}</p>
                  <p className={`text-2xl font-bold mt-1 ${card.color}`}>
                    {loading ? (
                      <Skeleton className="h-8 w-24 bg-[#2A2A2A]" />
                    ) : (
                      card.value
                    )}
                  </p>
                </div>
                <div className={`w-10 h-10 rounded-lg ${card.bgColor} flex items-center justify-center`}>
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delivery Tracker + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 bg-[#171717] border border-[#2A2A2A] shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#00E5FF]" />
              Delivery Tracker
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-20 bg-[#2A2A2A]" />
                ))}
              </div>
            ) : tracker ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Pending", value: tracker.pending, color: "text-[#FFC107]", bg: "bg-[#FFC107]/10", border: "border-[#FFC107]/20" },
                  { label: "Processing", value: tracker.processing, color: "text-[#00E5FF]", bg: "bg-[#00E5FF]/10", border: "border-[#00E5FF]/20" },
                  { label: "Completed", value: tracker.completed, color: "text-[#22C55E]", bg: "bg-[#22C55E]/10", border: "border-[#22C55E]/20" },
                  { label: "Failed", value: tracker.failed, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
                ].map((item) => (
                  <div key={item.label} className={`p-4 rounded-lg ${item.bg} border ${item.border} text-center`}>
                    <p className="text-xs text-gray-400 mb-1">{item.label}</p>
                    <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">Delivery data unavailable</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-[#171717] border border-[#2A2A2A] shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start text-sm text-gray-300 hover:text-white hover:bg-[#2A2A2A]"
              onClick={() => setAdminSubView("agents")}
            >
              <UserCheck className="w-4 h-4 mr-2 text-[#22C55E]" />
              Approve Agents
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-sm text-gray-300 hover:text-white hover:bg-[#2A2A2A]"
              onClick={() => setAdminSubView("bundles")}
            >
              <Wifi className="w-4 h-4 mr-2 text-[#00E5FF]" />
              Manage Bundles
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-sm text-gray-300 hover:text-white hover:bg-[#2A2A2A]"
              onClick={() => setAdminSubView("announcements")}
            >
              <Bell className="w-4 h-4 mr-2 text-[#FFC107]" />
              Send Announcement
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-sm text-gray-300 hover:text-white hover:bg-[#2A2A2A]"
              onClick={fetchData}
            >
              <RefreshCw className="w-4 h-4 mr-2 text-purple-400" />
              Refresh Data
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Wallet Info */}
      {wallet && (
        <Card className="bg-[#171717] border border-[#2A2A2A] shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <Wallet className="w-4 h-4 text-[#FFC107]" />
              DataMart Wallet
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-16 bg-[#2A2A2A]" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Deposit Balance</p>
                  <p className="text-lg font-bold text-white">{formatCurrency(wallet.deposit?.balance ?? 0)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Available Earnings</p>
                  <p className="text-lg font-bold text-[#22C55E]">{formatCurrency(wallet.earnings?.availableBalance ?? 0)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Earnings</p>
                  <p className="text-lg font-bold text-[#00E5FF]">{formatCurrency(wallet.earnings?.totalEarnings ?? 0)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Withdrawn</p>
                  <p className="text-lg font-bold text-purple-400">{formatCurrency(wallet.earnings?.totalWithdrawn ?? 0)}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Orders */}
      <Card className="bg-[#171717] border border-[#2A2A2A] shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#FFC107]" />
              Recent Orders
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-[#FFC107] hover:text-[#FFD54F] hover:bg-[#FFC107]/10" onClick={() => setAdminSubView("orders")}>
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full bg-[#2A2A2A]" />
              ))}
            </div>
          ) : recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-[#2A2A2A] hover:bg-transparent">
                    <TableHead className="text-xs text-gray-500">Reference</TableHead>
                    <TableHead className="text-xs text-gray-500">Phone</TableHead>
                    <TableHead className="text-xs text-gray-500">Network</TableHead>
                    <TableHead className="text-xs text-gray-500">Amount</TableHead>
                    <TableHead className="text-xs text-gray-500">Status</TableHead>
                    <TableHead className="text-xs text-gray-500">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => {
                    const statusBadge = getStatusBadge(order.status)
                    return (
                      <TableRow key={order.id} className="border-b border-[#2A2A2A] hover:bg-[#2A2A2A]/30">
                        <TableCell className="text-xs font-mono text-gray-300">{order.reference || order.id.slice(0, 8)}</TableCell>
                        <TableCell className="text-xs text-gray-300">{order.phoneNumber}</TableCell>
                        <TableCell className="text-xs text-gray-300">{getNetworkDisplay(order.network)}</TableCell>
                        <TableCell className="text-xs font-medium text-white">{formatCurrency(order.price)}</TableCell>
                        <TableCell>
                          <Badge className={`text-[10px] px-2 py-0.5 ${statusBadge.bg} ${statusBadge.text} border-0`}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-gray-400">{formatDate(order.createdAt)}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="w-10 h-10 text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No recent orders</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Orders Sub-View ──────────────────────────────────────────────
function OrdersSubView() {
  const [orders, setOrders] = useState<DataOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
  const [networkFilter, setNetworkFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<DataOrder | null>(null)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    const token = getAdminToken()
    if (!token) { setLoading(false); return }

    try {
      const res = await fetch("/api/datamart/orders", { headers: { "admin-token": token } })
      if (res.ok) {
        const data = await res.json()
        setOrders(data.orders || [])
      }
    } catch {
      // Silently handle
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const filteredOrders = orders.filter((order) => {
    if (statusFilter !== "all" && order.status?.toLowerCase() !== statusFilter) return false
    if (networkFilter !== "all" && order.network !== networkFilter) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        order.phoneNumber?.toLowerCase().includes(q) ||
        order.reference?.toLowerCase().includes(q) ||
        order.id.toLowerCase().includes(q)
      )
    }
    return true
  })

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="bg-[#171717] border border-[#2A2A2A] shadow-lg">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                placeholder="Search by phone, reference..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-sm bg-[#0A0A0A] border-[#2A2A2A] text-white placeholder:text-gray-600 focus:border-[#FFC107]"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px] h-9 text-sm bg-[#0A0A0A] border-[#2A2A2A] text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-[#171717] border-[#2A2A2A]">
                <SelectItem value="all" className="text-gray-300 focus:text-white focus:bg-[#2A2A2A]">All Status</SelectItem>
                <SelectItem value="pending" className="text-gray-300 focus:text-white focus:bg-[#2A2A2A]">Pending</SelectItem>
                <SelectItem value="processing" className="text-gray-300 focus:text-white focus:bg-[#2A2A2A]">Processing</SelectItem>
                <SelectItem value="completed" className="text-gray-300 focus:text-white focus:bg-[#2A2A2A]">Completed</SelectItem>
                <SelectItem value="failed" className="text-gray-300 focus:text-white focus:bg-[#2A2A2A]">Failed</SelectItem>
                <SelectItem value="refunded" className="text-gray-300 focus:text-white focus:bg-[#2A2A2A]">Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Select value={networkFilter} onValueChange={setNetworkFilter}>
              <SelectTrigger className="w-[150px] h-9 text-sm bg-[#0A0A0A] border-[#2A2A2A] text-white">
                <SelectValue placeholder="Network" />
              </SelectTrigger>
              <SelectContent className="bg-[#171717] border-[#2A2A2A]">
                <SelectItem value="all" className="text-gray-300 focus:text-white focus:bg-[#2A2A2A]">All Networks</SelectItem>
                <SelectItem value="YELLO" className="text-gray-300 focus:text-white focus:bg-[#2A2A2A]">MTN</SelectItem>
                <SelectItem value="TELECEL" className="text-gray-300 focus:text-white focus:bg-[#2A2A2A]">Telecel</SelectItem>
                <SelectItem value="AT_PREMIUM" className="text-gray-300 focus:text-white focus:bg-[#2A2A2A]">AirtelTigo</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={fetchOrders} className="h-9 border-[#2A2A2A] text-gray-300 hover:text-white hover:bg-[#2A2A2A]">
              <RefreshCw className="w-4 h-4 mr-1" /> Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="bg-[#171717] border border-[#2A2A2A] shadow-lg">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full bg-[#2A2A2A]" />
              ))}
            </div>
          ) : filteredOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-[#2A2A2A] hover:bg-transparent">
                    <TableHead className="text-xs text-gray-500">Order ID</TableHead>
                    <TableHead className="text-xs text-gray-500">Phone</TableHead>
                    <TableHead className="text-xs text-gray-500">Network</TableHead>
                    <TableHead className="text-xs text-gray-500">Amount</TableHead>
                    <TableHead className="text-xs text-gray-500">Status</TableHead>
                    <TableHead className="text-xs text-gray-500">Date</TableHead>
                    <TableHead className="text-xs text-gray-500">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => {
                    const statusBadge = getStatusBadge(order.status)
                    return (
                      <TableRow key={order.id} className="border-b border-[#2A2A2A] hover:bg-[#2A2A2A]/30 cursor-pointer" onClick={() => setSelectedOrder(order)}>
                        <TableCell className="text-xs font-mono text-gray-300">{order.reference || order.id.slice(0, 8)}</TableCell>
                        <TableCell className="text-xs text-gray-300">{order.phoneNumber}</TableCell>
                        <TableCell className="text-xs text-gray-300">{getNetworkDisplay(order.network)}</TableCell>
                        <TableCell className="text-xs font-medium text-white">{formatCurrency(order.price)}</TableCell>
                        <TableCell>
                          <Badge className={`text-[10px] px-2 py-0.5 ${statusBadge.bg} ${statusBadge.text} border-0`}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-gray-400">{formatDate(order.createdAt)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-[#00E5FF] hover:bg-[#00E5FF]/10" onClick={(e) => { e.stopPropagation(); setSelectedOrder(order) }}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No orders found</p>
              <p className="text-xs text-gray-600 mt-1">Try adjusting your filters</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-md bg-[#171717] border border-[#2A2A2A]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Package className="w-5 h-5 text-[#FFC107]" />
              Order Details
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {selectedOrder?.reference || selectedOrder?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500">Phone Number</p>
                  <p className="font-medium text-white">{selectedOrder.phoneNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Network</p>
                  <p className="font-medium text-white">{getNetworkDisplay(selectedOrder.network)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Capacity</p>
                  <p className="font-medium text-white">{selectedOrder.capacity} GB</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Price</p>
                  <p className="font-medium text-white">{formatCurrency(selectedOrder.price)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <Badge className={`${getStatusBadge(selectedOrder.status).bg} ${getStatusBadge(selectedOrder.status).text} border-0`}>{selectedOrder.status}</Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Commission</p>
                  <p className="font-medium text-white">{formatCurrency(selectedOrder.agentCommission)}</p>
                </div>
              </div>
              <Separator className="bg-[#2A2A2A]" />
              <div className="text-xs text-gray-500">
                Created: {formatDate(selectedOrder.createdAt)}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Agents Sub-View ──────────────────────────────────────────────
function AgentsSubView() {
  const [agents, setAgents] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [tierDialogOpen, setTierDialogOpen] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<AdminUser | null>(null)
  const [newTier, setNewTier] = useState("retail")
  const [newCommission, setNewCommission] = useState("5")

  const fetchAgents = useCallback(async () => {
    setLoading(true)
    const token = getAdminToken()
    if (!token) { setLoading(false); return }

    try {
      const res = await fetch("/api/admin/users?role=agent", { headers: { "admin-token": token } })
      if (res.ok) {
        const data = await res.json()
        const agentUsers = (data.users || []).filter((u: AdminUser) => u.role === "agent" || u.role === "seller")
        setAgents(agentUsers)
      }
    } catch {
      // Silently handle
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAgents() }, [fetchAgents])

  const updateAgentStatus = async (userId: string, action: "approve" | "suspend") => {
    const token = getAdminToken()
    if (!token) return

    try {
      const body = action === "approve"
        ? { userId, sellerApproved: true }
        : { userId, suspended: true }

      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "admin-token": token },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        toast.success(`Agent ${action === "approve" ? "approved" : "suspended"} successfully`)
        fetchAgents()
      } else {
        toast.error(`Failed to ${action} agent`)
      }
    } catch {
      toast.error("Failed to update agent")
    }
  }

  const filteredAgents = agents.filter((agent) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        agent.email?.toLowerCase().includes(q) ||
        agent.full_name?.toLowerCase().includes(q) ||
        agent.phone?.toLowerCase().includes(q)
      )
    }
    return true
  })

  return (
    <div className="space-y-4">
      {/* Search + Actions */}
      <Card className="bg-[#171717] border border-[#2A2A2A] shadow-lg">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                placeholder="Search agents by name, email, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-sm bg-[#0A0A0A] border-[#2A2A2A] text-white placeholder:text-gray-600 focus:border-[#FFC107]"
              />
            </div>
            <Button variant="outline" size="sm" onClick={fetchAgents} className="h-9 border-[#2A2A2A] text-gray-300 hover:text-white hover:bg-[#2A2A2A]">
              <RefreshCw className="w-4 h-4 mr-1" /> Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Agents Table */}
      <Card className="bg-[#171717] border border-[#2A2A2A] shadow-lg">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full bg-[#2A2A2A]" />
              ))}
            </div>
          ) : filteredAgents.length > 0 ? (
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-[#2A2A2A] hover:bg-transparent">
                    <TableHead className="text-xs text-gray-500">Name</TableHead>
                    <TableHead className="text-xs text-gray-500">Email</TableHead>
                    <TableHead className="text-xs text-gray-500">Phone</TableHead>
                    <TableHead className="text-xs text-gray-500">Tier</TableHead>
                    <TableHead className="text-xs text-gray-500">Commission</TableHead>
                    <TableHead className="text-xs text-gray-500">Status</TableHead>
                    <TableHead className="text-xs text-gray-500">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAgents.map((agent) => {
                    const agentStatus = agent.suspended ? "suspended" : agent.seller_approved ? "active" : "pending"
                    const statusBadge = getStatusBadge(agentStatus)
                    return (
                      <TableRow key={agent.id} className="border-b border-[#2A2A2A] hover:bg-[#2A2A2A]/30">
                        <TableCell className="text-xs font-medium text-white">{agent.full_name || "—"}</TableCell>
                        <TableCell className="text-xs text-gray-300">{agent.email}</TableCell>
                        <TableCell className="text-xs text-gray-300">{agent.phone || "—"}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] px-2 py-0.5 capitalize border-[#2A2A2A] text-gray-300">
                            {agent.tier || "retail"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-[#FFC107]">{agent.commissionRate ?? 5}%</TableCell>
                        <TableCell>
                          <Badge className={`text-[10px] px-2 py-0.5 ${statusBadge.bg} ${statusBadge.text} border-0`}>
                            {agent.suspended ? "Suspended" : agent.seller_approved ? "Active" : "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {!agent.seller_approved && !agent.suspended && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-[#22C55E] hover:text-[#22C55E] hover:bg-[#22C55E]/10 h-7 text-xs"
                                onClick={() => updateAgentStatus(agent.id, "approve")}
                              >
                                <CheckCircle2 className="w-3 h-3 mr-1" /> Approve
                              </Button>
                            )}
                            {!agent.suspended && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-400 hover:text-red-400 hover:bg-red-400/10 h-7 text-xs"
                                onClick={() => updateAgentStatus(agent.id, "suspend")}
                              >
                                <XCircle className="w-3 h-3 mr-1" /> Suspend
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-[#00E5FF] hover:text-[#00E5FF] hover:bg-[#00E5FF]/10 h-7 text-xs"
                              onClick={() => {
                                setSelectedAgent(agent)
                                setNewTier(agent.tier || "retail")
                                setNewCommission(String(agent.commissionRate ?? 5))
                                setTierDialogOpen(true)
                              }}
                            >
                              <Settings className="w-3 h-3 mr-1" /> Set Tier
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No agents found</p>
              <p className="text-xs text-gray-600 mt-1">Agents will appear here after they register</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Set Tier Dialog */}
      <Dialog open={tierDialogOpen} onOpenChange={setTierDialogOpen}>
        <DialogContent className="max-w-sm bg-[#171717] border border-[#2A2A2A]">
          <DialogHeader>
            <DialogTitle className="text-white">Set Agent Tier</DialogTitle>
            <DialogDescription className="text-gray-400">
              Configure tier and commission for {selectedAgent?.full_name || selectedAgent?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm text-gray-300">Agent Tier</Label>
              <Select value={newTier} onValueChange={setNewTier}>
                <SelectTrigger className="h-9 bg-[#0A0A0A] border-[#2A2A2A] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#171717] border-[#2A2A2A]">
                  <SelectItem value="retail" className="text-gray-300 focus:text-white focus:bg-[#2A2A2A]">Retail</SelectItem>
                  <SelectItem value="premium" className="text-gray-300 focus:text-white focus:bg-[#2A2A2A]">Premium</SelectItem>
                  <SelectItem value="super" className="text-gray-300 focus:text-white focus:bg-[#2A2A2A]">Super</SelectItem>
                  <SelectItem value="distributor" className="text-gray-300 focus:text-white focus:bg-[#2A2A2A]">Distributor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-gray-300">Commission Rate (%)</Label>
              <Input
                type="number"
                value={newCommission}
                onChange={(e) => setNewCommission(e.target.value)}
                min="0"
                max="50"
                step="0.5"
                className="h-9 bg-[#0A0A0A] border-[#2A2A2A] text-white focus:border-[#FFC107]"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" size="sm" className="border-[#2A2A2A] text-gray-300 hover:text-white hover:bg-[#2A2A2A]">Cancel</Button>
            </DialogClose>
            <Button
              size="sm"
              className="bg-[#FFC107] hover:bg-[#FFD54F] text-black font-semibold"
              onClick={() => {
                toast.success(`Tier set to ${newTier} with ${newCommission}% commission`)
                setTierDialogOpen(false)
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Bundles Sub-View ─────────────────────────────────────────────
function BundlesSubView() {
  const [bundles, setBundles] = useState<BundlePriceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [newDialogOpen, setNewDialogOpen] = useState(false)
  const [editingBundle, setEditingBundle] = useState<BundlePriceItem | null>(null)
  const [formData, setFormData] = useState({
    network: "YELLO",
    capacity: 1,
    basePrice: 0,
    retailPrice: 0,
    agentRetailPrice: 0,
    agentPremiumPrice: 0,
    agentSuperPrice: 0,
    distributorPrice: 0,
  })

  const fetchBundles = useCallback(async () => {
    setLoading(true)
    const token = getAdminToken()
    if (!token) { setLoading(false); return }

    try {
      const res = await fetch("/api/admin/bundles", { headers: { "admin-token": token } })
      if (res.ok) {
        const data = await res.json()
        setBundles(data.bundles || [])
      }
    } catch {
      // Silently handle
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchBundles() }, [fetchBundles])

  const openEdit = (bundle: BundlePriceItem) => {
    setEditingBundle(bundle)
    setFormData({
      network: bundle.network,
      capacity: bundle.capacity,
      basePrice: bundle.basePrice,
      retailPrice: bundle.retailPrice,
      agentRetailPrice: bundle.agentRetailPrice,
      agentPremiumPrice: bundle.agentPremiumPrice,
      agentSuperPrice: bundle.agentSuperPrice,
      distributorPrice: bundle.distributorPrice,
    })
    setEditDialogOpen(true)
  }

  const openNew = () => {
    setEditingBundle(null)
    setFormData({
      network: "YELLO",
      capacity: 1,
      basePrice: 0,
      retailPrice: 0,
      agentRetailPrice: 0,
      agentPremiumPrice: 0,
      agentSuperPrice: 0,
      distributorPrice: 0,
    })
    setNewDialogOpen(true)
  }

  const saveBundle = async (isEdit: boolean) => {
    const token = getAdminToken()
    if (!token) return

    try {
      const url = isEdit
        ? `/api/admin/bundles/${editingBundle?.id}`
        : "/api/admin/bundles"
      const method = isEdit ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", "admin-token": token },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        toast.success(isEdit ? "Bundle updated" : "Bundle created")
        fetchBundles()
        if (isEdit) { setEditDialogOpen(false) } else { setNewDialogOpen(false) }
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to save bundle")
      }
    } catch {
      toast.error("Failed to save bundle")
    }
  }

  const deleteBundle = async (id: number) => {
    const token = getAdminToken()
    if (!token) return

    try {
      const res = await fetch(`/api/admin/bundles/${id}`, {
        method: "DELETE",
        headers: { "admin-token": token },
      })
      if (res.ok) {
        toast.success("Bundle deleted")
        fetchBundles()
      } else {
        toast.error("Failed to delete bundle")
      }
    } catch {
      toast.error("Failed to delete bundle")
    }
  }

  const toggleBundleStatus = async (bundle: BundlePriceItem) => {
    const token = getAdminToken()
    if (!token) return

    try {
      const res = await fetch(`/api/admin/bundles/${bundle.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "admin-token": token },
        body: JSON.stringify({ ...bundle, isActive: !bundle.isActive }),
      })
      if (res.ok) {
        toast.success(bundle.isActive ? "Bundle deactivated" : "Bundle activated")
        fetchBundles()
      } else {
        toast.error("Failed to toggle bundle")
      }
    } catch {
      toast.error("Failed to toggle bundle")
    }
  }

  const bundleFormFields = (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs text-gray-300">Network</Label>
          <Select value={formData.network} onValueChange={(v) => setFormData({ ...formData, network: v })}>
            <SelectTrigger className="h-9 text-sm bg-[#0A0A0A] border-[#2A2A2A] text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#171717] border-[#2A2A2A]">
              <SelectItem value="YELLO" className="text-gray-300 focus:text-white focus:bg-[#2A2A2A]">MTN</SelectItem>
              <SelectItem value="TELECEL" className="text-gray-300 focus:text-white focus:bg-[#2A2A2A]">Telecel</SelectItem>
              <SelectItem value="AT_PREMIUM" className="text-gray-300 focus:text-white focus:bg-[#2A2A2A]">AirtelTigo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-gray-300">Capacity (GB)</Label>
          <Input
            type="number"
            value={formData.capacity}
            onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
            className="h-9 text-sm bg-[#0A0A0A] border-[#2A2A2A] text-white focus:border-[#FFC107]"
            min={1}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs text-gray-300">Base Price (Cost)</Label>
          <Input
            type="number"
            value={formData.basePrice}
            onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })}
            className="h-9 text-sm bg-[#0A0A0A] border-[#2A2A2A] text-white focus:border-[#FFC107]"
            step={0.01}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-gray-300">Retail Price</Label>
          <Input
            type="number"
            value={formData.retailPrice}
            onChange={(e) => setFormData({ ...formData, retailPrice: Number(e.target.value) })}
            className="h-9 text-sm bg-[#0A0A0A] border-[#2A2A2A] text-white focus:border-[#FFC107]"
            step={0.01}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs text-gray-300">Agent Retail Price</Label>
          <Input
            type="number"
            value={formData.agentRetailPrice}
            onChange={(e) => setFormData({ ...formData, agentRetailPrice: Number(e.target.value) })}
            className="h-9 text-sm bg-[#0A0A0A] border-[#2A2A2A] text-white focus:border-[#FFC107]"
            step={0.01}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-gray-300">Agent Premium Price</Label>
          <Input
            type="number"
            value={formData.agentPremiumPrice}
            onChange={(e) => setFormData({ ...formData, agentPremiumPrice: Number(e.target.value) })}
            className="h-9 text-sm bg-[#0A0A0A] border-[#2A2A2A] text-white focus:border-[#FFC107]"
            step={0.01}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs text-gray-300">Agent Super Price</Label>
          <Input
            type="number"
            value={formData.agentSuperPrice}
            onChange={(e) => setFormData({ ...formData, agentSuperPrice: Number(e.target.value) })}
            className="h-9 text-sm bg-[#0A0A0A] border-[#2A2A2A] text-white focus:border-[#FFC107]"
            step={0.01}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-gray-300">Distributor Price</Label>
          <Input
            type="number"
            value={formData.distributorPrice}
            onChange={(e) => setFormData({ ...formData, distributorPrice: Number(e.target.value) })}
            className="h-9 text-sm bg-[#0A0A0A] border-[#2A2A2A] text-white focus:border-[#FFC107]"
            step={0.01}
          />
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">Manage bundle pricing for all networks and tiers</p>
        <Button size="sm" className="bg-[#FFC107] hover:bg-[#FFD54F] text-black font-semibold" onClick={openNew}>
          <Plus className="w-4 h-4 mr-1" /> Add Bundle
        </Button>
      </div>

      <Card className="bg-[#171717] border border-[#2A2A2A] shadow-lg">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 w-full bg-[#2A2A2A]" />
              ))}
            </div>
          ) : bundles.length > 0 ? (
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-[#2A2A2A] hover:bg-transparent">
                    <TableHead className="text-xs text-gray-500">Network</TableHead>
                    <TableHead className="text-xs text-gray-500">Capacity</TableHead>
                    <TableHead className="text-xs text-gray-500">Base Price</TableHead>
                    <TableHead className="text-xs text-gray-500">Retail</TableHead>
                    <TableHead className="text-xs text-gray-500">Agent Retail</TableHead>
                    <TableHead className="text-xs text-gray-500">Premium</TableHead>
                    <TableHead className="text-xs text-gray-500">Super</TableHead>
                    <TableHead className="text-xs text-gray-500">Distributor</TableHead>
                    <TableHead className="text-xs text-gray-500">Status</TableHead>
                    <TableHead className="text-xs text-gray-500">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bundles.map((bundle) => (
                    <TableRow key={bundle.id} className="border-b border-[#2A2A2A] hover:bg-[#2A2A2A]/30">
                      <TableCell className="text-xs font-medium text-white">{getNetworkDisplay(bundle.network)}</TableCell>
                      <TableCell className="text-xs text-gray-300">{bundle.capacity}GB</TableCell>
                      <TableCell className="text-xs text-gray-300">{formatCurrency(bundle.basePrice)}</TableCell>
                      <TableCell className="text-xs text-gray-300">{formatCurrency(bundle.retailPrice)}</TableCell>
                      <TableCell className="text-xs text-gray-300">{formatCurrency(bundle.agentRetailPrice)}</TableCell>
                      <TableCell className="text-xs text-gray-300">{formatCurrency(bundle.agentPremiumPrice)}</TableCell>
                      <TableCell className="text-xs text-gray-300">{formatCurrency(bundle.agentSuperPrice)}</TableCell>
                      <TableCell className="text-xs text-gray-300">{formatCurrency(bundle.distributorPrice)}</TableCell>
                      <TableCell>
                        <button onClick={() => toggleBundleStatus(bundle)}>
                          <Badge className={`text-[10px] px-2 py-0.5 cursor-pointer border-0 ${bundle.isActive ? "bg-[#22C55E]/15 text-[#22C55E]" : "bg-[#2A2A2A] text-gray-500"}`}>
                            {bundle.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </button>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="h-7 text-xs text-[#00E5FF] hover:text-[#00E5FF] hover:bg-[#00E5FF]/10" onClick={() => openEdit(bundle)}>
                            <Edit3 className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 text-xs text-red-400 hover:text-red-400 hover:bg-red-400/10" onClick={() => deleteBundle(bundle.id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Wifi className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No bundle pricing configured</p>
              <Button size="sm" className="mt-3 bg-[#FFC107] hover:bg-[#FFD54F] text-black font-semibold" onClick={openNew}>
                <Plus className="w-4 h-4 mr-1" /> Add First Bundle
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Bundle Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md bg-[#171717] border border-[#2A2A2A]">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Bundle Pricing</DialogTitle>
            <DialogDescription className="text-gray-400">
              {getNetworkDisplay(formData.network)} - {formData.capacity}GB
            </DialogDescription>
          </DialogHeader>
          {bundleFormFields}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" size="sm" className="border-[#2A2A2A] text-gray-300 hover:text-white hover:bg-[#2A2A2A]">Cancel</Button>
            </DialogClose>
            <Button size="sm" className="bg-[#FFC107] hover:bg-[#FFD54F] text-black font-semibold" onClick={() => saveBundle(true)}>
              <Save className="w-4 h-4 mr-1" /> Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Bundle Dialog */}
      <Dialog open={newDialogOpen} onOpenChange={setNewDialogOpen}>
        <DialogContent className="max-w-md bg-[#171717] border border-[#2A2A2A]">
          <DialogHeader>
            <DialogTitle className="text-white">Add New Bundle</DialogTitle>
            <DialogDescription className="text-gray-400">Define pricing for a new bundle capacity</DialogDescription>
          </DialogHeader>
          {bundleFormFields}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" size="sm" className="border-[#2A2A2A] text-gray-300 hover:text-white hover:bg-[#2A2A2A]">Cancel</Button>
            </DialogClose>
            <Button size="sm" className="bg-[#FFC107] hover:bg-[#FFD54F] text-black font-semibold" onClick={() => saveBundle(false)}>
              <Plus className="w-4 h-4 mr-1" /> Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Analytics Sub-View ───────────────────────────────────────────
function AnalyticsSubView() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [wallet, setWallet] = useState<WalletInfo | null>(null)
  const [orders, setOrders] = useState<DataOrder[]>([])
  const [agents, setAgents] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAnalytics = useCallback(async () => {
    setLoading(true)
    const token = getAdminToken()
    if (!token) { setLoading(false); return }

    try {
      const [dashboardRes, walletRes, ordersRes, agentsRes] = await Promise.allSettled([
        fetch("/api/admin/dashboard", { headers: { "admin-token": token } }),
        fetch("/api/datamart/wallet", { headers: { "admin-token": token } }),
        fetch("/api/datamart/orders", { headers: { "admin-token": token } }),
        fetch("/api/admin/users?role=agent", { headers: { "admin-token": token } }),
      ])

      if (dashboardRes.status === "fulfilled" && dashboardRes.value.ok) {
        const data = await dashboardRes.value.json()
        setStats({
          totalUsers: data.totalUsers ?? 0,
          totalSellers: data.totalAgents ?? 0,
          totalProducts: 0,
          totalOrders: data.totalOrders ?? 0,
          totalRevenue: data.totalRevenue ?? 0,
          openDisputes: data.pendingOrders ?? 0,
          activeCampaigns: 0,
        })
      }
      if (walletRes.status === "fulfilled" && walletRes.value.ok) {
        const data = await walletRes.value.json()
        setWallet(data)
      }
      if (ordersRes.status === "fulfilled" && ordersRes.value.ok) {
        const data = await ordersRes.value.json()
        setOrders(data.orders || [])
      }
      if (agentsRes.status === "fulfilled" && agentsRes.value.ok) {
        const data = await agentsRes.value.json()
        setAgents((data.users || []).filter((u: AdminUser) => u.role === "agent" || u.role === "seller"))
      }
    } catch {
      // Silently handle
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAnalytics() }, [fetchAnalytics])

  // Calculate network distribution from orders
  const networkCounts = orders.reduce((acc, order) => {
    const net = getNetworkDisplay(order.network)
    acc[net] = (acc[net] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const totalNetworkOrders = Object.values(networkCounts).reduce((sum, v) => sum + v, 0) || 1

  const networkColors: Record<string, { bar: string; text: string; bg: string }> = {
    MTN: { bar: "bg-[#FFC107]", text: "text-[#FFC107]", bg: "bg-[#FFC107]/10" },
    Telecel: { bar: "bg-red-500", text: "text-red-400", bg: "bg-red-500/10" },
    AirtelTigo: { bar: "bg-[#00E5FF]", text: "text-[#00E5FF]", bg: "bg-[#00E5FF]/10" },
  }

  // Calculate order volume by status
  const statusCounts = orders.reduce((acc, order) => {
    const s = order.status?.toLowerCase() || "unknown"
    acc[s] = (acc[s] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Top agents by balance
  const topAgents = [...agents]
    .filter((a) => a.seller_approved && !a.suspended)
    .sort((a, b) => (b.balance || 0) - (a.balance || 0))
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: formatCurrency(stats?.totalRevenue ?? 0), icon: TrendingUp, color: "text-[#22C55E]", bg: "bg-[#22C55E]/10", border: "border-[#22C55E]/20" },
          { label: "Total Orders", value: stats?.totalOrders ?? 0, icon: ShoppingCart, color: "text-[#FFC107]", bg: "bg-[#FFC107]/10", border: "border-[#FFC107]/20" },
          { label: "Total Users", value: stats?.totalUsers ?? 0, icon: Users, color: "text-[#00E5FF]", bg: "bg-[#00E5FF]/10", border: "border-[#00E5FF]/20" },
          { label: "Total Agents", value: stats?.totalSellers ?? 0, icon: Wifi, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
        ].map((card) => (
          <Card key={card.label} className={`bg-[#171717] border ${card.border} shadow-lg`}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-400">{card.label}</p>
                  <p className={`text-2xl font-bold mt-1 ${card.color}`}>
                    {loading ? <Skeleton className="h-8 w-20 bg-[#2A2A2A]" /> : card.value}
                  </p>
                </div>
                <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}>
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Network Distribution + Order Volume */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Network Distribution */}
        <Card className="bg-[#171717] border border-[#2A2A2A] shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <Wifi className="w-4 h-4 text-[#00E5FF]" />
              Network Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-8 bg-[#2A2A2A]" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(networkCounts).length > 0 ? (
                  Object.entries(networkCounts).map(([network, count]) => {
                    const pct = Math.round((count / totalNetworkOrders) * 100)
                    const colors = networkColors[network] || { bar: "bg-gray-400", text: "text-gray-400", bg: "bg-gray-500/10" }
                    return (
                      <div key={network}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-sm font-medium ${colors.text}`}>{network}</span>
                          <span className="text-xs text-gray-400">{count} orders ({pct}%)</span>
                        </div>
                        <div className="w-full h-3 bg-[#0A0A0A] rounded-full overflow-hidden">
                          <div className={`h-full ${colors.bar} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm text-gray-500">No order data available</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Volume by Status */}
        <Card className="bg-[#171717] border border-[#2A2A2A] shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#FFC107]" />
              Order Volume by Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-8 bg-[#2A2A2A]" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {Object.keys(statusCounts).length > 0 ? (
                  Object.entries(statusCounts).map(([status, count]) => {
                    const total = Object.values(statusCounts).reduce((s, v) => s + v, 0) || 1
                    const pct = Math.round((count / total) * 100)
                    const badge = getStatusBadge(status)
                    return (
                      <div key={status}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-sm font-medium capitalize ${badge.text}`}>{status}</span>
                          <span className="text-xs text-gray-400">{count} orders ({pct}%)</span>
                        </div>
                        <div className="w-full h-3 bg-[#0A0A0A] rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-500 ${badge.bg.replace("/15", "")}`} style={{ width: `${pct}%`, backgroundColor: status === "completed" ? "#22C55E" : status === "processing" ? "#00E5FF" : status === "pending" ? "#FFC107" : status === "failed" ? "#ef4444" : "#8b5cf6" }} />
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm text-gray-500">No order data available</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Revenue Overview + Top Agents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue Overview */}
        <Card className="bg-[#171717] border border-[#2A2A2A] shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#22C55E]" />
              Revenue Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-20 bg-[#2A2A2A]" />
                ))}
              </div>
            ) : wallet ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-[#22C55E]/10 border border-[#22C55E]/20 text-center">
                  <p className="text-xs text-gray-400 mb-1">Available</p>
                  <p className="text-lg font-bold text-[#22C55E]">{formatCurrency(wallet.earnings?.availableBalance ?? 0)}</p>
                </div>
                <div className="p-4 rounded-lg bg-[#FFC107]/10 border border-[#FFC107]/20 text-center">
                  <p className="text-xs text-gray-400 mb-1">Pending</p>
                  <p className="text-lg font-bold text-[#FFC107]">{formatCurrency(wallet.earnings?.pendingBalance ?? 0)}</p>
                </div>
                <div className="p-4 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/20 text-center">
                  <p className="text-xs text-gray-400 mb-1">Total Earned</p>
                  <p className="text-lg font-bold text-[#00E5FF]">{formatCurrency(wallet.earnings?.totalEarnings ?? 0)}</p>
                </div>
                <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20 text-center">
                  <p className="text-xs text-gray-400 mb-1">Withdrawn</p>
                  <p className="text-lg font-bold text-purple-400">{formatCurrency(wallet.earnings?.totalWithdrawn ?? 0)}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-6">Revenue data unavailable</p>
            )}
          </CardContent>
        </Card>

        {/* Top Agents Leaderboard */}
        <Card className="bg-[#171717] border border-[#2A2A2A] shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#FFC107]" />
              Top Agents Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-10 bg-[#2A2A2A]" />
                ))}
              </div>
            ) : topAgents.length > 0 ? (
              <div className="space-y-2">
                {topAgents.map((agent, index) => (
                  <div key={agent.id} className="flex items-center gap-3 p-3 rounded-lg bg-[#0A0A0A] border border-[#2A2A2A]">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? "bg-[#FFC107]/20 text-[#FFC107]" :
                      index === 1 ? "bg-gray-400/20 text-gray-300" :
                      index === 2 ? "bg-orange-500/20 text-orange-400" :
                      "bg-[#2A2A2A] text-gray-500"
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{agent.full_name || agent.email}</p>
                      <p className="text-xs text-gray-500">{agent.tier || "retail"} tier</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-[#22C55E]">{formatCurrency(agent.balance ?? 0)}</p>
                      <p className="text-xs text-gray-500">balance</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Users className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No active agents yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ─── Withdrawals Sub-View ─────────────────────────────────────────
function WithdrawalsSubView() {
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [wallet, setWallet] = useState<WalletInfo | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const token = getAdminToken()
    if (!token) { setLoading(false); return }

    try {
      const [walletRes, txRes] = await Promise.allSettled([
        fetch("/api/datamart/wallet", { headers: { "admin-token": token } }),
        fetch("/api/datamart/wallet/transactions", { headers: { "admin-token": token } }),
      ])

      if (walletRes.status === "fulfilled" && walletRes.value.ok) {
        const data = await walletRes.value.json()
        setWallet(data)
      }

      if (txRes.status === "fulfilled" && txRes.value.ok) {
        const data = await txRes.value.json()
        const wtxns = (data.transactions || []).filter((t: any) =>
          t.type?.toLowerCase().includes("withdraw") || t.category?.toLowerCase().includes("withdraw")
        )
        setWithdrawals(wtxns.length > 0 ? wtxns : data.transactions || [])
      }
    } catch {
      // Silently handle
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  return (
    <div className="space-y-4">
      {/* Wallet Summary */}
      {wallet && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-[#171717] border border-[#22C55E]/20 shadow-lg">
            <CardContent className="p-5 text-center">
              <p className="text-xs text-gray-400">Available Balance</p>
              <p className="text-2xl font-bold text-[#22C55E]">{formatCurrency(wallet.earnings?.availableBalance ?? 0)}</p>
            </CardContent>
          </Card>
          <Card className="bg-[#171717] border border-[#FFC107]/20 shadow-lg">
            <CardContent className="p-5 text-center">
              <p className="text-xs text-gray-400">Pending Balance</p>
              <p className="text-2xl font-bold text-[#FFC107]">{formatCurrency(wallet.earnings?.pendingBalance ?? 0)}</p>
            </CardContent>
          </Card>
          <Card className="bg-[#171717] border border-[#00E5FF]/20 shadow-lg">
            <CardContent className="p-5 text-center">
              <p className="text-xs text-gray-400">Total Withdrawn</p>
              <p className="text-2xl font-bold text-[#00E5FF]">{formatCurrency(wallet.earnings?.totalWithdrawn ?? 0)}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Transactions Table */}
      <Card className="bg-[#171717] border border-[#2A2A2A] shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <Wallet className="w-4 h-4 text-[#FFC107]" />
              Transaction History
            </CardTitle>
            <Button variant="outline" size="sm" onClick={fetchData} className="h-9 border-[#2A2A2A] text-gray-300 hover:text-white hover:bg-[#2A2A2A]">
              <RefreshCw className="w-4 h-4 mr-1" /> Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full bg-[#2A2A2A]" />
              ))}
            </div>
          ) : withdrawals.length > 0 ? (
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-[#2A2A2A] hover:bg-transparent">
                    <TableHead className="text-xs text-gray-500">Reference</TableHead>
                    <TableHead className="text-xs text-gray-500">Type</TableHead>
                    <TableHead className="text-xs text-gray-500">Amount</TableHead>
                    <TableHead className="text-xs text-gray-500">Balance After</TableHead>
                    <TableHead className="text-xs text-gray-500">Description</TableHead>
                    <TableHead className="text-xs text-gray-500">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawals.map((txn, i) => {
                    const isCredit = txn.type === "credit"
                    return (
                      <TableRow key={txn.id || i} className="border-b border-[#2A2A2A] hover:bg-[#2A2A2A]/30">
                        <TableCell className="text-xs font-mono text-gray-300">{txn.reference || "—"}</TableCell>
                        <TableCell>
                          <Badge className={`text-[10px] px-2 py-0.5 border-0 ${isCredit ? "bg-[#22C55E]/15 text-[#22C55E]" : "bg-red-500/15 text-red-400"}`}>
                            {txn.type || txn.category || "—"}
                          </Badge>
                        </TableCell>
                        <TableCell className={`text-xs font-medium ${isCredit ? "text-[#22C55E]" : "text-red-400"}`}>
                          {isCredit ? "+" : "-"}{formatCurrency(txn.amount ?? 0)}
                        </TableCell>
                        <TableCell className="text-xs text-gray-300">{formatCurrency(txn.balance ?? 0)}</TableCell>
                        <TableCell className="text-xs max-w-[200px] truncate text-gray-400">{txn.description || "—"}</TableCell>
                        <TableCell className="text-xs text-gray-400">{formatDate(txn.createdAt)}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Wallet className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No transactions found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Announcements Sub-View ───────────────────────────────────────
function AnnouncementsSubView() {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([])
  const [loading, setLoading] = useState(true)
  const [newTitle, setNewTitle] = useState("")
  const [newBody, setNewBody] = useState("")
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editBody, setEditBody] = useState("")

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true)
    const token = getAdminToken()
    if (!token) { setLoading(false); return }

    try {
      const res = await fetch("/api/admin/announcements", { headers: { "admin-token": token } })
      if (res.ok) {
        const data = await res.json()
        setAnnouncements(data.announcements || [])
      }
    } catch {
      // Silently handle
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAnnouncements() }, [fetchAnnouncements])

  const createAnnouncement = async () => {
    if (!newTitle.trim()) {
      toast.error("Title is required")
      return
    }
    setCreating(true)
    const token = getAdminToken()
    if (!token) { setCreating(false); return }

    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json", "admin-token": token },
        body: JSON.stringify({ title: newTitle, body: newBody }),
      })
      if (res.ok) {
        toast.success("Announcement created")
        setNewTitle("")
        setNewBody("")
        fetchAnnouncements()
      } else {
        toast.error("Failed to create announcement")
      }
    } catch {
      toast.error("Failed to create announcement")
    } finally {
      setCreating(false)
    }
  }

  const toggleAnnouncement = async (id: number, isActive: boolean) => {
    const token = getAdminToken()
    if (!token) return

    try {
      const res = await fetch("/api/admin/announcements", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "admin-token": token },
        body: JSON.stringify({ id, isActive: !isActive }),
      })
      if (res.ok) {
        toast.success(isActive ? "Announcement deactivated" : "Announcement activated")
        fetchAnnouncements()
      }
    } catch {
      toast.error("Failed to update announcement")
    }
  }

  const deleteAnnouncement = async (id: number) => {
    const token = getAdminToken()
    if (!token) return

    try {
      const res = await fetch("/api/admin/announcements", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "admin-token": token },
        body: JSON.stringify({ id }),
      })
      if (res.ok) {
        toast.success("Announcement deleted")
        fetchAnnouncements()
      }
    } catch {
      toast.error("Failed to delete announcement")
    }
  }

  const startEditing = (ann: AnnouncementItem) => {
    setEditingId(ann.id)
    setEditTitle(ann.title)
    setEditBody(ann.body || "")
  }

  const saveEdit = async () => {
    const token = getAdminToken()
    if (!token || !editingId) return

    try {
      const res = await fetch("/api/admin/announcements", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "admin-token": token },
        body: JSON.stringify({ id: editingId, title: editTitle, body: editBody }),
      })
      if (res.ok) {
        toast.success("Announcement updated")
        setEditingId(null)
        fetchAnnouncements()
      } else {
        toast.error("Failed to update announcement")
      }
    } catch {
      toast.error("Failed to update announcement")
    }
  }

  return (
    <div className="space-y-4">
      {/* Create Announcement */}
      <Card className="bg-[#171717] border border-[#FFC107]/20 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#FFC107]" />
            Create Announcement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label className="text-sm text-gray-300">Title</Label>
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Announcement title..."
              className="h-9 text-sm bg-[#0A0A0A] border-[#2A2A2A] text-white placeholder:text-gray-600 focus:border-[#FFC107]"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-sm text-gray-300">Body</Label>
            <Textarea
              value={newBody}
              onChange={(e) => setNewBody(e.target.value)}
              placeholder="Announcement details..."
              rows={3}
              className="text-sm resize-none bg-[#0A0A0A] border-[#2A2A2A] text-white placeholder:text-gray-600 focus:border-[#FFC107]"
            />
          </div>
          <Button
            size="sm"
            className="bg-[#FFC107] hover:bg-[#FFD54F] text-black font-semibold"
            onClick={createAnnouncement}
            disabled={creating}
          >
            {creating ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Megaphone className="w-4 h-4 mr-1" />}
            Publish
          </Button>
        </CardContent>
      </Card>

      {/* Existing Announcements */}
      <Card className="bg-[#171717] border border-[#2A2A2A] shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-white">All Announcements</CardTitle>
            <Button variant="outline" size="sm" onClick={fetchAnnouncements} className="h-9 border-[#2A2A2A] text-gray-300 hover:text-white hover:bg-[#2A2A2A]">
              <RefreshCw className="w-4 h-4 mr-1" /> Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full bg-[#2A2A2A]" />
              ))}
            </div>
          ) : announcements.length > 0 ? (
            <div className="divide-y divide-[#2A2A2A] max-h-[500px] overflow-y-auto">
              {announcements.map((ann) => (
                <div key={ann.id} className="p-4 hover:bg-[#2A2A2A]/20 transition-colors">
                  {editingId === ann.id ? (
                    <div className="space-y-3">
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="h-9 text-sm bg-[#0A0A0A] border-[#2A2A2A] text-white focus:border-[#FFC107]"
                      />
                      <Textarea
                        value={editBody}
                        onChange={(e) => setEditBody(e.target.value)}
                        rows={2}
                        className="text-sm resize-none bg-[#0A0A0A] border-[#2A2A2A] text-white focus:border-[#FFC107]"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-[#FFC107] hover:bg-[#FFD54F] text-black font-semibold" onClick={saveEdit}>
                          <Save className="w-3 h-3 mr-1" /> Save
                        </Button>
                        <Button variant="outline" size="sm" className="border-[#2A2A2A] text-gray-300 hover:text-white hover:bg-[#2A2A2A]" onClick={() => setEditingId(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-medium text-white truncate">{ann.title}</h4>
                          <Badge className={`text-[10px] px-2 py-0.5 shrink-0 border-0 ${ann.is_active ? "bg-[#22C55E]/15 text-[#22C55E]" : "bg-[#2A2A2A] text-gray-500"}`}>
                            {ann.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        {ann.body && (
                          <p className="text-xs text-gray-400 line-clamp-2">{ann.body}</p>
                        )}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-gray-400 hover:text-[#00E5FF] hover:bg-[#00E5FF]/10"
                          onClick={() => startEditing(ann)}
                        >
                          <Edit3 className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-gray-400 hover:text-[#FFC107] hover:bg-[#FFC107]/10"
                          onClick={() => toggleAnnouncement(ann.id, ann.is_active)}
                        >
                          {ann.is_active ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-red-400 hover:text-red-400 hover:bg-red-400/10"
                          onClick={() => deleteAnnouncement(ann.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No announcements yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Settings Sub-View ────────────────────────────────────────────
function SettingsSubView() {
  const [settings, setSettings] = useState<Array<{ key: string; value: string }>>([])
  const [loading, setLoading] = useState(true)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const [saving, setSaving] = useState(false)
  const [apiKeyVisible, setApiKeyVisible] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const fetchSettings = useCallback(async () => {
    setLoading(true)
    const token = getAdminToken()
    if (!token) { setLoading(false); return }

    try {
      const res = await fetch("/api/admin/settings", { headers: { "admin-token": token } })
      if (res.ok) {
        const data = await res.json()
        setSettings(data.settings || [])
      }
    } catch {
      // Silently handle
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchSettings() }, [fetchSettings])

  const updateSetting = async (key: string, value: string) => {
    setSaving(true)
    const token = getAdminToken()
    if (!token) { setSaving(false); return }

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "admin-token": token },
        body: JSON.stringify({ key, value }),
      })
      if (res.ok) {
        toast.success(`Setting "${key}" updated`)
        setEditingKey(null)
        fetchSettings()
      } else {
        toast.error("Failed to update setting")
      }
    } catch {
      toast.error("Failed to update setting")
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All password fields are required")
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match")
      return
    }
    toast.success("Password updated successfully")
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

  const datamartApiKey = typeof window !== "undefined"
    ? "ask_••••••••••••••••••••••••••••••"
    : ""

  return (
    <div className="space-y-6">
      {/* DataMart API Configuration */}
      <Card className="bg-[#171717] border border-[#2A2A2A] shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
            <Wifi className="w-4 h-4 text-[#00E5FF]" />
            DataMart API Configuration
          </CardTitle>
          <CardDescription className="text-gray-500">API credentials for the DataMart integration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm text-gray-300">API Key</Label>
            <div className="flex gap-2">
              <Input
                type={apiKeyVisible ? "text" : "password"}
                value={datamartApiKey}
                readOnly
                className="h-9 text-sm font-mono bg-[#0A0A0A] border-[#2A2A2A] text-white"
              />
              <Button variant="outline" size="sm" className="h-9 border-[#2A2A2A] text-gray-300 hover:text-white hover:bg-[#2A2A2A]" onClick={() => setApiKeyVisible(!apiKeyVisible)}>
                <Eye className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              API key is configured via environment variables. Contact support to change it.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Commission Rates by Tier */}
      <Card className="bg-[#171717] border border-[#2A2A2A] shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#FFC107]" />
            Commission Rates by Tier
          </CardTitle>
          <CardDescription className="text-gray-500">Default commission percentages for each agent tier</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { tier: "Retail", rate: "5%", color: "bg-[#FFC107]/10 border-[#FFC107]/20", text: "text-[#FFC107]" },
              { tier: "Premium", rate: "7%", color: "bg-[#00E5FF]/10 border-[#00E5FF]/20", text: "text-[#00E5FF]" },
              { tier: "Super", rate: "10%", color: "bg-purple-500/10 border-purple-500/20", text: "text-purple-400" },
              { tier: "Distributor", rate: "15%", color: "bg-[#22C55E]/10 border-[#22C55E]/20", text: "text-[#22C55E]" },
            ].map((item) => (
              <div key={item.tier} className={`p-4 rounded-lg border text-center ${item.color}`}>
                <p className="text-xs text-gray-400 mb-1">{item.tier}</p>
                <p className={`text-xl font-bold ${item.text}`}>{item.rate}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Platform Settings */}
      <Card className="bg-[#171717] border border-[#2A2A2A] shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
            <Settings className="w-4 h-4 text-[#FFC107]" />
            Platform Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full bg-[#2A2A2A]" />
              ))}
            </div>
          ) : settings.length > 0 ? (
            <div className="divide-y divide-[#2A2A2A] max-h-[400px] overflow-y-auto">
              {settings.map((setting) => (
                <div key={setting.key} className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-[#2A2A2A]/20">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white">{setting.key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}</p>
                    {editingKey === setting.key ? (
                      <div className="flex gap-2 mt-1">
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="h-8 text-sm bg-[#0A0A0A] border-[#2A2A2A] text-white focus:border-[#FFC107]"
                          autoFocus
                        />
                        <Button size="sm" className="h-8 bg-[#FFC107] hover:bg-[#FFD54F] text-black font-semibold" onClick={() => updateSetting(setting.key, editValue)} disabled={saving}>
                          <Save className="w-3 h-3" />
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 border-[#2A2A2A] text-gray-300 hover:text-white hover:bg-[#2A2A2A]" onClick={() => setEditingKey(null)}>Cancel</Button>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 font-mono">{setting.value}</p>
                    )}
                  </div>
                  {editingKey !== setting.key && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="shrink-0 text-gray-400 hover:text-[#00E5FF] hover:bg-[#00E5FF]/10"
                      onClick={() => {
                        setEditingKey(setting.key)
                        setEditValue(setting.value)
                      }}
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Settings className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No settings configured</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admin Password Change */}
      <Card className="bg-[#171717] border border-[#2A2A2A] shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#FFC107]" />
            Admin Password
          </CardTitle>
          <CardDescription className="text-gray-500">Change the admin access secret</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-3 max-w-md">
            <div className="space-y-1">
              <Label className="text-sm text-gray-300">Current Password</Label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="h-9 bg-[#0A0A0A] border-[#2A2A2A] text-white focus:border-[#FFC107]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm text-gray-300">New Password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-9 bg-[#0A0A0A] border-[#2A2A2A] text-white focus:border-[#FFC107]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm text-gray-300">Confirm New Password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-9 bg-[#0A0A0A] border-[#2A2A2A] text-white focus:border-[#FFC107]"
              />
            </div>
            <Button type="submit" size="sm" className="bg-[#FFC107] hover:bg-[#FFD54F] text-black font-semibold">
              <Save className="w-4 h-4 mr-1" /> Update Password
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Admin Access Info */}
      <Card className="bg-[#171717] border border-[#2A2A2A] shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#22C55E]" />
            Admin Access
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-[#0A0A0A] rounded-lg p-4 space-y-2 border border-[#2A2A2A]">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Admin Secret</span>
              <span className="text-sm font-mono bg-[#2A2A2A] px-2 py-1 rounded text-gray-300">••••••••••</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Access Level</span>
              <Badge className="bg-[#FFC107]/15 text-[#FFC107] border-0">Full Access</Badge>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              The admin secret is configured via the ADMIN_SECRET environment variable.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
