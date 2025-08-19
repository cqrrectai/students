"use client"

import { useState } from "react"
import { PublicLayout } from "@/components/public-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Users, Star, BookOpen, Search, Filter, ChevronRight, CheckCircle, ArrowRight } from "lucide-react"
import Link from "next/link"

interface Course {
  id: string
  title: string
  description: string
  instructor: string
  duration: string
  students: number
  rating: number
  lessons: number
  price: number
  image: string
  category: string
  level: "Beginner" | "Intermediate" | "Advanced"
  features: string[]
}

// Courses will be loaded from database in the future
const courses: Course[] = []

export default function CoursesPage() {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? "fill-yellow-400" : "fill-gray-200"}`}
      />
    ))
  }

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-white via-gray-50 to-[#00e4a0]/5 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <Badge className="bg-[#00e4a0]/10 text-[#00e4a0] border-[#00e4a0]/20 px-4 py-2 text-sm font-medium mb-4">
              Expert-Led Courses
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Learn from the
              <span className="text-[#00e4a0] block">Best Educators</span>
            </h1>
            <p className="text-xl text-gray-600">
              Comprehensive courses designed by expert teachers, enhanced with AI-powered learning tools
              to help you achieve academic excellence.
            </p>
          </div>

          {/* Course Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {courses.length === 0 ? (
              <div className="col-span-full">
                <Card className="text-center py-16">
                  <CardContent>
                    <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Courses Coming Soon</h3>
                    <p className="text-gray-600 mb-6">
                      We're working on bringing you high-quality courses from expert instructors.
                      Stay tuned for updates!
                    </p>
                    <Button className="bg-[#00e4a0] hover:bg-[#00d494] text-white">
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Explore Exams Instead
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ) : (
              courses.map((course) => (
                <Card key={course.id} className="group hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-0">
                    <div className="relative overflow-hidden">
                      <img
                        src={course.image}
                        alt={course.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-white/90 text-gray-800">{course.category}</Badge>
                      </div>
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-[#00e4a0]/90 text-white">{course.level}</Badge>
                      </div>
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Button className="bg-[#00e4a0] hover:bg-[#00d494] text-white">
                          Preview Course
                        </Button>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(course.rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                              }`}
                            />
                          ))}
                          <span className="text-sm text-gray-600 ml-1">({course.rating})</span>
                        </div>
                      </div>

                      <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-[#00e4a0] transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">{course.description}</p>

                      <div className="text-sm text-gray-500 mb-4">
                        <p>Instructor: {course.instructor}</p>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {course.duration}
                        </div>
                        <div className="flex items-center">
                          <BookOpen className="h-4 w-4 mr-1" />
                          {course.lessons} lessons
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {course.students.toLocaleString()}
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-2xl font-bold text-gray-900">৳{course.price.toLocaleString()}</span>
                          </div>
                          <Button className="bg-[#00e4a0] hover:bg-[#00d494] text-white">
                            Enroll Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>
    </PublicLayout>
  )
} 