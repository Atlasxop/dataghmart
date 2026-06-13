"use client"

import {
  Info,
  Target,
  Heart,
  Users,
  Zap,
  Shield,
  Globe,
  Award,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Clock,
  Wifi,
} from "lucide-react"
import { useAppStore } from "@/store/useAppStore"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

// ─── Stats ─────────────────────────────────────────────────────
const STATS = [
  { label: "Orders Delivered", value: "50,000+", icon: Zap, color: "#FFC107" },
  { label: "Active Agents", value: "1,200+", icon: Users, color: "#22C55E" },
  { label: "Uptime", value: "99.9%", icon: Clock, color: "#00E5FF" },
  { label: "Networks", value: "3", icon: Wifi, color: "#FFC107" },
]

// ─── Values ────────────────────────────────────────────────────
const VALUES = [
  {
    icon: Target,
    title: "Mission-Driven",
    description: "We believe every Ghanaian deserves affordable, reliable internet access. Our mission drives every decision we make.",
    color: "#FFC107",
  },
  {
    icon: Shield,
    title: "Trust & Transparency",
    description: "No hidden fees, no surprises. We are upfront about our pricing and deliver exactly what we promise.",
    color: "#22C55E",
  },
  {
    icon: Heart,
    title: "Customer First",
    description: "Our customers are at the heart of everything we do. From instant delivery to 24/7 support, your satisfaction is our priority.",
    color: "#EF4444",
  },
  {
    icon: Globe,
    title: "Nationwide Reach",
    description: "Whether you are in Accra, Kumasi, Tamale, or anywhere in Ghana, our platform delivers data to your phone instantly.",
    color: "#00E5FF",
  },
]

// ─── Team Members ──────────────────────────────────────────────
const TEAM = [
  { name: "Kwame Asante", role: "Founder & CEO", initial: "KA" },
  { name: "Ama Mensah", role: "Head of Operations", initial: "AM" },
  { name: "Kofi Boateng", role: "Lead Developer", initial: "KB" },
  { name: "Abena Osei", role: "Customer Success", initial: "AO" },
]

// ─── Why Choose Dataghmart ─────────────────────────────────────
const WHY_CHOOSE = [
  "Instant data delivery within 30 seconds",
  "Competitive prices across all networks",
  "100% delivery guarantee with full refunds",
  "Secure payment with bank-level encryption",
  "24/7 customer support via multiple channels",
  "Agent program with commissions up to 10%",
  "API access for business integration",
  "White-label solutions for resellers",
]

