"use client"

import React, { useEffect, useState, useCallback } from "react"
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Wallet,
  TrendingUp,
  Users,
  Code,
  Palette,
  User,
  LogOut,
  Menu,
  X,
  Wifi,
  Smartphone,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  Loader2,
  CreditCard,
  Shield,
  Zap,
  BadgeCheck,
  ArrowRight,
  Copy,
  RefreshCw,
  DollarSign,
  Clock,
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Crown,
  Rocket,
  Phone,
  Mail,
  Upload,
  Award,
  ExternalLink,
  Sparkles,
} from "lucide-react"
import { useAppStore, type AgentSubView } from "@/store/useAppStore"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
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
import { toast } from "sonner"

// ─── Types ────────────────────────────────────────────────────────

interface BundleItem {
  id: string
  capacity: number
  displayName: string
  price: number
  sellingPrice?: number
  perGB?: number
  network: string
}

type NetworkKey = "YELLO" | "TELECEL" | "AT_PREMIUM"

// ─── Constants ────────────────────────────────────────────────────

const NETWORKS: {
  key: NetworkKey
  name: string
  code: string
  color: string
  badgeClass: string
  iconBg: string
}[] = [
  { key: "YELLO", name: "MTN", code: "YELLO", color: "#FFC107", badgeClass: "badge-mtn", iconBg: "bg-[#FFC107]/20" },
  { key: "TELECEL", name: "Telecel", code: "TELECEL", color: "#FF4444", badgeClass: "badge-telecel", iconBg: "bg-[#FF4444]/20" },
  { key: "AT_PREMIUM", name: "AirtelTigo", code: "AT_PREMIUM", color: "#4499FF", badgeClass: "badge-airteltigo", iconBg: "bg-[#4499FF]/20" },
]

const PREFIX_MAP: Record<string, NetworkKey> = {
  "024": "YELLO", "054": "YELLO", "059": "YELLO", "053": "YELLO", "025": "YELLO",
  "020": "TELECEL", "050": "TELECEL",
  "027": "AT_PREMIUM", "057": "AT_PREMIUM", "026": "AT_PREMIUM", "056": "AT_PREMIUM",
}

const FALLBACK_BUNDLES: Record<NetworkKey, BundleItem[]> = {
  YELLO: [
    { id: "mtn-1", capacity: 1, displayName: "1 GB", price: 4.75, perGB: 4.75, network: "YELLO" },
    { id: "mtn-2", capacity: 2, displayName: "2 GB", price: 9.0, perGB: 4.5, network: "YELLO" },
    { id: "mtn-3", capacity: 5, displayName: "5 GB", price: 20.9, perGB: 4.18, network: "YELLO" },
    { id: "mtn-4", capacity: 10, displayName: "10 GB", price: 38.0, perGB: 3.8, network: "YELLO" },
    { id: "mtn-5", capacity: 20, displayName: "20 GB", price: 71.25, perGB: 3.56, network: "YELLO" },
    { id: "mtn-6", capacity: 50, displayName: "50 GB", price: 171.0, perGB: 3.42, network: "YELLO" },
  ],
  TELECEL: [
    { id: "telecel-1", capacity: 1, displayName: "1 GB", price: 4.28, perGB: 4.28, network: "TELECEL" },
    { id: "telecel-2", capacity: 2, displayName: "2 GB", price: 8.08, perGB: 4.04, network: "TELECEL" },
    { id: "telecel-3", capacity: 5, displayName: "5 GB", price: 19.0, perGB: 3.8, network: "TELECEL" },
    { id: "telecel-4", capacity: 10, displayName: "10 GB", price: 36.1, perGB: 3.61, network: "TELECEL" },
    { id: "telecel-5", capacity: 20, displayName: "20 GB", price: 66.5, perGB: 3.33, network: "TELECEL" },
    { id: "telecel-6", capacity: 50, displayName: "50 GB", price: 156.75, perGB: 3.14, network: "TELECEL" },
  ],
  AT_PREMIUM: [
    { id: "at-1", capacity: 1, displayName: "1 GB", price: 3.8, perGB: 3.8, network: "AT_PREMIUM" },
    { id: "at-2", capacity: 2, displayName: "2 GB", price: 7.13, perGB: 3.56, network: "AT_PREMIUM" },
    { id: "at-3", capacity: 5, displayName: "5 GB", price: 17.1, perGB: 3.42, network: "AT_PREMIUM" },
    { id: "at-4", capacity: 10, displayName: "10 GB", price: 32.3, perGB: 3.23, network: "AT_PREMIUM" },
    { id: "at-5", capacity: 20, displayName: "20 GB", price: 61.75, perGB: 3.09, network: "AT_PREMIUM" },
    { id: "at-6", capacity: 50, displayName: "50 GB", price: 147.25, perGB: 2.95, network: "AT_PREMIUM" },
  ],
}

const TIER_INFO: Record<string, { name: string; commission: number; icon: typeof Zap; color: string }> = {
  retail: { name: "Retail Agent", commission: 5, icon: Zap, color: "text-[#22C55E]" },
  premium: { name: "Premium Agent", commission: 8, icon: Star, color: "text-[#FFC107]" },
  super: { name: "Super Agent", commission: 12, icon: Crown, color: "text-[#00E5FF]" },
  distributor: { name: "Distributor", commission: 15, icon: Rocket, color: "text-[#FFC107]" },
}

const agentMenuItems: { view: AgentSubView; label: string; icon: typeof LayoutDashboard }[] = [
  { view: "overview", label: "Overview", icon: LayoutDashboard },
  { view: "place-order", label: "Place Order", icon: ShoppingCart },
  { view: "orders", label: "My Orders", icon: Package },
  { view: "wallet", label: "Wallet", icon: Wallet },
  { view: "commissions", label: "Commissions", icon: TrendingUp },
  { view: "api-access", label: "API Access", icon: Code },
  { view: "profile", label: "Profile", icon: User },
]

// ─── Main Component ───────────────────────────────────────────────

