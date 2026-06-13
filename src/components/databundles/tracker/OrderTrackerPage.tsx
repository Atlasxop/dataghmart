"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useAppStore } from "@/store/useAppStore"
import { toast } from "sonner"
import {
  Search,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Wifi,
  Smartphone,
  RefreshCw,
  Activity,
  Package,
  ChevronRight,
  Zap,
  Radio,
  ArrowRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

// ─── Types ────────────────────────────────────────────────────────

interface OrderStatusData {
  id: string
  reference: string
  status: string
  phoneNumber?: string
  network?: string
  capacity?: number
  price?: number
  createdAt?: string
  updatedAt?: string
  [key: string]: unknown
}

interface DeliveryTrackerData {
  tracker: {
    pending?: number
    processing?: number
    completed?: number
    failed?: number
    checked?: number
    delivered?: number
    [key: string]: unknown
  }
  configured: boolean
  scannerStatus: string
  lastDelivered: unknown
}

// ─── Status Config ────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: typeof CheckCircle2 }> = {
  pending: { label: "Pending", color: "#FFC107", bgColor: "rgba(255,193,7,0.1)", icon: Clock },
  processing: { label: "Processing", color: "#00E5FF", bgColor: "rgba(0,229,255,0.1)", icon: RefreshCw },
  completed: { label: "Delivered", color: "#22C55E", bgColor: "rgba(34,197,94,0.1)", icon: CheckCircle2 },
  delivered: { label: "Delivered", color: "#22C55E", bgColor: "rgba(34,197,94,0.1)", icon: CheckCircle2 },
  failed: { label: "Failed", color: "#EF4444", bgColor: "rgba(239,68,68,0.1)", icon: XCircle },
  refunded: { label: "Refunded", color: "#9CA3AF", bgColor: "rgba(156,163,175,0.1)", icon: XCircle },
  created: { label: "Created", color: "#FFC107", bgColor: "rgba(255,193,7,0.1)", icon: Clock },
}

const TIMELINE_STEPS = [
  { key: "pending", label: "Pending", icon: Clock },
  { key: "processing", label: "Processing", icon: RefreshCw },
  { key: "completed", label: "Delivered", icon: CheckCircle2 },
]

function getStatusIndex(status: string): number {
  const normalized = status.toLowerCase()
  if (normalized === "completed" || normalized === "delivered") return 2
  if (normalized === "processing" || normalized === "created") return 1
  return 0
}

// ─── Component ────────────────────────────────────────────────────

