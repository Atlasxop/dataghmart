"use client"

import { useState } from "react"
import { useAppStore } from "@/store/useAppStore"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Zap,
  Shield,
  DollarSign,
  Globe,
  Users,
  Headphones,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Eye,
  EyeOff,
  UserPlus,
  Sparkles,
  Star,
  Wifi,
  CreditCard,
} from "lucide-react"
import { toast } from "sonner"

// ─── Benefits Data ────────────────────────────────────────────────

const BENEFITS = [
  {
    icon: DollarSign,
    title: "Wholesale Pricing",
    desc: "Get the best rates on all data bundles across every network",
    glow: "rgba(255, 193, 7, 0.15)",
  },
  {
    icon: Zap,
    title: "Up to 10% Commission",
    desc: "Earn commission on every sale you make — the more you sell, the more you earn",
    glow: "rgba(34, 197, 94, 0.15)",
  },
  {
    icon: Globe,
    title: "API Access",
    desc: "Integrate directly with our platform using our powerful REST API",
    glow: "rgba(0, 229, 255, 0.15)",
  },
  {
    icon: Star,
    title: "White-Label Solutions",
    desc: "Build your own branded data selling platform powered by Dataghmart",
    glow: "rgba(255, 193, 7, 0.15)",
  },
  {
    icon: Users,
    title: "Dedicated Dashboard",
    desc: "Track sales, commissions, and manage your business from one place",
    glow: "rgba(0, 229, 255, 0.15)",
  },
  {
    icon: Headphones,
    title: "Priority Support",
    desc: "Get fast, dedicated support from our agent success team 24/7",
    glow: "rgba(34, 197, 94, 0.15)",
  },
]

// ─── Component ────────────────────────────────────────────────────

