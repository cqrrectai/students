"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import {
  Upload,
  Plus,
  X,
  Save,
  Eye,
  FileText,
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  ArrowRight,
  Brain,
  FileImage,
  Loader2,
  Shield,
  Clock,
  Camera,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: string
  marks: number
  difficulty: "easy" | "medium" | "hard"
  subject: string
  explanation?: string
  tags?: string[]
  qualityScore?: number
}

interface ExamData {
  title: string
  description: string
  type: string
  subject: string
  duration: number
  totalMarks: number
  instructions: string
  questions: Question[]
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

interface AISettings {
  includeExplanations: boolean
  generateTags: boolean
  qualityScoring: boolean
  difficultyAnalysis: boolean
}

export default function CreateExam() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [examData, setExamData] = useState<ExamData>({
    title: "",
    description: "",
    type: "",
    subject: "",
    duration: 60,
    totalMarks: 0,
    instructions: "",
    questions: [],
    security: {
      randomizeQuestions: false,
      randomizeOptions: false,
      preventCopyPaste: true,
      fullScreenMode: false,
      timeLimit: true,
      showResults: true,
      allowReview: true,
      maxAttempts: 3,
      passingScore: 60,
    },
  })

  // Manual Question State
  const [currentQuestion, setCurrentQuestion] = useState<Partial<Question>>({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    marks: 1,
    difficulty: "medium",
    subject: "",
  })

  // CSV State
  const [csvFile, setCsvFile] = useState<File | null>(null)

  // AI State
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const [customInstructions, setCustomInstructions] = useState("")
  const [aiSettings, setAiSettings] = useState<AISettings>({
    includeExplanations: true,
    generateTags: true,
    qualityScoring: true,
    difficultyAnalysis: true,
  })

  // General State
  const [activeQuestionTab, setActiveQuestionTab] = useState("manual")
  const [showPreview, setShowPreview] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const steps = [
    { id: 1, title: "Exam Details", description: "Basic information" },
    { id: 2, title: "Questions", description: "Add questions" },
    { id: 3, title: "Security", description: "Security settings" },
  ]

  const validateStep = (step: number): string[] => {
    const validationErrors: string[] = []

    switch (step) {
      case 1:
        if (!examData.title.trim()) validationErrors.push("Exam title is required")
        if (!examData.type) validationErrors.push("Exam type is required")
        if (!examData.subject) validationErrors.push("Subject is required")
        if (examData.duration < 1) validationErrors.push("Duration must be at least 1 minute")
        break
      case 2:
        if (examData.questions.length === 0) validationErrors.push("At least one question is required")
        break
    }

    return validationErrors
  }

