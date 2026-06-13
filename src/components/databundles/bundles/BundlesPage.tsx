"use client"

import { useEffect, useState, useMemo } from "react"
import {
  Wifi,
  ArrowRight,
  Package,
  RefreshCw,
  AlertCircle,
  ShoppingBag,
  MessageSquare,
  Zap,
  CheckCircle2,
} from "lucide-react"
import { useAppStore } from "@/store/useAppStore"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// ─── Types ─────────────────────────────────────────────────────
interface BundleItem {
  capacity: number
  price: number
  sellingPrice?: number
}

interface NetworkBundles {
  [key: string]: BundleItem[]
}

// ─── Fallback Data ─────────────────────────────────────────────
const FALLBACK_BUNDLES: NetworkBundles = {
  YELLO: [
    { capacity: 1, price: 5 },
    { capacity: 2, price: 10 },
    { capacity: 3, price: 14.5 },
    { capacity: 5, price: 24 },
    { capacity: 10, price: 47 },
    { capacity: 20, price: 92 },
    { capacity: 50, price: 225 },
  ],
  TELECEL: [
    { capacity: 1, price: 4.5 },
    { capacity: 2, price: 9 },
    { capacity: 5, price: 22 },
    { capacity: 10, price: 43 },
    { capacity: 20, price: 84 },
  ],
  AT_PREMIUM: [
    { capacity: 1, price: 5 },
    { capacity: 2, price: 10 },
    { capacity: 5, price: 25 },
    { capacity: 10, price: 48 },
    { capacity: 20, price: 94 },
  ],
}

// ─── Network Config ────────────────────────────────────────────
const NETWORK_CONFIG: Record<
  string,
  { label: string; color: string; bgLight: string; tabLabel: string; badgeClass: string }
> = {
  YELLO: {
    label: "MTN",
    color: "#FFC107",
    bgLight: "rgba(255,195,0,0.1)",
    tabLabel: "MTN",
    badgeClass: "badge-mtn",
  },
  TELECEL: {
    label: "Telecel",
    color: "#FF4444",
    bgLight: "rgba(230,0,0,0.1)",
    tabLabel: "Telecel",
    badgeClass: "badge-telecel",
  },
  AT_PREMIUM: {
    label: "AirtelTigo",
    color: "#4499FF",
    bgLight: "rgba(0,102,204,0.1)",
    tabLabel: "AirtelTigo",
    badgeClass: "badge-airteltigo",
  },
}

