"use client"

import { FileText, ArrowRight, Mail } from "lucide-react"
import { useAppStore } from "@/store/useAppStore"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export default function TermsPage() {
  const navigate = useAppStore((s) => s.navigate)

  return (
    <div className="bg-[#0A0A0A]">
      {/* ─── Header ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-12 md:py-16">
        <div className="absolute inset-0 hero-grid-bg opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] via-transparent to-[#0A0A0A]" />

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#171717] border border-[#2A2A2A] mb-6">
            <FileText className="w-4 h-4 text-[#FFC107]" />
            <span className="text-sm text-gray-400">Legal</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Terms of Service
          </h1>
          <p className="text-gray-400">Last updated: March 2025</p>
        </div>
      </section>

      {/* ─── Terms Content ───────────────────────────────────── */}
      <section className="py-8 md:py-14">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="glass-card rounded-2xl p-6 md:p-10 space-y-8">
              {/* 1. Acceptance of Terms */}
              <div>
                <h2 className="text-xl font-bold text-white mb-3">1. Acceptance of Terms</h2>
                <div className="space-y-3 text-gray-400 text-sm leading-relaxed">
                  <p>
                    By accessing or using the Dataghmart platform (&quot;Service&quot;), you agree to be bound
                    by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, you may
                    not access or use the Service.
                  </p>
                  <p>
                    These Terms apply to all visitors, users, agents, and others who access or use
                    the Service. We reserve the right to update or modify these Terms at any time
                    without prior notice. Your continued use of the Service after any such changes
                    constitutes your acceptance of the new Terms.
                  </p>
                </div>
              </div>

              <Separator className="bg-[#2A2A2A]" />

              {/* 2. Services */}
              <div>
                <h2 className="text-xl font-bold text-white mb-3">2. Services</h2>
                <div className="space-y-3 text-gray-400 text-sm leading-relaxed">
                  <p>
                    Dataghmart provides an online platform for the sale and delivery of mobile data
                    bundles across Ghanaian telecom networks, including MTN, Telecel, and AirtelTigo.
                  </p>
                  <p>
                    Our Service includes: data bundle sales and delivery, order tracking, agent
                    reseller program, API integration tools, and white-label solutions. We reserve
                    the right to modify, suspend, or discontinue any part of the Service at any time.
                  </p>
                  <p>
                    Dataghmart acts as an intermediary between customers and telecom network providers.
                    We do not own or operate any telecom network. Data bundle availability and pricing
                    are subject to network provider terms and conditions.
                  </p>
                </div>
              </div>

              <Separator className="bg-[#2A2A2A]" />

              {/* 3. Payment Terms */}
              <div>
                <h2 className="text-xl font-bold text-white mb-3">3. Payment Terms</h2>
                <div className="space-y-3 text-gray-400 text-sm leading-relaxed">
                  <p>
                    All payments for data bundles are processed securely through our payment partners.
                    We accept mobile money (MTN MoMo, Telecel Cash), bank cards (Visa, Mastercard),
                    and bank transfers.
                  </p>
                  <p>
                    Prices are displayed in Ghanaian Cedis (GHS) and are inclusive of all applicable
                    taxes and fees. Prices are subject to change without prior notice, although we
                    strive to maintain consistent and competitive pricing.
                  </p>
                  <p>
                    In the event of a failed transaction where payment is deducted but data is not
                    delivered, the full amount will be refunded to the original payment method within
                    24-48 hours. Refund requests must be submitted within 7 days of the transaction.
                  </p>
                </div>
              </div>

              <Separator className="bg-[#2A2A2A]" />

              {/* 4. Agent Program */}
              <div>
                <h2 className="text-xl font-bold text-white mb-3">4. Agent Program</h2>
                <div className="space-y-3 text-gray-400 text-sm leading-relaxed">
                  <p>
                    The Dataghmart Agent Program allows registered agents to purchase data bundles at
                    wholesale prices and earn commissions on sales. Agent registration requires a
                    one-time fee and verification of identity.
                  </p>
                  <p>
                    Agent tiers (Bronze, Silver, Gold, Platinum) determine commission rates and
                    available features. Tiers are assigned based on monthly order volume and are
                    subject to periodic review.
                  </p>
                  <p>
                    Agents are responsible for compliance with all applicable laws and regulations
                    in their sales activities. Dataghmart reserves the right to suspend or terminate
                    agent accounts that violate these Terms or engage in fraudulent activity.
                  </p>
                </div>
              </div>

              <Separator className="bg-[#2A2A2A]" />

              {/* 5. Privacy & Data Protection */}
              <div>
                <h2 className="text-xl font-bold text-white mb-3">5. Privacy & Data Protection</h2>
                <div className="space-y-3 text-gray-400 text-sm leading-relaxed">
                  <p>
                    We are committed to protecting your privacy and personal data. Our collection
                    and use of personal information is governed by our Privacy Policy, which forms
                    an integral part of these Terms.
                  </p>
                  <p>
                    By using our Service, you consent to the collection, use, and storage of your
                    personal data as described in our Privacy Policy. We implement industry-standard
                    security measures to protect your information from unauthorized access or disclosure.
                  </p>
                </div>
              </div>

              <Separator className="bg-[#2A2A2A]" />

              {/* 6. Limitations of Liability */}
              <div>
                <h2 className="text-xl font-bold text-white mb-3">6. Limitations of Liability</h2>
                <div className="space-y-3 text-gray-400 text-sm leading-relaxed">
                  <p>
                    Dataghmart shall not be liable for any indirect, incidental, special, consequential,
                    or punitive damages resulting from your use of or inability to use the Service.
                  </p>
                  <p>
                    We are not responsible for data bundles delivered to incorrect phone numbers
                    provided by the user. It is the user&apos;s responsibility to verify the recipient
                    phone number before confirming a purchase.
                  </p>
                  <p>
                    Dataghmart is not liable for delays or failures in delivery caused by telecom
                    network outages, maintenance, or other factors beyond our reasonable control.
                    We will make commercially reasonable efforts to fulfill all orders promptly.
                  </p>
                  <p>
                    Our total liability for any claim arising from or related to the Service shall
                    not exceed the amount you paid to Dataghmart for the specific transaction giving
                    rise to the claim.
                  </p>
                </div>
              </div>

              <Separator className="bg-[#2A2A2A]" />

              {/* 7. User Responsibilities */}
              <div>
                <h2 className="text-xl font-bold text-white mb-3">7. User Responsibilities</h2>
                <div className="space-y-3 text-gray-400 text-sm leading-relaxed">
                  <p>
                    Users are responsible for maintaining the confidentiality of their account
                    credentials and for all activities that occur under their account.
                  </p>
                  <p>
                    Users must not use the Service for any unlawful purpose, including but not
                    limited to fraud, money laundering, or any activity that violates Ghanaian law
                    or the laws of any other applicable jurisdiction.
                  </p>
                  <p>
                    Users must provide accurate and complete information when creating an account
                    or making a purchase. Dataghmart reserves the right to suspend accounts with
                    suspicious or inaccurate information.
                  </p>
                </div>
              </div>

              <Separator className="bg-[#2A2A2A]" />

              {/* 8. Termination */}
              <div>
                <h2 className="text-xl font-bold text-white mb-3">8. Termination</h2>
                <div className="space-y-3 text-gray-400 text-sm leading-relaxed">
                  <p>
                    Dataghmart reserves the right to terminate or suspend your account and access
                    to the Service at our sole discretion, without prior notice, for conduct that
                    we believe violates these Terms or is harmful to other users, us, or third parties.
                  </p>
                  <p>
                    Upon termination, your right to use the Service will immediately cease. Provisions
                    of these Terms that by their nature should survive termination shall remain in
                    effect, including but not limited to limitation of liability and privacy provisions.
                  </p>
                </div>
              </div>

              <Separator className="bg-[#2A2A2A]" />

              {/* 9. Governing Law */}
              <div>
                <h2 className="text-xl font-bold text-white mb-3">9. Governing Law</h2>
                <div className="space-y-3 text-gray-400 text-sm leading-relaxed">
                  <p>
                    These Terms shall be governed by and construed in accordance with the laws of
                    the Republic of Ghana. Any disputes arising from these Terms or the Service
                    shall be resolved in the courts of Ghana.
                  </p>
                </div>
              </div>

              <Separator className="bg-[#2A2A2A]" />

              {/* 10. Contact */}
              <div>
                <h2 className="text-xl font-bold text-white mb-3">10. Contact Information</h2>
                <div className="space-y-3 text-gray-400 text-sm leading-relaxed">
                  <p>
                    If you have any questions about these Terms of Service, please contact us:
                  </p>
                  <div className="flex flex-col gap-2 pl-4">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-[#FFC107]" />
                      <span>Email: support@dataghmart.vercel.app</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-[#00E5FF]" />
                      <span>Location: Accra, Ghana</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
              <Button
                size="lg"
                className="btn-primary-green rounded-xl font-semibold px-8"
                onClick={() => navigate("buy-data")}
              >
                Buy Data Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                className="border-[#2A2A2A] text-gray-300 hover:text-white hover:bg-[#1F1F1F] rounded-xl px-8"
                onClick={() => navigate("privacy")}
              >
                View Privacy Policy
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
