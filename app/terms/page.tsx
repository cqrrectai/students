"use client"

import { PublicLayout } from "@/components/public-layout"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Scale } from "lucide-react"

export default function TermsPage() {
  return (
    <PublicLayout>
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-[#00e4a0]/5">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <Badge className="bg-[#00e4a0]/10 text-[#00e4a0] border-[#00e4a0]/20 px-4 py-2 text-sm font-medium mb-4">
              <Scale className="w-4 h-4 mr-2 inline-block" />
              Terms of Service
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Terms of Service
            </h1>
            <p className="text-xl text-gray-600">
              Please read these terms carefully before using our platform.
            </p>
          </div>

          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-8 space-y-8">
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900">1. Acceptance of Terms</h2>
                <p className="text-gray-600">
                  By accessing or using Cqrrect AI's platform, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900">2. User Accounts</h2>
                <div className="text-gray-600 space-y-2">
                  <p>When creating an account, you agree to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Provide accurate and complete information</li>
                    <li>Maintain the security of your account credentials</li>
                    <li>Accept responsibility for all activities under your account</li>
                    <li>Notify us immediately of any unauthorized access</li>
                  </ul>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900">3. Platform Usage</h2>
                <div className="text-gray-600 space-y-2">
                  <p>Users must:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Use the platform for its intended educational purposes</li>
                    <li>Not engage in any form of academic dishonesty</li>
                    <li>Respect intellectual property rights</li>
                    <li>Not attempt to circumvent our proctoring systems</li>
                  </ul>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900">4. AI Services</h2>
                <p className="text-gray-600">
                  Our AI-powered features are provided "as is" and may be updated or modified. While we strive for accuracy, we do not guarantee the completeness or accuracy of AI-generated content.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900">5. Payment Terms</h2>
                <div className="text-gray-600 space-y-2">
                  <p>For paid services:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Payments are processed securely through our platform</li>
                    <li>Subscriptions auto-renew unless cancelled</li>
                    <li>Refunds are subject to our refund policy</li>
                  </ul>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900">6. Intellectual Property</h2>
                <p className="text-gray-600">
                  All content, features, and functionality of our platform are owned by Cqrrect AI and protected by international copyright, trademark, and other intellectual property laws.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900">7. Limitation of Liability</h2>
                <p className="text-gray-600">
                  Cqrrect AI shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the platform.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900">8. Contact Information</h2>
                <p className="text-gray-600">
                  For questions about these Terms of Service, please contact us at:
                </p>
                <div className="text-gray-600">
                  <p>Email: Info@cqrrect.com</p>
                  <p>Phone: +88 01960-2806</p>
                  <p>Address: E-14/X, ICT Tower (14th Floor), Agargaon, Dhaka - 1207</p>
                </div>
              </section>

              <div className="text-sm text-gray-500 pt-8 border-t">
                <p>Last updated: March 2024</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicLayout>
  )
} 