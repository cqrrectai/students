"use client"

import type React from "react"
import { useState, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import {
  Upload,
  FileImage,
  Loader2,
  CheckCircle,
  AlertCircle,
  X,
  Download,
  Eye,
  Brain,
  BookOpen,
  Target,
  Clock,
  Search,
  Filter,
  Save,
  Star,
  Settings,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"

interface ExamQuestion {
  id: string
  question: string
  options?: string[]
  correctAnswer?: string
  questionType: "multiple-choice" | "short-answer" | "essay" | "true-false"
  difficulty: "easy" | "medium" | "hard"
  subject?: string
  marks?: number
  qualityScore?: number
  tags?: string[]
  explanation?: string
  timeEstimate?: number
  bloomsLevel?: string
}

interface ProcessingResult {
  questions: ExamQuestion[]
  totalQuestions: number
  processingTime: number
}

interface FilterOptions {
  difficulty: string[]
  questionType: string[]
  subject: string[]
  minMarks: number
  maxMarks: number
  minQualityScore: number
  searchQuery: string
}

export default function AIGeneratorPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [results, setResults] = useState<ProcessingResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [customInstructions, setCustomInstructions] = useState("")
  const [dragActive, setDragActive] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null)
  const [editingQuestion, setEditingQuestion] = useState<ExamQuestion | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<FilterOptions>({
    difficulty: [],
    questionType: [],
    subject: [],
    minMarks: 0,
    maxMarks: 100,
    minQualityScore: 0,
    searchQuery: "",
  })
  const [aiSettings, setAiSettings] = useState({
    includeExplanations: true,
    generateTags: true,
    qualityScoring: true,
    bloomsTaxonomy: false,
    timeEstimation: true,
    difficultyAnalysis: true,
  })

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
      setError(null)
    }
  }, [])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const imageFiles = files.filter((file) => file.type.startsWith("image/"))
    setSelectedFiles((prev) => [...prev, ...imageFiles])
    setError(null)
  }

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const processImages = async () => {
    if (selectedFiles.length === 0) {
      setError("Please select at least one image file")
      return
    }

    setIsProcessing(true)
    setError(null)
    setProcessingProgress(0)

    const progressInterval = setInterval(() => {
      setProcessingProgress((prev) => {
        if (prev >= 90) return prev
        return prev + Math.random() * 15
      })
    }, 500)

    try {
      const startTime = Date.now()
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
      const processingTime = Date.now() - startTime

      // Add IDs and quality scores to questions
      const questionsWithIds = data.questions.map((q: ExamQuestion, index: number) => ({
        ...q,
        id: `q-${Date.now()}-${index}`,
        qualityScore: Math.floor(Math.random() * 30) + 70, // Simulated quality score
        tags: generateTags(q),
        timeEstimate: estimateTime(q),
      }))

      setProcessingProgress(100)
      setTimeout(() => {
        setResults({
          questions: questionsWithIds,
          totalQuestions: questionsWithIds.length,
          processingTime,
        })
        clearInterval(progressInterval)
      }, 500)
    } catch (err) {
      clearInterval(progressInterval)
      setError(err instanceof Error ? err.message : "An error occurred while processing images")
    } finally {
      setTimeout(() => {
        setIsProcessing(false)
        setProcessingProgress(0)
      }, 500)
    }
  }

  const generateTags = (question: ExamQuestion): string[] => {
    const tags = []
    if (question.subject) tags.push(question.subject)
    if (question.difficulty) tags.push(question.difficulty)
    if (question.questionType) tags.push(question.questionType.replace("-", " "))
    if (question.marks && question.marks > 5) tags.push("high-value")
    return tags
  }

  const estimateTime = (question: ExamQuestion): number => {
    const baseTime = {
      "multiple-choice": 2,
      "true-false": 1,
      "short-answer": 5,
      essay: 15,
    }
    const difficultyMultiplier = {
      easy: 1,
      medium: 1.5,
      hard: 2,
    }
    return Math.round(baseTime[question.questionType] * difficultyMultiplier[question.difficulty])
  }

  const filteredQuestions = useMemo(() => {
    if (!results) return []

    return results.questions.filter((question) => {
      // Search query filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase()
        const searchableText =
          `${question.question} ${question.subject || ""} ${question.tags?.join(" ") || ""}`.toLowerCase()
        if (!searchableText.includes(query)) return false
      }

      // Difficulty filter
      if (filters.difficulty.length > 0 && !filters.difficulty.includes(question.difficulty)) {
        return false
      }

      // Question type filter
      if (filters.questionType.length > 0 && !filters.questionType.includes(question.questionType)) {
        return false
      }

      // Subject filter
      if (filters.subject.length > 0 && question.subject && !filters.subject.includes(question.subject)) {
        return false
      }

      // Marks filter
      if (question.marks) {
        if (question.marks < filters.minMarks || question.marks > filters.maxMarks) {
          return false
        }
      }

      // Quality score filter
      if (question.qualityScore && question.qualityScore < filters.minQualityScore) {
        return false
      }

      return true
    })
  }, [results, filters])

  const exportQuestions = async (format: "pdf" | "json" | "csv") => {
    if (!results) return

    const questionsToExport = filteredQuestions.length > 0 ? filteredQuestions : results.questions

    try {
      const response = await fetch("/api/export-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions: questionsToExport, format }),
      })

      if (!response.ok) throw new Error("Export failed")

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `exam-questions.${format}`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError("Failed to export questions")
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-emerald-100 text-emerald-700 border-emerald-200"
      case "medium":
        return "bg-amber-100 text-amber-700 border-amber-200"
      case "hard":
        return "bg-rose-100 text-rose-700 border-rose-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "multiple-choice":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "short-answer":
        return "bg-purple-100 text-purple-700 border-purple-200"
      case "essay":
        return "bg-indigo-100 text-indigo-700 border-indigo-200"
      case "true-false":
        return "bg-orange-100 text-orange-700 border-orange-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getQualityColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 80) return "text-blue-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const getQuestionStats = () => {
    if (!results) return null

    const questions = filteredQuestions.length > 0 ? filteredQuestions : results.questions

    const stats = {
      easy: questions.filter((q) => q.difficulty === "easy").length,
      medium: questions.filter((q) => q.difficulty === "medium").length,
      hard: questions.filter((q) => q.difficulty === "hard").length,
      multipleChoice: questions.filter((q) => q.questionType === "multiple-choice").length,
      shortAnswer: questions.filter((q) => q.questionType === "short-answer").length,
      essay: questions.filter((q) => q.questionType === "essay").length,
      trueFalse: questions.filter((q) => q.questionType === "true-false").length,
      avgQuality: Math.round(questions.reduce((acc, q) => acc + (q.qualityScore || 0), 0) / questions.length),
      totalTime: questions.reduce((acc, q) => acc + (q.timeEstimate || 0), 0),
    }

    return stats
  }

  const stats = getQuestionStats()

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
            <h1 className="text-3xl font-bold text-gray-900">AI Question Generator</h1>
            <p className="text-gray-600 mt-1">Generate exam questions from images using AI</p>
          </div>
        </div>
        {results && (
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => exportQuestions("json")} className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button className="bg-gray-900 hover:bg-gray-800 gap-2">
              <Save className="h-4 w-4" />
              Save to Bank
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Upload Section */}
        <div className="xl:col-span-1 space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Upload className="h-5 w-5 text-blue-600" />
                Upload Images
              </CardTitle>
              <CardDescription>Upload question bank images for AI processing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Drag & Drop Area */}
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                  dragActive ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
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
                <div className="space-y-4">
                  <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Upload className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Drop images here or click to browse</p>
                    <p className="text-xs text-gray-500 mt-1">Supports JPG, PNG, WebP up to 10MB each</p>
                  </div>
                </div>
              </div>

              {/* Selected Files */}
              {selectedFiles.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Selected Files</Label>
                    <Badge variant="secondary" className="text-xs">
                      {selectedFiles.length} files
                    </Badge>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                        <div className="flex items-center gap-3 min-w-0">
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
                          className="flex-shrink-0 h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Instructions */}
              <div className="space-y-2">
                <Label htmlFor="instructions" className="text-sm font-medium">
                  Custom Instructions
                </Label>
                <Textarea
                  id="instructions"
                  placeholder="e.g., Focus on HSC Physics questions, include Bengali translations..."
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  className="resize-none"
                  rows={3}
                />
              </div>

              {/* Process Button */}
              <Button
                onClick={processImages}
                disabled={isProcessing || selectedFiles.length === 0}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white shadow-lg"
                size="lg"
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

              {/* Progress Bar */}
              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Processing images...</span>
                    <span className="font-medium">{Math.round(processingProgress)}%</span>
                  </div>
                  <Progress value={processingProgress} className="h-2" />
                </div>
              )}

              {/* Error Alert */}
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* AI Settings */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="h-5 w-5 text-purple-600" />
                AI Settings
              </CardTitle>
              <CardDescription>Configure AI processing options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="explanations" className="text-sm">
                    Include Explanations
                  </Label>
                  <Switch
                    id="explanations"
                    checked={aiSettings.includeExplanations}
                    onCheckedChange={(checked) => setAiSettings((prev) => ({ ...prev, includeExplanations: checked }))}
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
                    onCheckedChange={(checked) => setAiSettings((prev) => ({ ...prev, qualityScoring: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="time" className="text-sm">
                    Time Estimation
                  </Label>
                  <Switch
                    id="time"
                    checked={aiSettings.timeEstimation}
                    onCheckedChange={(checked) => setAiSettings((prev) => ({ ...prev, timeEstimation: checked }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        <div className="xl:col-span-2">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="h-5 w-5 text-green-600" />
                Generated Questions
              </CardTitle>
              <CardDescription>AI-processed exam questions ready for use</CardDescription>
            </CardHeader>
            <CardContent>
              {!results && !isProcessing && (
                <div className="text-center py-16">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Brain className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No questions yet</h3>
                  <p className="text-gray-500 mb-6">Upload question bank images to get started</p>
                  <div className="grid grid-cols-2 gap-4 max-w-md mx-auto text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-blue-500" />
                      <span>Multiple formats</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-green-500" />
                      <span>Fast processing</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-purple-500" />
                      <span>High accuracy</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-orange-500" />
                      <span>AI-powered</span>
                    </div>
                  </div>
                </div>
              )}

              {isProcessing && (
                <div className="text-center py-16">
                  <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Processing your images</h3>
                  <p className="text-gray-500">Our AI is analyzing and extracting questions...</p>
                </div>
              )}

              {results && (
                <div className="space-y-6">
                  {/* Stats Overview */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                      <div className="text-2xl font-bold text-blue-700">{results.totalQuestions}</div>
                      <div className="text-sm text-blue-600">Questions</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                      <div className="text-2xl font-bold text-green-700">
                        {(results.processingTime / 1000).toFixed(1)}s
                      </div>
                      <div className="text-sm text-green-600">Processing</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                      <div className="text-2xl font-bold text-purple-700">{stats?.avgQuality || 0}</div>
                      <div className="text-sm text-purple-600">Avg Quality</div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
                      <div className="text-2xl font-bold text-orange-700">{stats?.totalTime || 0}m</div>
                      <div className="text-sm text-orange-600">Est. Time</div>
                    </div>
                  </div>

                  {/* Filters */}
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search questions..."
                          value={filters.searchQuery}
                          onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="gap-2">
                      <Filter className="h-4 w-4" />
                      Filters
                    </Button>
                  </div>

                  {showFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Difficulty</Label>
                        <div className="space-y-2">
                          {["easy", "medium", "hard"].map((difficulty) => (
                            <div key={difficulty} className="flex items-center space-x-2">
                              <Checkbox
                                id={difficulty}
                                checked={filters.difficulty.includes(difficulty)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setFilters((prev) => ({
                                      ...prev,
                                      difficulty: [...prev.difficulty, difficulty],
                                    }))
                                  } else {
                                    setFilters((prev) => ({
                                      ...prev,
                                      difficulty: prev.difficulty.filter((d) => d !== difficulty),
                                    }))
                                  }
                                }}
                              />
                              <Label htmlFor={difficulty} className="text-sm capitalize">
                                {difficulty}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Question Type</Label>
                        <div className="space-y-2">
                          {["multiple-choice", "short-answer", "essay", "true-false"].map((type) => (
                            <div key={type} className="flex items-center space-x-2">
                              <Checkbox
                                id={type}
                                checked={filters.questionType.includes(type)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setFilters((prev) => ({
                                      ...prev,
                                      questionType: [...prev.questionType, type],
                                    }))
                                  } else {
                                    setFilters((prev) => ({
                                      ...prev,
                                      questionType: prev.questionType.filter((t) => t !== type),
                                    }))
                                  }
                                }}
                              />
                              <Label htmlFor={type} className="text-sm">
                                {type.replace("-", " ")}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setFilters({
                              difficulty: [],
                              questionType: [],
                              subject: [],
                              minMarks: 0,
                              maxMarks: 100,
                              minQualityScore: 0,
                              searchQuery: "",
                            })
                          }
                        >
                          Clear Filters
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Questions List */}
                  <div className="space-y-4 max-h-[600px] overflow-y-auto">
                    {filteredQuestions.map((question, index) => (
                      <Card
                        key={question.id}
                        className={`transition-all duration-200 hover:shadow-md border-l-4 ${
                          question.difficulty === "easy"
                            ? "border-l-emerald-500"
                            : question.difficulty === "medium"
                              ? "border-l-amber-500"
                              : "border-l-rose-500"
                        }`}
                      >
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex flex-wrap gap-2">
                              <Badge className={`${getDifficultyColor(question.difficulty)} border`}>
                                {question.difficulty}
                              </Badge>
                              <Badge className={`${getTypeColor(question.questionType)} border`}>
                                {question.questionType.replace("-", " ")}
                              </Badge>
                              {question.marks && (
                                <Badge variant="outline" className="border-gray-300">
                                  {question.marks} marks
                                </Badge>
                              )}
                              {question.qualityScore && (
                                <Badge variant="outline" className="border-gray-300">
                                  <Star className="h-3 w-3 mr-1" />
                                  <span className={getQualityColor(question.qualityScore)}>
                                    {question.qualityScore}%
                                  </span>
                                </Badge>
                              )}
                              {question.timeEstimate && (
                                <Badge variant="outline" className="border-gray-300">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {question.timeEstimate}m
                                </Badge>
                              )}
                              {question.subject && (
                                <Badge variant="outline" className="border-gray-300">
                                  {question.subject}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-500">Q{index + 1}</span>
                              <Eye className="h-4 w-4 text-gray-400" />
                            </div>
                          </div>

                          <div className="space-y-3">
                            <p className="font-medium text-gray-900 leading-relaxed">{question.question}</p>

                            {question.options && question.options.length > 0 && (
                              <div className="space-y-2">
                                {question.options.map((option, optIndex) => (
                                  <div
                                    key={optIndex}
                                    className={`p-3 rounded-lg text-sm transition-colors ${
                                      question.correctAnswer === option
                                        ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                                        : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
                                    }`}
                                  >
                                    <span className="font-medium mr-2">{String.fromCharCode(65 + optIndex)}.</span>
                                    {option}
                                    {question.correctAnswer === option && (
                                      <CheckCircle className="inline-block ml-2 h-4 w-4 text-emerald-600" />
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                            {question.correctAnswer && !question.options && (
                              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                                  <span className="text-sm font-medium text-emerald-800">
                                    Answer: {question.correctAnswer}
                                  </span>
                                </div>
                              </div>
                            )}

                            {question.explanation && (
                              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-start gap-2">
                                  <Brain className="h-4 w-4 text-blue-600 mt-0.5" />
                                  <div>
                                    <span className="text-sm font-medium text-blue-800">Explanation:</span>
                                    <p className="text-sm text-blue-700 mt-1">{question.explanation}</p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {question.tags && question.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {question.tags.map((tag) => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
