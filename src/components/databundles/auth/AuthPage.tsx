"use client"

import { useState } from "react"
import {
  Wifi,
  LogIn,
  UserPlus,
  Eye,
  EyeOff,
  Loader2,
  Zap,
  Shield,
  ArrowRight,
  Phone,
  Mail,
  Lock,
  User,
} from "lucide-react"
import { useAppStore } from "@/store/useAppStore"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

function GoogleLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

type AuthMode = "signin" | "signup"

export default function AuthPage() {
  const navigate = useAppStore((s) => s.navigate)
  const setUser = useAppStore((s) => s.setUser)
  const [mode, setMode] = useState<AuthMode>("signin")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Form fields
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleGoogleSignIn = async () => {
    try {
      const { signIn } = await import("next-auth/react")
      await signIn("google", { callbackUrl: "/" }, { prompt: "login" })
    } catch {
      toast.error("Failed to sign in with Google. Please try again.")
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      toast.error("Please fill in all fields")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      })
      const data = await res.json()

      if (res.ok && data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email,
          fullName: data.user.full_name ?? null,
          phone: data.user.phone ?? null,
          role: data.user.role ?? "customer",
          avatarUrl: data.user.avatar_url ?? null,
          balance: Number(data.user.balance ?? 0),
          agentProfile: data.user.agent_profile
            ? {
                tier: data.user.agent_profile.tier,
                status: data.user.agent_profile.status,
                commissionRate: data.user.agent_profile.commission_rate,
                apiKey: data.user.agent_profile.api_key ?? null,
              }
            : null,
        })
        document.cookie = `user-id=${data.user.id}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`
        document.cookie = `user-email=${data.user.email}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`
        toast.success(`Welcome back, ${data.user.full_name || "User"}!`)
        navigate("home")
      } else {
        toast.error(data.error || "Sign in failed. Please try again.")
      }
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      toast.error("Please fill in all required fields")
      return
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          password,
          phone: phone.trim() || undefined,
        }),
      })
      const data = await res.json()

      if (res.ok && data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email,
          fullName: data.user.full_name ?? null,
          phone: data.user.phone ?? null,
          role: data.user.role ?? "customer",
          avatarUrl: data.user.avatar_url ?? null,
          balance: Number(data.user.balance ?? 0),
        })
        document.cookie = `user-id=${data.user.id}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`
        document.cookie = `user-email=${data.user.email}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`
        toast.success("Account created successfully! Welcome to Dataghmart.")
        navigate("home")
      } else {
        toast.error(data.error || "Account creation failed. Please try again.")
      }
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode)
    setShowPassword(false)
    setShowConfirmPassword(false)
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 hero-grid-bg opacity-50" />
      <div className="absolute top-20 -left-32 w-64 h-64 bg-[#FFC107]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 -right-32 w-64 h-64 bg-[#00E5FF]/5 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FFC107] to-[#E5AC00] mb-4 shadow-lg shadow-[#FFC107]/20">
            <Wifi className="w-8 h-8 text-[#0A0A0A]" />
          </div>
          <h1 className="text-2xl font-bold text-white">
            Dataghmart Data Bundles
          </h1>
          <p className="text-sm text-[#00E5FF] mt-1 font-medium tracking-wide">
            Ghana&apos;s #1 Data Bundle Platform
          </p>
        </div>

        {/* Auth Card */}
        <Card className="glass-card rounded-2xl shadow-2xl border-[#2A2A2A]">
          <CardContent className="p-6">
            {/* Google Sign In */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 flex items-center justify-center gap-3 border-[#2A2A2A] bg-[#1A1A1A] hover:bg-[#1F1F1F] text-white hover:text-white transition-colors font-medium rounded-xl"
              onClick={handleGoogleSignIn}
            >
              <GoogleLogo className="w-5 h-5" />
              Continue with Google
            </Button>

            {/* Or Separator */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#2A2A2A]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#171717] px-3 text-gray-500 font-medium">or continue with email</span>
              </div>
            </div>

            {/* Mode Toggle */}
            <div className="flex bg-[#0A0A0A] rounded-xl p-1 mb-6">
              <button
                type="button"
                onClick={() => switchMode("signin")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  mode === "signin"
                    ? "bg-[#FFC107] text-[#0A0A0A] shadow-md shadow-[#FFC107]/20"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
              <button
                type="button"
                onClick={() => switchMode("signup")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  mode === "signup"
                    ? "bg-[#22C55E] text-white shadow-md shadow-[#22C55E]/20"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <UserPlus className="w-4 h-4" />
                Create Account
              </button>
            </div>

            {/* Sign In Form */}
            {mode === "signin" && (
              <form onSubmit={handleLogin} className="space-y-4 animate-fade-in">
                <div className="space-y-2">
                  <Label htmlFor="signin-email" className="text-sm font-medium text-gray-300">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11 pl-10 bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder:text-gray-600 focus:border-[#FFC107] focus:ring-[#FFC107]/20 rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="signin-password" className="text-sm font-medium text-gray-300">
                      Password
                    </Label>
                    <button
                      type="button"
                      className="text-xs text-[#FFC107] hover:underline font-medium"
                      onClick={() => toast.info("Password reset will be available soon.")}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      id="signin-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 pl-10 pr-10 bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder:text-gray-600 focus:border-[#FFC107] focus:ring-[#FFC107]/20 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full h-11 btn-primary-yellow font-bold rounded-xl text-[15px]"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            )}

            {/* Sign Up Form */}
            {mode === "signup" && (
              <form onSubmit={handleRegister} className="space-y-4 animate-fade-in">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="text-sm font-medium text-gray-300">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="John Doe"
                      required
                      autoComplete="name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="h-11 pl-10 bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder:text-gray-600 focus:border-[#22C55E] focus:ring-[#22C55E]/20 rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-sm font-medium text-gray-300">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11 pl-10 bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder:text-gray-600 focus:border-[#22C55E] focus:ring-[#22C55E]/20 rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-phone" className="text-sm font-medium text-gray-300">
                    Phone Number <span className="text-gray-500 font-normal">(optional)</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      id="signup-phone"
                      type="tel"
                      placeholder="0XX XXX XXXX"
                      autoComplete="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="h-11 pl-10 bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder:text-gray-600 focus:border-[#22C55E] focus:ring-[#22C55E]/20 rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-sm font-medium text-gray-300">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Minimum 6 characters"
                      required
                      autoComplete="new-password"
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 pl-10 pr-10 bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder:text-gray-600 focus:border-[#22C55E] focus:ring-[#22C55E]/20 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm" className="text-sm font-medium text-gray-300">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      id="signup-confirm"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter your password"
                      required
                      autoComplete="new-password"
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-11 pl-10 pr-10 bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder:text-gray-600 focus:border-[#22C55E] focus:ring-[#22C55E]/20 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full h-11 btn-primary-green font-bold rounded-xl text-[15px]"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            )}

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-[#2A2A2A] text-center">
              <p className="text-xs text-gray-500">
                By continuing, you agree to our{" "}
                <button
                  type="button"
                  className="text-[#FFC107] hover:underline font-medium"
                  onClick={() => navigate("terms")}
                >
                  Terms of Service
                </button>{" "}
                and{" "}
                <button
                  type="button"
                  className="text-[#FFC107] hover:underline font-medium"
                  onClick={() => navigate("privacy")}
                >
                  Privacy Policy
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Agent CTA */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Want to sell data bundles?{" "}
            <button
              type="button"
              className="text-[#FFC107] hover:underline font-semibold"
              onClick={() => navigate("agent-register")}
            >
              Become an Agent
            </button>
          </p>
        </div>

        {/* Trust badges */}
        <div className="mt-8 flex items-center justify-center gap-6 text-gray-600">
          <div className="flex items-center gap-1.5 text-xs">
            <Shield className="w-3.5 h-3.5" />
            <span>Secure</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <Zap className="w-3.5 h-3.5" />
            <span>Instant Delivery</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <Wifi className="w-3.5 h-3.5" />
            <span>All Networks</span>
          </div>
        </div>
      </div>
    </div>
  )
}
