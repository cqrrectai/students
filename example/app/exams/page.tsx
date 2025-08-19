"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Filter,
  Clock,
  FileText,
  Users,
  Star,
  Play,
  BookOpen,
  GraduationCap,
  Target,
  Award,
} from "lucide-react"
import { useRouter } from "next/navigation"

interface Exam {
  id: string
  title: string
  description: string
  type: "HSC" | "SSC" | "University" | "Job"
  subject: string
  questions: number
  duration: number
  totalMarks: number
  difficulty: "easy" | "medium" | "hard"
  rating: number
  attempts: number
  createdAt: string
  status: "active" | "draft" | "archived" | "published"
  questionsData?: any[]
}

export default function ExamsPage() {
  const router = useRouter()
  const [exams, setExams] = useState<Exam[]>([])
  const [filteredExams, setFilteredExams] = useState<Exam[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterSubject, setFilterSubject] = useState("all")
  const [filterDifficulty, setFilterDifficulty] = useState("all")
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
            description: "Comprehensive test on mechanics including motion, force, and energy",
            type: "HSC",
            subject: "Physics",
            questions: 50,
            duration: 120,
            totalMarks: 100,
            difficulty: "medium",
            rating: 4.5,
            attempts: 1247,
            createdAt: "2024-01-15",
            status: "published",
          },
          {
            id: "2",
            title: "SSC Mathematics - Algebra",
            description: "Test your algebra skills with equations, functions, and graphs",
            type: "SSC",
            subject: "Mathematics",
            questions: 30,
            duration: 90,
            totalMarks: 60,
            difficulty: "easy",
            rating: 4.2,
            attempts: 856,
            createdAt: "2024-01-14",
            status: "published",
          },
          {
            id: "3",
            title: "University Admission - English",
            description: "English proficiency test for university admission",
            type: "University",
            subject: "English",
            questions: 75,
            duration: 180,
            totalMarks: 150,
            difficulty: "hard",
            rating: 4.7,
            attempts: 445,
            createdAt: "2024-01-13",
            status: "published",
          },
          {
            id: "4",
            title: "HSC Chemistry - Organic Chemistry",
            description: "Comprehensive test on organic chemistry reactions and mechanisms",
            type: "HSC",
            subject: "Chemistry",
            questions: 40,
            duration: 100,
            totalMarks: 80,
            difficulty: "hard",
            rating: 4.3,
            attempts: 692,
            createdAt: "2024-01-12",
            status: "published",
          },
          {
            id: "5",
            title: "SSC Bangla - Literature",
            description: "Test on Bangla literature and language skills",
            type: "SSC",
            subject: "Bangla",
            questions: 25,
            duration: 60,
            totalMarks: 50,
            difficulty: "medium",
            rating: 4.1,
            attempts: 534,
            createdAt: "2024-01-11",
            status: "published",
          },
          {
            id: "6",
            title: "HSC Biology - Cell Biology",
            description: "Detailed examination of cell structure and functions",
            type: "HSC",
            subject: "Biology",
            questions: 35,
            duration: 80,
            totalMarks: 70,
            difficulty: "medium",
            rating: 4.4,
            attempts: 723,
            createdAt: "2024-01-10",
            status: "published",
          },
        ]

        // Combine saved exams with mock exams, only show published ones
        const allExams = [...savedExams, ...mockExams]
          .filter((exam) => exam.status === "published" || exam.status === "active")
          .map((exam) => ({
            ...exam,
            // Ensure proper data structure
            questions:
              typeof exam.questions === "number"
                ? exam.questions
                : Array.isArray(exam.questions)
                  ? exam.questions.length
                  : 0,
            difficulty: exam.difficulty || "medium",
            rating: exam.rating || 4.0,
            attempts: exam.attempts || 0,
          }))

        setExams(allExams)
        setFilteredExams(allExams)
      } catch (error) {
        console.error("Error loading exams:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadExams()

    // Listen for storage changes to update in real-time
    const handleStorageChange = () => {
      loadExams()
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  // Filter exams based on search and filters
  useEffect(() => {
    let filtered = exams

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (exam) =>
          exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          exam.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
          exam.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Type filter
    if (filterType !== "all") {
      filtered = filtered.filter((exam) => exam.type.toLowerCase() === filterType.toLowerCase())
    }

    // Subject filter
    if (filterSubject !== "all") {
      filtered = filtered.filter((exam) => exam.subject.toLowerCase() === filterSubject.toLowerCase())
    }

    // Difficulty filter
    if (filterDifficulty !== "all") {
      filtered = filtered.filter((exam) => exam.difficulty === filterDifficulty)
    }

    setFilteredExams(filtered)
  }, [exams, searchQuery, filterType, filterSubject, filterDifficulty])

  const startExam = (examId: string) => {
    router.push(`/exam/${examId}`)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-emerald-100 text-emerald-700"
      case "medium":
        return "bg-amber-100 text-amber-700"
      case "hard":
        return "bg-rose-100 text-rose-700"
      default:
        return "bg-gray-100 text-gray-700"
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "HSC":
        return <GraduationCap className="h-4 w-4" />
      case "SSC":
        return <BookOpen className="h-4 w-4" />
      case "University":
        return <Target className="h-4 w-4" />
      case "Job":
        return <Award className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
      />
    ))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exams...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Exam Portal</h1>
            <p className="text-xl text-gray-600 mb-6">Practice exams for HSC, SSC, and University Admission</p>
            <div className="flex justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <span>{exams.length} Available Exams</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                <span>{exams.reduce((sum, exam) => sum + exam.attempts, 0).toLocaleString()} Total Attempts</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-600" />
                <span>4.4 Average Rating</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <Card className="mb-8 border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Search exams by title, subject, or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 text-base"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-3">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40 h-12">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="hsc">HSC</SelectItem>
                    <SelectItem value="ssc">SSC</SelectItem>
                    <SelectItem value="university">University</SelectItem>
                    <SelectItem value="job">Job Prep</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterSubject} onValueChange={setFilterSubject}>
                  <SelectTrigger className="w-40 h-12">
                    <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    <SelectItem value="physics">Physics</SelectItem>
                    <SelectItem value="chemistry">Chemistry</SelectItem>
                    <SelectItem value="mathematics">Mathematics</SelectItem>
                    <SelectItem value="biology">Biology</SelectItem>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="bangla">Bangla</SelectItem>
                    <SelectItem value="ict">ICT</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                  <SelectTrigger className="w-40 h-12">
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters Display */}
            {(searchQuery || filterType !== "all" || filterSubject !== "all" || filterDifficulty !== "all") && (
              <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                <span className="text-sm text-gray-600">Active filters:</span>
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1">
                    Search: {searchQuery}
                  </Badge>
                )}
                {filterType !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    Type: {filterType}
                  </Badge>
                )}
                {filterSubject !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    Subject: {filterSubject}
                  </Badge>
                )}
                {filterDifficulty !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    Level: {filterDifficulty}
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("")
                    setFilterType("all")
                    setFilterSubject("all")
                    setFilterDifficulty("all")
                  }}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Clear all
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredExams.length} of {exams.length} exams
          </p>
        </div>

        {/* Exam Cards */}
        {filteredExams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExams.map((exam) => (
              <Card
                key={exam.id}
                className="border-0 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer group"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${getTypeColor(exam.type)}`}>{getTypeIcon(exam.type)}</div>
                      <div>
                        <Badge className={getTypeColor(exam.type)}>{exam.type}</Badge>
                        <Badge variant="outline" className="ml-2">
                          {exam.subject}
                        </Badge>
                      </div>
                    </div>
                    <Badge className={getDifficultyColor(exam.difficulty)}>{exam.difficulty}</Badge>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {exam.title}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{exam.description}</p>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <FileText className="h-4 w-4" />
                      <span>{exam.questions} questions</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{exam.duration} min</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Target className="h-4 w-4" />
                      <span>{exam.totalMarks} marks</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>{exam.attempts} attempts</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1">
                      {renderStars(exam.rating)}
                      <span className="text-sm text-gray-600 ml-2">{exam.rating}</span>
                    </div>
                    <span className="text-xs text-gray-500">{exam.createdAt}</span>
                  </div>

                  <Button
                    onClick={() => startExam(exam.id)}
                    className="w-full bg-gray-900 hover:bg-gray-800 group-hover:bg-blue-600 transition-colors"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Exam
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-12 text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No exams found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search terms or filters to find more exams.</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("")
                  setFilterType("all")
                  setFilterSubject("all")
                  setFilterDifficulty("all")
                }}
              >
                Clear all filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
