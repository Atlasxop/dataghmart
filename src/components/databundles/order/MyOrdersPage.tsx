"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Package,
  Search,
  Filter,
  ShoppingCart,
  MapPin,
  Loader2,
  Wifi,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  ArrowLeft,
  ExternalLink,
  Calendar,
  Phone,
  Signal,
  CreditCard,
  Hash,
} from "lucide-react"
import { useAppStore } from "@/store/useAppStore"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

// ─── Types ────────────────────────────────────────────────────────

interface Order {
  id: string
  reference: string | null
  phoneNumber: string
  network: string
  capacity: number
  price: number
  status: string
  paymentMethod: string | null
  createdAt: string
  completedAt: string | null
  agentCommission: number
}

type StatusFilter = "all" | "pending" | "processing" | "completed" | "failed"

// ─── Network Config ──────────────────────────────────────────────

const NETWORK_DISPLAY: Record<string, { name: string; color: string; badgeClass: string }> = {
  YELLO: { name: "MTN", color: "#FFC107", badgeClass: "badge-mtn" },
  TELECEL: { name: "Telecel", color: "#FF4444", badgeClass: "badge-telecel" },
  AT_PREMIUM: { name: "AirtelTigo", color: "#4499FF", badgeClass: "badge-airteltigo" },
  MTN: { name: "MTN", color: "#FFC107", badgeClass: "badge-mtn" },
  AIRTELTIGO: { name: "AirtelTigo", color: "#4499FF", badgeClass: "badge-airteltigo" },
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; borderColor: string; icon: typeof Clock }> = {
  pending: {
    label: "Pending",
    color: "#FFC107",
    bgColor: "rgba(255, 193, 7, 0.12)",
    borderColor: "rgba(255, 193, 7, 0.3)",
    icon: Clock,
  },
  processing: {
    label: "Processing",
    color: "#00E5FF",
    bgColor: "rgba(0, 229, 255, 0.12)",
    borderColor: "rgba(0, 229, 255, 0.3)",
    icon: RefreshCw,
  },
  completed: {
    label: "Completed",
    color: "#22C55E",
    bgColor: "rgba(34, 197, 94, 0.12)",
    borderColor: "rgba(34, 197, 94, 0.3)",
    icon: CheckCircle2,
  },
  failed: {
    label: "Failed",
    color: "#EF4444",
    bgColor: "rgba(239, 68, 68, 0.12)",
    borderColor: "rgba(239, 68, 68, 0.3)",
    icon: XCircle,
  },
  refunded: {
    label: "Refunded",
    color: "#9CA3AF",
    bgColor: "rgba(156, 163, 175, 0.12)",
    borderColor: "rgba(156, 163, 175, 0.3)",
    icon: AlertTriangle,
  },
}

function getNetworkInfo(network: string) {
  return NETWORK_DISPLAY[network] || { name: network, color: "#9CA3AF", badgeClass: "" }
}

function getStatusConfig(status: string) {
  return STATUS_CONFIG[status] || STATUS_CONFIG.pending
}

function formatDate(dateStr: string) {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-GH", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return dateStr
  }
}

function formatPrice(amount: number) {
  return `GH₵ ${amount.toFixed(2)}`
}

// ─── Status Badge Component ──────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const config = getStatusConfig(status)
  const IconComp = config.icon
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{
        color: config.color,
        backgroundColor: config.bgColor,
        border: `1px solid ${config.borderColor}`,
      }}
    >
      <IconComp className="w-3 h-3" />
      {config.label}
    </span>
  )
}

// ─── Network Badge Component ─────────────────────────────────────