export default function AgentRegisterPage() {
  const navigate = useAppStore((s) => s.navigate)
  const setUser = useAppStore((s) => s.setUser)

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)

  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword
  const isFormValid =
    fullName.trim() !== "" &&
    email.trim() !== "" &&
    phone.trim() !== "" &&
    password.length >= 6 &&
    !passwordMismatch &&
    termsAccepted

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/agent/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          password,
          tier: "retail",
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setUser({
          id: data.user.id,
          email: data.user.email,
          fullName: data.user.fullName,
          phone: data.user.phone,
          role: "agent",
          avatarUrl: null,
          balance: data.user.balance || 0,
          agentProfile: {
            tier: data.agentProfile.tier,
            status: data.agentProfile.status,
            commissionRate: data.agentProfile.commissionRate,
            apiKey: null,
          },
        })
        setRegistrationSuccess(true)
        toast.success("Registration successful! Welcome to Dataghmart!")
      } else {
        toast.error(data.error || "Registration failed. Please try again.")
      }
    } catch {
      toast.error("Network error. Please check your connection.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // ─── Success State ────────────────────────────────────────────
  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
        <div className="glass-card-cyan rounded-2xl p-8 sm:p-10 max-w-md w-full text-center animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-[#22C55E]/20 flex items-center justify-center mx-auto mb-6 success-animation">
            <CheckCircle2 className="w-10 h-10 text-[#22C55E]" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Welcome, Agent!</h2>
          <p className="text-[#9CA3AF] mb-6">
            Your registration was successful. You&apos;re now an official Dataghmart Agent with full access to the DataMart API.
          </p>
          <div className="bg-[#0A0A0A] rounded-xl p-4 mb-6 border border-[#2A2A2A]">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Wifi className="w-5 h-5 text-[#00E5FF]" />
              <span className="text-sm font-medium text-[#00E5FF]">DataMart API Access</span>
            </div>
            <p className="text-xs text-[#9CA3AF]">Full access to wholesale data bundles across all Ghana networks</p>
          </div>
          <div className="space-y-3 text-left mb-6">
            <h3 className="text-sm font-semibold text-white">Next Steps:</h3>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#22C55E] mt-0.5 shrink-0" />
              <p className="text-sm text-[#9CA3AF]">Fund your wallet to start placing orders</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#22C55E] mt-0.5 shrink-0" />
              <p className="text-sm text-[#9CA3AF]">Explore your dedicated agent dashboard</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#22C55E] mt-0.5 shrink-0" />
              <p className="text-sm text-[#9CA3AF]">Start selling data bundles and earn commissions</p>
            </div>
          </div>
          <Button
            className="w-full btn-primary-green text-white font-bold py-6 text-base"
            onClick={() => navigate("agent-portal")}
          >
            Go to Agent Dashboard
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* ─── Hero Section ─────────────────────────────────────── */}
      <section className="hero-gradient hero-grid-bg relative overflow-hidden">
        {/* Glow effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#FFC107]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#00E5FF]/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative container mx-auto px-4 py-12 sm:py-16 text-center max-w-5xl">
          <div className="inline-flex items-center gap-2 bg-[#FFC107]/10 border border-[#FFC107]/20 rounded-full px-4 py-1.5 mb-6">
            <Sparkles className="w-4 h-4 text-[#FFC107]" />
            <span className="text-sm font-medium text-[#FFC107]">Agent Program</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight">
            Become a{" "}
            <span className="text-[#FFC107] drop-shadow-[0_0_20px_rgba(255,193,7,0.4)]">
              Dataghmart Agent
            </span>
          </h1>

          <p className="text-lg text-[#9CA3AF] max-w-2xl mx-auto mb-8">
            Join Ghana&apos;s fastest-growing data bundle platform. Start your own business selling data bundles with wholesale pricing and earn commissions on every sale.
          </p>

          {/* Free Registration Highlight */}
          <div className="glass-card-cyan inline-flex items-center gap-4 rounded-2xl px-8 py-5 mb-10 animate-pulse-glow-cyan">
            <div className="w-14 h-14 rounded-xl bg-[#22C55E]/20 flex items-center justify-center">
              <Shield className="w-7 h-7 text-[#22C55E]" />
            </div>
            <div className="text-left">
              <p className="text-xs text-[#9CA3AF] uppercase tracking-wider">Registration</p>
              <p className="text-3xl font-extrabold text-[#22C55E]">FREE</p>
              <p className="text-xs text-[#00E5FF]">No payment required — start instantly</p>
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {BENEFITS.map((benefit) => {
              const Icon = benefit.icon
              return (
                <div
                  key={benefit.title}
                  className="glass-card rounded-xl p-5 text-left hover:border-[#00E5FF]/50 transition-all duration-300 group"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                    style={{ background: benefit.glow }}
                  >
                    <Icon className="w-5 h-5 text-[#FFC107]" />
                  </div>
                  <h3 className="font-semibold text-white text-sm mb-1">{benefit.title}</h3>
                  <p className="text-xs text-[#9CA3AF] leading-relaxed">{benefit.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── Registration Form ────────────────────────────────── */}
      <section className="container mx-auto px-4 py-12 max-w-xl">
        <div className="glass-card rounded-2xl p-6 sm:p-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#FFC107]/20 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-[#FFC107]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Agent Registration</h2>
              <p className="text-xs text-[#9CA3AF]">Fill in your details to get started — powered by DataMart API</p>
            </div>
          </div>

          <form onSubmit={handleRegistration} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="agent-fullName" className="text-sm text-[#9CA3AF]">
                Full Name <span className="text-[#EF4444]">*</span>
              </Label>
              <Input
                id="agent-fullName"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder:text-[#4B5563] focus:border-[#FFC107] focus:ring-[#FFC107]/20"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="agent-email" className="text-sm text-[#9CA3AF]">
                Email Address <span className="text-[#EF4444]">*</span>
              </Label>
              <Input
                id="agent-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder:text-[#4B5563] focus:border-[#FFC107] focus:ring-[#FFC107]/20"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="agent-phone" className="text-sm text-[#9CA3AF]">
                Phone Number <span className="text-[#EF4444]">*</span>
              </Label>
              <Input
                id="agent-phone"
                placeholder="0XX XXX XXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                maxLength={10}
                className="bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder:text-[#4B5563] focus:border-[#FFC107] focus:ring-[#FFC107]/20"
              />
            </div>

            {/* Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="agent-password" className="text-sm text-[#9CA3AF]">
                  Password <span className="text-[#EF4444]">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="agent-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder:text-[#4B5563] focus:border-[#FFC107] focus:ring-[#FFC107]/20 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4B5563] hover:text-[#9CA3AF] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="agent-confirmPassword" className="text-sm text-[#9CA3AF]">
                  Confirm Password <span className="text-[#EF4444]">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="agent-confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder:text-[#4B5563] focus:border-[#FFC107] focus:ring-[#FFC107]/20 pr-10 ${
                      passwordMismatch ? "border-[#EF4444] focus:border-[#EF4444]" : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4B5563] hover:text-[#9CA3AF] transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordMismatch && (
                  <p className="text-xs text-[#EF4444]">Passwords do not match</p>
                )}
              </div>
            </div>

            {/* DataMart API Info */}
            <div className="bg-[#0A0A0A] rounded-xl p-4 border border-[#2A2A2A]">
              <div className="flex items-center gap-2 mb-2">
                <Wifi className="w-4 h-4 text-[#00E5FF]" />
                <span className="text-sm font-medium text-[#00E5FF]">Powered by DataMart API</span>
              </div>
              <p className="text-xs text-[#9CA3AF]">
                Your agent account gives you direct access to the DataMart API for wholesale data bundles, real-time order tracking, and instant delivery across all Ghana networks.
              </p>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3">
              <Checkbox
                id="agent-terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                className="mt-0.5 data-[state=checked]:bg-[#FFC107] data-[state=checked]:border-[#FFC107] data-[state=checked]:text-[#0A0A0A]"
              />
              <Label htmlFor="agent-terms" className="text-sm text-[#9CA3AF] leading-relaxed font-normal">
                I agree to the{" "}
                <button
                  type="button"
                  onClick={() => navigate("terms")}
                  className="text-[#FFC107] underline hover:no-underline"
                >
                  Terms of Service
                </button>{" "}
                and{" "}
                <button
                  type="button"
                  onClick={() => navigate("privacy")}
                  className="text-[#FFC107] underline hover:no-underline"
                >
                  Privacy Policy
                </button>
              </Label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full btn-primary-green font-bold py-6 text-base"
              size="lg"
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Agent Account...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Register as Agent
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>

            <p className="text-xs text-center text-[#4B5563]">
              Free registration — Start selling data bundles instantly via DataMart API
            </p>

            {/* Already have account */}
            <div className="text-center pt-2 border-t border-[#2A2A2A]">
              <p className="text-sm text-[#9CA3AF]">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("auth")}
                  className="text-[#FFC107] font-medium hover:underline"
                >
                  Sign In
                </button>
              </p>
            </div>
          </form>
        </div>
      </section>
    </div>
  )
}
