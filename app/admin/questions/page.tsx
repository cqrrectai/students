"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  ArrowLeft,
  Save,
  X,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import Link from "next/link"

import type { Database } from "@/lib/database.types"

type Question = Database['public']['Tables']['questions']['Row']
type Exam = Database['public']['Tables']['exams']['Row']

interface QuestionWithExam extends Question {
  exam?: {
    title: string
    type: string
  }
}

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<QuestionWithExam[]>([])
  const [exams, setExams] = useState<Exam[]>([])
  const [filteredQuestions, setFilteredQuestions] = useState<QuestionWithExam[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterDifficulty, setFilterDifficulty] = useState('all')
  const [filterExamType, setFilterExamType] = useState('all')
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionWithExam | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Form state for creating/editing questions
  const [formData, setFormData] = useState({
    question: '',
    options: ['', '', '', ''],
    correct_answer: '',
    marks: 1,
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    explanation: '',
    tags: [] as string[],
    exam_id: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterQuestions()
  }, [questions, searchQuery, filterDifficulty, filterExamType])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load questions and exams using new API endpoints
      const [questionsResponse, examsResponse] = await Promise.all([
        fetch('/api/admin/questions'),
        fetch('/api/admin/exams')
      ])

      const [questionsResult, examsResult] = await Promise.all([
        questionsResponse.json(),
        examsResponse.json()
      ])

      if (!questionsResponse.ok || !questionsResult.success) {
        setError('Failed to load questions')
        console.error('Questions error:', questionsResult.error)
        return
      }

      if (!examsResponse.ok || !examsResult.success) {
        setError('Failed to load exams')
        console.error('Exams error:', examsResult.error)
        return
      }

      const questionsData = questionsResult.data || []
      const examsData = examsResult.data || []
      
      setExams(examsData)

      // Questions already come enriched with exam information from the API
      setQuestions(questionsData)
    } catch (err) {
      setError('Failed to load data')
      console.error('Data loading error:', err)
    } finally {
      setLoading(false)
    }
  }

  const filterQuestions = () => {
    let filtered = [...questions]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(q => 
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.exam?.title?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Difficulty filter
    if (filterDifficulty !== 'all') {
      filtered = filtered.filter(q => q.difficulty === filterDifficulty)
    }

    // Exam type filter
    if (filterExamType !== 'all') {
      filtered = filtered.filter(q => q.exam?.type === filterExamType)
    }

    setFilteredQuestions(filtered)
  }

  const handleSaveQuestion = async () => {
    if (!formData.question.trim() || formData.options.some(opt => !opt.trim()) || !formData.correct_answer) {
      setError('Please fill in all required fields')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const questionData = {
        question: formData.question,
        options: formData.options,
        correct_answer: formData.correct_answer,
        marks: formData.marks,
        difficulty: formData.difficulty,
        explanation: formData.explanation || null,
        tags: formData.tags.length > 0 ? formData.tags : null,
        exam_id: formData.exam_id || null,
      }

      let response
      if (isCreating) {
        response = await fetch('/api/admin/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(questionData)
        })
      } else if (selectedQuestion) {
        response = await fetch(`/api/admin/questions/${selectedQuestion.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(questionData)
        })
      }

      const result = await response?.json()

      if (!response?.ok || !result?.success) {
        throw new Error(result?.error || 'Failed to save question')
      }

      setSuccess(isCreating ? 'Question created successfully!' : 'Question updated successfully!')

      // Reload questions
      await loadData()
      
      // Reset form
      handleCloseDialog()
      
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save question')
      console.error('Save error:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return

    try {
      const response = await fetch(`/api/admin/questions/${questionId}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to delete question')
      }

      setSuccess('Question deleted successfully!')
      await loadData()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete question')
      console.error('Delete error:', err)
    }
  }

  const handleCreateQuestion = () => {
    setFormData({
      question: '',
      options: ['', '', '', ''],
      correct_answer: '',
      marks: 1,
      difficulty: 'medium',
      explanation: '',
      tags: [],
      exam_id: '',
    })
    setSelectedQuestion(null)
    setIsCreating(true)
    setIsEditing(false)
  }

  const handleEditQuestion = (question: QuestionWithExam) => {
    setFormData({
      question: question.question,
      options: Array.isArray(question.options) ? question.options as string[] : ['', '', '', ''],
      correct_answer: question.correct_answer,
      marks: question.marks || 1,
      difficulty: question.difficulty as 'easy' | 'medium' | 'hard' || 'medium',
      explanation: question.explanation || '',
      tags: question.tags || [],
      exam_id: question.exam_id || '',
    })
    setSelectedQuestion(question)
    setIsEditing(true)
  }

  const handleCloseDialog = () => {
    setIsCreating(false)
    setIsEditing(false)
    setSelectedQuestion(null)
    setFormData({
      question: '',
      options: ['', '', '', ''],
      correct_answer: '',
      marks: 1,
      difficulty: 'medium',
      explanation: '',
      tags: [],
      exam_id: '',
    })
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00e4a0]"></div>
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
            <h1 className="text-3xl font-bold text-gray-900">Question Bank</h1>
            <p className="text-gray-600 mt-1">Manage your question database</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleCreateQuestion} className="bg-gray-900 hover:bg-gray-800">
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </Button>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Difficulties</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterExamType} onValueChange={setFilterExamType}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Exam Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="HSC">HSC</SelectItem>
            <SelectItem value="SSC">SSC</SelectItem>
            <SelectItem value="University">University</SelectItem>
            <SelectItem value="Job Preparation">Job Preparation</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Questions List */}
      <Card>
        <CardHeader>
          <CardTitle>Questions ({filteredQuestions.length})</CardTitle>
          <CardDescription>
            {questions.length} total questions in the database
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No questions found matching your criteria</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuestions.map((question) => (
                <div key={question.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getDifficultyColor(question.difficulty)}>
                          {question.difficulty}
                        </Badge>
                        <Badge variant="outline">{question.marks} marks</Badge>
                        {question.exam && (
                          <Badge variant="secondary">
                            {question.exam.title} ({question.exam.type})
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-900 mb-2">
                        {question.question}
                      </p>
                      {question.options && Array.isArray(question.options) && question.options.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                          {(question.options as string[]).map((option: string, index: number) => (
                            <div key={index} className="flex items-center gap-2">
                              <span className="font-medium">
                                {String.fromCharCode(65 + index)}.
                              </span>
                              <span className={
                                option === question.correct_answer 
                                  ? 'text-green-600 font-medium' 
                                  : ''
                              }>
                                {option}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      {question.explanation && (
                        <p className="text-sm text-gray-600 mt-2">
                          <span className="font-medium">Explanation:</span> {question.explanation}
                        </p>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditQuestion(question)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => question.id && handleDeleteQuestion(question.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Question Dialog */}
      <Dialog open={isCreating || isEditing} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isCreating ? 'Create New Question' : 'Edit Question'}
            </DialogTitle>
            <DialogDescription>
              {isCreating ? 'Add a new question to the database' : 'Update the selected question'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="exam">Exam (Optional)</Label>
                <Select value={formData.exam_id} onValueChange={(value) => setFormData({...formData, exam_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select exam" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No specific exam</SelectItem>
                    {exams.map((exam) => (
                      <SelectItem key={exam.id} value={exam.id}>
                        {exam.title} ({exam.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select value={formData.difficulty} onValueChange={(value: any) => setFormData({...formData, difficulty: value})}>
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

            <div className="space-y-2">
              <Label htmlFor="question">Question</Label>
              <Textarea
                id="question"
                placeholder="Enter your question..."
                value={formData.question}
                onChange={(e) => setFormData({...formData, question: e.target.value})}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Options</Label>
              <div className="space-y-2">
                {formData.options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="w-6 text-sm font-medium">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <Input
                      placeholder={`Option ${String.fromCharCode(65 + index)}`}
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...formData.options]
                        newOptions[index] = e.target.value
                        setFormData({...formData, options: newOptions})
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="correct_answer">Correct Answer</Label>
              <Select value={formData.correct_answer} onValueChange={(value) => setFormData({...formData, correct_answer: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select correct answer" />
                </SelectTrigger>
                <SelectContent>
                  {formData.options.map((option, index) => (
                    <SelectItem key={index} value={option} disabled={!option.trim()}>
                      {String.fromCharCode(65 + index)}. {option || 'Empty option'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="marks">Marks</Label>
                <Input
                  id="marks"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.marks}
                  onChange={(e) => setFormData({...formData, marks: parseInt(e.target.value) || 1})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="explanation">Explanation (Optional)</Label>
              <Textarea
                id="explanation"
                placeholder="Provide an explanation for the correct answer..."
                value={formData.explanation}
                onChange={(e) => setFormData({...formData, explanation: e.target.value})}
                rows={2}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleCloseDialog}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSaveQuestion} disabled={saving}>
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isCreating ? 'Create Question' : 'Update Question'}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 