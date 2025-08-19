"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Users,
  Clock,
  FileText,
  CheckCircle,
  AlertCircle,
  Calendar,
  BarChart3,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Exam {
  id: string
  title: string
  type: "HSC" | "SSC" | "University" | "Job"
  subject: string
  questions: number
  duration: number
  totalMarks: number
  students: number
  status: "active" | "draft" | "archived"
  createdAt: string
  lastModified: string
  attempts: number
  avgScore: number
}

function toNumber(v: any): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

function normalizeExams(exams: any[]): Exam[] {
  return exams.map((e) => ({
    ...e,
    questions: Array.isArray(e.questions) ? e.questions.length : toNumber(e.questions),
    duration: toNumber(e.duration),
    totalMarks: toNumber(e.totalMarks),
    students: toNumber(e.students),
    attempts: toNumber(e.attempts),
    avgScore: toNumber(e.avgScore),
  }))
}

export default function AdminExamsPage() {
  const router = useRouter()
  const [exams, setExams] = useState<Exam[]>([])
  const [filteredExams, setFilteredExams] = useState<Exam[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  // Load exams from localStorage
  useEffect(() => {
    const loadExams = () => {
      try {
        const savedExams = JSON.parse(localStorage.getItem("exams") || "[]")
        const mockExams: Exam[] = [
          {
            id: "1",
            title: "HSC Physics - Mechanics",
            type: "HSC",
            subject: "Physics",
            questions: 50,
            duration: 120,
            totalMarks: 100,
            students: 234,
            status: "active",
            createdAt: "2024-01-15",
            lastModified: "2024-01-20",
            attempts: 1247,
            avgScore: 78.5,
          },
          {
            id: "2",
            title: "SSC Mathematics - Algebra",
            type: "SSC",
            subject: "Mathematics",
            questions: 30,
            duration: 90,
            totalMarks: 60,
            students: 156,
            status: "draft",
            createdAt: "2024-01-14",
            lastModified: "2024-01-19",
            attempts: 0,
            avgScore: 0,
          },
          {
            id: "3",
            title: "University Admission - English",
            type: "University",
            subject: "English",
            questions: 75,
            duration: 180,
            totalMarks: 150,
            students: 89,
            status: "active",
            createdAt: "2024-01-13",
            lastModified: "2024-01-18",
            attempts: 445,
            avgScore: 82.3,
          },
        ]

        // Combine saved exams with mock exams
        const allExams = normalizeExams([...savedExams, ...mockExams])
        setExams(allExams)
        setFilteredExams(allExams)
      } catch (error) {
        console.error("Error loading exams:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadExams()
  }, [])

  // Filter exams
  useEffect(() => {
    let filtered = exams

    if (searchQuery) {
      filtered = filtered.filter(
        (exam) =>
          exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          exam.subject.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (filterType !== "all") {
      filtered = filtered.filter((exam) => exam.type.toLowerCase() === filterType.toLowerCase())
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((exam) => exam.status === filterStatus)
    }

    setFilteredExams(filtered)
  }, [exams, searchQuery, filterType, filterStatus])

  const deleteExam = (examId: string) => {
    if (confirm("Are you sure you want to delete this exam?")) {
      const updatedExams = exams.filter((exam) => exam.id !== examId)
      setExams(updatedExams)

      // Update localStorage
      const savedExams = JSON.parse(localStorage.getItem("exams") || "[]")
      const updatedSavedExams = savedExams.filter((exam: any) => exam.id !== examId)
      localStorage.setItem("exams", JSON.stringify(updatedSavedExams))
    }
  }

  const toggleExamStatus = (examId: string) => {
    const updatedExams = exams.map((exam) =>
      exam.id === examId
        ? { ...exam, status: exam.status === "active" ? "draft" : ("active" as "active" | "draft") }
        : exam,
    )
    setExams(updatedExams)

    // Update localStorage
    const savedExams = JSON.parse(localStorage.getItem("exams") || "[]")
    const updatedSavedExams = savedExams.map((exam: any) =>
      exam.id === examId ? { ...exam, status: exam.status === "active" ? "draft" : "active" } : exam,
    )
    localStorage.setItem("exams", JSON.stringify(updatedSavedExams))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700"
      case "draft":
        return "bg-yellow-100 text-yellow-700"
      case "archived":
        return "bg-gray-100 text-gray-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-3 w-3" />
      case "draft":
        return <Clock className="h-3 w-3" />
      case "archived":
        return <AlertCircle className="h-3 w-3" />
      default:
        return <AlertCircle className="h-3 w-3" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "HSC":
        return "bg-blue-100 text-blue-700"
      case "SSC":
        return "bg-green-100 text-green-700"
      case "University":
        return "bg-purple-100 text-purple-700"
      case "Job":
        return "bg-orange-100 text-orange-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Exams</h1>
            <p className="text-gray-600 mt-1">Create, edit, and manage all your exams</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link href="/admin/ai-generator">
              <BarChart3 className="h-4 w-4 mr-2" />
              AI Generator
            </Link>
          </Button>
          <Button asChild className="bg-gray-900 hover:bg-gray-800">
            <Link href="/admin/create-exam">
              <Plus className="h-4 w-4 mr-2" />
              Create Exam
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Exams</p>
                <p className="text-3xl font-bold text-gray-900">{exams.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Exams</p>
                <p className="text-3xl font-bold text-gray-900">{exams.filter((e) => e.status === "active").length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-3xl font-bold text-gray-900">
                  {exams.reduce((sum, exam) => sum + exam.students, 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Attempts</p>
                <p className="text-3xl font-bold text-gray-900">
                  {exams.reduce((sum, exam) => sum + exam.attempts, 0)}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search exams..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="hsc">HSC</SelectItem>
                  <SelectItem value="ssc">SSC</SelectItem>
                  <SelectItem value="university">University</SelectItem>
                  <SelectItem value="job">Job</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exams List */}
      <div className="space-y-4">
        {filteredExams.map((exam) => (
          <Card key={exam.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{exam.title}</h3>
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <Badge className={getTypeColor(exam.type)}>{exam.type}</Badge>
                        <Badge variant="outline">{exam.subject}</Badge>
                        <Badge className={getStatusColor(exam.status)}>
                          {getStatusIcon(exam.status)}
                          <span className="ml-1">{exam.status}</span>
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/admin/exams/${exam.id}`)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/admin/exams/${exam.id}/edit`)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Exam
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleExamStatus(exam.id)}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          {exam.status === "active" ? "Mark as Draft" : "Publish"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/admin/exams/${exam.id}/results`)}>
                          <Users className="h-4 w-4 mr-2" />
                          View Results
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => deleteExam(exam.id)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <FileText className="h-4 w-4" />
                      <span>{exam.questions} questions</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{exam.duration} min</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <BarChart3 className="h-4 w-4" />
                      <span>{exam.totalMarks} marks</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>{exam.students} students</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>{exam.attempts} attempts</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>{exam.createdAt}</span>
                    </div>
                  </div>

                  {exam.status === "active" && exam.avgScore > 0 && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Average Score</span>
                        <span className="font-medium text-gray-900">{exam.avgScore}%</span>
                      </div>
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${Number.isFinite(exam.avgScore) ? exam.avgScore : 0}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => router.push(`/admin/exams/${exam.id}`)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => router.push(`/admin/exams/${exam.id}/edit`)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredExams.length === 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No exams found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || filterType !== "all" || filterStatus !== "all"
                ? "Try adjusting your search or filters"
                : "Create your first exam to get started"}
            </p>
            <Button asChild className="bg-gray-900 hover:bg-gray-800">
              <Link href="/admin/create-exam">
                <Plus className="h-4 w-4 mr-2" />
                Create Exam
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
