"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PublicLayout } from "@/components/public-layout"
import { Testimonials } from "@/components/ui/testimonials-columns"
import { TiltedScroll } from "@/components/ui/tilted-scroll"
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
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-[#00e4a0]/5 py-8 md:py-16">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-10 items-center">
            {/* Left Content */}
            <div className="space-y-5 md:space-y-6">
              <div className="space-y-3">
                <Badge className="bg-[#00e4a0]/10 text-[#00e4a0] border-[#00e4a0]/20 px-2.5 py-1 text-xs font-medium">
                  🇧🇩 Bangladesh's #1 AI Exam Platform
                </Badge>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                  Master Your
                  <span className="text-[#00e4a0] block">AI-Powered</span>
                  Exam Journey
                </h1>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-lg">
                  Experience the future of learning with Bangladesh's most advanced AI-powered exam platform. Smart
                  questions, instant feedback, and personalized learning paths.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 md:gap-4">
                <div className="text-center p-2 bg-white/50 rounded-lg">
                  <div className="text-lg sm:text-xl font-bold text-gray-900">50K+</div>
                  <div className="text-xs text-gray-600">Students</div>
                </div>
                <div className="text-center p-2 bg-white/50 rounded-lg">
                  <div className="text-lg sm:text-xl font-bold text-gray-900">1000+</div>
                  <div className="text-xs text-gray-600">AI Exams</div>
                </div>
                <div className="text-center p-2 bg-white/50 rounded-lg">
                  <div className="text-lg sm:text-xl font-bold text-gray-900">95%</div>
                  <div className="text-xs text-gray-600">Success Rate</div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                <Link href="/auth/sign-up" className="w-full sm:w-auto">
                  <Button
                    size="default"
                    className="bg-[#00e4a0] hover:bg-[#00d494] text-gray-800 font-medium px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto text-xs sm:text-sm"
                  >
                    <Rocket className="mr-1.5 h-3.5 w-3.5" />
                    Start Free Exam
                  </Button>
                </Link>
                <Link href="/cqrrect-ai" className="w-full sm:w-auto">
                  <Button
                    size="default"
                    variant="outline"
                    className="border-2 border-gray-300 hover:border-[#00e4a0] text-gray-700 hover:text-[#00e4a0] font-medium px-4 py-2 rounded-full transition-all duration-300 w-full sm:w-auto text-xs sm:text-sm"
                  >
                    <Brain className="mr-1.5 h-3.5 w-3.5" />
                    Try AI Assistant
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative mt-6 lg:mt-0">
              <div className="relative">
                <Image
                  src="/images/cqrrect-hero-section.webp"
                  alt="Cqrrect AI Student"
                  width={500}
                  height={600}
                  className="w-full h-auto rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-500"
                  style={{
                    filter: "drop-shadow(0 15px 30px rgba(0, 228, 160, 0.15))",
                  }}
                />
                {/* Floating Elements */}
                <div className="absolute -top-3 -right-3 bg-[#00e4a0] text-white p-1.5 sm:p-2 rounded-lg shadow-lg animate-bounce">
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                </div>
                <div className="absolute -bottom-3 -left-3 bg-white p-1.5 sm:p-2 rounded-lg shadow-lg border border-gray-100 animate-pulse">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-[#00e4a0] rounded-full"></div>
                    <span className="text-xs font-medium text-gray-700">AI Powered</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Background Elements */}
        <div className="absolute top-16 left-8 w-12 h-12 bg-[#00e4a0]/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-16 right-8 w-20 h-20 bg-[#00e4a0]/5 rounded-full blur-2xl"></div>
      </section>

      {/* Partners Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-lg font-medium text-gray-600">Cqrrect Ai is Supported by</h2>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            <Image
              src="/images/Information_and_Communication_Technology_Division.webp"
              alt="ICT Division"
              width={160}
              height={80}
              className="h-12 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
            />
            <Image
              src="/images/iDEA Logo.webp"
              alt="iDEA"
              width={160}
              height={80}
              className="h-12 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
            />
            <Image
              src="/images/bangladesh-computer-council.webp"
              alt="Bangladesh Computer Council"
              width={160}
              height={80}
              className="h-12 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#00e4a0]/5 mix-blend-overlay"></div>
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="bg-[#00e4a0]/10 text-[#00e4a0] border-[#00e4a0]/20 px-3 py-1.5 text-xs font-medium mb-3">
              Why Choose Cqrrect AI
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Revolutionary AI-Powered Learning</h2>
            <p className="text-base text-gray-400 max-w-2xl mx-auto">
              Experience the next generation of exam preparation with cutting-edge AI technology designed specifically
              for Bangladeshi students.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {[
              {
                icon: Brain,
                title: "Smart AI Questions",
                description: "AI-generated questions that adapt to your learning style and difficulty preference.",
              },
              {
                icon: Target,
                title: "Personalized Learning",
                description: "Customized exam paths based on your strengths and areas for improvement.",
              },
              {
                icon: Clock,
                title: "Real-time Analytics",
                description: "Instant feedback and detailed performance analytics to track your progress.",
              },
              {
                icon: Shield,
                title: "Secure Exams",
                description: "Advanced security features including anti-cheat mechanisms and proctoring.",
              },
              {
                icon: Globe,
                title: "Bengali Support",
                description: "Full support for Bengali language with culturally relevant content.",
              },
              {
                icon: Award,
                title: "Certification",
                description: "Earn verified certificates and badges to showcase your achievements.",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="group hover:shadow-[#00e4a0]/10 transition-all duration-300 border-[#00e4a0]/10 bg-white/5 backdrop-blur-sm"
              >
                <CardContent className="p-6">
                  <div className="w-10 h-10 bg-[#00e4a0]/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="h-5 w-5 text-[#00e4a0]" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Scroll Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              <Badge className="bg-[#00e4a0]/10 text-[#00e4a0] border-[#00e4a0]/20 px-2.5 py-1 text-xs font-medium">
                Smart Features
              </Badge>
              <h2 className="text-2xl font-bold text-gray-900">
                Everything You Need for
                <span className="text-[#00e4a0] block mt-1">Exam Success</span>
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Our AI-powered platform combines cutting-edge technology with comprehensive exam preparation tools to ensure your success. From adaptive learning to real-time proctoring, we've got everything covered.
              </p>
              <div className="flex items-center gap-3">
                <Link href="/auth/sign-up">
                  <Button
                    className="bg-[#00e4a0] hover:bg-[#00d494] text-gray-800 font-medium px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-xs sm:text-sm"
                  >
                    Try It Free
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="lg:pl-8">
              <TiltedScroll className="transform scale-100" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gradient-to-r from-[#00e4a0]/10 to-[#00e4a0]/5 backdrop-blur-sm">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { number: "50,000+", label: "Active Students", icon: Users },
              { number: "1,000+", label: "AI-Generated Exams", icon: BookOpen },
              { number: "95%", label: "Success Rate", icon: TrendingUp },
              { number: "24/7", label: "AI Support", icon: Lightbulb },
            ].map((stat, index) => (
              <div key={index} className="text-white bg-white/5 rounded-lg p-4 backdrop-blur-sm border border-[#00e4a0]/10">
                <stat.icon className="h-6 w-6 mx-auto mb-2 text-[#00e4a0]" />
                <div className="text-xl md:text-2xl font-bold mb-1 text-[#00e4a0]">{stat.number}</div>
                <div className="text-xs text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials />

      {/* CTA Section */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Ready to Transform Your Exam Experience?</h2>
            <p className="text-lg text-gray-300 mb-6">
              Join thousands of successful students who have already revolutionized their learning journey with Cqrrect
              AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/auth/sign-up">
                <Button
                  size="default"
                  className="bg-[#00e4a0] hover:bg-[#00d494] text-white font-semibold px-6 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-sm"
                >
                  <Rocket className="mr-1.5 h-4 w-4" />
                  Start Your Journey
                </Button>
              </Link>
              <Link href="/pricing">
                <Button
                  size="default"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-gray-900 font-semibold px-6 py-2 rounded-full transition-all duration-300 text-sm"
                >
                  View Pricing
                  <ChevronRight className="ml-1.5 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}