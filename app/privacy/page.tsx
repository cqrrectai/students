"use client"

import { PublicLayout } from "@/components/public-layout"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Shield } from "lucide-react"

export default function PrivacyPage() {
  return (
    <PublicLayout>
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-[#00e4a0]/5">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <Badge className="bg-[#00e4a0]/10 text-[#00e4a0] border-[#00e4a0]/20 px-4 py-2 text-sm font-medium mb-4">
              <Shield className="w-4 h-4 mr-2 inline-block" />
              Privacy Policy
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Your Privacy Matters
            </h1>
            <p className="text-xl text-gray-600">
              Learn how we protect your personal information and respect your privacy.
            </p>
          </div>

          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-8 space-y-8">
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900">Information We Collect</h2>
                <p className="text-gray-600">
                  We collect information that you provide directly to us, including:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Name and contact information when you create an account</li>
                  <li>Educational information and exam results</li>
                  <li>Usage data and interaction with our platform</li>
                  <li>Device and browser information</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900">How We Use Your Information</h2>
                <p className="text-gray-600">
                  We use the information we collect to:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Provide and improve our AI-powered exam platform</li>
                  <li>Personalize your learning experience</li>
                  <li>Analyze usage patterns and optimize our services</li>
                  <li>Communicate with you about updates and new features</li>
                  <li>Ensure the security of your account</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900">Data Security</h2>
                <p className="text-gray-600">
                  We implement appropriate security measures to protect your personal information:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Encryption of sensitive data</li>
                  <li>Regular security audits and updates</li>
                  <li>Strict access controls and authentication</li>
                  <li>Secure data storage and transmission</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900">Your Rights</h2>
                <p className="text-gray-600">
                  You have the right to:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Access your personal information</li>
                  <li>Request corrections to your data</li>
                  <li>Delete your account and associated data</li>
                  <li>Opt-out of marketing communications</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900">Contact Us</h2>
                <p className="text-gray-600">
                  If you have any questions about our Privacy Policy, please contact us at:
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