"use client"

import { Wifi, Zap, Mail, Phone, MapPin, ArrowRight, MessageCircle } from "lucide-react"
import { useAppStore } from "@/store/useAppStore"

export default function Footer() {
  const navigate = useAppStore((s) => s.navigate)

  const quickLinks = [
    { label: "Buy Data", view: "buy-data" as const },
    { label: "Data Bundles", view: "bundles" as const },
    { label: "Track Order", view: "tracker" as const },
    { label: "Pricing", view: "pricing" as const },
    { label: "How It Works", view: "how-it-works" as const },
    { label: "FAQ", view: "faq" as const },
  ]

  const companyLinks = [
    { label: "About Us", view: "about" as const },
    { label: "Contact", view: "contact" as const },
    { label: "Terms of Service", view: "terms" as const },
    { label: "Privacy Policy", view: "privacy" as const },
    { label: "Become an Agent", view: "agent-register" as const },
  ]

  const networks = [
    { name: "MTN Data Bundles", color: "#FFC107" },
    { name: "Telecel Data Bundles", color: "#FF4444" },
    { name: "AirtelTigo Data Bundles", color: "#4499FF" },
  ]

  return (
    <footer className="bg-[#0A0A0A] border-t border-[#2A2A2A] mt-auto">
      {/* CTA Banner */}
      <div className="border-b border-[#2A2A2A]">
        <div className="container mx-auto px-4 py-8">
          <div className="glass-card-cyan rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-1">
                Ready to Buy Affordable Data Bundles?
              </h3>
              <p className="text-gray-400 text-sm md:text-base">
                Get instant data delivery across all networks in Ghana. Fast, reliable, and affordable.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate("buy-data")}
                className="btn-primary-green px-6 py-3 rounded-xl font-semibold text-sm whitespace-nowrap"
              >
                Buy Data Now
              </button>
              <button
                onClick={() => navigate("agent-register")}
                className="btn-primary-yellow px-6 py-3 rounded-xl font-semibold text-sm whitespace-nowrap"
              >
                Become an Agent
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand + Contact */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#FFC107] to-[#E5AC00] flex items-center justify-center">
                <Zap className="w-5 h-5 text-[#0A0A0A]" />
              </div>
              <div>
                <span className="text-lg font-bold text-white">Dataghmart</span>
                <span className="text-xs font-medium text-[#00E5FF] block leading-tight">Data Bundles</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Ghana&apos;s trusted platform for affordable data bundles with instant delivery.
              Buy MTN, Telecel, and AirtelTigo data packages at the best prices.
            </p>

            {/* Contact Information */}
            <div className="space-y-2.5">
              <a
                href="https://wa.me/233275903662"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-sm text-gray-400 hover:text-[#22C55E] transition-colors group"
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(34, 197, 94, 0.12)" }}>
                  <MessageCircle className="w-3.5 h-3.5" style={{ color: "#22C55E" }} />
                </div>
                <span>+233 27 590 3662</span>
                <span className="text-[9px] font-medium px-1.5 py-0.5 rounded" style={{ background: "rgba(34, 197, 94, 0.12)", color: "#22C55E" }}>WhatsApp</span>
              </a>
              <a
                href="tel:+233535343490"
                className="flex items-center gap-2.5 text-sm text-gray-400 hover:text-[#FFC107] transition-colors group"
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(255, 193, 7, 0.12)" }}>
                  <Phone className="w-3.5 h-3.5" style={{ color: "#FFC107" }} />
                </div>
                <span>+233 53 534 3490</span>
              </a>
              <a
                href="mailto:brightsany3000@gmail.com"
                className="flex items-center gap-2.5 text-sm text-gray-400 hover:text-[#00E5FF] transition-colors group"
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(0, 229, 255, 0.12)" }}>
                  <Mail className="w-3.5 h-3.5" style={{ color: "#00E5FF" }} />
                </div>
                <span>brightsany3000@gmail.com</span>
              </a>
              <div className="flex items-center gap-2.5 text-sm text-gray-500">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(255, 255, 255, 0.05)" }}>
                  <MapPin className="w-3.5 h-3.5 text-gray-500" />
                </div>
                <span>Accra, Ghana</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.view}>
                  <button
                    onClick={() => navigate(link.view)}
                    className="text-gray-400 hover:text-[#FFC107] text-sm transition-colors duration-200 flex items-center gap-1.5 group"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Networks */}
          <div>
            <h4 className="text-white font-semibold mb-4">Networks</h4>
            <ul className="space-y-2.5">
              {networks.map((net) => (
                <li key={net.name}>
                  <button
                    onClick={() => navigate("bundles")}
                    className="text-gray-400 hover:text-white text-sm transition-colors duration-200 flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: net.color }} />
                    {net.name}
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-4 border-t border-[#2A2A2A]">
              <h4 className="text-white font-semibold mb-3">Company</h4>
              <ul className="space-y-2.5">
                {companyLinks.map((link) => (
                  <li key={link.view}>
                    <button
                      onClick={() => navigate(link.view)}
                      className="text-gray-400 hover:text-[#FFC107] text-sm transition-colors duration-200 flex items-center gap-1.5 group"
                    >
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Agent / SEO Content */}
          <div>
            <h4 className="text-white font-semibold mb-4">Agent Program</h4>
            <p className="text-gray-400 text-sm leading-relaxed mb-3">
              Join our agent reseller program and earn commissions selling data bundles across Ghana.
              Get access to wholesale pricing, API integration, and white-label solutions.
            </p>
            <button
              onClick={() => navigate("agent-register")}
              className="btn-primary-yellow px-4 py-2 rounded-lg text-sm font-semibold"
            >
              Register as Agent — Free
            </button>

            {/* Quick Contact CTA */}
            <div className="mt-4 pt-4 border-t border-[#2A2A2A]">
              <h4 className="text-white font-semibold mb-3">Need Help?</h4>
              <p className="text-gray-500 text-xs mb-3">Our support team is available on WhatsApp for quick assistance.</p>
              <a
                href="https://wa.me/233275903662"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
                style={{ background: "rgba(34, 197, 94, 0.12)", color: "#22C55E", border: "1px solid rgba(34, 197, 94, 0.25)" }}
              >
                <MessageCircle className="w-4 h-4" />
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#2A2A2A]">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} Dataghmart Data Bundles. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-gray-600 text-xs">
            <span>Ghana&apos;s Trusted Platform for Affordable Data Bundles</span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline">Instant Delivery & Agent Reseller Opportunities</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
