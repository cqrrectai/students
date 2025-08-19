"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  BarChart3,
  Users,
  FileText,
  Brain,
  Upload,
  PlusCircle,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  GraduationCap,
  BookOpen,
} from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
  const stats = [
    {
      title: "Total Exams",
      value: "24",
      change: "+3 this week",
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Active Students",
      value: "1,247",
      change: "+127 this month",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Questions Generated",
      value: "3,456",
      change: "+234 this week",
      icon: Brain,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Success Rate",
      value: "94.2%",
      change: "+2.1% from last month",
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ]

  const recentExams = [
    {
      id: 1,
      title: "HSC Physics - Chapter 1",
      type: "HSC",
      questions: 50,
      students: 234,
      status: "active",
      createdAt: "2024-01-15",
    },
    {
      id: 2,
      title: "SSC Mathematics - Algebra",
      type: "SSC",
      questions: 30,
      students: 156,
      status: "draft",
      createdAt: "2024-01-14",
    },
    {
      id: 3,
      title: "University Admission - English",
      type: "University",
      questions: 75,
      students: 89,
      status: "active",
      createdAt: "2024-01-13",
    },
  ]

  const examTypes = [
    {
      title: "HSC Exams",
      description: "Higher Secondary Certificate preparation",
      count: 8,
      icon: GraduationCap,
      color: "bg-blue-600",
    },
    {
      title: "SSC Exams",
      description: "Secondary School Certificate preparation",
      count: 12,
      icon: BookOpen,
      color: "bg-green-600",
    },
    {
      title: "University Admission",
      description: "University entrance exam preparation",
      count: 4,
      icon: Users,
      color: "bg-purple-600",
    },
  ]

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome to ExamBD Admin Panel</p>
        </div>
        <div className="flex gap-3">
          <Button asChild className="bg-gray-900 hover:bg-gray-800">
            <Link href="/admin/create-exam">
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Exam
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Exam Options */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl text-gray-900">Create New Exam</CardTitle>
          <CardDescription>Choose how you want to create your exam</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Manual Creation */}
            <Card className="border-2 border-dashed border-gray-200 hover:border-gray-300 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="mx-auto w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <Upload className="h-6 w-6 text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Manual Creation</h3>
                <p className="text-gray-600 mb-4">Create exams manually or upload CSV files with questions</p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/admin/create-exam">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create Manually
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* AI Generation */}
            <Card className="border-2 border-dashed border-gray-200 hover:border-gray-300 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="mx-auto w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Generator</h3>
                <p className="text-gray-600 mb-4">Generate questions from images using AI technology</p>
                <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
                  <Link href="/admin/ai-generator">
                    <Brain className="h-4 w-4 mr-2" />
                    Use AI Generator
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Exams */}
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl text-gray-900">Recent Exams</CardTitle>
              <CardDescription>Latest created exams</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/exams">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentExams.map((exam) => (
                <div key={exam.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{exam.title}</h4>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                      <span>{exam.questions} questions</span>
                      <span>{exam.students} students</span>
                      <span>{exam.createdAt}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="bg-gray-200 text-gray-700">
                      {exam.type}
                    </Badge>
                    <Badge
                      variant={exam.status === "active" ? "default" : "secondary"}
                      className={
                        exam.status === "active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      }
                    >
                      {exam.status === "active" ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <Clock className="h-3 w-3 mr-1" />
                      )}
                      {exam.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Exam Types */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">Exam Categories</CardTitle>
            <CardDescription>Breakdown by exam type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {examTypes.map((type, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className={`p-2 rounded-lg ${type.color}`}>
                    <type.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{type.title}</h4>
                    <p className="text-sm text-gray-600">{type.description}</p>
                  </div>
                  <Badge variant="secondary" className="bg-gray-200 text-gray-700">
                    {type.count}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl text-gray-900">Quick Actions</CardTitle>
          <CardDescription>Frequently used actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button asChild variant="outline" className="h-20 flex-col gap-2">
              <Link href="/admin/questions">
                <BookOpen className="h-6 w-6" />
                <span className="text-sm">Question Bank</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col gap-2">
              <Link href="/admin/students">
                <Users className="h-6 w-6" />
                <span className="text-sm">Manage Students</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col gap-2">
              <Link href="/admin/analytics">
                <BarChart3 className="h-6 w-6" />
                <span className="text-sm">View Analytics</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col gap-2">
              <Link href="/admin/settings">
                <AlertCircle className="h-6 w-6" />
                <span className="text-sm">Settings</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
