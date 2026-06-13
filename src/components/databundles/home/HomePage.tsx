"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Wifi,
  Zap,
  Shield,
  ArrowRight,
  Smartphone,
  CheckCircle,
  Phone,
  Clock,
  BarChart3,
  Users,
  Truck,
  Headphones,
  Lock,
  BadgeCheck,
  CreditCard,
  ChevronRight,
  Star,
  TrendingUp,
  Globe,
  Signal,
  Package,
} from "lucide-react"
import { useAppStore } from "@/store/useAppStore"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// ─── Network Config ─────────────────────────────────────────────
const NETWORKS = [
  {
    name: "MTN",
    code: "YELLO",
    color: "#FFC107",
    bgColor: "rgba(255, 193, 7, 0.1)",
    borderColor: "rgba(255, 193, 7, 0.3)",
    tagline: "Ghana's #1 Network",
  },
  {
    name: "Telecel",
    code: "TELECEL",
    color: "#FF4444",
    bgColor: "rgba(230, 0, 0, 0.1)",
    borderColor: "rgba(230, 0, 0, 0.3)",
    tagline: "Formerly Vodafone",
  },
  {
    name: "AirtelTigo",
    code: "AT_PREMIUM",
    color: "#4499FF",
    bgColor: "rgba(0, 102, 204, 0.1)",
    borderColor: "rgba(0, 102, 204, 0.3)",
    tagline: "AT Premium Data",
  },
]

// ─── Featured Bundles ───────────────────────────────────────────
const FEATURED_BUNDLES = [
  { network: "MTN", capacity: 1, price: 5, unit: "GB" },
  { network: "MTN", capacity: 2, price: 10, unit: "GB" },
  { network: "MTN", capacity: 5, price: 24, unit: "GB" },
  { network: "Telecel", capacity: 1, price: 4.5, unit: "GB" },
  { network: "Telecel", capacity: 2, price: 9, unit: "GB" },
  { network: "Telecel", capacity: 5, price: 22, unit: "GB" },
  { network: "AirtelTigo", capacity: 1, price: 5, unit: "GB" },
  { network: "AirtelTigo", capacity: 2, price: 10, unit: "GB" },
]

const STATS = [
  { label: "Orders Delivered", value: "50,000+", icon: Package },
  { label: "Active Agents", value: "500+", icon: Users },
  { label: "Instant Delivery", value: "<30s", icon: Zap },
  { label: "Network Coverage", value: "99.9%", icon: Signal },
]

const FEATURES = [
  {
    icon: Zap,
    title: "Instant Delivery",
    desc: "Data bundles delivered in seconds. No waiting, no delays — your data is active immediately after purchase.",
    color: "#22C55E",
  },
  {
    icon: Shield,
    title: "Secure Payments",
    desc: "Pay securely via Mobile Money or card. All transactions are encrypted and protected with bank-grade security.",
    color: "#FFC107",
  },
  {
    icon: Smartphone,
    title: "All Networks",
    desc: "Buy data for MTN, Telecel, and AirtelTigo. One platform for all your data bundle needs in Ghana.",
    color: "#00E5FF",
  },
  {
    icon: TrendingUp,
    title: "Best Prices",
    desc: "Competitive wholesale pricing. Save more on every data bundle purchase compared to traditional channels.",
    color: "#22C55E",
  },
  {
    icon: Users,
    title: "Agent Program",
    desc: "Earn commissions as a reseller. Get API access, white-label solutions, and wholesale pricing tiers.",
    color: "#FFC107",
  },
  {
    icon: Truck,
    title: "Live Tracking",
    desc: "Track your data delivery in real-time. Full transparency from order placement to delivery confirmation.",
    color: "#00E5FF",
  },
]

const HOW_IT_WORKS = [
  {
    step: 1,
    title: "Choose Your Bundle",
    desc: "Select from MTN, Telecel, or AirtelTigo data packages at the best prices in Ghana.",
    icon: Wifi,
  },
  {
    step: 2,
    title: "Enter Phone Number",
    desc: "Provide the recipient phone number. You can buy for yourself or send data to anyone.",
    icon: Phone,
  },
  {
    step: 3,
    title: "Pay & Receive Instantly",
    desc: "Complete payment via Mobile Money or card. Data is delivered and activated in seconds.",
    icon: CheckCircle,
  },
]

