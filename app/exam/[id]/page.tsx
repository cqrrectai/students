"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Clock,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowLeft,
  ArrowRight,
  Flag,
  RotateCcw,
  Brain,
  BarChart3,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useProctoring } from "@/hooks/use-proctoring"
import { ProctoringDashboard } from "@/components/proctoring/proctoring-dashboard"

interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: string
  marks: number
  difficulty: "easy" | "medium" | "hard"
  subject: string
  explanation?: string
}

interface ExamData {
  id: string
  title: string
  description: string
  type: string
  subject: string
  duration: number
  totalMarks: number
  instructions: string
  questionsData: Question[]
  security: {
    randomizeQuestions: boolean
    randomizeOptions: boolean
    preventCopyPaste: boolean
    fullScreenMode: boolean
    timeLimit: boolean
    showResults: boolean
    allowReview: boolean
    maxAttempts: number
    passingScore: number
  }
}

interface Answer {
  questionId: string
  selectedAnswer: string
  isCorrect: boolean
  marks: number
  timeTaken: number
}

export default function ExamPage() {
  const router = useRouter()
  const params = useParams()
  const examId = params.id as string

  const [exam, setExam] = useState<ExamData | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set())
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [examStarted, setExamStarted] = useState(false)
  const [examCompleted, setExamCompleted] = useState(false)
  const [showInstructions, setShowInstructions] = useState(true)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [results, setResults] = useState<{
    score: number
    percentage: number
    passed: boolean
    answers: Answer[]
    timeTaken: number
    proctoringReport?: any
  } | null>(null)
  const [examStartTime, setExamStartTime] = useState<number>(0)
  const [questionStartTime, setQuestionStartTime] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Proctoring configuration
  const proctoringConfig = {
    enableKeyboardMonitoring: true,
    enableMouseTracking: true,
    enableTabSwitchDetection: true,
    enableInactivityDetection: true,
    enableCopyPasteBlocking: true,
    enableRightClickBlocking: true,
    enableDevToolsBlocking: true,
    enableFullscreenEnforcement: true,
    enableMultiDeviceDetection: true,
    inactivityThreshold: 5,
    maxViolations: 15,
    allowedIPs: process.env.ALLOWED_IPS?.split(",") || [],
  }

  // Proctoring hook
  const {
    proctoringData,
    violations,
    isMonitoring,
    startProctoring,
    stopProctoring,
    getProctoringReport,
    violationCount,
    lastActivity,
  } = useProctoring(examId, proctoringConfig)

  const handleSubmitExam = useCallback(async () => {
    if (!exam || !questions.length) return

    // Stop proctoring and get report
    const proctoringReport = await getProctoringReport()

    const totalTimeTaken = Date.now() - examStartTime
    const examAnswers: Answer[] = questions.map((question) => {
      const selectedAnswer = answers[question.id] || ""
      const isCorrect = selectedAnswer === question.correctAnswer
      return {
        questionId: question.id,
        selectedAnswer,
        isCorrect,
        marks: isCorrect ? question.marks : 0,
        timeTaken: 0,
      }
    })

    const totalScore = examAnswers.reduce((sum, answer) => sum + answer.marks, 0)
    const percentage = (totalScore / exam.totalMarks) * 100
    const passed = percentage >= exam.security.passingScore

    const examResults = {
      score: totalScore,
      percentage: Math.round(percentage * 100) / 100,
      passed,
      answers: examAnswers,
      timeTaken: totalTimeTaken,
      proctoringReport,
    }

    // Save exam attempt to database
    try {
      const response = await fetch('/api/exam-attempts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          examId: exam.id,
          userId: null, // Anonymous for now
          score: totalScore,
          totalMarks: exam.totalMarks,
          percentage: examResults.percentage,
          timeTaken: totalTimeTaken,
          answers: examAnswers,
          proctoringData: proctoringReport
        })
      })

      const result = await response.json()
      if (!result.success) {
        console.error('Failed to save exam attempt:', result.error)
      } else {
        console.log('Exam attempt saved successfully')
      }
    } catch (error) {
      console.error('Error saving exam attempt:', error)
    }

    // Store results for analytics (keep local storage for immediate access)
    localStorage.setItem(`exam_results_${examId}`, JSON.stringify(examResults))

    setResults(examResults)
    setExamCompleted(true)
    setShowSubmitDialog(false)

    if (exam.security.showResults) {
      setShowResults(true)
    }
  }, [exam, questions, answers, examStartTime, examId, getProctoringReport])

  // Load exam data
  useEffect(() => {
    const loadExam = async () => {
      try {
        console.log('Loading exam:', examId)
        
        const response = await fetch(`/api/exams/${examId}`)
        const result = await response.json()

        if (!result.success) {
          setError(result.error || "Failed to load exam")
          return
        }

        const foundExam = result.exam

        if (!foundExam) {
          setError("Exam not found")
          return
        }

        if (!foundExam.questionsData || foundExam.questionsData.length === 0) {
          setError("No questions found for this exam")
          return
        }

        setExam(foundExam)

        // Randomize questions if enabled
        let examQuestions = [...foundExam.questionsData]
        if (foundExam.security?.randomizeQuestions) {
          examQuestions = examQuestions.sort(() => Math.random() - 0.5)
        }

        // Randomize options if enabled
        if (foundExam.security?.randomizeOptions) {
          examQuestions = examQuestions.map((q) => {
            const correctAnswer = q.correctAnswer
            const shuffledOptions = [...q.options].sort(() => Math.random() - 0.5)
            return { ...q, options: shuffledOptions, correctAnswer }
          })
        }

        setQuestions(examQuestions)
        setTimeRemaining(foundExam.duration * 60)
      } catch (error) {
        console.error("Error loading exam:", error)
        setError("Failed to load exam")
      } finally {
        setIsLoading(false)
      }
    }

    if (examId) {
      loadExam()
    }
  }, [examId])

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null

    if (!examStarted || examCompleted || timeRemaining <= 0) return

    timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setExamCompleted(true)
          setShowSubmitDialog(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [examStarted, examCompleted, timeRemaining])

  // Prevent copy/paste if enabled
  useEffect(() => {
    if (!exam?.security?.preventCopyPaste) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "c" || e.key === "v" || e.key === "x")) {
        e.preventDefault()
      }
    }

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
    }

    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("contextmenu", handleContextMenu)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("contextmenu", handleContextMenu)
    }
  }, [exam])

  // Full screen mode if enabled
  useEffect(() => {
    if (!exam?.security?.fullScreenMode || !examStarted) return

    const enterFullScreen = async () => {
      try {
        await document.documentElement.requestFullscreen()
      } catch (error) {
        console.warn("Could not enter fullscreen mode")
      }
    }

    enterFullScreen()

    const handleFullScreenChange = () => {
      if (!document.fullscreenElement && examStarted && !examCompleted) {
        alert("Please return to fullscreen mode to continue the exam")
        enterFullScreen()
      }
    }

    document.addEventListener("fullscreenchange", handleFullScreenChange)

    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange)
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {})
      }
    }
  }, [exam, examStarted, examCompleted])

  const startExam = async () => {
    const success = await startProctoring("user_123")
    if (!success) {
      return
    }

    setShowInstructions(false)
    setExamStarted(true)
    setExamStartTime(Date.now())
    setQuestionStartTime(Date.now())
  }

  const selectAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }))
  }

  const toggleFlag = (questionId: string) => {
    setFlaggedQuestions((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(questionId)) {
        newSet.delete(questionId)
      } else {
        newSet.add(questionId)
      }
      return newSet
    })
  }

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index)
      setQuestionStartTime(Date.now())
    }
  }

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      goToQuestion(currentQuestionIndex + 1)
    }
  }

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      goToQuestion(currentQuestionIndex - 1)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`
  }

  const getAnsweredCount = () => {
    return Object.keys(answers).length
  }

  const getFlaggedCount = () => {
    return flaggedQuestions.size
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exam...</p>
        </div>
      </div>
    )
  }

  if (error || !exam) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Exam Not Available</h2>
            <p className="text-gray-600 mb-4">{error || "The requested exam could not be found."}</p>
            <Button onClick={() => router.push("/exams")} className="bg-gray-900 hover:bg-gray-800">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Exams
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Instructions Screen
  if (showInstructions) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <CardTitle className="text-2xl text-center">{exam.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-blue-50 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                <div className="text-sm font-medium">{questions.length} Questions</div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <Clock className="h-6 w-6 text-green-600 mx-auto mb-1" />
                <div className="text-sm font-medium">{exam.duration} Minutes</div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <CheckCircle className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                <div className="text-sm font-medium">{exam.totalMarks} Marks</div>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <Flag className="h-6 w-6 text-orange-600 mx-auto mb-1" />
                <div className="text-sm font-medium">{exam.security.passingScore}% Pass</div>
              </div>
            </div>

            {exam.description && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">About this exam:</h3>
                <p className="text-gray-600">{exam.description}</p>
              </div>
            )}

            {exam.instructions && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Instructions:</h3>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-blue-800 text-sm">{exam.instructions}</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <h3 className="font-medium text-gray-900">Important Notes:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• You have {exam.duration} minutes to complete this exam</li>
                <li>• You can navigate between questions and change your answers</li>
                <li>• Questions can be flagged for review</li>
                {exam.security.preventCopyPaste && <li>• Copy and paste is disabled</li>}
                {exam.security.fullScreenMode && <li>• Exam will run in fullscreen mode</li>}
                <li>• Make sure you have a stable internet connection</li>
                <li>• Advanced proctoring is enabled - your activity will be monitored</li>
                <li>• Multiple devices are not allowed for this exam</li>
                <li>• Excessive violations may result in exam termination</li>
                <li>• AI analytics will be generated after exam completion</li>
              </ul>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => router.push("/exams")} className="flex-1">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Exams
              </Button>
              <Button onClick={startExam} className="flex-1 bg-gray-900 hover:bg-gray-800">
                Start Exam
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Results Screen
  if (showResults && results) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-center text-2xl">Exam Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <div className={`text-6xl font-bold mb-2 ${results.passed ? "text-green-600" : "text-red-600"}`}>
                  {results.percentage}%
                </div>
                <div className="text-xl text-gray-600 mb-4">
                  {results.score} out of {exam.totalMarks} marks
                </div>
                <Badge
                  className={`text-lg px-4 py-2 ${
                    results.passed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}
                >
                  {results.passed ? "PASSED" : "FAILED"}
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{questions.length}</div>
                  <div className="text-sm text-gray-600">Total Questions</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {results.answers.filter((a) => a.isCorrect).length}
                  </div>
                  <div className="text-sm text-gray-600">Correct</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {results.answers.filter((a) => !a.isCorrect && a.selectedAnswer).length}
                  </div>
                  <div className="text-sm text-gray-600">Incorrect</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600">
                    {results.answers.filter((a) => !a.selectedAnswer).length}
                  </div>
                  <div className="text-sm text-gray-600">Unanswered</div>
                </div>
              </div>

              {/* AI Analytics Button */}
              <div className="mb-6 p-4 bg-gradient-to-r from-[#00e4a0]/10 to-[#00d494]/10 border border-[#00e4a0]/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Brain className="h-8 w-8 text-[#00e4a0]" />
                    <div>
                      <h3 className="font-semibold text-gray-900">AI Performance Analytics</h3>
                      <p className="text-sm text-gray-600">Get detailed insights powered by Llama 4 Scout</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => router.push(`/exam/${examId}/analytics`)}
                    className="bg-[#00e4a0] hover:bg-[#00d494] text-white"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View AI Analytics
                  </Button>
                </div>
              </div>

              {exam.security.allowReview && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Question Review</h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {questions.map((question, index) => {
                      const answer = results.answers.find((a) => a.questionId === question.id)
                      return (
                        <div key={question.id} className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <span className="font-medium text-gray-900">Question {index + 1}</span>
                            <div className="flex items-center gap-2">
                              {answer?.isCorrect ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : answer?.selectedAnswer ? (
                                <XCircle className="h-5 w-5 text-red-600" />
                              ) : (
                                <AlertTriangle className="h-5 w-5 text-gray-400" />
                              )}
                              <span className="text-sm text-gray-600">{question.marks} marks</span>
                            </div>
                          </div>
                          <p className="text-gray-900 mb-3">{question.question}</p>
                          <div className="space-y-2">
                            {question.options.map((option, optIndex) => (
                              <div
                                key={optIndex}
                                className={`p-2 rounded text-sm ${
                                  option === question.correctAnswer
                                    ? "bg-green-50 border border-green-200 text-green-800"
                                    : option === answer?.selectedAnswer
                                      ? "bg-red-50 border border-red-200 text-red-800"
                                      : "bg-gray-50"
                                }`}
                              >
                                <span className="font-medium mr-2">{String.fromCharCode(65 + optIndex)}.</span>
                                {option}
                                {option === question.correctAnswer && (
                                  <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700 text-xs">
                                    Correct
                                  </Badge>
                                )}
                                {option === answer?.selectedAnswer && option !== question.correctAnswer && (
                                  <Badge variant="secondary" className="ml-2 bg-red-100 text-red-700 text-xs">
                                    Your Answer
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                          {question.explanation && (
                            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <p className="text-sm text-blue-800">
                                <strong>Explanation:</strong> {question.explanation}
                              </p>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-6">
                <Button variant="outline" onClick={() => router.push("/exams")} className="flex-1">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Exams
                </Button>
                <Button
                  onClick={() => router.push(`/exam/${examId}/analytics`)}
                  className="flex-1 bg-[#00e4a0] hover:bg-[#00d494]"
                >
                  <Brain className="h-4 w-4 mr-2" />
                  AI Analytics
                </Button>
                <Button onClick={() => router.push(`/exam/${examId}`)} variant="outline" className="flex-1">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retake Exam
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  // Main Exam Interface
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-semibold text-gray-900">{exam.title}</h1>
              <Badge variant="outline">
                {exam.type} - {exam.subject}
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span className={timeRemaining < 300 ? "text-red-600 font-medium" : ""}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSubmitDialog(true)}
                className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
              >
                Submit Exam
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Question Navigation Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg">Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-600">
                <div>Progress: {Math.round(progress)}%</div>
                <Progress value={progress} className="mt-2" />
              </div>

              <div className="grid grid-cols-5 gap-2">
                {questions.map((question, index) => {
                  const isAnswered = answers[question.id]
                  const isFlagged = flaggedQuestions.has(question.id)
                  const isCurrent = index === currentQuestionIndex

                  return (
                    <button
                      key={question.id}
                      onClick={() => goToQuestion(index)}
                      className={`
                        w-10 h-10 rounded text-sm font-medium border-2 transition-all
                        ${
                          isCurrent
                            ? "border-blue-500 bg-blue-500 text-white"
                            : isAnswered
                              ? "border-green-500 bg-green-50 text-green-700"
                              : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                        }
                        ${isFlagged ? "ring-2 ring-orange-300" : ""}
                      `}
                    >
                      {index + 1}
                    </button>
                  )
                })}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Answered:</span>
                  <span className="font-medium">
                    {getAnsweredCount()}/{questions.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Flagged:</span>
                  <span className="font-medium">{getFlaggedCount()}</span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span>Current</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-50 border-2 border-green-500 rounded"></div>
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded"></div>
                  <span>Not Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded ring-2 ring-orange-300"></div>
                  <span>Flagged</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Question Area */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{currentQuestion.difficulty}</Badge>
                  <Badge variant="outline">{currentQuestion.marks} marks</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFlag(currentQuestion.id)}
                    className={flaggedQuestions.has(currentQuestion.id) ? "text-orange-600" : "text-gray-400"}
                  >
                    <Flag className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-lg text-gray-900 leading-relaxed">{currentQuestion.question}</div>

              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <label
                    key={index}
                    className={`
                      flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all
                      ${
                        answers[currentQuestion.id] === option
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value={option}
                      checked={answers[currentQuestion.id] === option}
                      onChange={() => selectAnswer(currentQuestion.id, option)}
                      className="sr-only"
                    />
                    <div
                      className={`
                      w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center
                      ${answers[currentQuestion.id] === option ? "border-blue-500 bg-blue-500" : "border-gray-300"}
                    `}
                    >
                      {answers[currentQuestion.id] === option && <div className="w-2 h-2 bg-white rounded-full"></div>}
                    </div>
                    <span className="font-medium text-gray-700 mr-3">{String.fromCharCode(65 + index)}.</span>
                    <span className="text-gray-900">{option}</span>
                  </label>
                ))}
              </div>

              <div className="flex items-center justify-between pt-6 border-t">
                <Button variant="outline" onClick={previousQuestion} disabled={currentQuestionIndex === 0}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => toggleFlag(currentQuestion.id)}
                    className={flaggedQuestions.has(currentQuestion.id) ? "text-orange-600" : ""}
                  >
                    <Flag className="h-4 w-4 mr-2" />
                    {flaggedQuestions.has(currentQuestion.id) ? "Unflag" : "Flag"}
                  </Button>

                  {currentQuestionIndex === questions.length - 1 ? (
                    <Button onClick={() => setShowSubmitDialog(true)} className="bg-red-600 hover:bg-red-700">
                      Submit Exam
                    </Button>
                  ) : (
                    <Button onClick={nextQuestion} className="bg-gray-900 hover:bg-gray-800">
                      Next
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {isMonitoring && (
        <ProctoringDashboard
          violations={violations}
          proctoringData={proctoringData}
          isMonitoring={isMonitoring}
          lastActivity={lastActivity}
        />
      )}

      {/* Submit Confirmation Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Exam</DialogTitle>
            <DialogDescription>
              Are you sure you want to submit your exam? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <div className="font-medium text-gray-900">{getAnsweredCount()}</div>
                <div className="text-gray-600">Answered</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <div className="font-medium text-gray-900">{questions.length - getAnsweredCount()}</div>
                <div className="text-gray-600">Unanswered</div>
              </div>
            </div>

            {questions.length - getAnsweredCount() > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  You have {questions.length - getAnsweredCount()} unanswered questions. These will be marked as
                  incorrect.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowSubmitDialog(false)} className="flex-1">
                Continue Exam
              </Button>
              <Button onClick={handleSubmitExam} className="flex-1 bg-red-600 hover:bg-red-700">
                Submit Exam
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