// ─── Component ─────────────────────────────────────────────────
export default function BundlesPage() {
  const navigate = useAppStore((s) => s.navigate)
  const user = useAppStore((s) => s.user)
  const isAgent = user?.role === "agent"

  const [bundles, setBundles] = useState<NetworkBundles>(FALLBACK_BUNDLES)
  const [loading, setLoading] = useState(true)
  const [usingFallback, setUsingFallback] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("YELLO")

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const res = await fetch("/api/datamart/products")
        if (!res.ok) throw new Error("Failed to fetch products")
        const data = await res.json()

        if (data.configured && data.byNetwork) {
          const liveBundles: NetworkBundles = {}

          for (const [networkCode, networkData] of Object.entries(
            data.byNetwork as Record<
              string,
              {
                storeProducts: Array<{ capacity: number; sellingPrice: number; basePrice: number }>
                dataPackages: Array<{ capacity: number; price: number; sellingPrice?: number }>
              }
            >
          )) {
            const items: BundleItem[] = []

            if (networkData.storeProducts?.length) {
              for (const p of networkData.storeProducts) {
                items.push({
                  capacity: p.capacity,
                  price: p.sellingPrice || p.basePrice,
                  sellingPrice: p.sellingPrice,
                })
              }
            }

            if (networkData.dataPackages?.length) {
              for (const p of networkData.dataPackages) {
                if (!items.find((i) => i.capacity === p.capacity)) {
                  items.push({
                    capacity: p.capacity,
                    price: p.sellingPrice || p.price,
                    sellingPrice: p.sellingPrice,
                  })
                }
              }
            }

            if (items.length > 0) {
              liveBundles[networkCode] = items.sort((a, b) => a.capacity - b.capacity)
            }
          }

          if (Object.keys(liveBundles).length > 0) {
            setBundles(liveBundles)
            setUsingFallback(false)
            setError(null)
            return
          }
        }

        setBundles(FALLBACK_BUNDLES)
        setUsingFallback(true)
      } catch (err) {
        console.error("Failed to fetch products:", err)
        setBundles(FALLBACK_BUNDLES)
        setUsingFallback(true)
        setError("Could not load live prices. Showing default prices.")
        toast.error("Using default prices — live prices unavailable")
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const networkKeys = useMemo(() => {
    return Object.keys(bundles).length > 0
      ? Object.keys(bundles)
      : Object.keys(FALLBACK_BUNDLES)
  }, [bundles])

  const config = NETWORK_CONFIG[activeTab] || NETWORK_CONFIG.YELLO

  return (
    <div className="bg-[#0A0A0A]">
      {/* ─── Header ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-12 md:py-20">
        {/* Grid background */}
        <div className="absolute inset-0 hero-grid-bg opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] via-transparent to-[#0A0A0A]" />

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#171717] border border-[#2A2A2A] mb-6">
            <Wifi className="w-4 h-4 text-[#00E5FF]" />
            <span className="text-sm text-gray-400">All Networks Supported</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Affordable Data Bundles in Ghana
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg mb-3">
            Compare and buy MTN, Telecel & AirtelTigo data bundles at the best prices.
            Instant delivery, 24/7 availability.
          </p>

          {usingFallback && !loading && (
            <div className="mt-4 inline-flex items-center gap-2 text-xs bg-[#FFC107]/10 border border-[#FFC107]/20 px-4 py-2 rounded-full">
              <AlertCircle className="w-3.5 h-3.5 text-[#FFC107]" />
              <span className="text-[#FFC107]">Showing standard pricing</span>
            </div>
          )}
        </div>
      </section>

      {/* ─── Network Tabs + Bundle Grid ─────────────────────── */}
      <section className="py-8 md:py-14">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {/* Network Tabs */}
            <div className="flex justify-center mb-10">
              <TabsList className="bg-[#171717] border border-[#2A2A2A] p-1 h-auto gap-1">
                {networkKeys.map((key) => {
                  const nc = NETWORK_CONFIG[key]
                  if (!nc) return null
                  return (
                    <TabsTrigger
                      key={key}
                      value={key}
                      className="px-5 py-2.5 text-sm font-semibold data-[state=active]:bg-[#1F1F1F] data-[state=active]:text-white text-gray-400 data-[state=active]:border data-[state=active]:border-[#2A2A2A] rounded-lg transition-all"
                    >
                      <span
                        className="w-3 h-3 rounded-full mr-2 inline-block"
                        style={{ backgroundColor: nc.color }}
                      />
                      {nc.tabLabel}
                    </TabsTrigger>
                  )
                })}
              </TabsList>
            </div>

            {/* Tab Contents */}
            {networkKeys.map((key) => {
              const nc = NETWORK_CONFIG[key] || NETWORK_CONFIG.YELLO
              const tabBundles = (bundles[key] || []).sort((a, b) => a.capacity - b.capacity)

              return (
                <TabsContent key={key} value={key}>
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                      <RefreshCw className="w-8 h-8 text-[#00E5FF] animate-spin mb-4" />
                      <p className="text-gray-400">Loading {nc.label} bundles...</p>
                    </div>
                  ) : tabBundles.length === 0 ? (
                    <div className="text-center py-20">
                      <Package className="w-12 h-12 text-[#2A2A2A] mx-auto mb-4" />
                      <p className="text-gray-400">No bundles available for {nc.label}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 max-w-6xl mx-auto">
                      {tabBundles.map((bundle, idx) => {
                        const perGB = bundle.capacity > 0 ? bundle.price / bundle.capacity : 0
                        const agentPrice = isAgent ? +(bundle.price * 0.9).toFixed(2) : null
                        const isBestValue = perGB <= 5

                        return (
                          <Card
                            key={idx}
                            className="premium-card bg-[#171717] border-[#2A2A2A] rounded-2xl overflow-hidden group cursor-pointer"
                            onClick={() => navigate("buy-data")}
                          >
                            <CardContent className="p-0">
                              {/* Network Color Strip */}
                              <div
                                className="h-1.5 data-flow-line"
                                style={{ backgroundColor: nc.color }}
                              />

                              <div className="p-5">
                                {/* Network Badge + Best Value */}
                                <div className="flex items-center justify-between mb-4">
                                  <Badge className={`${nc.badgeClass} text-xs font-semibold border-0`}>
                                    {nc.label}
                                  </Badge>
                                  {isBestValue && (
                                    <Badge className="bg-[#22C55E]/15 text-[#22C55E] text-[10px] border-0 font-semibold">
                                      <Zap className="w-3 h-3 mr-1" />
                                      Best Value
                                    </Badge>
                                  )}
                                </div>

                                {/* Data Amount */}
                                <div className="mb-4">
                                  <span className="text-4xl font-bold text-white">
                                    {bundle.capacity}
                                  </span>
                                  <span className="text-xl font-semibold text-gray-400 ml-1">
                                    GB
                                  </span>
                                </div>

                                {/* Price */}
                                <div className="mb-1">
                                  <span className="text-2xl font-bold text-[#22C55E]">
                                    GHS {bundle.price.toFixed(2)}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 mb-4">
                                  GHS {perGB.toFixed(2)}/GB
                                </p>

                                {/* Agent Price */}
                                {isAgent && agentPrice && (
                                  <div className="mb-4 p-2.5 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20">
                                    <p className="text-xs text-[#22C55E] font-medium mb-0.5">
                                      Agent Price
                                    </p>
                                    <p className="text-lg font-bold text-[#22C55E]">
                                      GHS {agentPrice.toFixed(2)}
                                    </p>
                                  </div>
                                )}

                                {/* Buy Button */}
                                <Button
                                  className="w-full btn-primary-green rounded-xl font-semibold"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    navigate("buy-data")
                                    toast.success("Select your network and data amount")
                                  }}
                                >
                                  <ShoppingBag className="w-4 h-4 mr-2" />
                                  Buy Now
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  )}
                </TabsContent>
              )
            })}
          </Tabs>
        </div>
      </section>

      {/* ─── Error Banner ───────────────────────────────────── */}
      {error && (
        <div className="container mx-auto px-4 mb-8">
          <div className="max-w-2xl mx-auto glass-card rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#FFC107] shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-[#FFC107] text-sm">{error}</p>
              <p className="text-gray-400 text-xs mt-1">
                Prices shown are standard rates. Live prices may vary.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─── Why Choose Us ──────────────────────────────────── */}
      <section className="py-12 border-t border-[#2A2A2A]">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10">
            Why Choose Dataghmart?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: Zap,
                title: "Instant Delivery",
                desc: "Data delivered in under 30 seconds after payment confirmation",
                color: "#FFC107",
              },
              {
                icon: CheckCircle2,
                title: "Best Prices",
                desc: "We negotiate directly with networks to bring you the lowest prices",
                color: "#22C55E",
              },
              {
                icon: Wifi,
                title: "All Networks",
                desc: "MTN, Telecel, and AirtelTigo data bundles available 24/7",
                color: "#00E5FF",
              },
              {
                icon: ShoppingBag,
                title: "Secure Payment",
                desc: "Mobile money and card payments processed with bank-level security",
                color: "#FFC107",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="glass-card rounded-2xl p-6 text-center hover:border-[#00E5FF]/30 transition-all duration-300"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: `${item.color}15` }}
                >
                  <item.icon className="w-6 h-6" style={{ color: item.color }} />
                </div>
                <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Bulk Purchase CTA ──────────────────────────────── */}
      <section className="py-16 border-t border-[#2A2A2A]">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#FFC107]/10 flex items-center justify-center mx-auto mb-6">
              <Package className="w-8 h-8 text-[#FFC107]" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Need Bulk Data?
            </h2>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Contact us for wholesale pricing on large data purchases. Perfect for businesses,
              organizations, and events.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                className="btn-primary-yellow font-semibold rounded-xl"
                onClick={() => navigate("agent-register")}
              >
                Register as Agent
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-[#2A2A2A] text-gray-300 hover:text-white hover:bg-[#1F1F1F] rounded-xl gap-2"
                onClick={() => navigate("contact")}
              >
                <MessageSquare className="w-4 h-4" />
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