function NetworkBadge({ network }: { network: string }) {
  const info = getNetworkInfo(network)
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${info.badgeClass}`}
      style={!info.badgeClass ? { color: info.color, backgroundColor: `${info.color}15`, border: `1px solid ${info.color}30` } : undefined}
    >
      <Signal className="w-3 h-3" />
      {info.name}
    </span>
  )
}

// ─── Order Detail Card ───────────────────────────────────────────

function OrderDetailCard({ order, onClose }: { order: Order; onClose: () => void }) {
  const navigate = useAppStore((s) => s.navigate)
  const statusConfig = getStatusConfig(order.status)
  const StatusIcon = statusConfig.icon

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:text-white hover:bg-[#1F1F1F] h-9 w-9"
          onClick={onClose}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h2 className="text-lg font-bold text-white">Order Details</h2>
          <p className="text-xs text-gray-500">#{order.id.slice(-8).toUpperCase()}</p>
        </div>
      </div>

      <Card className="glass-card rounded-2xl border-[#2A2A2A] mb-4">
        <CardContent className="p-6 space-y-4">
          {/* Status Header */}
          <div className="flex items-center justify-between">
            <StatusBadge status={order.status} />
            <NetworkBadge network={order.network} />
          </div>

          <Separator className="bg-[#2A2A2A]" />

          {/* Order Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#1A1A1A] flex items-center justify-center">
                <Hash className="w-4 h-4 text-[#FFC107]" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Order ID</p>
                <p className="text-sm text-white font-medium">{order.id}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#1A1A1A] flex items-center justify-center">
                <Phone className="w-4 h-4 text-[#00E5FF]" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Phone Number</p>
                <p className="text-sm text-white font-medium">{order.phoneNumber}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#1A1A1A] flex items-center justify-center">
                <Wifi className="w-4 h-4 text-[#22C55E]" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Data Amount</p>
                <p className="text-sm text-white font-medium">{order.capacity} GB</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#1A1A1A] flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-[#FFC107]" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Price</p>
                <p className="text-sm text-white font-bold">{formatPrice(order.price)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#1A1A1A] flex items-center justify-center">
                <Calendar className="w-4 h-4 text-gray-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Date</p>
                <p className="text-sm text-white font-medium">{formatDate(order.createdAt)}</p>
              </div>
            </div>
            {order.reference && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#1A1A1A] flex items-center justify-center">
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Reference</p>
                  <p className="text-sm text-white font-medium">{order.reference}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="space-y-3">
        {(order.status === "pending" || order.status === "processing") && (
          <Button
            className="w-full btn-primary-yellow font-bold rounded-xl h-11"
            onClick={() => navigate("tracker")}
          >
            <MapPin className="w-4 h-4 mr-2" />
            Track Order
          </Button>
        )}
        <Button
          variant="outline"
          className="w-full border-[#2A2A2A] text-gray-300 hover:text-white hover:bg-[#1F1F1F] rounded-xl h-11"
          onClick={() => navigate("buy-data")}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Buy More Data
        </Button>
      </div>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────

export default function MyOrdersPage() {
  const navigate = useAppStore((s) => s.navigate)
  const user = useAppStore((s) => s.user)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [searchPhone, setSearchPhone] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const fetchOrders = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/datamart/orders", {
        headers: {
          "user-id": user.id,
        },
      })
      if (res.ok) {
        const data = await res.json()
        setOrders(data.orders || [])
      } else {
        // Fallback: try to get orders with cookie auth
        const res2 = await fetch("/api/datamart/orders")
        if (res2.ok) {
          const data2 = await res2.json()
          setOrders(data2.orders || [])
        } else {
          toast.error("Failed to load orders")
        }
      }
    } catch {
      toast.error("Failed to load orders")
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  // Filter and search
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    const matchesSearch =
      !searchPhone.trim() ||
      order.phoneNumber.toLowerCase().includes(searchPhone.trim().toLowerCase())
    return matchesStatus && matchesSearch
  })

  // Stats
  const totalSpent = orders
    .filter((o) => o.status === "completed")
    .reduce((sum, o) => sum + o.price, 0)
  const pendingCount = orders.filter((o) => o.status === "pending" || o.status === "processing").length

  // If viewing a specific order detail
  if (selectedOrder) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <OrderDetailCard order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">My Orders</h1>
        <p className="text-sm text-gray-500">View your data purchase history</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card className="bg-[#171717] border-[#2A2A2A] rounded-xl">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-[#FFC107]">{orders.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Total Orders</p>
          </CardContent>
        </Card>
        <Card className="bg-[#171717] border-[#2A2A2A] rounded-xl">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-[#00E5FF]">{pendingCount}</p>
            <p className="text-xs text-gray-500 mt-0.5">Active</p>
          </CardContent>
        </Card>
        <Card className="bg-[#171717] border-[#2A2A2A] rounded-xl">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-[#22C55E]">{formatPrice(totalSpent)}</p>
            <p className="text-xs text-gray-500 mt-0.5">Total Spent</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-3 mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Search by phone number..."
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              className="h-10 pl-10 bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder:text-gray-600 focus:border-[#FFC107] focus:ring-[#FFC107]/20 rounded-xl"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            className={`h-10 w-10 border-[#2A2A2A] rounded-xl ${
              showFilters ? "bg-[#FFC107]/10 text-[#FFC107] border-[#FFC107]/30" : "bg-[#1A1A1A] text-gray-400"
            }`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 border-[#2A2A2A] bg-[#1A1A1A] text-gray-400 rounded-xl"
            onClick={fetchOrders}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        {/* Status Filter Pills */}
        {showFilters && (
          <div className="flex flex-wrap gap-2 animate-fade-in">
            {(["all", "pending", "processing", "completed", "failed"] as StatusFilter[]).map(
              (status) => {
                const isActive = statusFilter === status
                return (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                      isActive
                        ? status === "all"
                          ? "bg-[#FFC107] text-[#0A0A0A]"
                          : STATUS_CONFIG[status]
                          ? `border`
                          : "bg-[#FFC107] text-[#0A0A0A]"
                        : "bg-[#1A1A1A] text-gray-400 border border-[#2A2A2A] hover:border-[#3A3A3A]"
                    }`}
                    style={
                      isActive && status !== "all" && STATUS_CONFIG[status]
                        ? {
                            backgroundColor: STATUS_CONFIG[status].bgColor,
                            color: STATUS_CONFIG[status].color,
                            borderColor: STATUS_CONFIG[status].borderColor,
                          }
                        : undefined
                    }
                  >
                    {status === "all" ? "All" : STATUS_CONFIG[status]?.label || status}
                  </button>
                )
              }
            )}
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-[#FFC107] animate-spin" />
            <p className="text-sm text-gray-500">Loading your orders...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredOrders.length === 0 && (
        <Card className="bg-[#171717] border-[#2A2A2A] border-dashed rounded-2xl">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#1A1A1A] flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {orders.length === 0 ? "No orders yet" : "No matching orders"}
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              {orders.length === 0
                ? "Your data purchase history will appear here. Start by buying your first data bundle!"
                : "Try adjusting your search or filter criteria."}
            </p>
            {orders.length === 0 && (
              <Button
                className="btn-primary-yellow font-bold rounded-xl h-11"
                onClick={() => navigate("buy-data")}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Buy Data
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Desktop Table View */}
      {!loading && filteredOrders.length > 0 && (
        <div className="hidden md:block">
          <Card className="bg-[#171717] border-[#2A2A2A] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2A2A2A]">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                      Order ID
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                      Phone
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                      Network
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                      Data
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                      Price
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                      Status
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                      Date
                    </th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order, idx) => (
                    <tr
                      key={order.id}
                      className={`border-b border-[#2A2A2A]/50 hover:bg-[#1F1F1F] transition-colors cursor-pointer ${
                        idx === filteredOrders.length - 1 ? "border-b-0" : ""
                      }`}
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="px-4 py-3.5">
                        <span className="text-sm text-white font-mono">
                          #{order.id.slice(-8).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-sm text-gray-300">{order.phoneNumber}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <NetworkBadge network={order.network} />
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-sm text-white font-medium">{order.capacity} GB</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-sm text-white font-bold">{formatPrice(order.price)}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-sm text-gray-400">{formatDate(order.createdAt)}</span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {(order.status === "pending" || order.status === "processing") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[#00E5FF] hover:text-[#00E5FF] hover:bg-[#00E5FF]/10 h-8 px-2"
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate("tracker")
                            }}
                          >
                            <MapPin className="w-3.5 h-3.5 mr-1" />
                            Track
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Mobile Card View */}
      {!loading && filteredOrders.length > 0 && (
        <div className="md:hidden space-y-3 max-h-[65vh] overflow-y-auto custom-scrollbar">
          {filteredOrders.map((order) => (
            <Card
              key={order.id}
              className="bg-[#171717] border-[#2A2A2A] rounded-xl hover:border-[#3A3A3A] transition-colors cursor-pointer"
              onClick={() => setSelectedOrder(order)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-mono text-gray-400">
                      #{order.id.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">{formatDate(order.createdAt)}</p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <NetworkBadge network={order.network} />
                  <span className="text-sm text-white font-medium">{order.capacity} GB</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-sm text-gray-400">
                    <Phone className="w-3.5 h-3.5" />
                    {order.phoneNumber}
                  </div>
                  <span className="text-sm font-bold text-white">{formatPrice(order.price)}</span>
                </div>

                {(order.status === "pending" || order.status === "processing") && (
                  <div className="mt-3 pt-3 border-t border-[#2A2A2A]">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[#00E5FF] hover:text-[#00E5FF] hover:bg-[#00E5FF]/10 w-full h-8 text-xs"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate("tracker")
                      }}
                    >
                      <MapPin className="w-3.5 h-3.5 mr-1.5" />
                      Track Order
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Results count */}
      {!loading && filteredOrders.length > 0 && (
        <p className="text-xs text-gray-600 mt-4 text-center">
          Showing {filteredOrders.length} of {orders.length} orders
        </p>
      )}
    </div>
  )
}
