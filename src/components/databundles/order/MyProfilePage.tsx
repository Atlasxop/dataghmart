"use client"

import { useEffect, useState, useCallback } from "react"
import {
  User,
  Mail,
  Phone,
  Shield,
  Edit3,
  Save,
  X,
  Loader2,
  Trash2,
  AlertTriangle,
  Package,
  CreditCard,
  BadgeCheck,
  Zap,
  Star,
  CheckCircle2,
  Crown,
  Wallet,
} from "lucide-react"
import { useAppStore } from "@/store/useAppStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

// ─── Types ────────────────────────────────────────────────────────

interface UserStats {
  totalOrders: number
  totalSpent: number
  completedOrders: number
  pendingOrders: number
}

// ─── Agent Badge Component ───────────────────────────────────────

function AgentBadge({ tier }: { tier: string }) {
  const tierConfig: Record<string, { label: string; color: string; icon: typeof Star }> = {
    retail: { label: "Retail Agent", color: "#FFC107", icon: Star },
    premium: { label: "Premium Agent", color: "#00E5FF", icon: Zap },
    super: { label: "Super Agent", color: "#22C55E", icon: Crown },
    distributor: { label: "Distributor", color: "#FF6B35", icon: Shield },
  }
  const config = tierConfig[tier] || tierConfig.retail
  const IconComp = config.icon

  return (
    <div
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl"
      style={{
        backgroundColor: `${config.color}12`,
        border: `1px solid ${config.color}30`,
      }}
    >
      <IconComp className="w-4 h-4" style={{ color: config.color }} />
      <span className="text-sm font-bold" style={{ color: config.color }}>
        {config.label}
      </span>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────

export default function MyProfilePage() {
  const navigate = useAppStore((s) => s.navigate)
  const user = useAppStore((s) => s.user)
  const setUser = useAppStore((s) => s.setUser)
  const logout = useAppStore((s) => s.logout)

  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editName, setEditName] = useState(user?.fullName || "")
  const [editPhone, setEditPhone] = useState(user?.phone || "")
  const [stats, setStats] = useState<UserStats>({
    totalOrders: 0,
    totalSpent: 0,
    completedOrders: 0,
    pendingOrders: 0,
  })
  const [loadingStats, setLoadingStats] = useState(true)

  const fetchStats = useCallback(async () => {
    if (!user) {
      setLoadingStats(false)
      return
    }
    setLoadingStats(true)
    try {
      const res = await fetch("/api/datamart/orders", {
        headers: { "user-id": user.id },
      })
      if (res.ok) {
        const data = await res.json()
        const orders = data.orders || []
        setStats({
          totalOrders: orders.length,
          totalSpent: orders
            .filter((o: { status: string }) => o.status === "completed")
            .reduce((sum: number, o: { price: number }) => sum + o.price, 0),
          completedOrders: orders.filter((o: { status: string }) => o.status === "completed").length,
          pendingOrders: orders.filter(
            (o: { status: string }) => o.status === "pending" || o.status === "processing"
          ).length,
        })
      }
    } catch {
      // Silently fail stats
    } finally {
      setLoadingStats(false)
    }
  }, [user])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate("auth")
    }
  }, [user, navigate])

  const handleSaveProfile = async () => {
    if (!user) return
    if (!editName.trim()) {
      toast.error("Name cannot be empty")
      return
    }
    setSaving(true)
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "user-id": user.id,
        },
        body: JSON.stringify({
          fullName: editName.trim(),
          phone: editPhone.trim() || undefined,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setUser({
          ...user,
          fullName: data.user?.full_name ?? editName.trim(),
          phone: data.user?.phone ?? (editPhone.trim() || null) ?? null,
        })
        toast.success("Profile updated successfully!")
        setIsEditing(false)
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to update profile")
      }
    } catch {
      toast.error("Failed to update profile. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!user) return
    setDeleting(true)
    try {
      const res = await fetch("/api/auth/profile", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "user-id": user.id,
        },
      })
      if (res.ok) {
        logout()
        toast.success("Account deleted. We're sorry to see you go.")
        navigate("home")
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to delete account. Please contact support.")
      }
    } catch {
      toast.error("Failed to delete account. Please contact support.")
    } finally {
      setDeleting(false)
    }
  }

  const startEditing = () => {
    setEditName(user?.fullName || "")
    setEditPhone(user?.phone || "")
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setIsEditing(false)
    setEditName(user?.fullName || "")
    setEditPhone(user?.phone || "")
  }

  if (!user) {
    return null
  }

  const getUserInitials = () => {
    if (user.fullName) {
      return user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    return user.email?.[0]?.toUpperCase() || "U"
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">My Profile</h1>
        <p className="text-sm text-gray-500">Manage your account settings</p>
      </div>

      {/* Profile Card */}
      <Card className="glass-card rounded-2xl border-[#2A2A2A] mb-6">
        <CardContent className="p-6">
          {/* Avatar & Name Section */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FFC107] to-[#E5AC00] flex items-center justify-center shadow-lg shadow-[#FFC107]/20 shrink-0">
              <span className="text-xl font-bold text-[#0A0A0A]">{getUserInitials()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h2 className="text-lg font-bold text-white truncate">
                  {user.fullName || "User"}
                </h2>
                {user.role === "agent" && (
                  <Badge className="bg-[#FFC107]/15 text-[#FFC107] border-[#FFC107]/30 text-[10px] px-2 py-0 h-5">
                    <Zap className="w-3 h-3 mr-0.5" />
                    Agent
                  </Badge>
                )}
                {user.role === "admin" && (
                  <Badge className="bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30 text-[10px] px-2 py-0 h-5">
                    <Shield className="w-3 h-3 mr-0.5" />
                    Admin
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-400 truncate">{user.email}</p>
              {user.phone && (
                <p className="text-sm text-gray-500 mt-0.5">{user.phone}</p>
              )}
            </div>
            {!isEditing && (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-gray-400 hover:text-[#FFC107] hover:bg-[#FFC107]/10 rounded-xl shrink-0"
                onClick={startEditing}
              >
                <Edit3 className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Agent Badge */}
          {user.role === "agent" && user.agentProfile && (
            <div className="mb-6">
              <AgentBadge tier={user.agentProfile.tier} />
              <div className="mt-2 flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 text-xs font-medium ${
                    user.agentProfile.status === "active"
                      ? "text-[#22C55E]"
                      : user.agentProfile.status === "pending"
                      ? "text-[#FFC107]"
                      : "text-[#EF4444]"
                  }`}
                >
                  <BadgeCheck className="w-3 h-3" />
                  {user.agentProfile.status === "active"
                    ? "Verified & Active"
                    : user.agentProfile.status === "pending"
                    ? "Pending Verification"
                    : "Suspended"}
                </span>
                {user.agentProfile.commissionRate > 0 && (
                  <span className="text-xs text-gray-500">
                    • {user.agentProfile.commissionRate}% commission
                  </span>
                )}
              </div>
            </div>
          )}

          <Separator className="bg-[#2A2A2A] mb-6" />

          {/* Profile Info / Edit Form */}
          {isEditing ? (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-300">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Enter your full name"
                    className="h-11 pl-10 bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder:text-gray-600 focus:border-[#FFC107] focus:ring-[#FFC107]/20 rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-300">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="0XX XXX XXXX"
                    type="tel"
                    className="h-11 pl-10 bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder:text-gray-600 focus:border-[#FFC107] focus:ring-[#FFC107]/20 rounded-xl"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  className="flex-1 btn-primary-yellow font-bold rounded-xl h-11"
                  onClick={handleSaveProfile}
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  variant="outline"
                  className="border-[#2A2A2A] text-gray-300 hover:text-white hover:bg-[#1F1F1F] rounded-xl h-11 px-6"
                  onClick={cancelEditing}
                  disabled={saving}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#1A1A1A] flex items-center justify-center">
                  <User className="w-4 h-4 text-[#FFC107]" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Full Name</p>
                  <p className="text-sm text-white font-medium">
                    {user.fullName || "Not set"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#1A1A1A] flex items-center justify-center">
                  <Mail className="w-4 h-4 text-[#00E5FF]" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm text-white font-medium">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#1A1A1A] flex items-center justify-center">
                  <Phone className="w-4 h-4 text-[#22C55E]" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm text-white font-medium">
                    {user.phone || "Not set"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#1A1A1A] flex items-center justify-center">
                  <Shield className="w-4 h-4 text-gray-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Role</p>
                  <p className="text-sm text-white font-medium capitalize">{user.role}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Statistics */}
      <Card className="bg-[#171717] border-[#2A2A2A] rounded-2xl mb-6">
        <CardHeader className="pb-3 pt-5 px-6">
          <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
            <Package className="w-4 h-4 text-[#FFC107]" />
            Account Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-5">
          {loadingStats ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-5 h-5 text-[#FFC107] animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#1A1A1A] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Package className="w-3.5 h-3.5 text-[#FFC107]" />
                  <span className="text-xs text-gray-500">Total Orders</span>
                </div>
                <p className="text-xl font-bold text-white">{stats.totalOrders}</p>
              </div>
              <div className="bg-[#1A1A1A] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <CreditCard className="w-3.5 h-3.5 text-[#22C55E]" />
                  <span className="text-xs text-gray-500">Total Spent</span>
                </div>
                <p className="text-xl font-bold text-white">
                  GH₵ {stats.totalSpent.toFixed(2)}
                </p>
              </div>
              <div className="bg-[#1A1A1A] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" />
                  <span className="text-xs text-gray-500">Completed</span>
                </div>
                <p className="text-xl font-bold text-white">{stats.completedOrders}</p>
              </div>
              <div className="bg-[#1A1A1A] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Wallet className="w-3.5 h-3.5 text-[#00E5FF]" />
                  <span className="text-xs text-gray-500">Wallet Balance</span>
                </div>
                <p className="text-xl font-bold text-white">
                  GH₵ {user.balance.toFixed(2)}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-[#171717] border-[#2A2A2A] rounded-2xl mb-6">
        <CardHeader className="pb-3 pt-5 px-6">
          <CardTitle className="text-base font-semibold text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-5">
          <p className="text-sm text-gray-500 mb-4">
            Once you delete your account, there is no going back. All your data, order history,
            and wallet balance will be permanently removed.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="border-red-500/30 text-red-400 hover:text-red-300 hover:bg-red-500/10 hover:border-red-500/50 rounded-xl h-10"
                disabled={deleting}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-[#171717] border-[#2A2A2A]">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white">
                  Are you absolutely sure?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-gray-400">
                  This action cannot be undone. This will permanently delete your account
                  and remove all of your data from our servers, including your order history,
                  wallet balance, and any agent profile.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-[#2A2A2A] text-gray-300 hover:text-white hover:bg-[#1F1F1F]">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={handleDeleteAccount}
                >
                  {deleting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Yes, delete my account"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-3">
        <Card
          className="premium-card bg-[#171717] rounded-xl cursor-pointer"
          onClick={() => navigate("my-orders")}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#FFC107]/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-[#FFC107]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">My Orders</p>
              <p className="text-xs text-gray-500">View history</p>
            </div>
          </CardContent>
        </Card>
        <Card
          className="premium-card bg-[#171717] rounded-xl cursor-pointer"
          onClick={() => navigate("buy-data")}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#22C55E]/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-[#22C55E]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Buy Data</p>
              <p className="text-xs text-gray-500">New purchase</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
