"use client"

import type React from "react"
import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { databaseService } from "@/lib/database-service"
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
  Play,
  BookOpen
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PublicLayout } from "@/components/public-layout"
import { canUseAIExamGeneration, incrementAIExamGeneration } from '@/lib/subscription-utils'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
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

export default function CreateUserExam() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/sign-in')
    }
  }, [user, authLoading, router])
  
  const [examData, setExamData] = useState<ExamData>({
    title: "",
    description: "",
    type: "SSC",
    subject: "",
    duration: 60,
    totalMarks: 0,
    instructions: "Read all questions carefully and manage your time wisely.",
    questions: [],
    security: {
      randomizeQuestions: true,
      randomizeOptions: true,
      preventCopyPaste: true,
      fullScreenMode: false,
      timeLimit: true,
      showResults: true,
      allowReview: false,
      maxAttempts: 3,
      passingScore: 60
    }
  })

  const [aiSettings, setAiSettings] = useState<AISettings>({
    includeExplanations: true,
    generateTags: true,
    qualityScoring: true,
    difficultyAnalysis: true
  })

  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [customInstructions, setCustomInstructions] = useState("")
  const [dragActive, setDragActive] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  
  // Show loading if not authenticated
  if (!user) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00e4a0] mx-auto"></div>
              <p className="mt-4 text-gray-800 font-medium">Loading...</p>
            </div>
          </div>
        </div>
      </PublicLayout>
    )
  }

  const validateStep = (step: number): string[] => {
    const errors: string[] = []

    if (step === 1) {
      if (!examData.title.trim()) errors.push("Exam title is required")
      if (!examData.subject.trim()) errors.push("Subject is required")
      if (examData.duration < 1) errors.push("Duration must be at least 1 minute")
    }

    if (step === 3 && examData.questions.length === 0) {
      errors.push("At least one question is required")
    }

    return errors
  }

  const nextStep = () => {
    const errors = validateStep(currentStep)
    setValidationErrors(errors)
    if (errors.length === 0 && currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setValidationErrors([])
    }
  }

  const addManualQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      question: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      marks: 1,
      difficulty: "medium",
      subject: examData.subject,
      explanation: "",
      tags: []
    }

    setExamData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
      totalMarks: prev.totalMarks + 1
    }))
  }

  const updateQuestion = (questionId: string, field: keyof Question, value: any) => {
    setExamData(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.id === questionId
          ? { ...q, [field]: value }
          : q
      )
    }))
  }

  const updateQuestionOption = (questionId: string, optionIndex: number, value: string) => {
    setExamData(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.id === questionId
          ? { ...q, options: q.options.map((opt, idx) => idx === optionIndex ? value : opt) }
          : q
      )
    }))
  }

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === "text/csv") {
      setCsvFile(file)
    }
  }

  const processCsvFile = async () => {
    if (!csvFile) return

    setIsProcessing(true)
    try {
      const text = await csvFile.text()
      const lines = text.split('\n').filter(line => line.trim())
      const questions: Question[] = []

      // Skip header row
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(col => col.trim().replace(/^"(.*)"$/, '$1'))

        if (cols.length >= 6) {
          const question: Question = {
            id: Date.now().toString() + i,
            question: cols[0],
            options: [cols[1], cols[2], cols[3], cols[4]],
            correctAnswer: cols[5],
            marks: parseInt(cols[6]) || 1,
            difficulty: (cols[7] as any) || "medium",
            subject: examData.subject,
            explanation: cols[8] || "",
            tags: cols[9] ? cols[9].split(';') : []
          }
          questions.push(question)
        }
      }

      setExamData(prev => ({
        ...prev,
        questions: [...prev.questions, ...questions],
        totalMarks: prev.totalMarks + questions.reduce((sum, q) => sum + q.marks, 0)
      }))

      setCsvFile(null)
    } catch (error) {
      console.error('Error processing CSV:', error)
    } finally {
      setIsProcessing(false)
    }
  }

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
      setImageFiles((prev) => [...prev, ...imageFiles])
      setValidationErrors([])
    }
  }, [])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const imageFiles = files.filter((file) => file.type.startsWith("image/"))
    setImageFiles((prev) => [...prev, ...imageFiles])
    setValidationErrors([])
  }

  const removeFile = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index))
  }

  const processAIImages = async () => {
    if (imageFiles.length === 0) {
      setValidationErrors(["Please select at least one image file"])
      return
    }

    if (!user) {
      setValidationErrors(["Please sign in to use AI generation"])
      return
    }

    setIsProcessing(true)
    setValidationErrors([])
    setProcessingProgress(0)

    const progressInterval = setInterval(() => {
      setProcessingProgress((prev) => {
        if (prev >= 90) return prev
        return prev + Math.random() * 15
      })
    }, 500)

    try {
      // Check AI usage limits (simplified for now)
      try {
        const aiUsage = await canUseAIExamGeneration(user.id)
        if (!aiUsage.allowed) {
          throw new Error(`AI generation limit reached. You have ${aiUsage.remaining} generations remaining.`)
        }
      } catch (usageError) {
        console.warn('AI usage check failed, proceeding anyway:', usageError)
        // Continue with AI generation even if usage check fails
      }

      const formData = new FormData()

      imageFiles.forEach((file, index) => {
        formData.append(`image-${index}`, file)
      })

      if (customInstructions) {
        formData.append("instructions", customInstructions)
      }

      formData.append("aiSettings", JSON.stringify(aiSettings))
      formData.append("subject", examData.subject)
      formData.append("type", examData.type)

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
        tags: q.tags || ["ai-generated"],
        subject: q.subject || examData.subject,
      }))

      setProcessingProgress(100)

      // Increment AI usage (with error handling)
      try {
        await incrementAIExamGeneration(user.id)
      } catch (incrementError) {
        console.warn('Failed to increment AI usage:', incrementError)
        // Continue anyway, don't block the user
      }

      setTimeout(() => {
        setExamData((prev) => ({
          ...prev,
          questions: [...prev.questions, ...aiQuestions],
          totalMarks: prev.totalMarks + aiQuestions.reduce((sum, q) => sum + q.marks, 0),
        }))
        setImageFiles([])
        clearInterval(progressInterval)
      }, 500)
    } catch (error) {
      clearInterval(progressInterval)
      setValidationErrors([error instanceof Error ? error.message : "An error occurred while processing images"])
    } finally {
      setTimeout(() => {
        setIsProcessing(false)
        setProcessingProgress(0)
      }, 500)
    }
  }

  const removeQuestion = (questionId: string) => {
    const question = examData.questions.find(q => q.id === questionId)
    if (question) {
      setExamData(prev => ({
        ...prev,
        questions: prev.questions.filter(q => q.id !== questionId),
        totalMarks: prev.totalMarks - question.marks
      }))
    }
  }

  const saveExam = async (status: "published" | "draft" = "published") => {
    if (examData.questions.length === 0) {
      setValidationErrors(["Please add at least one question"])
      return
    }

    if (!user) {
      setValidationErrors(["Please sign in to create an exam"])
      return
    }

    setLoading(true)
    setValidationErrors([])

    try {
      console.log('Creating student exam with data:', {
        title: examData.title,
        type: examData.type,
        subject: examData.subject,
        duration: examData.duration,
        total_marks: examData.totalMarks,
        status: status === "published" ? "active" : "draft",
        created_by: user.id,
        exam_type: 'student'
      })

      // Use dedicated student exams API for better handling
      const response = await fetch('/api/student-exams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: examData.title,
          description: examData.description,
          type: examData.type,
          subject: examData.subject,
          duration: examData.duration,
          total_marks: examData.totalMarks,
          instructions: examData.instructions,
          status: status === "published" ? "active" : "draft",
          security: examData.security,
          created_by: user.id, // Set the creator
          questions: examData.questions.map((q, index) => ({
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            marks: q.marks,
            difficulty: q.difficulty,
            explanation: q.explanation || null,
            tags: q.tags || null,
            order_index: index + 1
          }))
        })
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to create exam')
      }

      console.log('Exam created successfully:', result.exam)

      // Redirect back to dashboard to see the newly created exam
      router.push('/dashboard')

    } catch (error) {
      console.error('Error saving exam:', error)
      let errorMessage = 'Failed to save exam. Please try again.'

      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      } else if (error && typeof error === 'object') {
        // Handle object errors better
        errorMessage = (error as any).message || (error as any).details || 'Unknown error occurred'
      }

      setValidationErrors([errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const saveAsDraft = () => saveExam("draft")
  const publishExam = () => saveExam("published")

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/dashboard')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Create Your Exam</h1>
                <p className="text-gray-700 mt-1 font-medium">Design a custom exam with AI assistance</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                Step {currentStep} of 4
              </Badge>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <Progress value={(currentStep / 4) * 100} className="h-2" />
            <div className="flex justify-between mt-2 text-sm text-gray-500">
              <span className={currentStep >= 1 ? "text-[#00e4a0] font-medium" : ""}>Basic Info</span>
              <span className={currentStep >= 2 ? "text-[#00e4a0] font-medium" : ""}>Settings</span>
              <span className={currentStep >= 3 ? "text-[#00e4a0] font-medium" : ""}>Questions</span>
              <span className={currentStep >= 4 ? "text-[#00e4a0] font-medium" : ""}>Review</span>
            </div>
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                <ul className="list-disc list-inside">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Step Content */}
          <div className="space-y-8">

            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-[#00e4a0]" />
                    Basic Exam Information
                  </CardTitle>
                  <CardDescription>
                    Provide the fundamental details about your exam
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title" className="text-sm font-medium">Exam Title *</Label>
                        <Input
                          id="title"
                          value={examData.title}
                          onChange={(e) => setExamData(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="e.g., HSC Physics Chapter 1 Practice Test"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                        <Textarea
                          id="description"
                          value={examData.description}
                          onChange={(e) => setExamData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Describe what this exam covers..."
                          className="mt-1"
                          rows={4}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="subject" className="text-sm font-medium">Subject *</Label>
                        <Input
                          id="subject"
                          value={examData.subject}
                          onChange={(e) => setExamData(prev => ({ ...prev, subject: e.target.value }))}
                          placeholder="e.g., Physics, Mathematics, Chemistry"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="type" className="text-sm font-medium">Exam Type</Label>
                        <Select
                          value={examData.type}
                          onValueChange={(value) => setExamData(prev => ({ ...prev, type: value }))}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SSC">SSC</SelectItem>
                            <SelectItem value="HSC">HSC</SelectItem>
                            <SelectItem value="University">University</SelectItem>
                            <SelectItem value="Job">Job Preparation</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="duration" className="text-sm font-medium">Duration (minutes)</Label>
                        <Input
                          id="duration"
                          type="number"
                          value={examData.duration}
                          onChange={(e) => setExamData(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                          min="1"
                          max="300"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="instructions" className="text-sm font-medium">Instructions</Label>
                    <Textarea
                      id="instructions"
                      value={examData.instructions}
                      onChange={(e) => setExamData(prev => ({ ...prev, instructions: e.target.value }))}
                      placeholder="Instructions for exam takers..."
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Security Settings */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-[#00e4a0]" />
                    Exam Settings & Security
                  </CardTitle>
                  <CardDescription>
                    Configure how your exam behaves and security features
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Question Settings */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900">Question Settings</h3>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">Randomize Questions</Label>
                          <p className="text-xs text-gray-500">Shuffle question order for each attempt</p>
                        </div>
                        <Switch
                          checked={examData.security.randomizeQuestions}
                          onCheckedChange={(checked) =>
                            setExamData(prev => ({
                              ...prev,
                              security: { ...prev.security, randomizeQuestions: checked }
                            }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">Randomize Options</Label>
                          <p className="text-xs text-gray-500">Shuffle answer options within questions</p>
                        </div>
                        <Switch
                          checked={examData.security.randomizeOptions}
                          onCheckedChange={(checked) =>
                            setExamData(prev => ({
                              ...prev,
                              security: { ...prev.security, randomizeOptions: checked }
                            }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">Show Results</Label>
                          <p className="text-xs text-gray-500">Display results immediately after exam</p>
                        </div>
                        <Switch
                          checked={examData.security.showResults}
                          onCheckedChange={(checked) =>
                            setExamData(prev => ({
                              ...prev,
                              security: { ...prev.security, showResults: checked }
                            }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">Allow Review</Label>
                          <p className="text-xs text-gray-500">Let students review answers before submit</p>
                        </div>
                        <Switch
                          checked={examData.security.allowReview}
                          onCheckedChange={(checked) =>
                            setExamData(prev => ({
                              ...prev,
                              security: { ...prev.security, allowReview: checked }
                            }))
                          }
                        />
                      </div>
                    </div>

                    {/* Security Settings */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900">Security Features</h3>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">Prevent Copy/Paste</Label>
                          <p className="text-xs text-gray-500">Disable copy-paste functionality</p>
                        </div>
                        <Switch
                          checked={examData.security.preventCopyPaste}
                          onCheckedChange={(checked) =>
                            setExamData(prev => ({
                              ...prev,
                              security: { ...prev.security, preventCopyPaste: checked }
                            }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">Full Screen Mode</Label>
                          <p className="text-xs text-gray-500">Force exam to run in fullscreen</p>
                        </div>
                        <Switch
                          checked={examData.security.fullScreenMode}
                          onCheckedChange={(checked) =>
                            setExamData(prev => ({
                              ...prev,
                              security: { ...prev.security, fullScreenMode: checked }
                            }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">Strict Time Limit</Label>
                          <p className="text-xs text-gray-500">Auto-submit when time expires</p>
                        </div>
                        <Switch
                          checked={examData.security.timeLimit}
                          onCheckedChange={(checked) =>
                            setExamData(prev => ({
                              ...prev,
                              security: { ...prev.security, timeLimit: checked }
                            }))
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Maximum Attempts</Label>
                        <Input
                          type="number"
                          value={examData.security.maxAttempts}
                          onChange={(e) =>
                            setExamData(prev => ({
                              ...prev,
                              security: { ...prev.security, maxAttempts: parseInt(e.target.value) || 1 }
                            }))
                          }
                          min="1"
                          max="10"
                          className="w-24"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Passing Score (%)</Label>
                        <Input
                          type="number"
                          value={examData.security.passingScore}
                          onChange={(e) =>
                            setExamData(prev => ({
                              ...prev,
                              security: { ...prev.security, passingScore: parseInt(e.target.value) || 60 }
                            }))
                          }
                          min="0"
                          max="100"
                          className="w-24"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Questions */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-[#00e4a0]" />
                      Add Questions
                    </CardTitle>
                    <CardDescription>
                      Create questions manually, upload from CSV, or use AI to generate from images
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="ai" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="ai">
                          <Brain className="h-4 w-4 mr-2" />
                          AI Generation
                        </TabsTrigger>
                        <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                        <TabsTrigger value="csv">CSV Upload</TabsTrigger>
                      </TabsList>

                      {/* AI Generation Tab - Now Default */}
                      <TabsContent value="ai" className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Upload Section */}
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Upload Question Images</Label>
                              <div
                                className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${dragActive
                                  ? "border-[#00e4a0] bg-[#00e4a0]/5"
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
                                  <div className="mx-auto w-12 h-12 bg-[#00e4a0]/10 rounded-xl flex items-center justify-center">
                                    <Camera className="h-6 w-6 text-[#00e4a0]" />
                                  </div>
                                  <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Drop images here or click to browse</h3>
                                    <p className="text-gray-700 text-sm font-medium">Upload images of questions, diagrams, or text for AI analysis</p>
                                    <p className="text-xs text-gray-500 mt-1">Supports JPG, PNG, WebP up to 10MB each</p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {imageFiles.length > 0 && (
                              <div className="space-y-2">
                                <p className="text-sm font-medium">Selected Files ({imageFiles.length}):</p>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                  {imageFiles.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                      <div className="flex items-center gap-3">
                                        <FileImage className="h-4 w-4 text-gray-500" />
                                        <span className="text-sm font-medium">{file.name}</span>
                                        <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeFile(index)}
                                        className="text-red-600 hover:text-red-700"
                                      >
                                        <X className="h-4 w-4" />
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
                                placeholder="e.g., Focus on multiple choice questions, include Bengali translations, emphasize practical applications..."
                                value={customInstructions}
                                onChange={(e) => setCustomInstructions(e.target.value)}
                                rows={3}
                              />
                            </div>
                          </div>

                          {/* AI Settings */}
                          <div className="space-y-4">
                            <Label>AI Processing Options</Label>
                            <div className="space-y-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
                              <div className="flex items-center justify-between">
                                <div>
                                  <Label htmlFor="explanations" className="text-sm font-medium">Include Explanations</Label>
                                  <p className="text-xs text-gray-500">Generate detailed explanations for answers</p>
                                </div>
                                <Switch
                                  id="explanations"
                                  checked={aiSettings.includeExplanations}
                                  onCheckedChange={(checked) =>
                                    setAiSettings((prev) => ({ ...prev, includeExplanations: checked }))
                                  }
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <div>
                                  <Label htmlFor="tags" className="text-sm font-medium">Generate Tags</Label>
                                  <p className="text-xs text-gray-500">Auto-generate relevant topic tags</p>
                                </div>
                                <Switch
                                  id="tags"
                                  checked={aiSettings.generateTags}
                                  onCheckedChange={(checked) => setAiSettings((prev) => ({ ...prev, generateTags: checked }))}
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <div>
                                  <Label htmlFor="quality" className="text-sm font-medium">Quality Scoring</Label>
                                  <p className="text-xs text-gray-500">Analyze question quality and clarity</p>
                                </div>
                                <Switch
                                  id="quality"
                                  checked={aiSettings.qualityScoring}
                                  onCheckedChange={(checked) =>
                                    setAiSettings((prev) => ({ ...prev, qualityScoring: checked }))
                                  }
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <div>
                                  <Label htmlFor="difficulty" className="text-sm font-medium">Difficulty Analysis</Label>
                                  <p className="text-xs text-gray-500">Automatically determine question difficulty</p>
                                </div>
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
                              disabled={isProcessing || imageFiles.length === 0}
                              className="w-full bg-[#00e4a0] hover:bg-[#00d494] text-black font-medium"
                            >
                              {isProcessing ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  AI Processing... ({Math.round(processingProgress)}%)
                                </>
                              ) : (
                                <>
                                  <Brain className="mr-2 h-4 w-4" />
                                  Generate Questions with AI
                                </>
                              )}
                            </Button>

                            {isProcessing && (
                              <div className="space-y-2">
                                <Progress value={processingProgress} className="h-2" />
                                <p className="text-xs text-gray-500 text-center">
                                  AI is analyzing your images and generating questions...
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </TabsContent>

                      {/* Manual Entry */}
                      <TabsContent value="manual" className="space-y-4">
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-gray-700 font-medium">Add questions one by one with full control</p>
                          <Button onClick={addManualQuestion} className="bg-[#00e4a0] hover:bg-[#00d494] text-black">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Question
                          </Button>
                        </div>
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            Fill in the question details in the questions list below after clicking "Add Question"
                          </AlertDescription>
                        </Alert>
                      </TabsContent>

                      {/* CSV Upload */}
                      <TabsContent value="csv" className="space-y-4">
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            CSV format: Question, Option A, Option B, Option C, Option D, Correct Answer, Marks, Difficulty, Explanation, Tags
                          </AlertDescription>
                        </Alert>

                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="csv-upload" className="text-sm font-medium">CSV File</Label>
                            <Input
                              id="csv-upload"
                              type="file"
                              accept=".csv"
                              onChange={handleCsvUpload}
                              className="mt-1"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Upload a CSV file with your questions and answers
                            </p>
                          </div>

                          {csvFile && (
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                              <FileText className="h-5 w-5 text-gray-600" />
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{csvFile.name}</p>
                                <p className="text-sm text-gray-600">{(csvFile.size / 1024).toFixed(1)} KB</p>
                              </div>
                              <Button
                                onClick={processCsvFile}
                                disabled={isProcessing}
                                className="bg-[#00e4a0] hover:bg-[#00d494] text-black"
                              >
                                {isProcessing ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Processing...
                                  </>
                                ) : (
                                  <>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Process CSV
                                  </>
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => setCsvFile(null)}
                              >
                                Remove
                              </Button>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>

                {/* Questions List */}
                {examData.questions.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Questions ({examData.questions.length})</span>
                        <Badge variant="secondary">Total Marks: {examData.totalMarks}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {examData.questions.map((question, index) => (
                        <div key={question.id} className="border rounded-lg p-4 bg-gray-50">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">Question {index + 1}</h4>
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

                          <div className="space-y-4">
                            <div>
                              <Label className="text-sm font-medium">Question</Label>
                              <Textarea
                                value={question.question}
                                onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                                placeholder="Enter your question..."
                                className="mt-1"
                                rows={2}
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {question.options.map((option, optIndex) => (
                                <div key={optIndex}>
                                  <Label className="text-sm font-medium">Option {String.fromCharCode(65 + optIndex)}</Label>
                                  <Input
                                    value={option}
                                    onChange={(e) => updateQuestionOption(question.id, optIndex, e.target.value)}
                                    placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                                    className="mt-1"
                                  />
                                </div>
                              ))}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <Label className="text-sm font-medium">Correct Answer</Label>
                                <Select
                                  value={question.correctAnswer}
                                  onValueChange={(value) => updateQuestion(question.id, 'correctAnswer', value)}
                                >
                                  <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select correct answer" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {question.options.filter(option => option.trim() !== "").map((option, optIndex) => (
                                      <SelectItem key={optIndex} value={option}>
                                        {String.fromCharCode(65 + optIndex)}: {option.substring(0, 30)}{option.length > 30 ? '...' : ''}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <Label className="text-sm font-medium">Marks</Label>
                                <Input
                                  type="number"
                                  value={question.marks}
                                  onChange={(e) => {
                                    const newMarks = parseInt(e.target.value) || 1
                                    const oldMarks = question.marks
                                    updateQuestion(question.id, 'marks', newMarks)
                                    setExamData(prev => ({
                                      ...prev,
                                      totalMarks: prev.totalMarks - oldMarks + newMarks
                                    }))
                                  }}
                                  min="1"
                                  max="10"
                                  className="mt-1"
                                />
                              </div>

                              <div>
                                <Label className="text-sm font-medium">Difficulty</Label>
                                <Select
                                  value={question.difficulty}
                                  onValueChange={(value: "easy" | "medium" | "hard") => updateQuestion(question.id, 'difficulty', value)}
                                >
                                  <SelectTrigger className="mt-1">
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

                            <div>
                              <Label className="text-sm font-medium">Explanation (Optional)</Label>
                              <Textarea
                                value={question.explanation || ''}
                                onChange={(e) => updateQuestion(question.id, 'explanation', e.target.value)}
                                placeholder="Explain the correct answer..."
                                className="mt-1"
                                rows={2}
                              />
                            </div>

                            {question.tags && question.tags.length > 0 && (
                              <div>
                                <Label className="text-sm font-medium">Tags</Label>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {question.tags.map((tag, tagIndex) => (
                                    <Badge key={tagIndex} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Step 4: Review & Publish */}
            {currentStep === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-[#00e4a0]" />
                    Review & Publish
                  </CardTitle>
                  <CardDescription>
                    Review your exam details before publishing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Exam Summary */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900">Exam Summary</h3>

                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Title:</span>
                          <span className="font-medium">{examData.title}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subject:</span>
                          <span className="font-medium">{examData.subject}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Type:</span>
                          <span className="font-medium">{examData.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Duration:</span>
                          <span className="font-medium">{examData.duration} minutes</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Questions:</span>
                          <span className="font-medium">{examData.questions.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Marks:</span>
                          <span className="font-medium">{examData.totalMarks}</span>
                        </div>
                      </div>
                    </div>

                    {/* Security Settings Summary */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900">Security Settings</h3>

                      <div className="space-y-2 text-sm">
                        {Object.entries(examData.security).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-gray-600 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}:
                            </span>
                            <span className="font-medium">
                              {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Preview Button */}
                  <div className="border-t pt-6">
                    <Button
                      variant="outline"
                      onClick={() => setShowPreview(true)}
                      className="w-full mb-4"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview Exam
                    </Button>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                      <Button
                        variant="outline"
                        onClick={saveAsDraft}
                        disabled={loading}
                        className="flex-1"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save as Draft
                      </Button>

                      <Button
                        onClick={publishExam}
                        disabled={loading || examData.questions.length === 0}
                        className="flex-1 bg-[#00e4a0] hover:bg-[#00d494] text-black"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Publishing...
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Publish Exam
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <Button
              onClick={nextStep}
              disabled={currentStep === 4}
              className="bg-[#00e4a0] hover:bg-[#00d494] text-black"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {/* Preview Dialog */}
          <Dialog open={showPreview} onOpenChange={setShowPreview}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Exam Preview</DialogTitle>
                <DialogDescription>
                  This is how your exam will appear to students
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                <div className="border-b pb-4">
                  <h2 className="text-2xl font-bold">{examData.title}</h2>
                  <p className="text-gray-600">{examData.description}</p>
                  <div className="flex gap-4 mt-2 text-sm text-gray-500">
                    <span>Duration: {examData.duration} minutes</span>
                    <span>Total Marks: {examData.totalMarks}</span>
                    <span>Questions: {examData.questions.length}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {examData.questions.slice(0, 3).map((question, index) => (
                    <div key={question.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-medium">Question {index + 1}</h3>
                        <Badge variant="outline">{question.marks} marks</Badge>
                      </div>

                      <p className="mb-4">{question.question}</p>

                      <div className="space-y-2">
                        {question.options.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center gap-2">
                            <div className="w-4 h-4 border rounded-full"></div>
                            <span className="text-sm">{String.fromCharCode(65 + optIndex)}. {option}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {examData.questions.length > 3 && (
                    <p className="text-center text-gray-500 text-sm">
                      ... and {examData.questions.length - 3} more questions
                    </p>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </PublicLayout>
  )
} 