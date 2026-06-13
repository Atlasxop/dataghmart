"use client"

import { useState } from "react"
import {
  Menu,
  X,
  User,
  LogOut,
  Shield,
  Wifi,
  Home,
  Package,
  ShoppingCart,
  MapPin,
  HelpCircle,
  DollarSign,
  ChevronDown,
  Zap,
} from "lucide-react"
import { useAppStore } from "@/store/useAppStore"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const navLinks = [
  { view: "home" as const, label: "Home", icon: Home },
  { view: "bundles" as const, label: "Bundles", icon: Package },
  { view: "buy-data" as const, label: "Buy Data", icon: ShoppingCart },
  { view: "tracker" as const, label: "Track Order", icon: MapPin },
  { view: "pricing" as const, label: "Pricing", icon: DollarSign },
  { view: "faq" as const, label: "FAQ", icon: HelpCircle },
]

export default function Header() {
  const { user, isAdmin, navigate, logout } = useAppStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const currentView = useAppStore((s) => s.currentView)

  const handleLogout = () => {
    logout()
    localStorage.removeItem("admin-token")
    toast.success("Logged out successfully")
    navigate("home")
  }

  const getUserInitials = () => {
    if (user?.fullName) {
      return user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    return user?.email?.[0]?.toUpperCase() || "U"
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#2A2A2A] bg-[#0A0A0A]/95 backdrop-blur-xl supports-[backdrop-filter]:bg-[#0A0A0A]/80">
      {/* Data flow line at top */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#00E5FF] to-transparent opacity-60" />

      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <button
          onClick={() => navigate("home")}
          className="flex items-center gap-2.5 hover:opacity-90 transition-opacity"
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#FFC107] to-[#E5AC00] flex items-center justify-center shadow-lg shadow-[#FFC107]/20">
            <Zap className="w-5 h-5 text-[#0A0A0A]" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-white leading-tight">Dataghmart</span>
            <span className="text-[10px] font-medium text-[#00E5FF] leading-tight tracking-wider uppercase">Data Bundles</span>
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <button
              key={link.view}
              onClick={() => navigate(link.view)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                currentView === link.view
                  ? "bg-[#FFC107]/10 text-[#FFC107] border border-[#FFC107]/20"
                  : "text-gray-400 hover:text-white hover:bg-[#1F1F1F] border border-transparent"
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full border border-[#2A2A2A] hover:border-[#FFC107]/50">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatarUrl || undefined} alt={user.fullName || "User"} />
                    <AvatarFallback className="bg-[#FFC107] text-[#0A0A0A] text-xs font-bold">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-[#171717] border-[#2A2A2A]" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-white">{user.fullName || "User"}</p>
                    <p className="text-xs leading-none text-gray-400">{user.email}</p>
                    {user.role === "agent" && (
                      <span className="text-xs text-[#FFC107] font-medium">⚡ Agent</span>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[#2A2A2A]" />
                <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-[#1F1F1F] focus:bg-[#1F1F1F]" onClick={() => navigate("my-orders")}>
                  <Package className="mr-2 h-4 w-4" />
                  My Orders
                </DropdownMenuItem>
                <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-[#1F1F1F] focus:bg-[#1F1F1F]" onClick={() => navigate("my-profile")}>
                  <User className="mr-2 h-4 w-4" />
                  My Profile
                </DropdownMenuItem>
                {user.role === "agent" && (
                  <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-[#1F1F1F] focus:bg-[#1F1F1F]" onClick={() => navigate("agent-portal")}>
                    <Wifi className="mr-2 h-4 w-4" />
                    Agent Portal
                  </DropdownMenuItem>
                )}
                {isAdmin && (
                  <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-[#1F1F1F] focus:bg-[#1F1F1F]" onClick={() => navigate("admin-dashboard")}>
                    <Shield className="mr-2 h-4 w-4" />
                    Admin Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="bg-[#2A2A2A]" />
                <DropdownMenuItem onClick={handleLogout} className="text-red-400 hover:text-red-300 hover:bg-[#1F1F1F] focus:bg-[#1F1F1F]">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white hover:bg-[#1F1F1F]"
                onClick={() => navigate("auth")}
              >
                Sign In
              </Button>
              <Button
                size="sm"
                className="btn-primary-yellow font-semibold"
                onClick={() => navigate("auth")}
              >
                Get Started
              </Button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-gray-400 hover:text-white hover:bg-[#1F1F1F]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#2A2A2A] bg-[#0A0A0A]">
          <nav className="container mx-auto px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.view}
                onClick={() => {
                  navigate(link.view)
                  setMobileMenuOpen(false)
                }}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentView === link.view
                    ? "bg-[#FFC107]/10 text-[#FFC107] border border-[#FFC107]/20"
                    : "text-gray-400 hover:text-white hover:bg-[#1F1F1F] border border-transparent"
                }`}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </button>
            ))}
            <div className="pt-2 border-t border-[#2A2A2A]">
              <button
                onClick={() => {
                  navigate("agent-register")
                  setMobileMenuOpen(false)
                }}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-[#FFC107] hover:bg-[#FFC107]/10 transition-colors"
              >
                <Zap className="w-4 h-4" />
                Become an Agent
              </button>
            </div>
            {!user && (
              <div className="pt-3 border-t border-[#2A2A2A] space-y-2">
                <Button
                  variant="outline"
                  className="w-full border-[#2A2A2A] text-gray-300 hover:text-white hover:bg-[#1F1F1F]"
                  onClick={() => {
                    navigate("auth")
                    setMobileMenuOpen(false)
                  }}
                >
                  Sign In
                </Button>
                <Button
                  className="w-full btn-primary-yellow font-semibold"
                  onClick={() => {
                    navigate("auth")
                    setMobileMenuOpen(false)
                  }}
                >
                  Get Started
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