// ─── Component ─────────────────────────────────────────────────
export default function AboutPage() {
  const navigate = useAppStore((s) => s.navigate)

  return (
    <div className="bg-[#0A0A0A]">
      {/* ─── Header ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-12 md:py-20">
        <div className="absolute inset-0 hero-grid-bg opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] via-transparent to-[#0A0A0A]" />

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#171717] border border-[#2A2A2A] mb-6">
            <Info className="w-4 h-4 text-[#00E5FF]" />
            <span className="text-sm text-gray-400">Our Story</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            About Dataghmart
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Ghana&apos;s trusted platform for affordable data bundles with instant delivery.
            Connecting Ghanaians to the digital world, one bundle at a time.
          </p>
        </div>
      </section>

      {/* ─── Stats Bar ───────────────────────────────────────── */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {STATS.map((stat) => {
              const StatIcon = stat.icon
              return (
                <div key={stat.label} className="glass-card rounded-2xl p-6 text-center">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                    style={{ backgroundColor: `${stat.color}15` }}
                  >
                    <StatIcon className="w-5 h-5" style={{ color: stat.color }} />
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-white">{stat.value}</p>
                  <p className="text-gray-400 text-xs mt-1">{stat.label}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── Our Story ───────────────────────────────────────── */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Our Story</h2>
                <div className="space-y-4 text-gray-400 text-sm leading-relaxed">
                  <p>
                    Dataghmart was born from a simple observation: buying data bundles in Ghana
                    was often expensive, inconvenient, and unreliable. We set out to change that
                    by building a platform that makes data accessible, affordable, and instantly
                    available to every Ghanaian.
                  </p>
                  <p>
                    Founded in Accra, our team of passionate technologists and telecom experts
                    partnered with all major Ghanaian networks to negotiate the best prices and
                    build an automated delivery system that processes thousands of transactions
                    daily.
                  </p>
                  <p>
                    Today, Dataghmart serves thousands of customers and agents across Ghana,
                    delivering data bundles 24/7 with a 99.9% uptime guarantee and an average
                    delivery time of under 30 seconds.
                  </p>
                </div>
              </div>

              <div className="glass-card rounded-2xl p-8">
                <h3 className="text-xl font-bold text-white mb-4">Our Mission</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                  To make internet access affordable and accessible for every Ghanaian by providing
                  the best data bundle prices with instant, reliable delivery across all networks.
                </p>

                <Separator className="my-4 bg-[#2A2A2A]" />

                <h3 className="text-xl font-bold text-white mb-4 mt-4">Our Vision</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  A Ghana where every citizen has access to affordable internet connectivity,
                  empowering them to learn, work, and thrive in the digital economy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Our Values ──────────────────────────────────────── */}
      <section className="py-12 md:py-16 border-t border-[#2A2A2A]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10">
              Our Values
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {VALUES.map((value) => {
                const ValueIcon = value.icon
                return (
                  <div key={value.title} className="glass-card rounded-2xl p-6">
                    <div className="flex items-start gap-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${value.color}15` }}
                      >
                        <ValueIcon className="w-6 h-6" style={{ color: value.color }} />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold mb-2">{value.title}</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">{value.description}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Team Section ────────────────────────────────────── */}
      <section className="py-12 md:py-16 border-t border-[#2A2A2A]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-3">
              Meet Our Team
            </h2>
            <p className="text-gray-400 text-center mb-10">
              A passionate team dedicated to connecting Ghanaians
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {TEAM.map((member) => (
                <div key={member.name} className="text-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#FFC107] to-[#E5AC00] flex items-center justify-center mx-auto mb-3">
                    <span className="text-[#0A0A0A] font-bold text-xl">{member.initial}</span>
                  </div>
                  <h4 className="text-white font-semibold text-sm">{member.name}</h4>
                  <p className="text-gray-400 text-xs mt-1">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Why Choose Dataghmart ───────────────────────────── */}
      <section className="py-12 md:py-16 border-t border-[#2A2A2A]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10">
              Why Choose Dataghmart?
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
              {WHY_CHOOSE.map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#22C55E] shrink-0" />
                  <span className="text-gray-300 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ─────────────────────────────────────────────── */}
      <section className="py-16 border-t border-[#2A2A2A]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Join the Dataghmart Family
          </h2>
          <p className="text-gray-400 max-w-md mx-auto mb-8">
            Experience the easiest way to buy data bundles in Ghana. Get started today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="btn-primary-green rounded-xl font-semibold px-8"
              onClick={() => navigate("buy-data")}
            >
              Buy Data Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              className="btn-primary-yellow rounded-xl font-semibold px-8"
              onClick={() => navigate("agent-register")}
            >
              Become an Agent
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* ─── SEO Content ─────────────────────────────────────── */}
      <section className="py-12 border-t border-[#2A2A2A]">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-4 text-gray-500 text-xs leading-relaxed">
            <p>
              Dataghmart is Ghana&apos;s premier online data bundle platform, offering affordable MTN data bundles,
              Telecel data packages, and AirtelTigo data plans. Based in Accra, we serve customers nationwide
              with instant data delivery and competitive pricing.
            </p>
            <p>
              As a leading data reseller in Ghana, Dataghmart provides wholesale data bundle pricing through
              our agent program, allowing entrepreneurs and businesses to earn commissions selling data bundles.
              Our platform supports mobile money payments, card payments, and bank transfers for convenient
              purchasing across all networks in Ghana.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
