"use client"

import { useState } from "react"
import {
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  Clock,
  Send,
  CheckCircle2,
  ExternalLink,
  HelpCircle,
} from "lucide-react"
import { useAppStore } from "@/store/useAppStore"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"

// ─── Contact Info ──────────────────────────────────────────────
const CONTACT_ITEMS = [
  {
    icon: Phone,
    title: "Phone",
    detail: "+233 XX XXX XXXX",
    sub: "Mon-Fri 8am-6pm GMT",
    color: "#22C55E",
  },
  {
    icon: Mail,
    title: "Email",
    detail: "support@dataghmart.vercel.app",
    sub: "24/7 email response",
    color: "#FFC107",
  },
  {
    icon: MapPin,
    title: "Office",
    detail: "Accra, Ghana",
    sub: "Visit us by appointment",
    color: "#00E5FF",
  },
  {
    icon: MessageSquare,
    title: "WhatsApp",
    detail: "+233 XX XXX XXXX",
    sub: "Quick chat support",
    color: "#22C55E",
  },
]

// ─── Social Links ──────────────────────────────────────────────
const SOCIAL_LINKS = [
  { name: "Twitter / X", url: "#", color: "#1DA1F2" },
  { name: "Facebook", url: "#", color: "#4267B2" },
  { name: "Instagram", url: "#", color: "#E1306C" },
  { name: "WhatsApp", url: "#", color: "#25D366" },
]

// ─── Contact FAQ ───────────────────────────────────────────────
const CONTACT_FAQ = [
  {
    q: "What is the fastest way to get support?",
    a: "WhatsApp is the fastest way to reach us. You can also email us for non-urgent inquiries, and we will respond within 24 hours.",
  },
  {
    q: "Can I visit your office?",
    a: "Yes, but please schedule an appointment first by calling or emailing us. Walk-ins are not guaranteed to be seen immediately.",
  },
  {
    q: "How do I report an issue with my order?",
    a: "Use the Track Order feature to check your order status first. If there's an issue, contact us via WhatsApp or email with your order reference number.",
  },
]

export default function ContactPage() {
  const navigate = useAppStore((s) => s.navigate)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error("Please fill in all required fields")
      return
    }

    setSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setSubmitting(false)
    setSubmitted(true)
    toast.success("Message sent successfully! We'll get back to you soon.")

    // Reset after 5 seconds
    setTimeout(() => {
      setSubmitted(false)
      setFormData({ name: "", email: "", subject: "", message: "" })
    }, 5000)
  }

  return (
    <div className="bg-[#0A0A0A]">
      {/* ─── Header ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-12 md:py-20">
        <div className="absolute inset-0 hero-grid-bg opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] via-transparent to-[#0A0A0A]" />

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#171717] border border-[#2A2A2A] mb-6">
            <Mail className="w-4 h-4 text-[#FFC107]" />
            <span className="text-sm text-gray-400">Get In Touch</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Contact Us
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Have questions or need help? Our team is here for you. Reach out through any
            of the channels below.
          </p>
        </div>
      </section>

      {/* ─── Contact Grid ────────────────────────────────────── */}
      <section className="py-8 md:py-14">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Contact Info - Left Side */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-xl font-bold text-white mb-4">Get In Touch</h2>

              {CONTACT_ITEMS.map((item) => {
                const ItemIcon = item.icon
                return (
                  <div
                    key={item.title}
                    className="glass-card rounded-xl p-4 flex items-center gap-4 hover:border-[#00E5FF]/30 transition-all duration-300"
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${item.color}15` }}
                    >
                      <ItemIcon className="w-5 h-5" style={{ color: item.color }} />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{item.title}</p>
                      <p className="text-gray-300 text-sm">{item.detail}</p>
                      <p className="text-gray-500 text-xs">{item.sub}</p>
                    </div>
                  </div>
                )
              })}

              {/* Social Media Links */}
              <div className="pt-4">
                <h3 className="text-white font-semibold text-sm mb-3">Follow Us</h3>
                <div className="flex flex-wrap gap-2">
                  {SOCIAL_LINKS.map((social) => (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#171717] border border-[#2A2A2A] text-gray-300 hover:text-white hover:border-[#00E5FF]/30 transition-all"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {social.name}
                    </a>
                  ))}
                </div>
              </div>

              {/* Business Hours */}
              <div className="glass-card rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-[#FFC107]" />
                  <h3 className="text-white font-semibold text-sm">Business Hours</h3>
                </div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Monday - Friday</span>
                    <span className="text-white">8:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Saturday</span>
                    <span className="text-white">9:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Sunday</span>
                    <span className="text-gray-500">Closed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form - Right Side */}
            <div className="lg:col-span-3">
              <Card className="glass-card rounded-2xl border-0 bg-transparent">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-xl">Send a Message</CardTitle>
                  <p className="text-gray-400 text-sm">
                    Fill out the form below and we&apos;ll get back to you as soon as possible.
                  </p>
                </CardHeader>
                <CardContent>
                  {submitted ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-2xl bg-[#22C55E]/15 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8 text-[#22C55E]" />
                      </div>
                      <h3 className="text-white font-semibold text-xl mb-2">
                        Message Sent!
                      </h3>
                      <p className="text-gray-400 text-sm">
                        Thank you for reaching out. We&apos;ll respond within 24 hours.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-gray-300 text-sm">Name *</Label>
                          <Input
                            value={formData.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                            placeholder="Your name"
                            required
                            className="bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder:text-gray-500 rounded-xl focus:border-[#00E5FF] focus:ring-[#00E5FF]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-300 text-sm">Email *</Label>
                          <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleChange("email", e.target.value)}
                            placeholder="Your email"
                            required
                            className="bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder:text-gray-500 rounded-xl focus:border-[#00E5FF] focus:ring-[#00E5FF]"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-300 text-sm">Subject</Label>
                        <Input
                          value={formData.subject}
                          onChange={(e) => handleChange("subject", e.target.value)}
                          placeholder="What is this about?"
                          className="bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder:text-gray-500 rounded-xl focus:border-[#00E5FF] focus:ring-[#00E5FF]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-300 text-sm">Message *</Label>
                        <Textarea
                          value={formData.message}
                          onChange={(e) => handleChange("message", e.target.value)}
                          placeholder="How can we help you?"
                          rows={5}
                          required
                          className="bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder:text-gray-500 rounded-xl focus:border-[#00E5FF] focus:ring-[#00E5FF] resize-none"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={submitting}
                        className="w-full btn-primary-green rounded-xl font-semibold h-12"
                      >
                        {submitting ? (
                          <>
                            <Clock className="w-4 h-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Contact FAQ ─────────────────────────────────────── */}
      <section className="py-12 border-t border-[#2A2A2A]">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-bold text-white text-center mb-8">
              Common Questions
            </h2>

            <div className="space-y-3">
              {CONTACT_FAQ.map((faq, idx) => (
                <div key={idx} className="glass-card rounded-xl overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between p-4 text-left"
                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  >
                    <span className="text-white font-medium text-sm pr-4">{faq.q}</span>
                    <HelpCircle
                      className={`w-4 h-4 text-[#00E5FF] shrink-0 transition-transform duration-300 ${
                        expandedFaq === idx ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {expandedFaq === idx && (
                    <div className="px-4 pb-4 animate-fade-in">
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