export default function OrderTrackerPage() {
  const navigate = useAppStore((s) => s.navigate)
  const [reference, setReference] = useState("")
  const [loading, setLoading] = useState(false)
  const [orderData, setOrderData] = useState<OrderStatusData | null>(null)
  const [trackError, setTrackError] = useState<string | null>(null)
  const [deliveryTracker, setDeliveryTracker] = useState<DeliveryTrackerData | null>(null)
  const autoRefreshRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ─── Track Order ───────────────────────────────────────────
  const trackOrder = useCallback(async (ref?: string) => {
    const searchRef = ref || reference
    if (!searchRef.trim()) {
      toast.error("Please enter an order reference")
      return
    }

    setLoading(true)
    setTrackError(null)

    try {
      const res = await fetch(`/api/datamart/order-status?reference=${encodeURIComponent(searchRef.trim())}`)
      const data = await res.json()

      if (!res.ok) {
        setTrackError(data.error || "Order not found")
        setOrderData(null)
        toast.error("Order not found. Check your reference and try again.")
        return
      }

      if (data.success && data.status) {
        setOrderData(data.status as OrderStatusData)
        toast.success("Order found!")
      } else {
        setTrackError("No order found with this reference")
        setOrderData(null)
      }
    } catch {
      setTrackError("Failed to fetch order status. Please try again.")
      setOrderData(null)
      toast.error("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [reference])

  // ─── Fetch Delivery Tracker ────────────────────────────────
  const fetchDeliveryTracker = useCallback(async () => {
    try {
      const res = await fetch("/api/datamart/delivery-tracker?public=true")
      if (res.ok) {
        const data = await res.json()
        setDeliveryTracker(data)
      }
    } catch {
      // Silently fail for tracker widget
    }
  }, [])

  // ─── Initial Fetch ─────────────────────────────────────────
  useEffect(() => {
    fetchDeliveryTracker()
  }, [fetchDeliveryTracker])

  // ─── Auto-refresh for active orders ────────────────────────
  useEffect(() => {
    if (autoRefreshRef.current) {
      clearInterval(autoRefreshRef.current)
      autoRefreshRef.current = null
    }

    if (orderData) {
      const status = (orderData.status || "").toLowerCase()
      const isActive = status === "pending" || status === "processing" || status === "created"

      if (isActive) {
        autoRefreshRef.current = setInterval(() => {
          trackOrder(orderData.reference || reference)
        }, 10000)
      }
    }

    return () => {
      if (autoRefreshRef.current) {
        clearInterval(autoRefreshRef.current)
      }
    }
  }, [orderData, trackOrder, reference])

  // ─── Format Date ───────────────────────────────────────────
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A"
    try {
      return new Date(dateStr).toLocaleString("en-GH", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return dateStr
    }
  }

  const currentStatus = orderData?.status?.toLowerCase() || ""
  const statusConfig = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.pending
  const StatusIcon = statusConfig.icon
  const currentStepIndex = getStatusIndex(currentStatus)
  const isActive = currentStatus === "pending" || currentStatus === "processing" || currentStatus === "created"

  return (
    <div className="bg-[#0A0A0A] min-h-screen">
      {/* ─── Header ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-12 md:py-16">
        <div className="absolute inset-0 hero-grid-bg opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] via-transparent to-[#0A0A0A]" />

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#171717] border border-[#2A2A2A] mb-6">
            <MapPin className="w-4 h-4 text-[#00E5FF]" />
            <span className="text-sm text-gray-400">Real-Time Order Tracking</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Track Your Order
          </h1>
          <p className="text-gray-400 max-w-lg mx-auto">
            Enter your order reference to check delivery status in real-time
          </p>
        </div>
      </section>

      {/* ─── Search Section ──────────────────────────────────── */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="glass-card rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <Input
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && trackOrder()}
                    placeholder="Enter order reference (e.g. DM-12345)"
                    className="pl-12 h-12 bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder:text-gray-500 rounded-xl focus:border-[#00E5FF] focus:ring-[#00E5FF]"
                  />
                </div>
                <Button
                  onClick={() => trackOrder()}
                  disabled={loading}
                  className="btn-primary-green h-12 px-8 rounded-xl font-semibold"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <MapPin className="w-5 h-5 mr-2" />
                  )}
                  Track Order
                </Button>
              </div>

              {isActive && orderData && (
                <div className="mt-4 flex items-center gap-2 text-sm text-[#00E5FF]">
                  <Radio className="w-4 h-4 animate-pulse" />
                  <span>Auto-refreshing every 10 seconds...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Error State ─────────────────────────────────────── */}
      {trackError && !orderData && (
        <section className="py-4">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto glass-card rounded-2xl p-6 text-center">
              <XCircle className="w-12 h-12 text-[#EF4444] mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">Order Not Found</h3>
              <p className="text-gray-400 text-sm">{trackError}</p>
              <Button
                variant="outline"
                className="mt-4 border-[#2A2A2A] text-gray-300 hover:text-white hover:bg-[#1F1F1F] rounded-xl"
                onClick={() => navigate("buy-data")}
              >
                Buy Data Instead
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* ─── Order Details ───────────────────────────────────── */}
      {orderData && (
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Timeline Progress Bar */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#00E5FF]" />
                  Order Progress
                </h3>

                {/* Visual Timeline */}
                <div className="relative flex items-center justify-between mb-8">
                  {/* Background Line */}
                  <div className="absolute top-5 left-0 right-0 h-1 bg-[#2A2A2A] rounded-full" />
                  {/* Progress Line */}
                  <div
                    className="absolute top-5 left-0 h-1 rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${(currentStepIndex / 2) * 100}%`,
                      background:
                        currentStatus === "failed"
                          ? "#EF4444"
                          : "linear-gradient(90deg, #FFC107, #00E5FF, #22C55E)",
                    }}
                  />

                  {TIMELINE_STEPS.map((step, idx) => {
                    const isCompleted = idx <= currentStepIndex && currentStatus !== "failed"
                    const isCurrent = idx === currentStepIndex
                    const StepIcon = step.icon

                    return (
                      <div key={step.key} className="relative flex flex-col items-center z-10">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                            isCompleted && !isCurrent
                              ? "bg-[#22C55E] border-[#22C55E]"
                              : isCurrent
                                ? "bg-[#171717] border-[#00E5FF] animate-pulse-glow-cyan"
                                : "bg-[#171717] border-[#2A2A2A]"
                          }`}
                        >
                          {isCompleted && !isCurrent ? (
                            <CheckCircle2 className="w-5 h-5 text-white" />
                          ) : (
                            <StepIcon className={`w-5 h-5 ${isCurrent ? "text-[#00E5FF]" : "text-gray-500"}`} />
                          )}
                        </div>
                        <span
                          className={`mt-2 text-xs font-medium ${
                            isCompleted ? "text-white" : "text-gray-500"
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {currentStatus === "failed" && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20">
                    <XCircle className="w-5 h-5 text-[#EF4444]" />
                    <span className="text-[#EF4444] text-sm font-medium">
                      This order has failed. Please contact support for assistance.
                    </span>
                  </div>
                )}
              </div>

              {/* Order Info Card */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#FFC107]" />
                  Order Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Order ID */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A]">
                    <div className="w-10 h-10 rounded-lg bg-[#FFC107]/10 flex items-center justify-center shrink-0">
                      <ChevronRight className="w-5 h-5 text-[#FFC107]" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Order ID</p>
                      <p className="text-white font-medium text-sm">
                        {orderData.id || orderData.reference || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A]">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: statusConfig.bgColor }}
                    >
                      <StatusIcon className="w-5 h-5" style={{ color: statusConfig.color }} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Status</p>
                      <Badge
                        className="text-xs font-semibold border-0"
                        style={{ backgroundColor: statusConfig.bgColor, color: statusConfig.color }}
                      >
                        {statusConfig.label}
                      </Badge>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A]">
                    <div className="w-10 h-10 rounded-lg bg-[#00E5FF]/10 flex items-center justify-center shrink-0">
                      <Smartphone className="w-5 h-5 text-[#00E5FF]" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Phone Number</p>
                      <p className="text-white font-medium text-sm">
                        {orderData.phoneNumber || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Network */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A]">
                    <div className="w-10 h-10 rounded-lg bg-[#FFC107]/10 flex items-center justify-center shrink-0">
                      <Wifi className="w-5 h-5 text-[#FFC107]" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Network</p>
                      <p className="text-white font-medium text-sm">
                        {orderData.network || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Capacity */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A]">
                    <div className="w-10 h-10 rounded-lg bg-[#22C55E]/10 flex items-center justify-center shrink-0">
                      <Zap className="w-5 h-5 text-[#22C55E]" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Data Amount</p>
                      <p className="text-white font-medium text-sm">
                        {orderData.capacity ? `${orderData.capacity} GB` : "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A]">
                    <div className="w-10 h-10 rounded-lg bg-[#FFC107]/10 flex items-center justify-center shrink-0">
                      <Package className="w-5 h-5 text-[#FFC107]" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Price</p>
                      <p className="text-white font-medium text-sm">
                        {orderData.price ? `GHS ${Number(orderData.price).toFixed(2)}` : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator className="my-4 bg-[#2A2A2A]" />

                {/* Timestamps */}
                <div className="flex flex-col sm:flex-row gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Clock className="w-4 h-4 text-[#FFC107]" />
                    <span>Created: {formatDate(orderData.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Clock className="w-4 h-4 text-[#00E5FF]" />
                    <span>Updated: {formatDate(orderData.updatedAt)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  className="flex-1 btn-primary-green rounded-xl font-semibold"
                  onClick={() => navigate("buy-data")}
                >
                  Buy More Data
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-[#2A2A2A] text-gray-300 hover:text-white hover:bg-[#1F1F1F] rounded-xl"
                  onClick={() => navigate("contact")}
                >
                  Contact Support
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── Live Delivery Tracker Widget ────────────────────── */}
      <section className="py-12 border-t border-[#2A2A2A]">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <Radio className="w-5 h-5 text-[#00E5FF] animate-pulse" />
                  Live Delivery Tracker
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white hover:bg-[#1F1F1F]"
                  onClick={fetchDeliveryTracker}
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>

              {deliveryTracker ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    {
                      label: "Pending",
                      value: deliveryTracker.tracker.pending || 0,
                      color: "#FFC107",
                      bgColor: "rgba(255,193,7,0.1)",
                    },
                    {
                      label: "Processing",
                      value: deliveryTracker.tracker.processing || 0,
                      color: "#00E5FF",
                      bgColor: "rgba(0,229,255,0.1)",
                    },
                    {
                      label: "Delivered",
                      value: deliveryTracker.tracker.completed || deliveryTracker.tracker.delivered || 0,
                      color: "#22C55E",
                      bgColor: "rgba(34,197,94,0.1)",
                    },
                    {
                      label: "Failed",
                      value: deliveryTracker.tracker.failed || 0,
                      color: "#EF4444",
                      bgColor: "rgba(239,68,68,0.1)",
                    },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="p-4 rounded-xl text-center"
                      style={{ backgroundColor: stat.bgColor }}
                    >
                      <p className="text-2xl font-bold" style={{ color: stat.color }}>
                        {stat.value}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Loader2 className="w-6 h-6 text-[#00E5FF] animate-spin mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Loading tracker data...</p>
                </div>
              )}

              {!deliveryTracker?.configured && deliveryTracker && (
                <p className="text-xs text-gray-500 text-center mt-4">
                  Live tracking is being set up. Stats will appear once configured.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── No Order Placeholder ────────────────────────────── */}
      {!orderData && !trackError && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto text-center">
              <div className="w-20 h-20 rounded-2xl bg-[#171717] border border-[#2A2A2A] flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-[#2A2A2A]" />
              </div>
              <h3 className="text-white font-semibold text-xl mb-3">
                Enter Your Order Reference
              </h3>
              <p className="text-gray-400 text-sm mb-6">
                You can find your order reference in your order confirmation message or in your order history.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  className="btn-primary-green rounded-xl font-semibold"
                  onClick={() => navigate("buy-data")}
                >
                  Buy Data Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  className="border-[#2A2A2A] text-gray-300 hover:text-white hover:bg-[#1F1F1F] rounded-xl"
                  onClick={() => navigate("my-orders")}
                >
                  View My Orders
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
