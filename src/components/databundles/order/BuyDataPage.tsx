"use client"

import { useState, useEffect, useCallback } from "react"
import { useAppStore } from "@/store/useAppStore"
import { toast } from "sonner"
import { detectNetwork, getNetworkName, isValidGhanaPhone } from "@/lib/networkDetect"
import type { DetectedNetwork } from "@/lib/networkDetect"
import {
  Wifi,
  Smartphone,
  ShoppingCart,
  CheckCircle2,
  ChevronRight,
  AlertTriangle,
  Loader2,
  Shield,
  Zap,
  ArrowLeft,
  Phone,
  CreditCard,
  CircleCheck,
  XCircle,
  Signal,
  Package,
  Eye,
  MessageCircleWarning,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

// ─── Types ────────────────────────────────────────────────────────

interface Product {
  id: string
  network: string
  capacity: number
  mb: number
  displayName: string
  basePrice: number
  sellingPrice: number
  profit: number
  inStock: boolean
}

type NetworkKey = "YELLO" | "TELECEL" | "AT_PREMIUM"

type PurchaseStatus = "idle" | "loading" | "success" | "error"

// ─── Network Config ──────────────────────────────────────────────

const NETWORKS: {
  key: NetworkKey
  name: string
  color: string
  badgeClass: string
  iconBg: string
  glowColor: string
}[] = [
  {
    key: "YELLO",
    name: "MTN",
    color: "#FFC107",
    badgeClass: "badge-mtn",
    iconBg: "rgba(255, 193, 7, 0.15)",
    glowColor: "rgba(255, 193, 7, 0.3)",
  },
  {
    key: "TELECEL",
    name: "Telecel",
    color: "#FF4444",
    badgeClass: "badge-telecel",
    iconBg: "rgba(230, 0, 0, 0.15)",
    glowColor: "rgba(230, 0, 0, 0.3)",
  },
  {
    key: "AT_PREMIUM",
    name: "AirtelTigo",
    color: "#4499FF",
    badgeClass: "badge-airteltigo",
    iconBg: "rgba(0, 102, 204, 0.15)",
    glowColor: "rgba(0, 102, 204, 0.3)",
  },
]

// ─── Fallback Bundles ────────────────────────────────────────────

const FALLBACK_PRODUCTS: Product[] = [
  { id: "mtn-1", network: "YELLO", capacity: 1, mb: 1024, displayName: "1GB", basePrice: 4.5, sellingPrice: 5, profit: 0.5, inStock: true },
  { id: "mtn-2", network: "YELLO", capacity: 2, mb: 2048, displayName: "2GB", basePrice: 9, sellingPrice: 10, profit: 1, inStock: true },
  { id: "mtn-5", network: "YELLO", capacity: 5, mb: 5120, displayName: "5GB", basePrice: 22, sellingPrice: 24, profit: 2, inStock: true },
  { id: "mtn-10", network: "YELLO", capacity: 10, mb: 10240, displayName: "10GB", basePrice: 44, sellingPrice: 47, profit: 3, inStock: true },
  { id: "telecel-1", network: "TELECEL", capacity: 1, mb: 1024, displayName: "1GB", basePrice: 4, sellingPrice: 4.5, profit: 0.5, inStock: true },
  { id: "telecel-2", network: "TELECEL", capacity: 2, mb: 2048, displayName: "2GB", basePrice: 8, sellingPrice: 9, profit: 1, inStock: true },
  { id: "telecel-5", network: "TELECEL", capacity: 5, mb: 5120, displayName: "5GB", basePrice: 20, sellingPrice: 22, profit: 2, inStock: true },
  { id: "telecel-10", network: "TELECEL", capacity: 10, mb: 10240, displayName: "10GB", basePrice: 40, sellingPrice: 43, profit: 3, inStock: true },
  { id: "at-1", network: "AT_PREMIUM", capacity: 1, mb: 1024, displayName: "1GB", basePrice: 4.5, sellingPrice: 5, profit: 0.5, inStock: true },
  { id: "at-2", network: "AT_PREMIUM", capacity: 2, mb: 2048, displayName: "2GB", basePrice: 9, sellingPrice: 10, profit: 1, inStock: true },
  { id: "at-5", network: "AT_PREMIUM", capacity: 5, mb: 5120, displayName: "5GB", basePrice: 22, sellingPrice: 24, profit: 2, inStock: true },
  { id: "at-10", network: "AT_PREMIUM", capacity: 10, mb: 10240, displayName: "10GB", basePrice: 44, sellingPrice: 47, profit: 3, inStock: true },
]

// ─── Helpers ─────────────────────────────────────────────────────

function getNetworkConfig(key: NetworkKey) {
  return NETWORKS.find((n) => n.key === key)
}

function formatPrice(price: number): string {
  return `₵${price.toFixed(2)}`
}

// ─── Component ───────────────────────────────────────────────────

export default function BuyDataPage() {
  const { navigate, goBack, user } = useAppStore()

  // State
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkKey | null>(null)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [selectedBundle, setSelectedBundle] = useState<Product | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [purchaseStatus, setPurchaseStatus] = useState<PurchaseStatus>("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [orderReference, setOrderReference] = useState("")

  // Network detection state
  const [detectedNetwork, setDetectedNetwork] = useState<DetectedNetwork>(null)
  const [isVerified, setIsVerified] = useState(false)

  // Fetch products on mount
  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true)
    try {
      const res = await fetch("/api/datamart/products")
      if (!res.ok) throw new Error("Failed to fetch products")
      const data = await res.json()
      if (data.products && data.products.length > 0) {
        setProducts(data.products)
      } else {
        setProducts(FALLBACK_PRODUCTS)
      }
    } catch {
      setProducts(FALLBACK_PRODUCTS)
    } finally {
      setLoadingProducts(false)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Auto-detect network when phone number changes
  useEffect(() => {
    if (phoneNumber.length >= 3) {
      const detected = detectNetwork(phoneNumber)
      setDetectedNetwork(detected)

      if (detected && detected !== selectedNetwork) {
        setSelectedNetwork(detected as NetworkKey)
        setSelectedBundle(null)
      }
    } else {
      setDetectedNetwork(null)
    }
    // Reset verification when phone number changes
    setIsVerified(false)
  }, [phoneNumber, selectedNetwork])

  // Reset verification when bundle changes
  useEffect(() => {
    setIsVerified(false)
  }, [selectedBundle])

  // Filtered bundles by selected network
  const filteredProducts = selectedNetwork
    ? products.filter((p) => p.network === selectedNetwork)
    : products

  // Group products by network for display
  const groupedProducts: Record<NetworkKey, Product[]> = {
    YELLO: filteredProducts.filter((p) => p.network === "YELLO"),
    TELECEL: filteredProducts.filter((p) => p.network === "TELECEL"),
    AT_PREMIUM: filteredProducts.filter((p) => p.network === "AT_PREMIUM"),
  }

  // Validate phone
  const phoneError = phoneNumber.length > 0 && !isValidGhanaPhone(phoneNumber)
  const phoneValid = isValidGhanaPhone(phoneNumber)

  // Network detection status for UI
  const networkDetectedFromPhone = phoneNumber.length >= 3 && detectedNetwork !== null
  const networkNotDetected = phoneNumber.length >= 3 && detectedNetwork === null

  // Can verify: need valid phone, network, and bundle selected
  const canVerify = phoneValid && selectedNetwork !== null && selectedBundle !== null

  // Can proceed to purchase only after verification
  const canPurchase =
    selectedNetwork !== null &&
    isValidGhanaPhone(phoneNumber) &&
    selectedBundle !== null &&
    isVerified &&
    purchaseStatus !== "loading"

  // Handle verify
  const handleVerify = () => {
    if (!canVerify) return
    setIsVerified(true)
  }

  // Handle purchase
  const handlePurchase = async () => {
    if (!canPurchase || !selectedBundle) return

    setPurchaseStatus("loading")
    setErrorMessage("")

    try {
      const res = await fetch("/api/datamart/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber,
          network: selectedNetwork,
          capacity: selectedBundle.capacity,
          price: selectedBundle.sellingPrice,
          costPrice: selectedBundle.basePrice,
          userId: user?.id || "guest",
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Purchase failed. Please try again.")
      }

      setPurchaseStatus("success")
      setOrderReference(data.order?.reference || data.datamartReference || data.idempotencyKey || "N/A")
      toast.success("Data bundle purchased successfully!", {
        description: `${selectedBundle.displayName} sent to ${phoneNumber}`,
      })
    } catch (err) {
      setPurchaseStatus("error")
      const msg = err instanceof Error ? err.message : "Purchase failed. Please try again."
      setErrorMessage(msg)
      toast.error("Purchase failed", { description: msg })
    }
  }

  // Reset form after success
  const handleReset = () => {
    setSelectedNetwork(null)
    setPhoneNumber("")
    setSelectedBundle(null)
    setPurchaseStatus("idle")
    setErrorMessage("")
    setOrderReference("")
    setDetectedNetwork(null)
    setIsVerified(false)
  }

  // ─── Success State ──────────────────────────────────────────────

  if (purchaseStatus === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "#0A0A0A" }}>
        <div className="w-full max-w-md animate-fade-in">
          <Card className="glass-card-cyan border-0 overflow-hidden">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center success-animation" style={{ background: "rgba(34, 197, 94, 0.15)", border: "2px solid rgba(34, 197, 94, 0.4)" }}>
                <CircleCheck className="w-10 h-10" style={{ color: "#22C55E" }} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Purchase Successful!</h2>
              <p className="text-gray-400 mb-6">Your data bundle is on its way</p>

              <div className="glass-card rounded-xl p-4 mb-6 text-left space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Bundle</span>
                  <span className="text-white font-semibold">{selectedBundle?.displayName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Network</span>
                  <span className="font-semibold" style={{ color: getNetworkConfig(selectedNetwork!)?.color }}>
                    {getNetworkConfig(selectedNetwork!)?.name}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Phone</span>
                  <span className="text-white font-semibold">{phoneNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Amount</span>
                  <span className="text-white font-semibold">{formatPrice(selectedBundle?.sellingPrice || 0)}</span>
                </div>
                {orderReference && (
                  <>
                    <Separator className="bg-[#2A2A2A]" />
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">Reference</span>
                      <span className="text-sm font-mono" style={{ color: "#00E5FF" }}>{orderReference}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleReset}
                  className="w-full btn-primary-green h-12 text-base font-semibold rounded-xl"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Buy Another Bundle
                </Button>
                <Button
                  onClick={() => navigate("my-orders")}
                  variant="outline"
                  className="w-full h-12 text-base font-semibold rounded-xl border-[#2A2A2A] text-gray-300 hover:bg-[#1F1F1F] hover:text-white"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  View My Orders
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // ─── Main Purchase Flow ─────────────────────────────────────────

  return (
    <div className="min-h-screen pb-8" style={{ background: "#0A0A0A" }}>
      {/* Header */}
      <div className="sticky top-0 z-50 glass-card border-b border-[#2A2A2A]" style={{ background: "rgba(10, 10, 10, 0.95)" }}>
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={goBack}
            className="text-gray-400 hover:text-white hover:bg-[#1F1F1F] rounded-xl"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-white">Buy Data Bundle</h1>
            <p className="text-xs text-gray-500">Instant delivery to any network</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
        {/* ─── Step 1: Network Selection ──────────────────────────── */}
        <section className="animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: "rgba(255, 193, 7, 0.15)", color: "#FFC107" }}>1</div>
            <h2 className="text-base font-semibold text-white">Select Network</h2>
            {detectedNetwork && (
              <Badge className="text-[10px] border-0 ml-1 animate-fade-in" style={{ background: "rgba(0, 229, 255, 0.15)", color: "#00E5FF" }}>
                Auto-detected
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            {NETWORKS.map((network) => {
              const isSelected = selectedNetwork === network.key
              const wasAutoDetected = detectedNetwork === network.key
              return (
                <button
                  key={network.key}
                  onClick={() => {
                    setSelectedNetwork(network.key)
                    setSelectedBundle(null)
                    setIsVerified(false)
                  }}
                  className={`premium-card rounded-xl p-4 text-center transition-all duration-300 cursor-pointer ${
                    isSelected ? "scale-[1.02]" : ""
                  }`}
                  style={{
                    background: isSelected ? network.iconBg : "#171717",
                    borderColor: isSelected ? network.color : "#2A2A2A",
                    boxShadow: isSelected ? `0 0 20px ${network.glowColor}` : "none",
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center"
                    style={{ background: isSelected ? network.color : network.iconBg }}
                  >
                    <Signal className="w-6 h-6" style={{ color: isSelected ? "#0A0A0A" : network.color }} />
                  </div>
                  <span className="text-sm font-semibold text-white block">{network.name}</span>
                  <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${network.badgeClass}`}>
                    {network.key}
                  </span>
                  {isSelected && (
                    <div className="mt-2 flex justify-center items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" style={{ color: network.color }} />
                      {wasAutoDetected && (
                        <span className="text-[9px] font-medium" style={{ color: "#00E5FF" }}>Detected</span>
                      )}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </section>

        {/* ─── Step 2: Phone Number ───────────────────────────────── */}
        <section className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: "rgba(255, 193, 7, 0.15)", color: "#FFC107" }}>2</div>
            <h2 className="text-base font-semibold text-white">Enter Phone Number</h2>
          </div>

          <Card className="glass-card border-[#2A2A2A] rounded-xl">
            <CardContent className="p-4">
              <Label className="text-sm text-gray-400 mb-2 block">Ghana Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "")
                    if (val.length <= 10) {
                      setPhoneNumber(val)
                    }
                    if (selectedBundle) {
                      setSelectedBundle(null)
                    }
                  }}
                  placeholder="0XXXXXXXXX"
                  className="h-12 pl-10 pr-10 bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder:text-gray-600 rounded-xl text-base focus-visible:border-[#FFC107] focus-visible:ring-[#FFC107]/20"
                />
                {phoneNumber.length > 0 && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {phoneValid ? (
                      <CheckCircle2 className="w-5 h-5" style={{ color: "#22C55E" }} />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                )}
              </div>

              {/* Phone format error */}
              {phoneError && (
                <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Enter a valid Ghana number (starts with 0, exactly 10 digits)
                </p>
              )}

              {/* Network detection feedback */}
              {networkDetectedFromPhone && phoneValid && (
                <div className="mt-2 rounded-lg p-2.5 flex items-center gap-2 animate-fade-in" style={{ background: "rgba(0, 229, 255, 0.08)", border: "1px solid rgba(0, 229, 255, 0.2)" }}>
                  <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: "#00E5FF" }} />
                  <span className="text-xs" style={{ color: "#00E5FF" }}>
                    We detected this number as <strong>{getNetworkName(detectedNetwork)}</strong>. Is that correct?
                  </span>
                </div>
              )}

              {/* Network not detected warning */}
              {networkNotDetected && phoneValid && (
                <div className="mt-2 rounded-lg p-2.5 flex items-center gap-2 animate-fade-in" style={{ background: "rgba(255, 193, 7, 0.08)", border: "1px solid rgba(255, 193, 7, 0.2)" }}>
                  <MessageCircleWarning className="w-4 h-4 shrink-0" style={{ color: "#FFC107" }} />
                  <span className="text-xs" style={{ color: "#FFC107" }}>
                    Could not detect network. Please select manually.
                  </span>
                </div>
              )}

              {/* Valid number confirmation */}
              {phoneValid && !networkDetectedFromPhone && !networkNotDetected && (
                <p className="text-xs mt-2 flex items-center gap-1" style={{ color: "#22C55E" }}>
                  <CheckCircle2 className="w-3 h-3" />
                  Valid Ghana number
                </p>
              )}
            </CardContent>
          </Card>
        </section>

        {/* ─── Step 3: Bundle Selection ───────────────────────────── */}
        <section className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: "rgba(255, 193, 7, 0.15)", color: "#FFC107" }}>3</div>
            <h2 className="text-base font-semibold text-white">Choose Bundle</h2>
            {selectedNetwork && (
              <Badge className={`${getNetworkConfig(selectedNetwork)?.badgeClass} text-[10px] border-0 ml-1`}>
                {getNetworkConfig(selectedNetwork)?.name}
              </Badge>
            )}
          </div>

          {loadingProducts ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-xl p-4 border border-[#2A2A2A] bg-[#171717] animate-pulse">
                  <div className="h-4 w-12 bg-[#2A2A2A] rounded mb-3" />
                  <div className="h-6 w-16 bg-[#2A2A2A] rounded mb-2" />
                  <div className="h-3 w-20 bg-[#2A2A2A] rounded" />
                </div>
              ))}
            </div>
          ) : !selectedNetwork ? (
            <Card className="glass-card border-[#2A2A2A] rounded-xl">
              <CardContent className="p-8 text-center">
                <Wifi className="w-10 h-10 mx-auto mb-3 text-gray-600" />
                <p className="text-gray-500 text-sm">Enter your phone number or select a network above to see available bundles</p>
              </CardContent>
            </Card>
          ) : groupedProducts[selectedNetwork].length === 0 ? (
            <Card className="glass-card border-[#2A2A2A] rounded-xl">
              <CardContent className="p-8 text-center">
                <Package className="w-10 h-10 mx-auto mb-3 text-gray-600" />
                <p className="text-gray-500 text-sm">No bundles available for this network</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {groupedProducts[selectedNetwork]
                .sort((a, b) => a.capacity - b.capacity)
                .map((product) => {
                  const isSelected = selectedBundle?.id === product.id
                  const networkCfg = getNetworkConfig(product.network as NetworkKey)
                  const perGB = product.capacity > 0 ? product.sellingPrice / product.capacity : 0

                  return (
                    <button
                      key={product.id}
                      onClick={() => {
                        if (product.inStock) {
                          setSelectedBundle(isSelected ? null : product)
                        }
                      }}
                      disabled={!product.inStock}
                      className={`premium-card rounded-xl p-4 text-center transition-all duration-300 cursor-pointer relative overflow-hidden ${
                        isSelected ? "scale-[1.02]" : ""
                      } ${!product.inStock ? "opacity-50 cursor-not-allowed" : ""}`}
                      style={{
                        background: isSelected ? (networkCfg?.iconBg || "#171717") : "#171717",
                        borderColor: isSelected ? (networkCfg?.color || "#2A2A2A") : "#2A2A2A",
                        boxShadow: isSelected ? `0 0 20px ${networkCfg?.glowColor || "transparent"}` : "none",
                      }}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle2 className="w-4 h-4" style={{ color: networkCfg?.color || "#22C55E" }} />
                        </div>
                      )}
                      <div className="text-2xl font-bold text-white mb-1">
                        {product.displayName}
                      </div>
                      <div className="text-lg font-bold mb-1" style={{ color: networkCfg?.color || "#FFC107" }}>
                        {formatPrice(product.sellingPrice)}
                      </div>
                      <div className="text-[10px] text-gray-500">
                        {formatPrice(perGB)}/GB
                      </div>
                      {!product.inStock && (
                        <div className="text-[10px] text-red-400 mt-1 font-medium">Out of Stock</div>
                      )}
                    </button>
                  )
                })}
            </div>
          )}
        </section>

        {/* ─── Step 4: Verify & Purchase ──────────────────────────── */}
        {(selectedNetwork || selectedBundle) && (
          <section className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: "rgba(255, 193, 7, 0.15)", color: "#FFC107" }}>4</div>
              <h2 className="text-base font-semibold text-white">Verify & Purchase</h2>
            </div>

            <Card className="glass-card-cyan border-0 rounded-xl overflow-hidden data-flow-line">
              <CardContent className="p-5 space-y-4">
                {/* Selected Bundle Info */}
                {selectedBundle ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ background: getNetworkConfig(selectedNetwork!)?.iconBg }}
                      >
                        <Wifi className="w-5 h-5" style={{ color: getNetworkConfig(selectedNetwork!)?.color }} />
                      </div>
                      <div>
                        <p className="text-white font-semibold">{selectedBundle.displayName} Data</p>
                        <p className="text-xs text-gray-500">
                          {getNetworkConfig(selectedNetwork!)?.name} Network
                        </p>
                      </div>
                    </div>
                    <span className="text-lg font-bold" style={{ color: getNetworkConfig(selectedNetwork!)?.color }}>
                      {formatPrice(selectedBundle.sellingPrice)}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-gray-500">
                    <ShoppingCart className="w-5 h-5" />
                    <span className="text-sm">No bundle selected yet</span>
                  </div>
                )}

                <Separator className="bg-[#2A2A2A]" />

                {/* Phone Number */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-400">Phone Number</span>
                  </div>
                  <span className="text-sm text-white font-medium">
                    {phoneNumber || "Not entered"}
                  </span>
                </div>

                {/* Network */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Signal className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-400">Network</span>
                  </div>
                  {selectedNetwork ? (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getNetworkConfig(selectedNetwork)?.badgeClass}`}>
                      {getNetworkConfig(selectedNetwork)?.name}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-600">Not selected</span>
                  )}
                </div>

                {/* Total */}
                {selectedBundle && (
                  <>
                    <Separator className="bg-[#2A2A2A]" />
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-white">Total</span>
                      <span className="text-xl font-bold" style={{ color: "#22C55E" }}>
                        {formatPrice(selectedBundle.sellingPrice)}
                      </span>
                    </div>
                  </>
                )}

                {/* Verification Section */}
                {canVerify && !isVerified && (
                  <div className="rounded-xl p-4 space-y-3" style={{ background: "rgba(255, 193, 7, 0.06)", border: "1px solid rgba(255, 193, 7, 0.2)" }}>
                    <div className="flex items-center gap-2 mb-1">
                      <Eye className="w-4 h-4" style={{ color: "#FFC107" }} />
                      <span className="text-sm font-semibold text-white">Verify Your Order</span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      You are buying <strong className="text-white">{selectedBundle?.displayName}</strong> for{" "}
                      <strong className="text-white">{phoneNumber}</strong> on{" "}
                      <strong style={{ color: getNetworkConfig(selectedNetwork!)?.color }}>
                        {getNetworkConfig(selectedNetwork!)?.name}
                      </strong>.
                      Please confirm this is correct.
                    </p>
                    <Button
                      onClick={handleVerify}
                      className="w-full h-10 text-sm font-semibold rounded-xl"
                      style={{ background: "#FFC107", color: "#0A0A0A" }}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Yes, This Is Correct
                    </Button>
                  </div>
                )}

                {/* Verified Confirmation */}
                {isVerified && (
                  <div className="rounded-xl p-3 flex items-center gap-2 animate-fade-in" style={{ background: "rgba(34, 197, 94, 0.08)", border: "1px solid rgba(34, 197, 94, 0.25)" }}>
                    <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: "#22C55E" }} />
                    <span className="text-xs font-medium" style={{ color: "#22C55E" }}>
                      Order verified — {selectedBundle?.displayName} for {phoneNumber} on {getNetworkConfig(selectedNetwork!)?.name}
                    </span>
                  </div>
                )}

                {/* Error Message */}
                {purchaseStatus === "error" && errorMessage && (
                  <div className="rounded-xl p-3 flex items-start gap-2" style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)" }}>
                    <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-red-300">{errorMessage}</p>
                  </div>
                )}

                {/* Purchase Button */}
                <Button
                  onClick={handlePurchase}
                  disabled={!canPurchase}
                  className={`w-full h-13 text-base font-semibold rounded-xl transition-all duration-300 ${
                    canPurchase
                      ? "btn-primary-green animate-pulse-glow-green"
                      : "bg-[#1F1F1F] text-gray-600 cursor-not-allowed hover:bg-[#1F1F1F]"
                  }`}
                  style={{
                    minHeight: "48px",
                  }}
                >
                  {purchaseStatus === "loading" ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing Purchase...
                    </>
                  ) : canPurchase ? (
                    <>
                      <CreditCard className="w-5 h-5 mr-2" />
                      Purchase {selectedBundle?.displayName} for {formatPrice(selectedBundle?.sellingPrice || 0)}
                    </>
                  ) : !isVerified && canVerify ? (
                    <>
                      <Shield className="w-5 h-5 mr-2" />
                      Verify your order to enable purchase
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5 mr-2" />
                      Complete all steps to purchase
                    </>
                  )}
                </Button>

                {/* Security Badge */}
                <div className="flex items-center justify-center gap-2 pt-1">
                  <Shield className="w-3 h-3 text-gray-600" />
                  <span className="text-[10px] text-gray-600">Secured by Dataghmart • Instant Delivery</span>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Quick Bundle Access (when no network selected) */}
        {!selectedNetwork && !loadingProducts && (
          <section className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4" style={{ color: "#FFC107" }} />
              Popular Bundles
            </h2>
            <div className="space-y-3">
              {NETWORKS.map((network) => {
                const networkProducts = products
                  .filter((p) => p.network === network.key)
                  .sort((a, b) => a.capacity - b.capacity)

                if (networkProducts.length === 0) return null

                return (
                  <Card key={network.key} className="premium-card border-[#2A2A2A] bg-[#171717] rounded-xl">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ background: network.iconBg }}
                          >
                            <Signal className="w-4 h-4" style={{ color: network.color }} />
                          </div>
                          <span className="text-sm font-semibold text-white">{network.name}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${network.badgeClass}`}>
                            {network.key}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedNetwork(network.key)
                            setSelectedBundle(null)
                          }}
                          className="text-xs hover:bg-[#1F1F1F] rounded-lg"
                          style={{ color: network.color }}
                        >
                          View All <ChevronRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                      <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                        {networkProducts.slice(0, 4).map((product) => (
                          <button
                            key={product.id}
                            onClick={() => {
                              setSelectedNetwork(network.key)
                              setSelectedBundle(product)
                            }}
                            className="shrink-0 px-3 py-2 rounded-lg border border-[#2A2A2A] bg-[#0A0A0A] hover:border-[#3A3A3A] transition-all cursor-pointer"
                          >
                            <div className="text-xs font-bold text-white">{product.displayName}</div>
                            <div className="text-xs font-semibold mt-0.5" style={{ color: network.color }}>
                              {formatPrice(product.sellingPrice)}
                            </div>
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
