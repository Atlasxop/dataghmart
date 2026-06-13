"use client"

import { Shield, ArrowRight, Mail, Lock, Eye, Server } from "lucide-react"
import { useAppStore } from "@/store/useAppStore"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export default function PrivacyPage() {
  const navigate = useAppStore((s) => s.navigate)

  return (
    <div className="bg-[#0A0A0A]">
      {/* ─── Header ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-12 md:py-16">
        <div className="absolute inset-0 hero-grid-bg opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] via-transparent to-[#0A0A0A]" />

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#171717] border border-[#2A2A2A] mb-6">
            <Shield className="w-4 h-4 text-[#22C55E]" />
            <span className="text-sm text-gray-400">Your Privacy Matters</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-gray-400">Last updated: March 2025</p>
        </div>
      </section>

      {/* ─── Privacy Content ─────────────────────────────────── */}
      <section className="py-8 md:py-14">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="glass-card rounded-2xl p-6 md:p-10 space-y-8">
              {/* Introduction */}
              <div>
                <h2 className="text-xl font-bold text-white mb-3">Introduction</h2>
                <div className="space-y-3 text-gray-400 text-sm leading-relaxed">
                  <p>
                    Dataghmart (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy.
                    This Privacy Policy explains how we collect, use, disclose, and safeguard your
                    information when you use our data bundle platform.
                  </p>
                  <p>
                    Please read this Privacy Policy carefully. By using Dataghmart, you acknowledge
                    that you have read, understood, and agree to the practices described in this policy.
                    If you do not agree, please discontinue use of our Service.
                  </p>
                </div>
              </div>

              <Separator className="bg-[#2A2A2A]" />

              {/* 1. Data Collection */}
              <div>
                <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-[#00E5FF]" />
                  1. Data Collection
                </h2>
                <div className="space-y-3 text-gray-400 text-sm leading-relaxed">
                  <p>We collect the following types of information:</p>

                  <div className="pl-4 space-y-2">
                    <div>
                      <p className="text-white font-medium text-sm">Personal Information:</p>
                      <ul className="list-disc list-inside text-gray-400 space-y-1 mt-1">
                        <li>Full name</li>
                        <li>Email address</li>
                        <li>Phone number</li>
                        <li>Payment information (processed by third-party payment providers; we do not store full card details)</li>
                      </ul>
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">Transaction Information:</p>
                      <ul className="list-disc list-inside text-gray-400 space-y-1 mt-1">
                        <li>Order history and details</li>
                        <li>Payment records</li>
                        <li>Data bundle purchases</li>
                      </ul>
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">Technical Information:</p>
                      <ul className="list-disc list-inside text-gray-400 space-y-1 mt-1">
                        <li>IP address and browser type</li>
                        <li>Device information</li>
                        <li>Usage patterns and analytics</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="bg-[#2A2A2A]" />

              {/* 2. Data Usage */}
              <div>
                <h2 className="text-xl font-bold text-white mb-3">2. Data Usage</h2>
                <div className="space-y-3 text-gray-400 text-sm leading-relaxed">
                  <p>We use your information for the following purposes:</p>
                  <ul className="list-disc list-inside space-y-1.5 pl-2">
                    <li>Processing and delivering data bundle orders</li>
                    <li>Communicating order confirmations and status updates</li>
                    <li>Processing payments and managing refunds</li>
                    <li>Improving our platform and user experience</li>
                    <li>Sending important service notifications</li>
                    <li>Complying with legal obligations</li>
                    <li>Preventing fraud and unauthorized access</li>
                    <li>Providing customer support</li>
                  </ul>
                  <p>
                    We will not use your personal data for purposes materially different from those
                    described in this policy without providing you with notice and, where required,
                    obtaining your consent.
                  </p>
                </div>
              </div>

              <Separator className="bg-[#2A2A2A]" />

              {/* 3. Data Security */}
              <div>
                <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-[#22C55E]" />
                  3. Data Security
                </h2>
                <div className="space-y-3 text-gray-400 text-sm leading-relaxed">
                  <p>
                    We implement industry-standard security measures to protect your personal
                    information from unauthorized access, alteration, disclosure, or destruction.
                    These measures include:
                  </p>
                  <ul className="list-disc list-inside space-y-1.5 pl-2">
                    <li>SSL/TLS encryption for all data transmissions</li>
                    <li>Secure storage of personal data with encryption at rest</li>
                    <li>Regular security audits and vulnerability assessments</li>
                    <li>Access controls limiting employee access to personal data</li>
                    <li>Secure payment processing through certified payment providers</li>
                  </ul>
                  <p>
                    While we strive to protect your personal data, no method of electronic storage
                    or transmission is 100% secure. We cannot guarantee absolute security of your
                    information.
                  </p>
                </div>
              </div>

              <Separator className="bg-[#2A2A2A]" />

              {/* 4. Cookies & Tracking */}
              <div>
                <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                  <Server className="w-5 h-5 text-[#FFC107]" />
                  4. Cookies & Tracking Technologies
                </h2>
                <div className="space-y-3 text-gray-400 text-sm leading-relaxed">
                  <p>
                    We use cookies and similar tracking technologies to enhance your experience
                    on our platform. These include:
                  </p>
                  <ul className="list-disc list-inside space-y-1.5 pl-2">
                    <li>
                      <span className="text-white font-medium">Essential Cookies:</span> Required
                      for the platform to function properly (authentication, session management)
                    </li>
                    <li>
                      <span className="text-white font-medium">Analytics Cookies:</span> Help us
                      understand how users interact with our platform (page views, click patterns)
                    </li>
                    <li>
                      <span className="text-white font-medium">Preference Cookies:</span> Remember
                      your settings and preferences for a better experience
                    </li>
                  </ul>
                  <p>
                    You can control cookie preferences through your browser settings. Disabling
                    essential cookies may affect the functionality of our platform.
                  </p>
                </div>
              </div>

              <Separator className="bg-[#2A2A2A]" />

              {/* 5. Third Parties */}
              <div>
                <h2 className="text-xl font-bold text-white mb-3">5. Third-Party Sharing</h2>
                <div className="space-y-3 text-gray-400 text-sm leading-relaxed">
                  <p>
                    We do not sell, trade, or rent your personal data to third parties. We may
                    share your information only in the following circumstances:
                  </p>
                  <ul className="list-disc list-inside space-y-1.5 pl-2">
                    <li>
                      <span className="text-white font-medium">Telecom Networks:</span> To deliver
                      data bundles to your phone number, we share necessary details with the
                      relevant network provider (MTN, Telecel, or AirtelTigo)
                    </li>
                    <li>
                      <span className="text-white font-medium">Payment Processors:</span> To
                      process your payments securely, we share payment details with our certified
                      payment partners
                    </li>
                    <li>
                      <span className="text-white font-medium">Legal Requirements:</span> We may
                      disclose your information if required by law, regulation, or legal process
                    </li>
                    <li>
                      <span className="text-white font-medium">Service Providers:</span> We may
                      share data with trusted service providers who assist in operating our platform,
                      subject to confidentiality agreements
                    </li>
                  </ul>
                </div>
              </div>

              <Separator className="bg-[#2A2A2A]" />

              {/* 6. Your Rights */}
              <div>
                <h2 className="text-xl font-bold text-white mb-3">6. Your Rights</h2>
                <div className="space-y-3 text-gray-400 text-sm leading-relaxed">
                  <p>You have the following rights regarding your personal data:</p>
                  <ul className="list-disc list-inside space-y-1.5 pl-2">
                    <li>
                      <span className="text-white font-medium">Access:</span> You can request a
                      copy of the personal data we hold about you
                    </li>
                    <li>
                      <span className="text-white font-medium">Correction:</span> You can request
                      correction of inaccurate or incomplete personal data
                    </li>
                    <li>
                      <span className="text-white font-medium">Deletion:</span> You can request
                      deletion of your personal data, subject to legal retention requirements
                    </li>
                    <li>
                      <span className="text-white font-medium">Portability:</span> You can request
                      your data in a structured, machine-readable format
                    </li>
                    <li>
                      <span className="text-white font-medium">Objection:</span> You can object to
                      certain processing activities, such as direct marketing
                    </li>
                  </ul>
                  <p>
                    To exercise any of these rights, please contact us using the details provided
                    below. We will respond to your request within 30 days.
                  </p>
                </div>
              </div>

              <Separator className="bg-[#2A2A2A]" />

              {/* 7. Data Retention */}
              <div>
                <h2 className="text-xl font-bold text-white mb-3">7. Data Retention</h2>
                <div className="space-y-3 text-gray-400 text-sm leading-relaxed">
                  <p>
                    We retain your personal data only for as long as necessary to fulfill the
                    purposes for which it was collected, including legal, accounting, or reporting
                    requirements. Transaction records are retained for a minimum of 5 years as
                    required by Ghanaian financial regulations.
                  </p>
                  <p>
                    When your data is no longer needed, we will securely delete or anonymize it in
                    accordance with our data retention policy.
                  </p>
                </div>
              </div>

              <Separator className="bg-[#2A2A2A]" />

              {/* 8. Children's Privacy */}
              <div>
                <h2 className="text-xl font-bold text-white mb-3">8. Children&apos;s Privacy</h2>
                <div className="space-y-3 text-gray-400 text-sm leading-relaxed">
                  <p>
                    Our Service is not intended for children under the age of 13. We do not
                    knowingly collect personal data from children under 13. If we become aware
                    that we have collected personal data from a child under 13, we will take
                    steps to delete such information promptly.
                  </p>
                </div>
              </div>

              <Separator className="bg-[#2A2A2A]" />

              {/* 9. Changes to This Policy */}
              <div>
                <h2 className="text-xl font-bold text-white mb-3">9. Changes to This Policy</h2>
                <div className="space-y-3 text-gray-400 text-sm leading-relaxed">
                  <p>
                    We may update this Privacy Policy from time to time. We will notify you of
                    any material changes by posting the new Privacy Policy on this page and
                    updating the &quot;Last updated&quot; date. We encourage you to review this
                    Privacy Policy periodically for any changes.
                  </p>
                </div>
              </div>

              <Separator className="bg-[#2A2A2A]" />

              {/* 10. Contact Information */}
              <div>
                <h2 className="text-xl font-bold text-white mb-3">10. Contact Information</h2>
                <div className="space-y-3 text-gray-400 text-sm leading-relaxed">
                  <p>
                    If you have any questions, concerns, or requests regarding this Privacy Policy
                    or our data practices, please contact us:
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
                onClick={() => navigate("terms")}
              >
                View Terms of Service
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