export default function AgentPortal() {
  const { agentSubView, setAgentSubView, user, navigate, logout } = useAppStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (user && user.role !== "agent") {
      navigate("agent-register")
    }
    if (!user) {
      navigate("auth")
    }
  }, [user, navigate])

  if (!user || user.role !== "agent") {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#FFC107]" />
      </div>
    )
  }

  const tierInfo = TIER_INFO[user.agentProfile?.tier || "retail"]
  const TierIcon = tierInfo?.icon || Zap

  return (
    <div className="min-h-screen flex bg-[#0A0A0A]">
      {/* ─── Sidebar Overlay (mobile) ─────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ─── Sidebar ──────────────────────────────────────────── */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#111111] text-white transform transition-transform duration-200 border-r border-[#2A2A2A] ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-5 border-b border-[#2A2A2A]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#FFC107]/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[#FFC107]" />
                </div>
                <h2 className="font-bold text-lg text-white">Agent Portal</h2>
              </div>
              <button className="md:hidden text-[#9CA3AF] hover:text-white" onClick={() => setSidebarOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Agent Info */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FFC107]/20 flex items-center justify-center text-sm font-bold text-[#FFC107]">
                {user.fullName?.charAt(0)?.toUpperCase() || "A"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate">{user.fullName || "Agent"}</p>
                <p className="text-xs text-[#9CA3AF] truncate">{user.email}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <TierIcon className={`w-4 h-4 ${tierInfo?.color || "text-[#9CA3AF]"}`} />
              <Badge className="bg-[#FFC107]/10 text-[#FFC107] border-[#FFC107]/20 hover:bg-[#FFC107]/20 text-xs" variant="secondary">
                {tierInfo?.name || "Agent"}
              </Badge>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {agentMenuItems.map((item) => {
              const isActive = agentSubView === item.view
              const Icon = item.icon
              return (
                <button
                  key={item.view}
                  onClick={() => {
                    setAgentSubView(item.view)
                    setSidebarOpen(false)
                  }}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-[#FFC107]/10 text-[#FFC107] border-l-2 border-[#FFC107]"
                      : "text-[#9CA3AF] hover:bg-[#1F1F1F] hover:text-white"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-[#FFC107]" : ""}`} />
                  {item.label}
                </button>
              )
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-[#2A2A2A]">
            <button
              onClick={() => {
                logout()
                navigate("home")
              }}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-[#9CA3AF] hover:bg-[#1F1F1F] hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* ─── Main Area ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-[#111111] border-b border-[#2A2A2A] px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button className="md:hidden text-[#9CA3AF] hover:text-white" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-white capitalize">
              {agentSubView.replace(/-/g, " ")}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-[#22C55E]/10 text-[#22C55E] px-3 py-1.5 rounded-lg border border-[#22C55E]/20">
              <Wallet className="w-4 h-4" />
              <span className="text-sm font-bold">GHS {user.balance.toFixed(2)}</span>
            </div>
            {tierInfo && (
              <Badge className={`${tierInfo.color} bg-[#171717] border border-[#2A2A2] hover:bg-[#1F1F1F]`} variant="secondary">
                {tierInfo.name}
              </Badge>
            )}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#FFC107]/20 flex items-center justify-center text-sm font-bold text-[#FFC107]">
                {user.fullName?.charAt(0)?.toUpperCase() || "A"}
              </div>
              <span className="hidden sm:block text-sm font-medium text-white truncate max-w-[120px]">
                {user.fullName || "Agent"}
              </span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto custom-scrollbar">
          <AgentSubViewRenderer />
        </main>
      </div>
    </div>
  )
}

// ─── Sub-View Router ──────────────────────────────────────────────

function AgentSubViewRenderer() {
  const agentSubView = useAppStore((s) => s.agentSubView)

  switch (agentSubView) {
    case "overview":
      return <OverviewSubView />
    case "place-order":
      return <PlaceOrderSubView />
    case "orders":
      return <OrdersSubView />
    case "wallet":
      return <WalletSubView />
    case "commissions":
      return <CommissionsSubView />
    case "referrals":
      return <ReferralsSubView />
    case "api-access":
      return <ApiAccessSubView />
    case "white-label":
      return <WhiteLabelSubView />
    case "profile":
      return <ProfileSubView />
    default:
      return <OverviewSubView />
  }
}

// ─── Overview Sub-View ────────────────────────────────────────────

function OverviewSubView() {
  const user = useAppStore((s) => s.user)
  const setAgentSubView = useAppStore((s) => s.setAgentSubView)
  const [stats, setStats] = useState({ totalSales: 0, commissions: 0, ordersToday: 0, referrals: 0 })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch(`/api/data-orders?userId=${user?.id}`)
        if (res.ok) {
          const data = await res.json()
          const orders = Array.isArray(data) ? data : data.orders || []
          const today = new Date().toISOString().split("T")[0]
          const todayOrders = orders.filter((o: any) => o.createdAt?.startsWith(today))
          const totalSales = orders.reduce((sum: number, o: any) => sum + (o.price || 0), 0)
          const totalCommissions = orders.reduce((sum: number, o: any) => sum + (o.agentCommission || 0), 0)
          setStats({
            totalSales,
            commissions: totalCommissions,
            ordersToday: todayOrders.length,
            referrals: 0,
          })
          setRecentOrders(orders.slice(0, 5))
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false)
      }
    }
    if (user?.id) fetchDashboard()
  }, [user?.id])

  const metricCards = [
    { label: "Total Orders", value: stats.ordersToday.toString(), icon: Package, color: "text-[#FFC107]", bg: "bg-[#FFC107]/10", border: "border-[#FFC107]/20" },
    { label: "Wallet Balance", value: `GHS ${user?.balance.toFixed(2) || "0.00"}`, icon: Wallet, color: "text-[#22C55E]", bg: "bg-[#22C55E]/10", border: "border-[#22C55E]/20" },
    { label: "Total Commissions", value: `GHS ${stats.commissions.toFixed(2)}`, icon: TrendingUp, color: "text-[#00E5FF]", bg: "bg-[#00E5FF]/10", border: "border-[#00E5FF]/20" },
    { label: "Active Referrals", value: stats.referrals.toString(), icon: Users, color: "text-[#FFC107]", bg: "bg-[#FFC107]/10", border: "border-[#FFC107]/20" },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Welcome back, {user?.fullName || "Agent"}!</h2>
          <p className="text-[#9CA3AF]">Here&apos;s your agent dashboard overview.</p>
        </div>
        <Button
          className="btn-primary-yellow font-bold"
          onClick={() => setAgentSubView("place-order")}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Place New Order
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((m) => {
          const Icon = m.icon
          return (
            <div key={m.label} className={`glass-card rounded-xl p-5 border ${m.border}`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg ${m.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${m.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{loading ? <Skeleton className="h-7 w-20 bg-[#1F1F1F]" /> : m.value}</p>
              <p className="text-xs text-[#9CA3AF] mt-1">{m.label}</p>
            </div>
          )
        })}
      </div>

      {/* Wallet & Commission Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card rounded-xl p-5 border border-[#22C55E]/20">
          <div className="flex items-center gap-2 mb-3">
            <Wallet className="w-4 h-4 text-[#22C55E]" />
            <span className="font-semibold text-white text-sm">Wallet Balance</span>
          </div>
          <p className="text-3xl font-bold text-[#22C55E]">GHS {user?.balance.toFixed(2) || "0.00"}</p>
          <div className="flex gap-2 mt-3">
            <Button size="sm" variant="outline" className="border-[#2A2A2A] text-[#9CA3AF] hover:text-white hover:bg-[#1F1F1F]" onClick={() => setAgentSubView("wallet")}>
              Top Up
            </Button>
            <Button size="sm" variant="outline" className="border-[#2A2A2A] text-[#9CA3AF] hover:text-white hover:bg-[#1F1F1F]" onClick={() => setAgentSubView("wallet")}>
              View Transactions
            </Button>
          </div>
        </div>

        <div className="glass-card rounded-xl p-5 border border-[#FFC107]/20">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-[#FFC107]" />
            <span className="font-semibold text-white text-sm">Commission Summary</span>
          </div>
          <p className="text-3xl font-bold text-[#FFC107]">GHS {stats.commissions.toFixed(2)}</p>
          <p className="text-sm text-[#9CA3AF] mt-1">
            Commission rate: <span className="font-medium text-[#FFC107]">{user?.agentProfile?.commissionRate || 5}%</span>
          </p>
          <Button size="sm" variant="outline" className="mt-3 border-[#2A2A2A] text-[#9CA3AF] hover:text-white hover:bg-[#1F1F1F]" onClick={() => setAgentSubView("commissions")}>
            View Details
          </Button>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="glass-card rounded-xl border border-[#2A2A2A]">
        <div className="flex items-center justify-between p-5 pb-3">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-[#00E5FF]" />
            <span className="font-semibold text-white text-sm">Recent Orders</span>
          </div>
          <Button size="sm" variant="ghost" className="text-[#9CA3AF] hover:text-white" onClick={() => setAgentSubView("orders")}>
            View All <ChevronRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
        <div className="px-5 pb-5">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full bg-[#1F1F1F]" />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-8 text-[#9CA3AF]">
              <Package className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p>No orders yet. Start selling!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#2A2A2A] hover:bg-transparent">
                    <TableHead className="text-[#9CA3AF]">Phone</TableHead>
                    <TableHead className="text-[#9CA3AF]">Network</TableHead>
                    <TableHead className="text-[#9CA3AF]">Amount</TableHead>
                    <TableHead className="text-[#9CA3AF]">Status</TableHead>
                    <TableHead className="text-[#9CA3AF]">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id} className="border-[#2A2A2A] hover:bg-[#1F1F1F]">
                      <TableCell className="font-mono text-sm text-white">{order.phoneNumber}</TableCell>
                      <TableCell className="text-[#9CA3AF]">{order.network}</TableCell>
                      <TableCell className="font-medium text-[#FFC107]">GHS {(order.price || 0).toFixed(2)}</TableCell>
                      <TableCell>
                        <OrderStatusBadge status={order.status} />
                      </TableCell>
                      <TableCell className="text-xs text-[#9CA3AF]">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Place Order Sub-View ─────────────────────────────────────────

function PlaceOrderSubView() {
  const user = useAppStore((s) => s.user)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkKey | null>(null)
  const [selectedBundle, setSelectedBundle] = useState<BundleItem | null>(null)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState<{ reference: string; orderId: string } | null>(null)
  const [bundles, setBundles] = useState<BundleItem[]>([])
  const [loadingBundles, setLoadingBundles] = useState(false)

  const fetchBundles = useCallback(async (network: NetworkKey) => {
    setLoadingBundles(true)
    try {
      const res = await fetch(`/api/datamart/products?network=${network}`)
      if (res.ok) {
        const data = await res.json()
        let items: BundleItem[] = []
        if (data.byNetwork && data.byNetwork[network]) {
          const netData = data.byNetwork[network]
          const storeProducts: BundleItem[] = (netData.storeProducts || []).map((p: any) => ({
            id: p.id,
            capacity: p.capacity || p.mb / 1024,
            displayName: p.displayName || `${p.capacity || Math.round(p.mb / 1024)} GB`,
            price: p.sellingPrice || p.basePrice,
            sellingPrice: p.sellingPrice,
            perGB: p.sellingPrice
              ? Number((p.sellingPrice / (p.capacity || p.mb / 1024)).toFixed(2))
              : undefined,
            network: p.network,
          }))
          const dataPackages: BundleItem[] = (netData.dataPackages || []).map((p: any) => ({
            id: p.id,
            capacity: p.capacity || p.mb / 1024,
            displayName: p.name || `${p.capacity || Math.round(p.mb / 1024)} GB`,
            price: p.sellingPrice || p.price,
            sellingPrice: p.sellingPrice,
            perGB: (p.sellingPrice || p.price)
              ? Number(((p.sellingPrice || p.price) / (p.capacity || p.mb / 1024)).toFixed(2))
              : undefined,
            network: p.network,
          }))
          items = [...storeProducts, ...dataPackages]
        }
        if (items.length > 0) {
          items.sort((a, b) => a.capacity - b.capacity)
          setBundles(items)
        } else {
          setBundles(FALLBACK_BUNDLES[network])
        }
      } else {
        setBundles(FALLBACK_BUNDLES[network])
      }
    } catch {
      setBundles(FALLBACK_BUNDLES[network])
    } finally {
      setLoadingBundles(false)
    }
  }, [])

  useEffect(() => {
    if (selectedNetwork) {
      setSelectedBundle(null)
      fetchBundles(selectedNetwork)
    }
  }, [selectedNetwork, fetchBundles])

  const detectedNetwork = phoneNumber.length >= 3 ? PREFIX_MAP[phoneNumber.substring(0, 3)] : null
  const networkMismatch = detectedNetwork && selectedNetwork && detectedNetwork !== selectedNetwork
  const isPhoneValid = /^0\d{9}$/.test(phoneNumber)
  const commissionRate = user?.agentProfile?.commissionRate || 5

  const handlePlaceOrder = async () => {
    if (!selectedNetwork || !selectedBundle || !isPhoneValid || !user) return
    setIsProcessing(true)
    try {
      const commissionAmount = selectedBundle.price * (commissionRate / 100)
      const res = await fetch("/api/datamart/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          phoneNumber,
          network: NETWORKS.find((n) => n.key === selectedNetwork)?.name || selectedNetwork,
          capacity: selectedBundle.capacity,
          price: selectedBundle.price,
          costPrice: selectedBundle.sellingPrice || selectedBundle.price,
          paymentMethod: "wallet",
          customerPhone: customerPhone || undefined,
          agentId: user.agentProfile?.tier || "retail",
          agentCommission: commissionAmount,
        }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setOrderSuccess({
          reference: data.datamartReference || data.order?.reference || data.order?.id || "",
          orderId: data.order?.id || "",
        })
        toast.success("Order placed successfully!")
      } else {
        toast.error(data.error || "Failed to place order.")
      }
    } catch {
      toast.error("Network error. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  if (orderSuccess) {
    return (
      <div className="max-w-md mx-auto animate-fade-in">
        <div className="glass-card-cyan rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-[#22C55E]/20 rounded-full flex items-center justify-center mx-auto mb-4 success-animation">
            <CheckCircle2 className="w-8 h-8 text-[#22C55E]" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Order Placed Successfully!</h2>
          <div className="bg-[#0A0A0A] rounded-xl p-4 mb-6 border border-[#2A2A2A]">
            <p className="text-xs text-[#9CA3AF] mb-1">Order Reference</p>
            <p className="text-lg font-mono font-bold text-[#00E5FF]">{orderSuccess.reference || orderSuccess.orderId}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 border-[#2A2A2A] text-[#9CA3AF] hover:text-white hover:bg-[#1F1F1F]" onClick={() => useAppStore.getState().setAgentSubView("orders")}>
              View Orders
            </Button>
            <Button className="flex-1 btn-primary-green text-white font-bold" onClick={() => { setStep(1); setSelectedNetwork(null); setSelectedBundle(null); setPhoneNumber(""); setCustomerPhone(""); setOrderSuccess(null) }}>
              New Order
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const steps = [
    { num: 1, label: "Network" },
    { num: 2, label: "Bundle" },
    { num: 3, label: "Phone" },
    { num: 4, label: "Review" },
  ]

  const canGoNext = () => {
    switch (step) {
      case 1: return !!selectedNetwork
      case 2: return !!selectedBundle
      case 3: return isPhoneValid && !networkMismatch
      case 4: return true
      default: return false
    }
  }

  const networkName = selectedNetwork ? NETWORKS.find((n) => n.key === selectedNetwork)?.name || selectedNetwork : ""

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white">Place Agent Order</h2>
        <p className="text-[#9CA3AF] text-sm">Agent pricing — {commissionRate}% commission on every sale</p>
      </div>

      {/* Step Progress */}
      <div className="flex items-center justify-between px-2">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step > s.num ? "bg-[#22C55E] text-white" : step === s.num ? "bg-[#FFC107] text-[#0A0A0A] ring-4 ring-[#FFC107]/20" : "bg-[#1F1F1F] text-[#9CA3AF]"
              }`}>
                {step > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
              </div>
              <span className={`text-xs mt-1 font-medium ${step >= s.num ? "text-[#FFC107]" : "text-[#9CA3AF]"}`}>{s.label}</span>
            </div>
            {i < steps.length - 1 && <div className={`w-8 sm:w-16 h-0.5 mx-1 mb-5 ${step > s.num ? "bg-[#22C55E]" : "bg-[#2A2A2A]"}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Network */}
      {step === 1 && (
        <div className="glass-card rounded-xl p-5 border border-[#2A2A2A]">
          <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
            <Wifi className="w-5 h-5 text-[#FFC107]" />Select Network
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {NETWORKS.map((net) => (
              <button key={net.key} onClick={() => setSelectedNetwork(net.key)}
                className={`relative rounded-xl border-2 p-5 transition-all hover:shadow-lg text-center ${
                  selectedNetwork === net.key ? `border-[#FFC107] bg-[#171717] shadow-lg shadow-[#FFC107]/10` : "border-[#2A2A2A] bg-[#171717] hover:border-[#4B5563]"
                }`}>
                {selectedNetwork === net.key && <div className="absolute top-2 right-2"><BadgeCheck className="w-5 h-5 text-[#FFC107]" /></div>}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${net.iconBg}`}>
                  <Wifi className="w-6 h-6" style={{ color: net.color }} />
                </div>
                <p className="font-bold text-white">{net.name}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Bundle */}
      {step === 2 && (
        <div className="glass-card rounded-xl p-5 border border-[#2A2A2A]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-[#FFC107]" />Select Bundle
            </h3>
            <Badge className={`${NETWORKS.find((n) => n.key === selectedNetwork)?.badgeClass} text-xs`}>{networkName}</Badge>
          </div>
          {loadingBundles ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[#FFC107]" /><span className="ml-2 text-[#9CA3AF]">Loading...</span></div>
          ) : bundles.length === 0 ? (
            <div className="text-center py-12 text-[#9CA3AF]"><p>No bundles available.</p></div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {bundles.map((bundle) => (
                <button key={bundle.id} onClick={() => setSelectedBundle(bundle)}
                  className={`relative rounded-xl border-2 p-4 transition-all hover:shadow-lg text-left ${
                    selectedBundle?.id === bundle.id ? "border-[#FFC107] bg-[#171717] shadow-lg shadow-[#FFC107]/10" : "border-[#2A2A2A] bg-[#171717] hover:border-[#4B5563]"
                  }`}>
                  {selectedBundle?.id === bundle.id && <div className="absolute top-1.5 right-1.5"><BadgeCheck className="w-4 h-4 text-[#FFC107]" /></div>}
                  <p className="text-lg font-bold text-white">{bundle.displayName}</p>
                  <p className="text-xl font-bold text-[#22C55E] mt-1">GHS {bundle.price.toFixed(2)}</p>
                  {bundle.perGB && <p className="text-xs text-[#9CA3AF]">GHS {bundle.perGB.toFixed(2)}/GB</p>}
                  <div className="mt-1 text-xs text-[#FFC107] font-medium">
                    + GHS {(bundle.price * commissionRate / 100).toFixed(2)} commission
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Phone */}
      {step === 3 && (
        <div className="glass-card rounded-xl p-5 border border-[#2A2A2A]">
          <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
            <Smartphone className="w-5 h-5 text-[#FFC107]" />Enter Phone Number
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[#9CA3AF]">Recipient Phone Number *</Label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4B5563]" />
                <Input placeholder="0241234567" className="pl-10 text-lg font-mono bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder:text-[#4B5563] focus:border-[#FFC107] focus:ring-[#FFC107]/20" value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))} maxLength={10} />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[#9CA3AF]">Customer Phone (Optional)</Label>
              <Input placeholder="Customer's phone number" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder:text-[#4B5563] focus:border-[#FFC107] focus:ring-[#FFC107]/20" />
              <p className="text-xs text-[#4B5563]">If buying for someone else, enter their number</p>
            </div>
            {detectedNetwork && (
              <div className="flex items-center gap-2 p-3 bg-[#1A1A1A] rounded-lg border border-[#2A2A2A]">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${NETWORKS.find((n) => n.key === detectedNetwork)?.iconBg || "bg-[#1F1F1F]"}`}>
                  <Wifi className="w-3 h-3" style={{ color: NETWORKS.find((n) => n.key === detectedNetwork)?.color || "#9CA3AF" }} />
                </div>
                <span className="text-sm font-medium text-white">Detected: {NETWORKS.find((n) => n.key === detectedNetwork)?.name}</span>
              </div>
            )}
            {networkMismatch && (
              <div className="flex items-start gap-2 p-3 bg-[#FFC107]/10 border border-[#FFC107]/20 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-[#FFC107] mt-0.5 shrink-0" />
                <p className="text-xs text-[#FFC107]">Network mismatch detected. Please verify the number.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 4: Review */}
      {step === 4 && selectedBundle && (
        <div className="glass-card rounded-xl p-5 border border-[#2A2A2A]">
          <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />Review & Confirm
          </h3>
          <div className="space-y-5">
            <div className="bg-[#0A0A0A] rounded-xl p-4 space-y-3 border border-[#2A2A2A]">
              <p className="font-semibold text-sm text-white">Order Summary</p>
              <Separator className="bg-[#2A2A2A]" />
              <div className="space-y-2">
                <div className="flex justify-between text-sm"><span className="text-[#9CA3AF]">Network</span><div className="flex items-center gap-1.5"><div className={`w-4 h-4 rounded-full ${NETWORKS.find((n) => n.key === selectedNetwork)?.iconBg || "bg-[#1F1F1F]"}`} /><span className="font-medium text-white">{networkName}</span></div></div>
                <div className="flex justify-between text-sm"><span className="text-[#9CA3AF]">Data Bundle</span><span className="font-medium text-white">{selectedBundle.displayName}</span></div>
                <div className="flex justify-between text-sm"><span className="text-[#9CA3AF]">Phone Number</span><span className="font-mono font-medium text-white">{phoneNumber}</span></div>
                {customerPhone && <div className="flex justify-between text-sm"><span className="text-[#9CA3AF]">Customer Phone</span><span className="font-mono font-medium text-white">{customerPhone}</span></div>}
                <Separator className="bg-[#2A2A2A]" />
                <div className="flex justify-between text-sm"><span className="text-[#9CA3AF]">Price</span><span className="font-medium text-white">GHS {selectedBundle.price.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-[#9CA3AF]">Your Commission ({commissionRate}%)</span><span className="font-medium text-[#FFC107]">+ GHS {(selectedBundle.price * commissionRate / 100).toFixed(2)}</span></div>
                <div className="flex justify-between text-base font-bold"><span className="text-white">Total</span><span className="text-[#22C55E]">GHS {selectedBundle.price.toFixed(2)}</span></div>
              </div>
            </div>
            <Button className="w-full btn-primary-yellow font-bold py-5 text-base" size="lg" disabled={isProcessing} onClick={handlePlaceOrder}>
              {isProcessing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</> : <>Place Order — GHS {selectedBundle.price.toFixed(2)}<ChevronRight className="w-4 h-4 ml-1" /></>}
            </Button>
          </div>
        </div>
      )}

      {/* Navigation */}
      {step > 1 && !orderSuccess && (
        <div className="flex justify-between">
          <Button variant="outline" className="border-[#2A2A2A] text-[#9CA3AF] hover:text-white hover:bg-[#1F1F1F]" onClick={() => setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4)}>
            <ChevronLeft className="w-4 h-4 mr-1" />Back
          </Button>
          {step < 4 && (
            <Button className="btn-primary-yellow font-bold" disabled={!canGoNext()} onClick={() => setStep((prev) => (prev + 1) as 1 | 2 | 3 | 4)}>
              Continue<ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Orders Sub-View ──────────────────────────────────────────────

function OrdersSubView() {
  const user = useAppStore((s) => s.user)
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`/api/data-orders?userId=${user?.id}`)
        if (res.ok) {
          const data = await res.json()
          setOrders(Array.isArray(data) ? data : data.orders || [])
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false)
      }
    }
    if (user?.id) fetchOrders()
  }, [user?.id])

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">My Orders</h2>
        <Badge className="bg-[#FFC107]/10 text-[#FFC107] border border-[#FFC107]/20">{orders.length} orders</Badge>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full bg-[#1F1F1F]" />)}</div>
      ) : orders.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center border border-[#2A2A2A]">
          <Package className="w-12 h-12 mx-auto mb-3 text-[#9CA3AF]/40" />
          <h3 className="font-semibold text-white mb-1">No Orders Yet</h3>
          <p className="text-sm text-[#9CA3AF] mb-4">Start placing orders to see them here.</p>
          <Button className="btn-primary-yellow font-bold" onClick={() => useAppStore.getState().setAgentSubView("place-order")}>
            Place Your First Order
          </Button>
        </div>
      ) : (
        <div className="glass-card rounded-xl border border-[#2A2A2A] overflow-hidden">
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto custom-scrollbar">
            <Table>
              <TableHeader>
                <TableRow className="border-[#2A2A2A] hover:bg-transparent">
                  <TableHead className="text-[#9CA3AF]">Reference</TableHead>
                  <TableHead className="text-[#9CA3AF]">Phone</TableHead>
                  <TableHead className="text-[#9CA3AF]">Network</TableHead>
                  <TableHead className="text-[#9CA3AF]">Capacity</TableHead>
                  <TableHead className="text-[#9CA3AF]">Price</TableHead>
                  <TableHead className="text-[#9CA3AF]">Commission</TableHead>
                  <TableHead className="text-[#9CA3AF]">Status</TableHead>
                  <TableHead className="text-[#9CA3AF]">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id} className="border-[#2A2A2A] hover:bg-[#1F1F1F]">
                    <TableCell className="font-mono text-xs text-[#00E5FF]">{order.reference || order.id.slice(0, 8)}</TableCell>
                    <TableCell className="font-mono text-sm text-white">{order.phoneNumber}</TableCell>
                    <TableCell className="text-[#9CA3AF]">{order.network}</TableCell>
                    <TableCell className="text-white">{order.capacity} GB</TableCell>
                    <TableCell className="font-medium text-[#FFC107]">GHS {(order.price || 0).toFixed(2)}</TableCell>
                    <TableCell className="text-[#22C55E] font-medium">GHS {(order.agentCommission || 0).toFixed(2)}</TableCell>
                    <TableCell><OrderStatusBadge status={order.status} /></TableCell>
                    <TableCell className="text-xs text-[#9CA3AF]">{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Wallet Sub-View ──────────────────────────────────────────────

function WalletSubView() {
  const user = useAppStore((s) => s.user)
  const setUser = useAppStore((s) => s.setUser)
  const [balance, setBalance] = useState(user?.balance || 0)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [topUpAmount, setTopUpAmount] = useState("")
  const [topUpPhone, setTopUpPhone] = useState("")
  const [topUpNetwork, setTopUpNetwork] = useState("")
  const [isToppingUp, setIsToppingUp] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/data-orders?userId=${user?.id}`)
        if (res.ok) {
          const data = await res.json()
          const orders = Array.isArray(data) ? data : data.orders || []
          const txns = orders.map((o: any) => ({
            id: o.id,
            type: "debit",
            amount: o.price,
            category: "purchase",
            description: `${o.capacity}GB ${o.network} - ${o.phoneNumber}`,
            createdAt: o.createdAt,
          }))
          setTransactions(txns)
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false)
      }
    }
    if (user?.id) fetchData()
  }, [user?.id])

  const handleTopUp = async () => {
    if (!topUpAmount || Number(topUpAmount) <= 0) {
      toast.error("Please enter a valid amount")
      return
    }
    setIsToppingUp(true)
    try {
      const newBalance = balance + Number(topUpAmount)
      setBalance(newBalance)
      if (user) {
        setUser({ ...user, balance: newBalance })
      }
      setTransactions((prev) => [
        {
          id: `topup-${Date.now()}`,
          type: "credit",
          amount: Number(topUpAmount),
          category: "topup",
          description: `Wallet top-up via ${topUpNetwork || "MoMo"}`,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ])
      toast.success(`GHS ${Number(topUpAmount).toFixed(2)} added to your wallet!`)
      setTopUpAmount("")
      setTopUpPhone("")
      setTopUpNetwork("")
    } catch {
      toast.error("Top-up failed. Please try again.")
    } finally {
      setIsToppingUp(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Balance Display */}
      <div className="glass-card-cyan rounded-xl p-6 border border-[#22C55E]/30 animate-pulse-glow-cyan">
        <div className="flex items-center gap-3 mb-2">
          <Wallet className="w-5 h-5 text-[#22C55E]" />
          <span className="text-sm text-[#9CA3AF]">Wallet Balance</span>
        </div>
        <p className="text-4xl font-bold text-[#22C55E]">GHS {balance.toFixed(2)}</p>
        <p className="text-xs text-[#4B5563] mt-2">Available for data bundle purchases</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Up Form */}
        <div className="glass-card rounded-xl p-5 border border-[#2A2A2A]">
          <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
            <CreditCard className="w-4 h-4 text-[#FFC107]" />Top Up Wallet
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[#9CA3AF]">Amount (GHS)</Label>
              <Input type="number" placeholder="Enter amount" value={topUpAmount} onChange={(e) => setTopUpAmount(e.target.value)} min="1" className="bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder:text-[#4B5563] focus:border-[#FFC107] focus:ring-[#FFC107]/20" />
              <div className="flex gap-2">
                {[10, 25, 50, 100].map((amt) => (
                  <Button key={amt} variant="outline" size="sm" className="text-xs border-[#2A2A2A] text-[#9CA3AF] hover:text-[#FFC107] hover:border-[#FFC107]/50" onClick={() => setTopUpAmount(amt.toString())}>
                    GHS {amt}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[#9CA3AF]">MoMo Phone Number</Label>
              <Input placeholder="0XX XXX XXXX" value={topUpPhone} onChange={(e) => setTopUpPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} maxLength={10} className="bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder:text-[#4B5563] focus:border-[#FFC107] focus:ring-[#FFC107]/20" />
            </div>
            <div className="space-y-2">
              <Label className="text-[#9CA3AF]">MoMo Network</Label>
              <Select value={topUpNetwork} onValueChange={setTopUpNetwork}>
                <SelectTrigger className="bg-[#1A1A1A] border-[#2A2A2A] text-white"><SelectValue placeholder="Select network" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MTN">MTN MoMo</SelectItem>
                  <SelectItem value="TELECEL">Telecel Cash</SelectItem>
                  <SelectItem value="AIRTELTIGO">AirtelTigo Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full btn-primary-green text-white font-bold" disabled={isToppingUp || !topUpAmount} onClick={handleTopUp}>
              {isToppingUp ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</> : "Top Up Wallet"}
            </Button>
          </div>
        </div>

        {/* Transaction History */}
        <div className="glass-card rounded-xl p-5 border border-[#2A2A2A]">
          <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-[#00E5FF]" />Transaction History
          </h3>
          {loading ? (
            <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full bg-[#1F1F1F]" />)}</div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-[#9CA3AF] text-sm">No transactions yet</div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
              {transactions.map((txn) => (
                <div key={txn.id} className="flex items-center justify-between py-2 border-b border-[#2A2A2A] last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${txn.type === "credit" ? "bg-[#22C55E]/10" : "bg-[#EF4444]/10"}`}>
                      {txn.type === "credit" ? <ArrowDownRight className="w-4 h-4 text-[#22C55E]" /> : <ArrowUpRight className="w-4 h-4 text-[#EF4444]" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{txn.description}</p>
                      <p className="text-xs text-[#9CA3AF]">{new Date(txn.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`font-bold text-sm ${txn.type === "credit" ? "text-[#22C55E]" : "text-[#EF4444]"}`}>
                    {txn.type === "credit" ? "+" : "-"}GHS {txn.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Commissions Sub-View ─────────────────────────────────────────

function CommissionsSubView() {
  const user = useAppStore((s) => s.user)
  const [commissions, setCommissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCommissions, setTotalCommissions] = useState(0)

  useEffect(() => {
    const fetchCommissions = async () => {
      try {
        const res = await fetch(`/api/data-orders?userId=${user?.id}`)
        if (res.ok) {
          const data = await res.json()
          const orders = Array.isArray(data) ? data : data.orders || []
          const total = orders.reduce((sum: number, o: any) => sum + (o.agentCommission || 0), 0)
          setTotalCommissions(total)
          setCommissions(orders.filter((o: any) => o.agentCommission > 0))
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false)
      }
    }
    if (user?.id) fetchCommissions()
  }, [user?.id])

  const commissionRate = user?.agentProfile?.commissionRate || 5

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card-cyan rounded-xl p-5 border border-[#FFC107]/30 animate-pulse-glow-yellow">
          <p className="text-sm text-[#9CA3AF]">Total Commissions</p>
          <p className="text-3xl font-bold text-[#FFC107] mt-1">GHS {totalCommissions.toFixed(2)}</p>
        </div>
        <div className="glass-card rounded-xl p-5 border border-[#2A2A2A]">
          <p className="text-sm text-[#9CA3AF]">Commission Rate</p>
          <p className="text-3xl font-bold text-[#FFC107] mt-1">{commissionRate}%</p>
        </div>
        <div className="glass-card rounded-xl p-5 border border-[#2A2A2A]">
          <p className="text-sm text-[#9CA3AF]">Paid Commissions</p>
          <p className="text-3xl font-bold text-[#22C55E] mt-1">GHS 0.00</p>
        </div>
      </div>

      <div className="glass-card rounded-xl border border-[#2A2A2A]">
        <div className="flex items-center justify-between p-5 pb-3">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#FFC107]" />Commission History
          </h3>
          <Button size="sm" variant="outline" className="border-[#2A2A2A] text-[#9CA3AF] hover:text-white hover:bg-[#1F1F1F]" disabled={totalCommissions === 0}>Withdraw</Button>
        </div>
        <div className="px-5 pb-5">
          {loading ? (
            <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full bg-[#1F1F1F]" />)}</div>
          ) : commissions.length === 0 ? (
            <div className="text-center py-8 text-[#9CA3AF]">
              <TrendingUp className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p>No commissions earned yet</p>
              <p className="text-xs mt-1">Place orders to start earning commissions</p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto custom-scrollbar">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#2A2A2A] hover:bg-transparent">
                    <TableHead className="text-[#9CA3AF]">Order</TableHead>
                    <TableHead className="text-[#9CA3AF]">Amount</TableHead>
                    <TableHead className="text-[#9CA3AF]">Commission</TableHead>
                    <TableHead className="text-[#9CA3AF]">Status</TableHead>
                    <TableHead className="text-[#9CA3AF]">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commissions.map((c) => (
                    <TableRow key={c.id} className="border-[#2A2A2A] hover:bg-[#1F1F1F]">
                      <TableCell className="font-mono text-xs text-[#00E5FF]">{c.reference || c.id.slice(0, 8)}</TableCell>
                      <TableCell className="text-white">GHS {(c.price || 0).toFixed(2)}</TableCell>
                      <TableCell className="font-medium text-[#FFC107]">GHS {(c.agentCommission || 0).toFixed(2)}</TableCell>
                      <TableCell><Badge variant="secondary" className="text-xs bg-[#FFC107]/10 text-[#FFC107] border border-[#FFC107]/20">Pending</Badge></TableCell>
                      <TableCell className="text-xs text-[#9CA3AF]">{new Date(c.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Referrals Sub-View ───────────────────────────────────────────

function ReferralsSubView() {
  const user = useAppStore((s) => s.user)
  const [referralCode] = useState(`DM-${user?.id?.slice(0, 8).toUpperCase() || "AGENT"}`)
  const [copied, setCopied] = useState(false)
  const [referrals, setReferrals] = useState<any[]>([])
  const [email, setEmail] = useState("")
  const [isInviting, setIsInviting] = useState(false)

  const copyCode = () => {
    navigator.clipboard.writeText(referralCode)
    setCopied(true)
    toast.success("Referral code copied!")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleInvite = async () => {
    if (!email.trim()) return
    setIsInviting(true)
    setTimeout(() => {
      setReferrals((prev) => [
        ...prev,
        { id: `ref-${Date.now()}`, email, status: "pending", reward: 0, createdAt: new Date().toISOString() },
      ])
      toast.success(`Invitation sent to ${email}`)
      setEmail("")
      setIsInviting(false)
    }, 1000)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="glass-card-cyan rounded-xl p-6 border border-[#00E5FF]/30">
        <p className="text-sm text-[#9CA3AF]">Your Referral Code</p>
        <div className="flex items-center gap-3 mt-2">
          <p className="text-2xl font-mono font-bold text-[#00E5FF]">{referralCode}</p>
          <Button variant="outline" size="sm" className="border-[#2A2A2A] text-[#9CA3AF] hover:text-white" onClick={copyCode}>
            {copied ? <CheckCircle2 className="w-4 h-4 text-[#22C55E]" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
        <p className="text-xs text-[#4B5563] mt-3">Share this code with friends. Earn rewards when they sign up and make purchases.</p>
      </div>

      <div className="glass-card rounded-xl p-5 border border-[#2A2A2A]">
        <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-[#FFC107]" />Invite a Friend
        </h3>
        <div className="flex gap-2">
          <Input placeholder="friend@email.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder:text-[#4B5563] focus:border-[#FFC107] focus:ring-[#FFC107]/20" />
          <Button className="btn-primary-yellow font-bold shrink-0" disabled={isInviting || !email.trim()} onClick={handleInvite}>
            {isInviting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Invite"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card rounded-xl p-4 text-center border border-[#2A2A2A]"><p className="text-2xl font-bold text-white">{referrals.length}</p><p className="text-xs text-[#9CA3AF]">Total Referrals</p></div>
        <div className="glass-card rounded-xl p-4 text-center border border-[#2A2A2A]"><p className="text-2xl font-bold text-[#22C55E]">{referrals.filter((r) => r.status === "active").length}</p><p className="text-xs text-[#9CA3AF]">Active</p></div>
        <div className="glass-card rounded-xl p-4 text-center border border-[#2A2A2A]"><p className="text-2xl font-bold text-[#FFC107]">GHS {referrals.reduce((sum, r) => sum + r.reward, 0).toFixed(2)}</p><p className="text-xs text-[#9CA3AF]">Rewards</p></div>
      </div>

      <div className="glass-card rounded-xl p-5 border border-[#2A2A2A]">
        <h3 className="font-semibold text-white mb-4">Referral History</h3>
        {referrals.length === 0 ? (
          <div className="text-center py-8 text-[#9CA3AF]">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p>No referrals yet. Share your code to start earning!</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
            {referrals.map((ref) => (
              <div key={ref.id} className="flex items-center justify-between py-2 border-b border-[#2A2A2A] last:border-0">
                <div>
                  <p className="text-sm font-medium text-white">{ref.email}</p>
                  <p className="text-xs text-[#9CA3AF]">{new Date(ref.createdAt).toLocaleDateString()}</p>
                </div>
                <Badge variant="secondary" className="text-xs capitalize bg-[#FFC107]/10 text-[#FFC107] border border-[#FFC107]/20">{ref.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── API Access Sub-View ──────────────────────────────────────────

function ApiAccessSubView() {
  const user = useAppStore((s) => s.user)
  const [showKey, setShowKey] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [apiKey, setApiKey] = useState(user?.agentProfile?.apiKey || "")

  const maskedKey = apiKey ? `${apiKey.slice(0, 10)}${"*".repeat(20)}${apiKey.slice(-4)}` : "No API key generated"

  const copyKey = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey)
      toast.success("API key copied to clipboard!")
    }
  }

  const generateNewKey = async () => {
    setIsRegenerating(true)
    setTimeout(() => {
      const newKey = `dm_${user?.agentProfile?.tier || "retail"}_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
      setApiKey(newKey)
      toast.success("New API key generated!")
      setIsRegenerating(false)
    }, 1500)
  }

  const hasApiAccess = user?.agentProfile?.tier === "premium" || user?.agentProfile?.tier === "super" || user?.agentProfile?.tier === "distributor"

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">API Access</h2>
        {!hasApiAccess && (
          <Badge className="bg-[#FFC107]/10 text-[#FFC107] border border-[#FFC107]/20">Upgrade to Premium for API</Badge>
        )}
      </div>

      <div className="glass-card rounded-xl p-5 border border-[#2A2A2A]">
        <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
          <Code className="w-4 h-4 text-[#00E5FF]" />API Key
        </h3>
        {!hasApiAccess ? (
          <div className="text-center py-8">
            <Shield className="w-12 h-12 mx-auto mb-3 text-[#9CA3AF]/40" />
            <h4 className="font-semibold text-white mb-1">API Access Requires Premium</h4>
            <p className="text-sm text-[#9CA3AF] mb-4">Upgrade to Premium or higher to access the API.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-[#0A0A0A] rounded-lg p-4 border border-[#2A2A2A]">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs text-[#9CA3AF]">Your API Key</Label>
                <button onClick={() => setShowKey(!showKey)} className="text-xs text-[#9CA3AF] hover:text-white transition-colors">
                  {showKey ? <><EyeOff className="w-3 h-3 inline mr-1" />Hide</> : <><Eye className="w-3 h-3 inline mr-1" />Show</>}
                </button>
              </div>
              <div className="font-mono text-sm break-all text-[#00E5FF]">{showKey ? (apiKey || "No key") : maskedKey}</div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="border-[#2A2A2A] text-[#9CA3AF] hover:text-white hover:bg-[#1F1F1F]" onClick={copyKey} disabled={!apiKey}>
                <Copy className="w-3 h-3 mr-1" />Copy Key
              </Button>
              <Button variant="outline" size="sm" className="border-[#2A2A2A] text-[#9CA3AF] hover:text-white hover:bg-[#1F1F1F]" onClick={generateNewKey} disabled={isRegenerating}>
                {isRegenerating ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <RefreshCw className="w-3 h-3 mr-1" />}
                Generate New Key
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="glass-card rounded-xl p-5 border border-[#2A2A2A]">
        <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
          <ExternalLink className="w-4 h-4 text-[#00E5FF]" />API Documentation
        </h3>
        <div className="space-y-4">
          <div className="bg-[#0A0A0A] rounded-lg p-4 font-mono text-xs overflow-x-auto border border-[#2A2A2A]">
            <p className="text-[#4B5563]">{"// Example: Place an order via API"}</p>
            <p className="mt-1 text-[#22C55E]">const response = await fetch(</p>
            <p className="ml-4 text-[#22C55E]">&quot;https://dataghmart.com/api/v1/orders&quot;, &#123;</p>
            <p className="ml-8 text-[#FFC107]">method: &quot;POST&quot;,</p>
            <p className="ml-8 text-[#FFC107]">headers: &#123;</p>
            <p className="ml-12 text-white">&quot;Content-Type&quot;: &quot;application/json&quot;,</p>
            <p className="ml-12 text-[#00E5FF]">&quot;X-API-Key&quot;: &quot;{apiKey ? "your_api_key" : "YOUR_API_KEY"}&quot;</p>
            <p className="ml-8 text-[#FFC107]">&#125;,</p>
            <p className="ml-8 text-[#FFC107]">body: JSON.stringify(&#123;</p>
            <p className="ml-12 text-white">phoneNumber: &quot;0241234567&quot;,</p>
            <p className="ml-12 text-white">network: &quot;YELLO&quot;,</p>
            <p className="ml-12 text-white">capacity: 5</p>
            <p className="ml-8 text-[#FFC107]">&#125;)</p>
            <p className="ml-4 text-[#22C55E]">&#125;</p>
            <p className="text-[#22C55E]">);</p>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-white">Endpoints</h4>
            <div className="space-y-2">
              {[
                { method: "GET", path: "/api/v1/products", desc: "List available products" },
                { method: "POST", path: "/api/v1/orders", desc: "Place a new order" },
                { method: "GET", path: "/api/v1/orders/:id", desc: "Check order status" },
                { method: "GET", path: "/api/v1/balance", desc: "Check wallet balance" },
              ].map((ep) => (
                <div key={ep.path} className="flex items-center gap-3 p-2 bg-[#0A0A0A] rounded-lg border border-[#2A2A2A]">
                  <Badge className={`text-[10px] font-mono ${ep.method === "GET" ? "bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20" : "bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20"}`}>
                    {ep.method}
                  </Badge>
                  <code className="text-xs font-mono text-white">{ep.path}</code>
                  <span className="text-xs text-[#9CA3AF] ml-auto">{ep.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Usage Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#0A0A0A] rounded-lg p-3 text-center border border-[#2A2A2A]">
              <p className="text-lg font-bold text-[#FFC107]">0</p>
              <p className="text-xs text-[#9CA3AF]">API Calls Today</p>
            </div>
            <div className="bg-[#0A0A0A] rounded-lg p-3 text-center border border-[#2A2A2A]">
              <p className="text-lg font-bold text-[#22C55E]">1,000</p>
              <p className="text-xs text-[#9CA3AF]">Daily Limit</p>
            </div>
            <div className="bg-[#0A0A0A] rounded-lg p-3 text-center border border-[#2A2A2A]">
              <p className="text-lg font-bold text-[#00E5FF]">Active</p>
              <p className="text-xs text-[#9CA3AF]">Status</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── White Label Sub-View ─────────────────────────────────────────

function WhiteLabelSubView() {
  const user = useAppStore((s) => s.user)
  const [brandName, setBrandName] = useState(user?.agentProfile?.tier === "distributor" ? "My Data Store" : "")
  const [primaryColor, setPrimaryColor] = useState("#FFC107")
  const [domain, setDomain] = useState("")

  const isPremium = user?.agentProfile?.tier === "premium" || user?.agentProfile?.tier === "super" || user?.agentProfile?.tier === "distributor"

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-xl font-bold text-white">White Label Settings</h2>

      {!isPremium ? (
        <div className="glass-card rounded-xl p-12 text-center border border-[#2A2A2A]">
          <Palette className="w-12 h-12 mx-auto mb-3 text-[#9CA3AF]/40" />
          <h3 className="font-semibold text-white mb-1">Premium Feature</h3>
          <p className="text-sm text-[#9CA3AF] mb-4">White Label is available for Premium agents and above.</p>
          <Button className="btn-primary-yellow font-bold">Upgrade to Premium</Button>
        </div>
      ) : (
        <>
          <div className="glass-card rounded-xl overflow-hidden border border-[#2A2A2A]">
            <div className="h-20" style={{ backgroundColor: primaryColor }} />
            <div className="p-4">
              <h3 className="font-bold text-lg text-white" style={{ color: primaryColor }}>{brandName || "Your Brand"}</h3>
              <p className="text-sm text-[#9CA3AF]">Powered by Dataghmart</p>
            </div>
          </div>

          <div className="glass-card rounded-xl p-5 border border-[#2A2A2A]">
            <h3 className="font-semibold text-white mb-4">Brand Configuration</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[#9CA3AF]">Brand Name</Label>
                <Input placeholder="Your brand name" value={brandName} onChange={(e) => setBrandName(e.target.value)} className="bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder:text-[#4B5563] focus:border-[#FFC107] focus:ring-[#FFC107]/20" />
              </div>
              <div className="space-y-2">
                <Label className="text-[#9CA3AF]">Primary Color</Label>
                <div className="flex items-center gap-3">
                  <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer bg-[#1A1A1A] border border-[#2A2A2A]" />
                  <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="flex-1 bg-[#1A1A1A] border-[#2A2A2A] text-white focus:border-[#FFC107] focus:ring-[#FFC107]/20" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[#9CA3AF]">Custom Domain (Optional)</Label>
                <Input placeholder="data.yourdomain.com" value={domain} onChange={(e) => setDomain(e.target.value)} className="bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder:text-[#4B5563] focus:border-[#FFC107] focus:ring-[#FFC107]/20" />
              </div>
              <Button className="btn-primary-yellow font-bold">Save Settings</Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Profile Sub-View ─────────────────────────────────────────────

function ProfileSubView() {
  const user = useAppStore((s) => s.user)
  const setUser = useAppStore((s) => s.setUser)
  const [fullName, setFullName] = useState(user?.fullName || "")
  const [email, setEmail] = useState(user?.email || "")
  const [phone, setPhone] = useState(user?.phone || "")
  const [isSaving, setIsSaving] = useState(false)

  const tierInfo = TIER_INFO[user?.agentProfile?.tier || "retail"]
  const TierIcon = tierInfo?.icon || Zap

  const handleSave = async () => {
    setIsSaving(true)
    try {
      if (user) {
        setUser({ ...user, fullName, phone })
      }
      toast.success("Profile updated successfully!")
    } catch {
      toast.error("Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl animate-fade-in">
      <h2 className="text-xl font-bold text-white">Agent Profile</h2>

      {/* Tier Info */}
      <div className="glass-card-cyan rounded-xl overflow-hidden border border-[#FFC107]/20">
        <div className="bg-gradient-to-r from-[#FFC107]/20 to-[#00E5FF]/10 p-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#FFC107]/20 flex items-center justify-center text-2xl font-bold text-[#FFC107]">
              {user?.fullName?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">{user?.fullName || "Agent"}</h3>
              <div className="flex items-center gap-2 mt-1">
                <TierIcon className={`w-4 h-4 ${tierInfo?.color || "text-[#9CA3AF]"}`} />
                <Badge className="bg-[#FFC107]/10 text-[#FFC107] border border-[#FFC107]/20 hover:bg-[#FFC107]/20" variant="secondary">
                  {tierInfo?.name || "Agent"}
                </Badge>
                <Badge className="bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20 hover:bg-[#22C55E]/20" variant="secondary">
                  {tierInfo?.commission}% commission
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="glass-card rounded-xl p-5 border border-[#2A2A2A]">
        <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
          <User className="w-4 h-4 text-[#FFC107]" />Personal Information
        </h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[#9CA3AF]">Full Name</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="bg-[#1A1A1A] border-[#2A2A2A] text-white focus:border-[#FFC107] focus:ring-[#FFC107]/20" />
          </div>
          <div className="space-y-2">
            <Label className="text-[#9CA3AF]">Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled className="bg-[#1A1A1A] border-[#2A2A2A] text-[#9CA3AF] opacity-60" />
            <p className="text-xs text-[#4B5563]">Email cannot be changed</p>
          </div>
          <div className="space-y-2">
            <Label className="text-[#9CA3AF]">Phone Number</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-[#1A1A1A] border-[#2A2A2A] text-white focus:border-[#FFC107] focus:ring-[#FFC107]/20" />
          </div>
          <Button className="btn-primary-yellow font-bold" disabled={isSaving} onClick={handleSave}>
            {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* KYC Section */}
      <div className="glass-card rounded-xl p-5 border border-[#2A2A2A]">
        <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-[#00E5FF]" />KYC Verification
        </h3>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-medium text-white">Verification Status</p>
            <p className="text-sm text-[#9CA3AF]">Verify your identity to unlock all features</p>
          </div>
          <Badge className={`${
            user?.agentProfile?.status === "active" ? "bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20" : "bg-[#FFC107]/10 text-[#FFC107] border border-[#FFC107]/20"
          }`} variant="secondary">
            {user?.agentProfile?.status === "active" ? "Verified" : "Pending"}
          </Badge>
        </div>
        <div className="border-2 border-dashed border-[#2A2A2A] rounded-lg p-8 text-center bg-[#0A0A0A]">
          <Upload className="w-8 h-8 mx-auto mb-2 text-[#9CA3AF]/40" />
          <p className="text-sm font-medium text-white">Upload ID Document</p>
          <p className="text-xs text-[#9CA3AF] mt-1">Ghana Card, Passport, or Driver&apos;s License</p>
          <Button variant="outline" size="sm" className="mt-3 border-[#2A2A2A] text-[#9CA3AF] hover:text-white hover:bg-[#1F1F1F]">Choose File</Button>
        </div>
      </div>

      {/* Achievements */}
      <div className="glass-card rounded-xl p-5 border border-[#2A2A2A]">
        <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
          <Award className="w-4 h-4 text-[#FFC107]" />Badges & Achievements
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { name: "New Agent", icon: Star, earned: true, color: "text-[#FFC107]" },
            { name: "First Sale", icon: ShoppingCart, earned: false, color: "text-[#4B5563]" },
            { name: "10 Sales", icon: TrendingUp, earned: false, color: "text-[#4B5563]" },
            { name: "Top Agent", icon: Crown, earned: false, color: "text-[#4B5563]" },
          ].map((badge) => {
            const BadgeIcon = badge.icon
            return (
              <div key={badge.name} className={`text-center p-3 rounded-lg border transition-all ${
                badge.earned ? "bg-[#FFC107]/10 border-[#FFC107]/30" : "bg-[#0A0A0A] border-[#2A2A2A] opacity-50"
              }`}>
                <BadgeIcon className={`w-6 h-6 mx-auto mb-1 ${badge.earned ? badge.color : "text-[#4B5563]"}`} />
                <p className="text-xs font-medium text-white">{badge.name}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Helper Components ────────────────────────────────────────────

function OrderStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    pending: { label: "Pending", className: "bg-[#FFC107]/10 text-[#FFC107] border-[#FFC107]/20" },
    processing: { label: "Processing", className: "bg-[#00E5FF]/10 text-[#00E5FF] border-[#00E5FF]/20" },
    completed: { label: "Completed", className: "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20" },
    failed: { label: "Failed", className: "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20" },
    refunded: { label: "Refunded", className: "bg-[#9CA3AF]/10 text-[#9CA3AF] border-[#9CA3AF]/20" },
  }
  const c = config[status] || config.pending
  return <Badge variant="secondary" className={`text-xs border ${c.className}`}>{c.label}</Badge>
}
