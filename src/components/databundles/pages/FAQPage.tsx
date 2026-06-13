"use client"

import { HelpCircle, MessageSquare, ArrowRight, Search, ShoppingBag, Truck, Users, CreditCard } from "lucide-react"
import { useAppStore } from "@/store/useAppStore"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

// ─── FAQ Categories & Items ────────────────────────────────────
const FAQ_CATEGORIES = [
  {
    title: "General",
    icon: HelpCircle,
    color: "#FFC107",
    items: [
      {
        q: "What is Dataghmart Data Bundles?",
        a: "Dataghmart is Ghana's leading platform for purchasing affordable data bundles online. We support MTN, Telecel, and AirtelTigo networks with instant delivery and competitive pricing. Our platform makes it easy to buy data anytime, anywhere in Ghana.",
      },
      {
        q: "Which networks are supported?",
        a: "We currently support all major Ghanaian telecom networks: MTN (YELLO), Telecel (formerly Vodafone), and AirtelTigo (AT Premium). We are always working to add more networks to serve you better.",
      },
      {
        q: "Is Dataghmart available 24/7?",
        a: "Yes! Our platform operates 24 hours a day, 7 days a week. You can purchase data bundles at any time, and delivery is automated and instant regardless of the time.",
      },
    ],
  },
  {
    title: "Purchasing",
    icon: ShoppingBag,
    color: "#22C55E",
    items: [
      {
        q: "How do I buy a data bundle?",
        a: "Simply select your network, choose your data amount, enter the recipient phone number, and make payment. Your data will be delivered instantly. The entire process takes less than a minute.",
      },
      {
        q: "Do I need an account to buy data?",
        a: "No, you can make a one-time purchase without creating an account. However, having an account gives you access to order history, exclusive deals, and faster checkout with saved details.",
      },
      {
        q: "Can I buy data for someone else?",
        a: "Absolutely! You can enter any Ghanaian phone number as the recipient. The data bundle will be delivered directly to that number. This makes it easy to send data to friends and family.",
      },
    ],
  },
  {
    title: "Delivery",
    icon: Truck,
    color: "#00E5FF",
    items: [
      {
        q: "How fast is data delivery?",
        a: "Data is delivered instantly — typically within 30 seconds of payment confirmation. In rare cases of network delays, delivery may take up to 5 minutes. You can track your order status using the Track Order feature.",
      },
      {
        q: "What if my data is not delivered?",
        a: "If your data bundle is not delivered within 10 minutes, please contact our support team immediately. We have a 100% delivery guarantee — if your data isn't delivered, you will receive a full refund to your original payment method.",
      },
      {
        q: "How do I track my order?",
        a: "Use our Track Order feature by entering your order reference number. You can also view all your orders in your account dashboard. Active orders auto-refresh every 10 seconds for real-time updates.",
      },
    ],
  },
  {
    title: "Agent Program",
    icon: Users,
    color: "#FFC107",
    items: [
      {
        q: "How do I become an agent?",
        a: "Sign up for the Agent Program for free. You'll get access to wholesale prices, commission on every sale, API integration tools, and a white-label option. Registration takes just a few minutes — powered by DataMart API.",
      },
      {
        q: "What are the agent tiers?",
        a: "We have four agent tiers: Bronze (3% commission), Silver (5% commission), Gold (8% commission), and Platinum (10% commission). Your tier is determined by your monthly order volume. The more you sell, the more you earn.",
      },
      {
        q: "What is the white-label option?",
        a: "Gold and Platinum agents can use our white-label solution to sell data bundles under their own brand. You get a customizable storefront and API access to integrate with your existing business.",
      },
    ],
  },
  {
    title: "Payments",
    icon: CreditCard,
    color: "#22C55E",
    items: [
      {
        q: "What payment methods are accepted?",
        a: "We accept mobile money payments (MTN MoMo, Telecel Cash), bank cards (Visa, Mastercard), and bank transfers. All payments are processed securely with bank-level encryption.",
      },
      {
        q: "Is my payment information safe?",
        a: "Yes. We use industry-standard encryption and never store your full payment details. All transactions are processed through secure payment gateways. Your financial data is always protected.",
      },
      {
        q: "How do refunds work?",
        a: "If your data bundle is not delivered, you are eligible for a full refund. Refunds are processed to your original payment method within 24-48 hours. Contact support to initiate a refund request.",
      },
    ],
  },
]

