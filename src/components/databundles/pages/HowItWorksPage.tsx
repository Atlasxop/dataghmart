"use client"

import {
  ShoppingCart,
  CreditCard,
  Zap,
  CheckCircle2,
  UserPlus,
  Package,
  TrendingUp,
  Wallet,
  Truck,
  Clock,
  Shield,
  Lock,
  Eye,
  ArrowRight,
  BadgeCheck,
} from "lucide-react"
import { useAppStore } from "@/store/useAppStore"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

// ─── Step Types ────────────────────────────────────────────────
interface Step {
  number: number
  title: string
  description: string
  icon: typeof ShoppingCart
}

// ─── Customer Steps ────────────────────────────────────────────
const CUSTOMER_STEPS: Step[] = [
  {
    number: 1,
    title: "Choose Your Bundle",
    description:
      "Select your preferred network (MTN, Telecel, or AirtelTigo), pick your data amount, and enter the recipient phone number. Our platform shows you real-time pricing across all networks.",
    icon: ShoppingCart,
  },
  {
    number: 2,
    title: "Make Secure Payment",
    description:
      "Pay with mobile money (MTN MoMo, Telecel Cash), bank card (Visa, Mastercard), or bank transfer. All payments are encrypted and processed through secure gateways.",
    icon: CreditCard,
  },
  {
    number: 3,
    title: "Instant Delivery",
    description:
      "Your data bundle is delivered directly to the phone number within 30 seconds. You'll receive a confirmation notification and can track your order in real-time.",
    icon: Zap,
  },
]

// ─── Agent Steps ───────────────────────────────────────────────
const AGENT_STEPS: Step[] = [
  {
    number: 1,
    title: "Register as an Agent",
    description:
      "Sign up for the Dataghmart Agent Program for free. Complete the registration form with your details and get instant access to wholesale data bundles via the DataMart API.",
    icon: UserPlus,
  },
  {
    number: 2,
    title: "Access Wholesale Prices",
    description:
      "Once approved, get access to discounted wholesale prices on all data bundles. Your commission rate depends on your agent tier (3% to 10%).",
    icon: Package,
  },
  {
    number: 3,
    title: "Sell & Earn Commissions",
    description:
      "Sell data bundles through our platform, your own white-label storefront, or via API integration. Earn commissions on every sale you make.",
    icon: TrendingUp,
  },
  {
    number: 4,
    title: "Withdraw Your Earnings",
    description:
      "Withdraw your commissions to your mobile money wallet or bank account. Payouts range from daily (Platinum) to monthly (Bronze) depending on your tier.",
    icon: Wallet,
  },
]

// ─── Delivery Process ──────────────────────────────────────────
const DELIVERY_STEPS: Step[] = [
  {
    number: 1,
    title: "Order Placed",
    description: "Your order is received and queued for processing in our automated system.",
    icon: ShoppingCart,
  },
  {
    number: 2,
    title: "Payment Verified",
    description: "We confirm your payment with the payment provider, typically within seconds.",
    icon: BadgeCheck,
  },
  {
    number: 3,
    title: "Data Delivered",
    description: "Your data bundle is sent to the recipient phone number via the telecom network.",
    icon: Truck,
  },
]

// ─── Safety & Security ─────────────────────────────────────────
const SAFETY_ITEMS = [
  {
    icon: Lock,
    title: "Encrypted Payments",
    description: "All transactions use bank-level encryption to protect your financial information.",
    color: "#22C55E",
  },
  {
    icon: Shield,
    title: "Secure Platform",
    description: "Our platform is built with modern security practices and regular security audits.",
    color: "#00E5FF",
  },
  {
    icon: Eye,
    title: "Transparent Pricing",
    description: "No hidden fees or charges. The price you see is exactly what you pay.",
    color: "#FFC107",
  },
  {
    icon: CheckCircle2,
    title: "Delivery Guarantee",
    description: "100% delivery guarantee — if your data isn't delivered, you get a full refund.",
    color: "#22C55E",
  },
]