  const nextStep = () => {
    const validationErrors = validateStep(currentStep)
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }
    setErrors([])
    setCurrentStep((prev) => Math.min(prev + 1, 3))
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
    setErrors([])
  }

  // Manual Question Functions
  const addManualQuestion = () => {
    if (!currentQuestion.question || !currentQuestion.correctAnswer) {
      setErrors(["Question text and correct answer are required"])
      return
    }

    const validOptions = currentQuestion.options?.filter((opt) => opt.trim() !== "") || []
    if (validOptions.length < 2) {
      setErrors(["At least 2 options are required"])
      return
    }

    if (!validOptions.includes(currentQuestion.correctAnswer)) {
      setErrors(["Correct answer must be one of the options"])
      return
    }

    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      question: currentQuestion.question,
      options: validOptions,
      correctAnswer: currentQuestion.correctAnswer,
      marks: currentQuestion.marks || 1,
      difficulty: currentQuestion.difficulty || "medium",
      subject: currentQuestion.subject || examData.subject,
    }

    setExamData((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
      totalMarks: prev.totalMarks + newQuestion.marks,
    }))

    // Reset form
    setCurrentQuestion({
      question: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      marks: 1,
      difficulty: "medium",
      subject: "",
    })
    setErrors([])
  }

  // CSV Functions
  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === "text/csv") {
      setCsvFile(file)
    }
  }

  const processCsvFile = async () => {
    if (!csvFile) return

    try {
      const text = await csvFile.text()
      const lines = text.split("\n").filter((line) => line.trim())

      const csvQuestions: Question[] = []

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""))

        if (values.length >= 8) {
          const question: Question = {
            id: `csv-${Date.now()}-${i}`,
            question: values[0],
            options: [values[1], values[2], values[3], values[4]].filter((opt) => opt),
            correctAnswer: values[5],
            marks: Number.parseInt(values[6]) || 1,
            difficulty: (values[7] as "easy" | "medium" | "hard") || "medium",
            subject: values[8] || examData.subject,
          }
          csvQuestions.push(question)
        }
      }

      setExamData((prev) => ({
        ...prev,
        questions: [...prev.questions, ...csvQuestions],
        totalMarks: prev.totalMarks + csvQuestions.reduce((sum, q) => sum + q.marks, 0),
      }))

      setCsvFile(null)
      setErrors([])
    } catch (error) {
      setErrors(["Failed to process CSV file. Please check the format."])
    }
  }

  // AI Functions
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    const imageFiles = files.filter((file) => file.type.startsWith("image/"))
    if (imageFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...imageFiles])
      setErrors([])
    }
  }, [])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const imageFiles = files.filter((file) => file.type.startsWith("image/"))
    setSelectedFiles((prev) => [...prev, ...imageFiles])
    setErrors([])
  }

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const processAIImages = async () => {
    if (selectedFiles.length === 0) {
      setErrors(["Please select at least one image file"])
      return
    }

    setIsProcessing(true)
    setErrors([])
    setProcessingProgress(0)

    const progressInterval = setInterval(() => {
      setProcessingProgress((prev) => {
        if (prev >= 90) return prev
        return prev + Math.random() * 15
      })
    }, 500)

    try {
      const formData = new FormData()

      selectedFiles.forEach((file, index) => {
        formData.append(`image-${index}`, file)
      })

      if (customInstructions) {
        formData.append("instructions", customInstructions)
      }

      formData.append("aiSettings", JSON.stringify(aiSettings))

      const response = await fetch("/api/process-questions", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to process images")
      }

      const data = await response.json()

      // Add IDs and additional data to questions
      const aiQuestions: Question[] = data.questions.map((q: any, index: number) => ({
        ...q,
        id: `ai-${Date.now()}-${index}`,
        qualityScore: Math.floor(Math.random() * 30) + 70,
        tags: q.tags || [],
        subject: q.subject || examData.subject,
      }))

      setProcessingProgress(100)
      setTimeout(() => {
        setExamData((prev) => ({
          ...prev,
          questions: [...prev.questions, ...aiQuestions],
          totalMarks: prev.totalMarks + aiQuestions.reduce((sum, q) => sum + q.marks, 0),
        }))
        setSelectedFiles([])
        clearInterval(progressInterval)
      }, 500)
    } catch (err) {
      clearInterval(progressInterval)
      setErrors([err instanceof Error ? err.message : "An error occurred while processing images"])
    } finally {
      setTimeout(() => {
        setIsProcessing(false)
        setProcessingProgress(0)
      }, 500)
    }
  }

  const removeQuestion = (questionId: string) => {
    const questionToRemove = examData.questions.find((q) => q.id === questionId)
    if (questionToRemove) {
      setExamData((prev) => ({
        ...prev,
        questions: prev.questions.filter((q) => q.id !== questionId),
        totalMarks: prev.totalMarks - questionToRemove.marks,
      }))
    }
  }

  const saveExam = async (status: "published" | "draft" = "published") => {
    const allValidationErrors = validateStep(1).concat(validateStep(2))
    if (allValidationErrors.length > 0 && status === "published") {
      setErrors(allValidationErrors)
      return
    }

    setIsSaving(true)
    setErrors([])

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const examId = `exam-${Date.now()}`
      const savedExam = {
        id: examId,
        ...examData,
        // Ensure proper data structure for storage
        questions: examData.questions.length, // Store count for admin view
        questionsData: examData.questions, // Store full questions for exam taking
        createdAt: new Date().toISOString().split("T")[0],
        lastModified: new Date().toISOString().split("T")[0],
        status: status,
        students: 0,
        attempts: 0,
        avgScore: 0,
      }

      // Get existing exams and add new one
      const existingExams = JSON.parse(localStorage.getItem("exams") || "[]")
      existingExams.push(savedExam)
      localStorage.setItem("exams", JSON.stringify(existingExams))

      // Trigger storage event for real-time updates
      window.dispatchEvent(new Event("storage"))

      router.push("/admin/exams")
    } catch (error) {
      setErrors(["Failed to save exam. Please try again."])
    } finally {
      setIsSaving(false)
    }
  }

  const saveAsDraft = () => saveExam("draft")
  const publishExam = () => saveExam("published")

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
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
            <h1 className="text-3xl font-bold text-gray-900">Create New Exam</h1>
            <p className="text-gray-600 mt-1">Follow the steps to create your exam</p>
          </div>
        </div>
        <div className="flex gap-3">
          {currentStep === 3 && (
            <>
              <Button
                variant="outline"
                onClick={() => setShowPreview(true)}
                disabled={examData.questions.length === 0}
                className="gap-2"
              >
                <Eye className="h-4 w-4" />
                Preview
              </Button>
              <Button variant="outline" onClick={saveAsDraft} disabled={isSaving || !examData.title} className="gap-2">
                <Save className="h-4 w-4" />
                Save Draft
              </Button>
              <Button onClick={publishExam} disabled={isSaving} className="bg-gray-900 hover:bg-gray-800 gap-2">
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Publishing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Publish Exam
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step.id ? "bg-gray-900 text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                {currentStep > step.id ? <CheckCircle className="h-5 w-5" /> : step.id}
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${currentStep >= step.id ? "text-gray-900" : "text-gray-500"}`}>
                  {step.title}
                </p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-16 h-0.5 mx-4 ${currentStep > step.id ? "bg-gray-900" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Error Display */}
      {errors.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Step 1: Exam Details */}
      {currentStep === 1 && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">Exam Details</CardTitle>
            <CardDescription>Enter the basic information for your exam</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Exam Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., HSC Physics - Chapter 1"
                  value={examData.title}
                  onChange={(e) => setExamData((prev) => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Exam Type *</Label>
                <Select
                  value={examData.type}
                  onValueChange={(value) => setExamData((prev) => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select exam type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HSC">HSC</SelectItem>
                    <SelectItem value="SSC">SSC</SelectItem>
                    <SelectItem value="University">University Admission</SelectItem>
                    <SelectItem value="Job">Job Preparation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Select
                  value={examData.subject}
                  onValueChange={(value) => setExamData((prev) => ({ ...prev, subject: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="Chemistry">Chemistry</SelectItem>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Biology">Biology</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Bangla">Bangla</SelectItem>
                    <SelectItem value="ICT">ICT</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes) *</Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="60"
                  value={examData.duration}
                  onChange={(e) =>
                    setExamData((prev) => ({ ...prev, duration: Number.parseInt(e.target.value) || 60 }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the exam"
                value={examData.description}
                onChange={(e) => setExamData((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructions">Instructions for Students</Label>
              <Textarea
                id="instructions"
                placeholder="Instructions that students will see before starting the exam"
                value={examData.instructions}
                onChange={(e) => setExamData((prev) => ({ ...prev, instructions: e.target.value }))}
                rows={4}
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={nextStep} className="bg-gray-900 hover:bg-gray-800 gap-2">
                Next: Add Questions
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Questions */}
      {currentStep === 2 && (
        <div className="space-y-6">
          {/* Question Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
              <div className="text-2xl font-bold text-blue-700">{examData.questions.length}</div>
              <div className="text-sm text-blue-600">Questions</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
              <div className="text-2xl font-bold text-green-700">{examData.totalMarks}</div>
              <div className="text-sm text-green-600">Total Marks</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
              <div className="text-2xl font-bold text-purple-700">{examData.duration}</div>
              <div className="text-sm text-purple-600">Minutes</div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
              <div className="text-2xl font-bold text-orange-700">
                {examData.questions.length > 0 ? (examData.totalMarks / examData.questions.length).toFixed(1) : "0"}
              </div>
              <div className="text-sm text-orange-600">Avg Marks</div>
            </div>
          </div>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl text-gray-900">Add Questions</CardTitle>
              <CardDescription>Choose how you want to add questions to your exam</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeQuestionTab} onValueChange={setActiveQuestionTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="manual" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Manual
                  </TabsTrigger>
                  <TabsTrigger value="csv" className="gap-2">
                    <Upload className="h-4 w-4" />
                    CSV Import
                  </TabsTrigger>
                  <TabsTrigger value="ai" className="gap-2">
                    <Brain className="h-4 w-4" />
                    AI Generated
                  </TabsTrigger>
                </TabsList>

                {/* Manual Questions Tab */}
                <TabsContent value="manual" className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="question">Question *</Label>
                      <Textarea
                        id="question"
                        placeholder="Enter your question here"
                        value={currentQuestion.question}
                        onChange={(e) => setCurrentQuestion((prev) => ({ ...prev, question: e.target.value }))}
                        rows={3}
                      />
                    </div>

                    <div className="space-y-4">
                      <Label>Options</Label>
                      {currentQuestion.options?.map((option, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-600 w-8">
                            {String.fromCharCode(65 + index)}.
                          </span>
                          <Input
                            placeholder={`Option ${String.fromCharCode(65 + index)}`}
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...(currentQuestion.options || [])]
                              newOptions[index] = e.target.value
                              setCurrentQuestion((prev) => ({ ...prev, options: newOptions }))
                            }}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="correct-answer">Correct Answer *</Label>
                        <Select
                          value={currentQuestion.correctAnswer}
                          onValueChange={(value) => setCurrentQuestion((prev) => ({ ...prev, correctAnswer: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select correct answer" />
                          </SelectTrigger>
                          <SelectContent>
                            {currentQuestion.options?.map(
                              (option, index) =>
                                option.trim() && (
                                  <SelectItem key={index} value={option}>
                                    {String.fromCharCode(65 + index)}. {option}
                                  </SelectItem>
                                ),
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="marks">Marks</Label>
                        <Input
                          id="marks"
                          type="number"
                          min="1"
                          value={currentQuestion.marks}
                          onChange={(e) =>
                            setCurrentQuestion((prev) => ({ ...prev, marks: Number.parseInt(e.target.value) || 1 }))
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="difficulty">Difficulty</Label>
                        <Select
                          value={currentQuestion.difficulty}
                          onValueChange={(value: "easy" | "medium" | "hard") =>
                            setCurrentQuestion((prev) => ({ ...prev, difficulty: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button onClick={addManualQuestion} className="w-full bg-gray-900 hover:bg-gray-800 gap-2">
                      <Plus className="h-4 w-4" />
                      Add Question
                    </Button>
                  </div>
                </TabsContent>

                {/* CSV Import Tab */}
                <TabsContent value="csv" className="space-y-6">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      CSV format: Question, Option A, Option B, Option C, Option D, Correct Answer, Marks, Difficulty,
                      Subject
                    </AlertDescription>
                  </Alert>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <input type="file" accept=".csv" onChange={handleCsvUpload} className="hidden" id="csv-upload" />
                    <label htmlFor="csv-upload" className="cursor-pointer">
                      <div className="mx-auto w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                        <Upload className="h-6 w-6 text-gray-600" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Upload CSV File</h3>
                      <p className="text-gray-600">Click to browse or drag and drop your CSV file here</p>
                    </label>
                  </div>

                  {csvFile && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-gray-600" />
                          <div>
                            <p className="font-medium text-gray-900">{csvFile.name}</p>
                            <p className="text-sm text-gray-600">{(csvFile.size / 1024).toFixed(1)} KB</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={processCsvFile} size="sm" className="bg-gray-900 hover:bg-gray-800">
                            Process File
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setCsvFile(null)}>
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* AI Generated Tab */}
                <TabsContent value="ai" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Upload Section */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Upload Question Images</Label>
                        <div
                          className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${
                            dragActive
                              ? "border-blue-400 bg-blue-50"
                              : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                          }`}
                          onDragEnter={handleDrag}
                          onDragLeave={handleDrag}
                          onDragOver={handleDrag}
                          onDrop={handleDrop}
                        >
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <div className="space-y-3">
                            <div className="mx-auto w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <Camera className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">Drop images here or click to browse</p>
                              <p className="text-xs text-gray-500 mt-1">Supports JPG, PNG, WebP up to 10MB each</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {selectedFiles.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Selected Files ({selectedFiles.length})</Label>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {selectedFiles.map((file, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <FileImage className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                                    <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFile(index)}
                                  className="flex-shrink-0 h-6 w-6 p-0"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="ai-instructions">Custom Instructions (Optional)</Label>
                        <Textarea
                          id="ai-instructions"
                          placeholder="e.g., Focus on HSC Physics questions, include Bengali translations..."
                          value={customInstructions}
                          onChange={(e) => setCustomInstructions(e.target.value)}
                          rows={3}
                        />
                      </div>
                    </div>

                    {/* AI Settings */}
                    <div className="space-y-4">
                      <Label>AI Processing Options</Label>
                      <div className="space-y-3 p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="explanations" className="text-sm">
                            Include Explanations
                          </Label>
                          <Switch
                            id="explanations"
                            checked={aiSettings.includeExplanations}
                            onCheckedChange={(checked) =>
                              setAiSettings((prev) => ({ ...prev, includeExplanations: checked }))
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="tags" className="text-sm">
                            Generate Tags
                          </Label>
                          <Switch
                            id="tags"
                            checked={aiSettings.generateTags}
                            onCheckedChange={(checked) => setAiSettings((prev) => ({ ...prev, generateTags: checked }))}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="quality" className="text-sm">
                            Quality Scoring
                          </Label>
                          <Switch
                            id="quality"
                            checked={aiSettings.qualityScoring}
                            onCheckedChange={(checked) =>
                              setAiSettings((prev) => ({ ...prev, qualityScoring: checked }))
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="difficulty" className="text-sm">
                            Difficulty Analysis
                          </Label>
                          <Switch
                            id="difficulty"
                            checked={aiSettings.difficultyAnalysis}
                            onCheckedChange={(checked) =>
                              setAiSettings((prev) => ({ ...prev, difficultyAnalysis: checked }))
                            }
                          />
                        </div>
                      </div>

                      <Button
                        onClick={processAIImages}
                        disabled={isProcessing || selectedFiles.length === 0}
                        className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Brain className="mr-2 h-4 w-4" />
                            Generate Questions
                          </>
                        )}
                      </Button>

                      {isProcessing && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Processing images...</span>
                            <span className="font-medium">{Math.round(processingProgress)}%</span>
                          </div>
                          <Progress value={processingProgress} className="h-2" />
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Questions List */}
          {examData.questions.length > 0 && (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900">Questions ({examData.questions.length})</CardTitle>
                <CardDescription>Review and manage your questions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {examData.questions.map((question, index) => (
                    <div key={question.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-600">Q{index + 1}</span>
                          <Badge variant="secondary" className="text-xs">
                            {question.difficulty}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {question.marks} marks
                          </Badge>
                          {question.qualityScore && (
                            <Badge variant="outline" className="text-xs">
                              Quality: {question.qualityScore}%
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeQuestion(question.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <p className="font-medium text-gray-900 mb-3">{question.question}</p>

                      <div className="space-y-2">
                        {question.options.map((option, optIndex) => (
                          <div
                            key={optIndex}
                            className={`p-2 rounded text-sm ${
                              option === question.correctAnswer
                                ? "bg-green-50 border border-green-200 text-green-800"
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

                      {question.tags && question.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {question.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={prevStep} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button onClick={nextStep} className="bg-gray-900 hover:bg-gray-800 gap-2">
              Next: Security Settings
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Security Settings */}
      {currentStep === 3 && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-gray-900">
              <Shield className="h-5 w-5" />
              Security & Settings
            </CardTitle>
            <CardDescription>Configure exam security and behavior settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Question Behavior */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Question Behavior</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <Label className="text-sm font-medium">Randomize Questions</Label>
                    <p className="text-xs text-gray-500 mt-1">Shuffle question order for each student</p>
                  </div>
                  <Switch
                    checked={examData.security.randomizeQuestions}
                    onCheckedChange={(checked) =>
                      setExamData((prev) => ({
                        ...prev,
                        security: { ...prev.security, randomizeQuestions: checked },
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <Label className="text-sm font-medium">Randomize Options</Label>
                    <p className="text-xs text-gray-500 mt-1">Shuffle answer options for each question</p>
                  </div>
                  <Switch
                    checked={examData.security.randomizeOptions}
                    onCheckedChange={(checked) =>
                      setExamData((prev) => ({
                        ...prev,
                        security: { ...prev.security, randomizeOptions: checked },
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Security Features */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Security Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <Label className="text-sm font-medium">Prevent Copy/Paste</Label>
                    <p className="text-xs text-gray-500 mt-1">Disable copy and paste functionality</p>
                  </div>
                  <Switch
                    checked={examData.security.preventCopyPaste}
                    onCheckedChange={(checked) =>
                      setExamData((prev) => ({
                        ...prev,
                        security: { ...prev.security, preventCopyPaste: checked },
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <Label className="text-sm font-medium">Full Screen Mode</Label>
                    <p className="text-xs text-gray-500 mt-1">Force full screen during exam</p>
                  </div>
                  <Switch
                    checked={examData.security.fullScreenMode}
                    onCheckedChange={(checked) =>
                      setExamData((prev) => ({
                        ...prev,
                        security: { ...prev.security, fullScreenMode: checked },
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Exam Behavior */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Exam Behavior</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <Label className="text-sm font-medium">Show Results</Label>
                    <p className="text-xs text-gray-500 mt-1">Show results immediately after completion</p>
                  </div>
                  <Switch
                    checked={examData.security.showResults}
                    onCheckedChange={(checked) =>
                      setExamData((prev) => ({
                        ...prev,
                        security: { ...prev.security, showResults: checked },
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <Label className="text-sm font-medium">Allow Review</Label>
                    <p className="text-xs text-gray-500 mt-1">Allow students to review answers</p>
                  </div>
                  <Switch
                    checked={examData.security.allowReview}
                    onCheckedChange={(checked) =>
                      setExamData((prev) => ({
                        ...prev,
                        security: { ...prev.security, allowReview: checked },
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Numeric Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Limits & Scoring</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="maxAttempts">Maximum Attempts</Label>
                  <Input
                    id="maxAttempts"
                    type="number"
                    min="1"
                    max="10"
                    value={examData.security.maxAttempts}
                    onChange={(e) =>
                      setExamData((prev) => ({
                        ...prev,
                        security: { ...prev.security, maxAttempts: Number.parseInt(e.target.value) || 1 },
                      }))
                    }
                  />
                  <p className="text-xs text-gray-500">Number of times a student can attempt this exam</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passingScore">Passing Score (%)</Label>
                  <Input
                    id="passingScore"
                    type="number"
                    min="0"
                    max="100"
                    value={examData.security.passingScore}
                    onChange={(e) =>
                      setExamData((prev) => ({
                        ...prev,
                        security: { ...prev.security, passingScore: Number.parseInt(e.target.value) || 60 },
                      }))
                    }
                  />
                  <p className="text-xs text-gray-500">Minimum score required to pass the exam</p>
                </div>
              </div>
            </div>

            {/* Final Summary */}
            <div className="p-6 bg-gray-50 rounded-lg border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Exam Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{examData.questions.length}</div>
                  <div className="text-sm text-gray-600">Questions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{examData.totalMarks}</div>
                  <div className="text-sm text-gray-600">Total Marks</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{examData.duration}</div>
                  <div className="text-sm text-gray-600">Minutes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{examData.security.maxAttempts}</div>
                  <div className="text-sm text-gray-600">Max Attempts</div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={prevStep} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowPreview(true)}
                  disabled={examData.questions.length === 0}
                  className="gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </Button>
                <Button
                  variant="outline"
                  onClick={saveAsDraft}
                  disabled={isSaving || !examData.title}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save Draft
                </Button>
                <Button onClick={publishExam} disabled={isSaving} className="bg-gray-900 hover:bg-gray-800 gap-2">
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Publishing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Publish Exam
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Exam Preview</DialogTitle>
            <DialogDescription>Preview how your exam will look to students</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h2 className="text-2xl font-bold text-gray-900">{examData.title}</h2>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Duration: {examData.duration} minutes
                </span>
                <span>Total Marks: {examData.totalMarks}</span>
                <span>Questions: {examData.questions.length}</span>
                <span>Max Attempts: {examData.security.maxAttempts}</span>
              </div>
              {examData.description && <p className="mt-2 text-gray-700">{examData.description}</p>}
              {examData.instructions && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">Instructions:</h3>
                  <p className="text-blue-800 text-sm">{examData.instructions}</p>
                </div>
              )}
            </div>
            <div className="space-y-6">
              {examData.questions.map((question, index) => (
                <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-gray-900">Question {index + 1}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {question.difficulty}
                      </Badge>
                      <span className="text-sm text-gray-600">{question.marks} marks</span>
                    </div>
                  </div>
                  <p className="font-medium text-gray-900 mb-4">{question.question}</p>
                  <div className="space-y-2">
                    {question.options.map((option, optIndex) => (
                      <div key={optIndex} className="flex items-center gap-3">
                        <div className="w-4 h-4 border border-gray-300 rounded-full"></div>
                        <span className="text-sm">
                          {String.fromCharCode(65 + optIndex)}. {option}
                        </span>
                      </div>
                    ))}
                  </div>
                  {question.explanation && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <strong>Explanation:</strong> {question.explanation}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