export default function FAQPage() {
  const navigate = useAppStore((s) => s.navigate)

  return (
    <div className="bg-[#0A0A0A]">
      {/* ─── Header ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-12 md:py-20">
        <div className="absolute inset-0 hero-grid-bg opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] via-transparent to-[#0A0A0A]" />

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#171717] border border-[#2A2A2A] mb-6">
            <HelpCircle className="w-4 h-4 text-[#FFC107]" />
            <span className="text-sm text-gray-400">Got Questions?</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Find answers to common questions about data bundles, purchasing, delivery, and our
            agent program.
          </p>
        </div>
      </section>

      {/* ─── FAQ Sections ────────────────────────────────────── */}
      <section className="py-8 md:py-14">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-10">
            {FAQ_CATEGORIES.map((category) => {
              const CategoryIcon = category.icon
              return (
                <div key={category.title}>
                  {/* Category Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${category.color}15` }}
                    >
                      <CategoryIcon className="w-5 h-5" style={{ color: category.color }} />
                    </div>
                    <h2 className="text-xl font-bold text-white">{category.title}</h2>
                  </div>

                  {/* Accordion */}
                  <Accordion type="single" collapsible className="space-y-2">
                    {category.items.map((item, idx) => (
                      <AccordionItem
                        key={idx}
                        value={`${category.title}-${idx}`}
                        className="glass-card rounded-xl border-0 px-1 overflow-hidden"
                      >
                        <AccordionTrigger className="text-white hover:no-underline hover:text-[#00E5FF] px-4 py-4 text-left text-sm font-medium">
                          {item.q}
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4 text-gray-400 text-sm leading-relaxed">
                          {item.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── Still Have Questions CTA ────────────────────────── */}
      <section className="py-14 border-t border-[#2A2A2A]">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#00E5FF]/10 flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-8 h-8 text-[#00E5FF]" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Still Have Questions?</h2>
            <p className="text-gray-400 mb-6">
              Our support team is available to help you with any questions about data bundles,
              payments, or our agent program.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                className="btn-primary-green rounded-xl font-semibold"
                onClick={() => navigate("contact")}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
              <Button
                variant="outline"
                className="border-[#2A2A2A] text-gray-300 hover:text-white hover:bg-[#1F1F1F] rounded-xl"
                onClick={() => navigate("buy-data")}
              >
                Buy Data Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SEO Content ─────────────────────────────────────── */}
      <section className="py-12 border-t border-[#2A2A2A]">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-bold text-white mb-4">
              Affordable Data Bundles in Ghana — Your Complete Guide
            </h2>
            <div className="space-y-4 text-gray-400 text-sm leading-relaxed">
              <p>
                Dataghmart is Ghana&apos;s most trusted platform for buying affordable data bundles online.
                Whether you need MTN data bundles, Telecel data packages, or AirtelTigo data plans,
                we offer the most competitive prices with instant delivery across all networks in Ghana.
              </p>
              <p>
                Our data bundle platform supports all major Ghanaian telecom networks including MTN Ghana,
                Telecel Ghana (formerly Vodafone Ghana), and AirtelTigo. With our instant delivery system,
                your data is activated within seconds of payment confirmation, making us the fastest data
                bundle delivery service in Ghana.
              </p>
              <p>
                Looking for the cheapest data bundles in Ghana? Our price comparison tool lets you compare
                data bundle prices across MTN, Telecel, and AirtelTigo so you always get the best deal.
                We also offer an agent reseller program with commission rates up to 10%, allowing you to
                earn money selling data bundles in Ghana.
              </p>
              <p>
                Whether you&apos;re in Accra, Kumasi, Tamale, Takoradi, or anywhere in Ghana, Dataghmart
                delivers data bundles to your phone instantly. No need to visit a physical shop — buy
                data online with mobile money, card, or bank transfer and get connected in seconds.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