// ─── Component ─────────────────────────────────────────────────
export default function HowItWorksPage() {
  const navigate = useAppStore((s) => s.navigate)

  return (
    <div className="bg-[#0A0A0A]">
      {/* ─── Header ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-12 md:py-20">
        <div className="absolute inset-0 hero-grid-bg opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] via-transparent to-[#0A0A0A]" />

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#171717] border border-[#2A2A2A] mb-6">
            <Zap className="w-4 h-4 text-[#FFC107]" />
            <span className="text-sm text-gray-400">Simple & Fast</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            How It Works
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Buying data bundles on Dataghmart is simple, fast, and secure. Follow these
            easy steps to get connected in seconds.
          </p>
        </div>
      </section>

      {/* ─── For Customers ───────────────────────────────────── */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 rounded-xl bg-[#22C55E]/15 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-[#22C55E]" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">For Customers</h2>
            </div>

            {/* Visual Timeline */}
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-[#22C55E] via-[#00E5FF] to-[#FFC107] hidden md:block" />

              <div className="space-y-8">
                {CUSTOMER_STEPS.map((step) => {
                  const StepIcon = step.icon
                  return (
                    <div key={step.number} className="flex gap-6 items-start">
                      {/* Step Number Circle */}
                      <div className="relative z-10 shrink-0">
                        <div className="w-12 h-12 rounded-full bg-[#171717] border-2 border-[#22C55E] flex items-center justify-center">
                          <span className="text-[#22C55E] font-bold text-lg">{step.number}</span>
                        </div>
                      </div>

                      {/* Step Content */}
                      <div className="glass-card rounded-2xl p-6 flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-xl bg-[#22C55E]/10 flex items-center justify-center">
                            <StepIcon className="w-5 h-5 text-[#22C55E]" />
                          </div>
                          <h3 className="text-white text-lg font-semibold">{step.title}</h3>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="mt-10 text-center">
              <Button
                size="lg"
                className="btn-primary-green rounded-xl font-semibold px-8"
                onClick={() => {
                  navigate("buy-data")
                  toast.success("Choose your network and data amount")
                }}
              >
                Buy Data Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── For Agents ──────────────────────────────────────── */}
      <section className="py-12 md:py-16 border-t border-[#2A2A2A]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 rounded-xl bg-[#FFC107]/15 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[#FFC107]" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">For Agents</h2>
            </div>

            {/* Visual Timeline */}
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-[#FFC107] via-[#E5AC00] to-[#CC9A00] hidden md:block" />

              <div className="space-y-8">
                {AGENT_STEPS.map((step) => {
                  const StepIcon = step.icon
                  return (
                    <div key={step.number} className="flex gap-6 items-start">
                      {/* Step Number Circle */}
                      <div className="relative z-10 shrink-0">
                        <div className="w-12 h-12 rounded-full bg-[#171717] border-2 border-[#FFC107] flex items-center justify-center">
                          <span className="text-[#FFC107] font-bold text-lg">{step.number}</span>
                        </div>
                      </div>

                      {/* Step Content */}
                      <div className="glass-card rounded-2xl p-6 flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-xl bg-[#FFC107]/10 flex items-center justify-center">
                            <StepIcon className="w-5 h-5 text-[#FFC107]" />
                          </div>
                          <h3 className="text-white text-lg font-semibold">{step.title}</h3>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="mt-10 text-center">
              <Button
                size="lg"
                className="btn-primary-yellow rounded-xl font-semibold px-8"
                onClick={() => {
                  navigate("agent-register")
                  toast.success("Start your agent journey")
                }}
              >
                Become an Agent
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Delivery Process ────────────────────────────────── */}
      <section className="py-12 md:py-16 border-t border-[#2A2A2A]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/15 flex items-center justify-center">
                <Truck className="w-5 h-5 text-[#00E5FF]" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">Delivery Process</h2>
            </div>

            {/* Horizontal Timeline for Desktop */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {DELIVERY_STEPS.map((step, idx) => {
                const StepIcon = step.icon
                return (
                  <div key={step.number} className="relative">
                    {/* Connector Arrow (not on last) */}
                    {idx < DELIVERY_STEPS.length - 1 && (
                      <div className="hidden md:block absolute top-8 -right-3 w-6">
                        <ArrowRight className="w-6 h-6 text-[#00E5FF]" />
                      </div>
                    )}

                    <div className="glass-card rounded-2xl p-6 text-center h-full">
                      <div className="w-14 h-14 rounded-2xl bg-[#00E5FF]/10 flex items-center justify-center mx-auto mb-4">
                        <StepIcon className="w-7 h-7 text-[#00E5FF]" />
                      </div>
                      <div className="w-8 h-8 rounded-full bg-[#171717] border border-[#00E5FF] flex items-center justify-center mx-auto mb-3">
                        <span className="text-[#00E5FF] font-bold text-sm">{step.number}</span>
                      </div>
                      <h3 className="text-white font-semibold mb-2">{step.title}</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-8 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/20">
                <Clock className="w-4 h-4 text-[#22C55E]" />
                <span className="text-[#22C55E] text-sm font-medium">
                  Average delivery time: Under 30 seconds
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Safety & Security ───────────────────────────────── */}
      <section className="py-12 md:py-16 border-t border-[#2A2A2A]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                Safety & Security
              </h2>
              <p className="text-gray-400 max-w-lg mx-auto">
                Your safety is our top priority. We use industry-standard security measures
                to protect your data and transactions.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {SAFETY_ITEMS.map((item) => {
                const ItemIcon = item.icon
                return (
                  <div key={item.title} className="glass-card rounded-2xl p-6">
                    <div className="flex items-start gap-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${item.color}15` }}
                      >
                        <ItemIcon className="w-6 h-6" style={{ color: item.color }} />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ─────────────────────────────────────────────── */}
      <section className="py-16 border-t border-[#2A2A2A]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-gray-400 max-w-md mx-auto mb-8">
            Join thousands of Ghanaians who trust Dataghmart for affordable, instant data delivery.
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
    </div>
  )
}
