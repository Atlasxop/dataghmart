"use client"

import { useState, useEffect } from "react"
import {
  DollarSign,
  Check,
  ArrowRight,
  Zap,
  Crown,
  Star,
  Award,
  Trophy,
  HelpCircle,
  Wifi,
  Shield,
} from "lucide-react"
import { useAppStore } from "@/store/useAppStore"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

// ─── Types ─────────────────────────────────────────────────────
interface BundleItem {
  capacity: number
  price: number
}

interface NetworkBundles {
  [key: string]: BundleItem[]
}

// ─── Fallback Bundle Data ──────────────────────────────────────
const FALLBACK_BUNDLES: NetworkBundles = {
  YELLO: [
    { capacity: 1, price: 5 },
    { capacity: 2, price: 10 },
    { capacity: 5, price: 24 },
    { capacity: 10, price: 47 },
    { capacity: 20, price: 92 },
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

// ─── Agent Tiers ───────────────────────────────────────────────
const AGENT_TIERS = [
  {
    name: "Bronze",
    discount: 3,
    icon: Shield,
    color: "#CD7F32",
    requirements: "0-50 orders/month",
    benefits: ["3% commission on sales", "Basic dashboard", "Email support", "Monthly payouts"],
  },
  {
    name: "Silver",
    discount: 5,
    icon: Star,
    color: "#C0C0C0",
    requirements: "51-200 orders/month",
    benefits: ["5% commission on sales", "Advanced analytics", "Priority support", "Weekly payouts", "API access"],
  },
  {
    name: "Gold",
    discount: 8,
    icon: Award,
    color: "#FFC107",
    requirements: "201-500 orders/month",
    benefits: [
      "8% commission on sales",
      "Full analytics suite",
      "24/7 dedicated support",
      "Daily payouts",
      "API access",
      "White-label option",
    ],
  },
  {
    name: "Platinum",
    discount: 10,
    icon: Crown,
    color: "#00E5FF",
    requirements: "500+ orders/month",
    benefits: [
      "10% commission on sales",
      "Enterprise dashboard",
      "Dedicated account manager",
      "Instant payouts",
      "Full API access",
      "White-label solution",
      "Custom pricing",
    ],
  },
]

// ─── Pricing FAQ ───────────────────────────────────────────────
const PRICING_FAQ = [
  {
    q: "Are there any hidden fees?",
    a: "No. The price you see is the price you pay. There are no hidden charges or service fees.",
  },
  {
    q: "Do prices change depending on time of day?",
    a: "No. Our prices remain the same 24/7. You get the same great rates anytime you purchase.",
  },
  {
    q: "How do agent discounts work?",
    a: "Agents get a commission on every sale based on their tier. The discount is automatically applied to your agent pricing when you make a purchase through the agent portal.",
  },
  {
    q: "Can I get a refund if I find a cheaper price?",
    a: "We strive to offer the most competitive prices in Ghana. If you find a lower price elsewhere within 24 hours, contact us and we will match it or refund the difference.",
  },
]

// ─── Component ─────────────────────────────────────────────────
export default function PricingPage() {
  const navigate = useAppStore((s) => s.navigate)
  const [bundles, setBundles] = useState<NetworkBundles>(FALLBACK_BUNDLES)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/datamart/products")
        if (!res.ok) return
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
                items.push({ capacity: p.capacity, price: p.sellingPrice || p.basePrice })
              }
            }
            if (networkData.dataPackages?.length) {
              for (const p of networkData.dataPackages) {
                if (!items.find((i) => i.capacity === p.capacity)) {
                  items.push({ capacity: p.capacity, price: p.sellingPrice || p.price })
                }
              }
            }
            if (items.length > 0) {
              liveBundles[networkCode] = items.sort((a, b) => a.capacity - b.capacity)
            }
          }
          if (Object.keys(liveBundles).length > 0) {
            setBundles(liveBundles)
          }
        }
      } catch {
        // Use fallback
      }
    }
    fetchProducts()
  }, [])

  // ─── Get comparison data ──────────────────────────────────
  const mtnBundles = bundles.YELLO || FALLBACK_BUNDLES.YELLO
  const telecelBundles = bundles.TELECEL || FALLBACK_BUNDLES.TELECEL
  const atBundles = bundles.AT_PREMIUM || FALLBACK_BUNDLES.AT_PREMIUM

  const allCapacities = Array.from(
    new Set([
      ...mtnBundles.map((b) => b.capacity),
      ...telecelBundles.map((b) => b.capacity),
      ...atBundles.map((b) => b.capacity),
    ])
  ).sort((a, b) => a - b)

  function getBundlePrice(networkBundles: BundleItem[], capacity: number): number | null {
    const bundle = networkBundles.find((b) => b.capacity === capacity)
    return bundle ? bundle.price : null
  }

  function getBestPrice(capacity: number): number | null {
    const prices = [mtnBundles, telecelBundles, atBundles]
      .map((n) => getBundlePrice(n, capacity))
      .filter((p): p is number => p !== null)
    return prices.length > 0 ? Math.min(...prices) : null
  }

  return (
    <div className="bg-[#0A0A0A]">
      {/* ─── Header ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-12 md:py-20">
        <div className="absolute inset-0 hero-grid-bg opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] via-transparent to-[#0A0A0A]" />

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#171717] border border-[#2A2A2A] mb-6">
            <DollarSign className="w-4 h-4 text-[#22C55E]" />
            <span className="text-sm text-gray-400">Transparent Pricing</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Data Bundle Prices in Ghana
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Compare prices across all networks. No hidden fees, no surprises — just the best
            deals on MTN, Telecel, and AirtelTigo data.
          </p>
        </div>
      </section>

      {/* ─── Price Comparison Table ──────────────────────────── */}
      <section className="py-8 md:py-14">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-white text-center mb-8">
              Price Comparison — MTN vs Telecel vs AirtelTigo
            </h2>

            <div className="glass-card rounded-2xl overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-4 gap-0 border-b border-[#2A2A2A] bg-[#1A1A1A]">
                <div className="p-4 text-sm font-semibold text-gray-400">Data Amount</div>
                <div className="p-4 text-center">
                  <Badge className="badge-mtn border-0 text-sm font-semibold">MTN</Badge>
                </div>
                <div className="p-4 text-center">
                  <Badge className="badge-telecel border-0 text-sm font-semibold">Telecel</Badge>
                </div>
                <div className="p-4 text-center">
                  <Badge className="badge-airteltigo border-0 text-sm font-semibold">AirtelTigo</Badge>
                </div>
              </div>

              {/* Table Rows */}
              {allCapacities.map((capacity, idx) => {
                const mtnPrice = getBundlePrice(mtnBundles, capacity)
                const telecelPrice = getBundlePrice(telecelBundles, capacity)
                const atPrice = getBundlePrice(atBundles, capacity)
                const bestPrice = getBestPrice(capacity)

                return (
                  <div
                    key={capacity}
                    className={`grid grid-cols-4 gap-0 border-b border-[#2A2A2A] ${
                      idx % 2 === 0 ? "bg-transparent" : "bg-[#1A1A1A]/50"
                    }`}
                  >
                    <div className="p-4">
                      <span className="text-white font-semibold">{capacity} GB</span>
                    </div>
                    <div className="p-4 text-center">
                      {mtnPrice !== null ? (
                        <div className="flex flex-col items-center">
                          <span
                            className={`text-sm font-semibold ${
                              mtnPrice === bestPrice ? "text-[#22C55E]" : "text-white"
                            }`}
                          >
                            GHS {mtnPrice.toFixed(2)}
                          </span>
                          <span
                            className={`text-xs ${
                              mtnPrice === bestPrice ? "text-[#22C55E]/70" : "text-gray-500"
                            }`}
                          >
                            GHS {(mtnPrice / capacity).toFixed(2)}/GB
                          </span>
                          {mtnPrice === bestPrice && (
                            <Badge className="mt-1 bg-[#22C55E]/15 text-[#22C55E] text-[10px] border-0">
                              Best Value
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-600 text-sm">—</span>
                      )}
                    </div>
                    <div className="p-4 text-center">
                      {telecelPrice !== null ? (
                        <div className="flex flex-col items-center">
                          <span
                            className={`text-sm font-semibold ${
                              telecelPrice === bestPrice ? "text-[#22C55E]" : "text-white"
                            }`}
                          >
                            GHS {telecelPrice.toFixed(2)}
                          </span>
                          <span
                            className={`text-xs ${
                              telecelPrice === bestPrice ? "text-[#22C55E]/70" : "text-gray-500"
                            }`}
                          >
                            GHS {(telecelPrice / capacity).toFixed(2)}/GB
                          </span>
                          {telecelPrice === bestPrice && (
                            <Badge className="mt-1 bg-[#22C55E]/15 text-[#22C55E] text-[10px] border-0">
                              Best Value
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-600 text-sm">—</span>
                      )}
                    </div>
                    <div className="p-4 text-center">
                      {atPrice !== null ? (
                        <div className="flex flex-col items-center">
                          <span
                            className={`text-sm font-semibold ${
                              atPrice === bestPrice ? "text-[#22C55E]" : "text-white"
                            }`}
                          >
                            GHS {atPrice.toFixed(2)}
                          </span>
                          <span
                            className={`text-xs ${
                              atPrice === bestPrice ? "text-[#22C55E]/70" : "text-gray-500"
                            }`}
                          >
                            GHS {(atPrice / capacity).toFixed(2)}/GB
                          </span>
                          {atPrice === bestPrice && (
                            <Badge className="mt-1 bg-[#22C55E]/15 text-[#22C55E] text-[10px] border-0">
                              Best Value
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-600 text-sm">—</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
              <Button
                size="lg"
                className="btn-primary-green rounded-xl font-semibold px-8"
                onClick={() => navigate("buy-data")}
              >
                <Wifi className="w-5 h-5 mr-2" />
                Buy Data Now
              </Button>
              <Button
                size="lg"
                className="btn-primary-yellow rounded-xl font-semibold px-8"
                onClick={() => navigate("agent-register")}
              >
                <Zap className="w-5 h-5 mr-2" />
                Become an Agent
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Agent Discount Tiers ────────────────────────────── */}
      <section className="py-14 border-t border-[#2A2A2A]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Agent Pricing Tiers
            </h2>
            <p className="text-gray-400 max-w-lg mx-auto">
              Join our agent program and earn commissions on every data bundle sale. Higher tiers
              unlock better discounts and exclusive features.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {AGENT_TIERS.map((tier) => {
              const TierIcon = tier.icon
              return (
                <Card
                  key={tier.name}
                  className="premium-card bg-[#171717] border-[#2A2A2A] rounded-2xl overflow-hidden"
                >
                  <CardContent className="p-6">
                    <div className="text-center mb-6">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                        style={{ backgroundColor: `${tier.color}15` }}
                      >
                        <TierIcon className="w-7 h-7" style={{ color: tier.color }} />
                      </div>
                      <h3 className="text-white text-xl font-bold">{tier.name}</h3>
                      <p className="text-[#22C55E] text-2xl font-bold mt-1">{tier.discount}% OFF</p>
                      <p className="text-gray-500 text-xs mt-1">{tier.requirements}</p>
                    </div>

                    <Separator className="my-4 bg-[#2A2A2A]" />

                    <ul className="space-y-2.5">
                      {tier.benefits.map((benefit) => (
                        <li key={benefit} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
                          <span className="text-gray-300">{benefit}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className="w-full mt-6 rounded-xl font-semibold border-0"
                      style={{ backgroundColor: `${tier.color}20`, color: tier.color }}
                      onClick={() => {
                        navigate("agent-register")
                        toast.success(`Join as a ${tier.name} Agent`)
                      }}
                    >
                      Join {tier.name}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="text-center mt-8">
            <Button
              size="lg"
              className="btn-primary-yellow rounded-xl font-semibold"
              onClick={() => navigate("agent-register")}
            >
              <Trophy className="w-5 h-5 mr-2" />
              Start Your Agent Journey — Free Registration
            </Button>
          </div>
        </div>
      </section>

      {/* ─── Pricing FAQ ─────────────────────────────────────── */}
      <section className="py-14 border-t border-[#2A2A2A]">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-white text-center mb-8">
              Pricing FAQ
            </h2>

            <div className="space-y-3">
              {PRICING_FAQ.map((faq, idx) => (
                <div key={idx} className="glass-card rounded-xl overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between p-5 text-left"
                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  >
                    <span className="text-white font-medium pr-4">{faq.q}</span>
                    <HelpCircle
                      className={`w-5 h-5 text-[#00E5FF] shrink-0 transition-transform duration-300 ${
                        expandedFaq === idx ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {expandedFaq === idx && (
                    <div className="px-5 pb-5 animate-fade-in">
                      <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
