"use client"

import { PublicLayout } from "@/components/public-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Brain,
  Users,
  Target,
  Award,
  Sparkles,
  BookOpen,
  Clock,
  Shield,
  Globe,
  Lightbulb,
  Rocket,
  ChevronRight,
  CheckCircle,
} from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-white via-gray-50 to-[#00e4a0]/5 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <Badge className="bg-[#00e4a0]/10 text-[#00e4a0] border-[#00e4a0]/20 px-4 py-2 text-sm font-medium mb-4">
              About Cqrrect AI
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Revolutionizing Education
              <span className="text-[#00e4a0] block">Through AI Innovation</span>
            </h1>
            <p className="text-xl text-gray-600">
              We're on a mission to make quality education accessible to every student in Bangladesh
              through cutting-edge AI technology and expert guidance.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-gray-600 mb-8">
                At Cqrrect AI, we believe that every student deserves access to high-quality education.
                Our platform combines artificial intelligence with expert teaching methodologies to create
                a personalized learning experience that adapts to each student's needs.
              </p>
              <div className="space-y-4">
                {[
                  "Democratize quality education through technology",
                  "Provide personalized learning experiences",
                  "Support students in achieving their academic goals",
                  "Make exam preparation more effective and engaging",
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-[#00e4a0] flex-shrink-0" />
                    <p className="text-gray-700">{item}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl overflow-hidden">
                <img
                  src="/placeholder.jpg"
                  alt="Students using Cqrrect AI"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-lg">
                <div className="flex items-center gap-3">
                  <Brain className="h-8 w-8 text-[#00e4a0]" />
                  <div>
                    <p className="font-semibold">AI-Powered</p>
                    <p className="text-sm text-gray-600">Learning Assistant</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Users, label: "Active Students", value: "50,000+" },
              { icon: BookOpen, label: "AI-Generated Exams", value: "1,000+" },
              { icon: Clock, label: "Study Hours", value: "1M+" },
              { icon: Target, label: "Success Rate", value: "95%" },
            ].map((stat, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#00e4a0]/10 flex items-center justify-center">
                    <stat.icon className="h-6 w-6 text-[#00e4a0]" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Cqrrect AI?</h2>
            <p className="text-xl text-gray-600">
              Our platform offers unique features that make learning more effective and engaging
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "AI-Powered Learning",
                description:
                  "Personalized learning paths and adaptive questions that evolve with your progress",
              },
              {
                icon: Shield,
                title: "Secure Examinations",
                description:
                  "Advanced proctoring system ensures fair and secure online examination environment",
              },
              {
                icon: Target,
                title: "Performance Analytics",
                description:
                  "Detailed insights and analytics to track your progress and identify improvement areas",
              },
              {
                icon: Globe,
                title: "Bangladeshi Focus",
                description:
                  "Content specifically designed for Bangladeshi curriculum and examination patterns",
              },
              {
                icon: Lightbulb,
                title: "Expert Guidance",
                description:
                  "Learn from experienced educators and benefit from their proven teaching methods",
              },
              {
                icon: Rocket,
                title: "Continuous Innovation",
                description:
                  "Regular updates and new features to enhance your learning experience",
              },
            ].map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-[#00e4a0]/10 flex items-center justify-center mb-4 group-hover:bg-[#00e4a0] transition-colors duration-300">
                    <feature.icon className="h-6 w-6 text-[#00e4a0] group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#00e4a0]/5">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Start Your Learning Journey?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of students who are already benefiting from our AI-powered learning platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-[#00e4a0] hover:bg-[#00d494] text-white" asChild>
                <Link href="/auth/sign-up">
                  Get Started Now
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline">
                Schedule Demo
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
} 