const TESTIMONIALS = [
  {
    name: "Kwame A.",
    role: "MTN User",
    text: "Fastest data delivery I've ever experienced. My MTN data was active before I could even check my phone!",
    rating: 5,
  },
  {
    name: "Ama M.",
    role: "Telecel User",
    text: "Best prices for Telecel data bundles. I save at least 10% compared to buying directly from the network.",
    rating: 5,
  },
  {
    name: "Kofi B.",
    role: "Agent",
    text: "The agent program is amazing. I earn commissions on every sale and the API integration was seamless.",
    rating: 5,
  },
]

export default function HomePage() {
  const navigate = useAppStore((s) => s.navigate)
  const [deliveryData, setDeliveryData] = useState<{ pending: number; processing: number; completed: number; failed: number } | null>(null)
  const [liveOrderCount, setLiveOrderCount] = useState(0)

  // Fetch live delivery tracker
  useEffect(() => {
    const fetchTracker = async () => {
      try {
        const res = await fetch("/api/datamart/delivery-tracker?public=true")
        if (res.ok) {
          const data = await res.json()
          if (data.tracker) {
            setDeliveryData(data.tracker)
          }
        }
      } catch {
        // Silently fail — use fallback
      }
    }
    fetchTracker()
    const interval = setInterval(fetchTracker, 30000)
    return () => clearInterval(interval)
  }, [])

  // Animated counter
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveOrderCount((prev) => prev + Math.floor(Math.random() * 3))
    }, 2000)
    return () => clearInterval(timer)
  }, [])

  const getNetworkConfig = (name: string) => NETWORKS.find((n) => n.name === name) || NETWORKS[0]

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* ═══════════════ HERO SECTION ═══════════════ */}
      <section className="relative overflow-hidden hero-gradient">
        {/* Animated grid background */}
        <div className="absolute inset-0 hero-grid-bg opacity-50" />

        {/* Floating glow orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#00E5FF]/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#FFC107]/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-[#22C55E]/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />

        <div className="relative container mx-auto px-4 py-16 md:py-24 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/30 mb-6 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
              <span className="text-[#22C55E] text-sm font-medium">
                {deliveryData ? `${deliveryData.completed}+ orders delivered today` : "Live — Instant Data Delivery"}
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight animate-slide-in-up">
              Buy Data Bundles{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22C55E] to-[#00E5FF]">
                Instantly
              </span>{" "}
              Across Ghana
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl mx-auto animate-slide-in-up" style={{ animationDelay: "0.2s" }}>
              Fast Delivery • Trusted Service • Agent Opportunities • Live Order Tracking
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-slide-in-up" style={{ animationDelay: "0.4s" }}>
              <button
                onClick={() => navigate("buy-data")}
                className="btn-primary-green px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-2 animate-pulse-glow-green"
              >
                <Wifi className="w-5 h-5" />
                Buy Data Now
              </button>
              <button
                onClick={() => navigate("agent-register")}
                className="btn-primary-yellow px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-2"
              >
                <Zap className="w-5 h-5" />
                Become an Agent
              </button>
            </div>

            {/* Live Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto animate-slide-in-up" style={{ animationDelay: "0.6s" }}>
              {STATS.map((stat) => (
                <div key={stat.label} className="glass-card rounded-xl p-3 text-center">
                  <stat.icon className="w-5 h-5 text-[#00E5FF] mx-auto mb-1" />
                  <div className="text-xl md:text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Data flow line at bottom */}
        <div className="data-flow-line h-[1px]" />
      </section>

      {/* ═══════════════ NETWORK CARDS ═══════════════ */}
      <section className="py-16 md:py-20 bg-[#0A0A0A]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Choose Your <span className="text-[#00E5FF]">Network</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              We support all major networks in Ghana. Select your provider and browse affordable data bundle packages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {NETWORKS.map((net) => (
              <button
                key={net.code}
                onClick={() => navigate("buy-data")}
                className="glass-card rounded-2xl p-6 text-center transition-all duration-300 hover:scale-[1.02] group"
                style={{ borderColor: net.borderColor }}
              >
                <div
                  className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-2xl font-bold"
                  style={{ backgroundColor: net.bgColor, color: net.color }}
                >
                  {net.name[0]}
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{net.name}</h3>
                <p className="text-sm text-gray-500 mb-3">{net.tagline}</p>
                <div className="flex items-center justify-center gap-1 text-sm font-medium group-hover:gap-2 transition-all" style={{ color: net.color }}>
                  View Bundles <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ FEATURED BUNDLES ═══════════════ */}
      <section className="py-16 md:py-20 bg-[#0A0A0A] border-t border-[#1A1A1A]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Popular <span className="text-[#FFC107]">Data Bundles</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Affordable MTN, Telecel, and AirtelTigo data packages with instant delivery across Ghana.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {FEATURED_BUNDLES.map((bundle, i) => {
              const net = getNetworkConfig(bundle.network)
              return (
                <button
                  key={i}
                  onClick={() => navigate("buy-data")}
                  className="premium-card rounded-xl p-5 text-left bg-[#171717] group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="px-2.5 py-1 rounded-md text-xs font-semibold"
                      style={{ backgroundColor: net.bgColor, color: net.color }}
                    >
                      {bundle.network}
                    </span>
                    <CheckCircle className="w-4 h-4 text-[#22C55E]" />
                  </div>
                  <div className="mb-2">
                    <span className="text-3xl font-bold text-white">{bundle.capacity}</span>
                    <span className="text-lg text-gray-400 ml-1">{bundle.unit}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold" style={{ color: net.color }}>
                      GH₵{bundle.price.toFixed(2)}
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-[#00E5FF] transition-colors" />
                  </div>
                </button>
              )
            })}
          </div>

          <div className="text-center mt-8">
            <button
              onClick={() => navigate("bundles")}
              className="inline-flex items-center gap-2 text-[#00E5FF] hover:text-[#00E5FF]/80 font-medium transition-colors"
            >
              View All Data Bundles <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════ HOW IT WORKS ═══════════════ */}
      <section className="py-16 md:py-20 bg-[#0A0A0A] border-t border-[#1A1A1A]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              How It <span className="text-[#22C55E]">Works</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Buy data bundles in 3 simple steps. No registration required for one-time purchases.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00E5FF]/10 to-[#00E5FF]/5 border border-[#00E5FF]/20 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-7 h-7 text-[#00E5FF]" />
                </div>
                <div className="text-sm font-bold text-[#FFC107] mb-2">Step {item.step}</div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ FEATURES ═══════════════ */}
      <section className="py-16 md:py-20 bg-[#0A0A0A] border-t border-[#1A1A1A]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Why Choose <span className="text-[#FFC107]">Dataghmart</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              The most trusted platform for buying affordable data bundles in Ghana with instant delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {FEATURES.map((feature, i) => (
              <div key={i} className="glass-card rounded-xl p-6 group hover:border-[#00E5FF]/30 transition-all duration-300">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${feature.color}15`, color: feature.color }}
                >
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ LIVE TRACKER WIDGET ═══════════════ */}
      {deliveryData && (
        <section className="py-16 md:py-20 bg-[#0A0A0A] border-t border-[#1A1A1A]">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="glass-card-cyan rounded-2xl p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 rounded-full bg-[#22C55E] animate-pulse" />
                  <h2 className="text-xl font-bold text-white">Live Delivery Tracker</h2>
                  <span className="text-xs text-gray-500 ml-auto">Updates every 30s</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-[#0A0A0A] rounded-xl p-4 text-center border border-[#2A2A2A]">
                    <Clock className="w-5 h-5 text-[#FFC107] mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{deliveryData.pending || 0}</div>
                    <div className="text-xs text-gray-500">Pending</div>
                  </div>
                  <div className="bg-[#0A0A0A] rounded-xl p-4 text-center border border-[#2A2A2A]">
                    <Truck className="w-5 h-5 text-[#00E5FF] mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{deliveryData.processing || 0}</div>
                    <div className="text-xs text-gray-500">Processing</div>
                  </div>
                  <div className="bg-[#0A0A0A] rounded-xl p-4 text-center border border-[#22C55E]/20">
                    <CheckCircle className="w-5 h-5 text-[#22C55E] mx-auto mb-2" />
                    <div className="text-2xl font-bold text-[#22C55E]">{deliveryData.completed || 0}</div>
                    <div className="text-xs text-gray-500">Delivered</div>
                  </div>
                  <div className="bg-[#0A0A0A] rounded-xl p-4 text-center border border-[#2A2A2A]">
                    <Shield className="w-5 h-5 text-red-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{deliveryData.failed || 0}</div>
                    <div className="text-xs text-gray-500">Failed</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════ TESTIMONIALS ═══════════════ */}
      <section className="py-16 md:py-20 bg-[#0A0A0A] border-t border-[#1A1A1A]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              What Our <span className="text-[#22C55E]">Customers</span> Say
            </h2>
            <p className="text-gray-400">Trusted by thousands of Ghanaians for affordable data bundle purchases.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="glass-card rounded-xl p-6">
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-[#FFC107] text-[#FFC107]" />
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FFC107] to-[#E5AC00] flex items-center justify-center text-sm font-bold text-[#0A0A0A]">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{t.name}</div>
                    <div className="text-xs text-gray-500">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ AGENT CTA ═══════════════ */}
      <section className="py-16 md:py-20 bg-[#0A0A0A] border-t border-[#1A1A1A]">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto glass-card rounded-2xl p-8 md:p-12 relative overflow-hidden">
            {/* Glow effect */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFC107]/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#00E5FF]/5 rounded-full blur-3xl" />

            <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <Badge className="bg-[#FFC107]/10 text-[#FFC107] border-[#FFC107]/30 mb-4">💰 Earn Money</Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Become a Data Bundle Agent
                </h2>
                <p className="text-gray-400 mb-6 leading-relaxed">
                  Join Dataghmart&apos;s agent reseller program and earn commissions on every data bundle sale.
                  Get access to wholesale pricing, API integration, white-label solutions, and a dedicated agent dashboard.
                  Registration is <span className="text-[#22C55E] font-bold">FREE</span> — powered by DataMart API.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => navigate("agent-register")}
                    className="btn-primary-yellow px-6 py-3 rounded-xl font-semibold flex items-center gap-2"
                  >
                    <Zap className="w-5 h-5" />
                    Register as Agent — Free
                  </button>
                  <button
                    onClick={() => navigate("how-it-works")}
                    className="px-6 py-3 rounded-xl font-medium text-gray-400 hover:text-white border border-[#2A2A2A] hover:border-[#FFC107]/30 transition-all"
                  >
                    Learn More
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="glass-card rounded-xl p-4 text-center">
                  <CreditCard className="w-6 h-6 text-[#FFC107] mx-auto mb-2" />
                  <div className="text-sm font-medium text-white">Wallet System</div>
                  <div className="text-xs text-gray-500">Fund & withdraw</div>
                </div>
                <div className="glass-card rounded-xl p-4 text-center">
                  <BarChart3 className="w-6 h-6 text-[#22C55E] mx-auto mb-2" />
                  <div className="text-sm font-medium text-white">Commissions</div>
                  <div className="text-xs text-gray-500">Earn per sale</div>
                </div>
                <div className="glass-card rounded-xl p-4 text-center">
                  <Globe className="w-6 h-6 text-[#00E5FF] mx-auto mb-2" />
                  <div className="text-sm font-medium text-white">API Access</div>
                  <div className="text-xs text-gray-500">Integrate & sell</div>
                </div>
                <div className="glass-card rounded-xl p-4 text-center">
                  <BadgeCheck className="w-6 h-6 text-[#FFC107] mx-auto mb-2" />
                  <div className="text-sm font-medium text-white">White-Label</div>
                  <div className="text-xs text-gray-500">Your own brand</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ SEO CONTENT ═══════════════ */}
      <section className="py-16 md:py-20 bg-[#0A0A0A] border-t border-[#1A1A1A]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto prose prose-invert">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
              Buy Affordable Data Bundles Online in Ghana
            </h2>
            <div className="text-gray-400 space-y-4 text-sm leading-relaxed">
              <p>
                <strong className="text-white">Dataghmart Data Bundles</strong> is Ghana&apos;s most trusted platform for buying affordable data bundles online.
                Whether you need MTN data bundles, Telecel data packages, or AirtelTigo data plans, we offer the best prices with instant delivery across all networks in Ghana.
              </p>
              <p>
                Our platform provides cheap data bundles for MTN Ghana, Telecel Ghana (formerly Vodafone), and AirtelTigo with real-time delivery tracking.
                Buy data online using Mobile Money (MoMo) or card payment and receive your data bundle instantly. No more waiting in line or dealing with slow delivery.
              </p>
              <p>
                Looking to earn extra income? Join our data bundle agent reseller program and start earning commissions today.
                As a Dataghmart agent, you get wholesale pricing on all data bundles, API access for integration, white-label solutions, and a dedicated dashboard to manage your business.
                Agent registration is free — start selling data bundles and earning money immediately via DataMart API.
              </p>
              <p>
                Dataghmart Data Bundles — Ghana&apos;s Trusted Platform for Affordable Data Bundles, Instant Delivery, MTN, Telecel, AirtelTigo Data Packages, and Agent Reseller Opportunities.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
