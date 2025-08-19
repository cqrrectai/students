"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Brain,
  Target,
  Users,
  Award,
  TrendingUp,
  ArrowRight,
  Sparkles,
  BookOpen,
  Clock,
  Shield,
  Globe,
  Lightbulb,
  Rocket,
  ChevronRight,
} from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/images/cqrrect-logo.png"
                alt="Cqrrect Ai Logo"
                width={120}
                height={40}
                className="h-8 w-auto"
              />
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/exams" className="text-gray-700 hover:text-[#00e4a0] transition-colors font-medium">
                Exams
              </Link>
              <Link href="/cqrrect-ai" className="text-gray-700 hover:text-[#00e4a0] transition-colors font-medium">
                AI Assistant
              </Link>
              <Link href="/courses" className="text-gray-700 hover:text-[#00e4a0] transition-colors font-medium">
                Courses
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-[#00e4a0] transition-colors font-medium">
                About
              </Link>
            </nav>

            {/* CTA Button */}
            <Link href="/pricing">
              <Button className="bg-[#00e4a0] hover:bg-[#00d494] text-white font-semibold px-6 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-[#00e4a0]/5 py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-[#00e4a0]/10 text-[#00e4a0] border-[#00e4a0]/20 px-4 py-2 text-sm font-medium">
                  🇧🇩 Bangladesh's #1 AI Exam Platform
                </Badge>
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Master Your
                  <span className="text-[#00e4a0] block">AI-Powered</span>
                  Exam Journey
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                  Experience the future of learning with Bangladesh's most advanced AI-powered exam platform. Smart
                  questions, instant feedback, and personalized learning paths.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">50K+</div>
                  <div className="text-sm text-gray-600">Students</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">1000+</div>
                  <div className="text-sm text-gray-600">AI Exams</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">95%</div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/exams">
                  <Button
                    size="lg"
                    className="bg-[#00e4a0] hover:bg-[#00d494] text-white font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
                  >
                    <Rocket className="mr-2 h-5 w-5" />
                    Start Free Exam
                  </Button>
                </Link>
                <Link href="/cqrrect-ai">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-gray-300 hover:border-[#00e4a0] text-gray-700 hover:text-[#00e4a0] font-semibold px-8 py-4 rounded-full transition-all duration-300 w-full sm:w-auto"
                  >
                    <Brain className="mr-2 h-5 w-5" />
                    Try AI Assistant
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative">
              <div className="relative">
                <Image
                  src="/images/cqrrect-hero-section.webp"
                  alt="Cqrrect AI Student"
                  width={600}
                  height={700}
                  className="w-full h-auto rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-500"
                  style={{
                    filter: "drop-shadow(0 25px 50px rgba(0, 228, 160, 0.15))",
                  }}
                />
                {/* Floating Elements */}
                <div className="absolute -top-6 -right-6 bg-[#00e4a0] text-white p-4 rounded-2xl shadow-lg animate-bounce">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-lg border border-gray-100 animate-pulse">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-[#00e4a0] rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">AI Powered</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Background Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-[#00e4a0]/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-[#00e4a0]/5 rounded-full blur-2xl"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-[#00e4a0]/10 text-[#00e4a0] border-[#00e4a0]/20 px-4 py-2 text-sm font-medium mb-4">
              Why Choose Cqrrect AI
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Revolutionary AI-Powered Learning</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the next generation of exam preparation with cutting-edge AI technology designed specifically
              for Bangladeshi students.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "Smart AI Questions",
                description: "AI-generated questions that adapt to your learning style and difficulty preference.",
                color: "bg-blue-500",
              },
              {
                icon: Target,
                title: "Personalized Learning",
                description: "Customized exam paths based on your strengths and areas for improvement.",
                color: "bg-[#00e4a0]",
              },
              {
                icon: Clock,
                title: "Real-time Analytics",
                description: "Instant feedback and detailed performance analytics to track your progress.",
                color: "bg-purple-500",
              },
              {
                icon: Shield,
                title: "Secure Exams",
                description: "Advanced security features including anti-cheat mechanisms and proctoring.",
                color: "bg-red-500",
              },
              {
                icon: Globe,
                title: "Bengali Support",
                description: "Full support for Bengali language with culturally relevant content.",
                color: "bg-orange-500",
              },
              {
                icon: Award,
                title: "Certification",
                description: "Earn verified certificates and badges to showcase your achievements.",
                color: "bg-indigo-500",
              },
            ].map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                <CardContent className="p-8">
                  <div
                    className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-[#00e4a0] to-[#00d494]">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { number: "50,000+", label: "Active Students", icon: Users },
              { number: "1,000+", label: "AI-Generated Exams", icon: BookOpen },
              { number: "95%", label: "Success Rate", icon: TrendingUp },
              { number: "24/7", label: "AI Support", icon: Lightbulb },
            ].map((stat, index) => (
              <div key={index} className="text-white">
                <stat.icon className="h-12 w-12 mx-auto mb-4 opacity-80" />
                <div className="text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-lg opacity-90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Exam Experience?</h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of successful students who have already revolutionized their learning journey with Cqrrect
              AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/exams">
                <Button
                  size="lg"
                  className="bg-[#00e4a0] hover:bg-[#00d494] text-white font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Rocket className="mr-2 h-5 w-5" />
                  Start Your Journey
                </Button>
              </Link>
              <Link href="/pricing">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-gray-900 font-semibold px-8 py-4 rounded-full transition-all duration-300"
                >
                  View Pricing
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <Image
                src="/images/cqrrect-logo.png"
                alt="Cqrrect Ai Logo"
                width={120}
                height={40}
                className="h-8 w-auto"
              />
              <p className="text-gray-600">
                Bangladesh's leading AI-powered exam platform, revolutionizing education through technology.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Platform</h4>
              <div className="space-y-2">
                <Link href="/exams" className="block text-gray-600 hover:text-[#00e4a0] transition-colors">
                  Exams
                </Link>
                <Link href="/cqrrect-ai" className="block text-gray-600 hover:text-[#00e4a0] transition-colors">
                  AI Assistant
                </Link>
                <Link href="/courses" className="block text-gray-600 hover:text-[#00e4a0] transition-colors">
                  Courses
                </Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
              <div className="space-y-2">
                <Link href="/about" className="block text-gray-600 hover:text-[#00e4a0] transition-colors">
                  About
                </Link>
                <Link href="/pricing" className="block text-gray-600 hover:text-[#00e4a0] transition-colors">
                  Pricing
                </Link>
                <Link href="/contact" className="block text-gray-600 hover:text-[#00e4a0] transition-colors">
                  Contact
                </Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Support</h4>
              <div className="space-y-2">
                <Link href="/help" className="block text-gray-600 hover:text-[#00e4a0] transition-colors">
                  Help Center
                </Link>
                <Link href="/privacy" className="block text-gray-600 hover:text-[#00e4a0] transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="block text-gray-600 hover:text-[#00e4a0] transition-colors">
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-100 mt-8 pt-8 text-center text-gray-600">
            <p>&copy; 2024 Cqrrect AI. All rights reserved. Made with ❤️ in Bangladesh.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
