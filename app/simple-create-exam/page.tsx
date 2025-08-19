"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Plus, X } from 'lucide-react'
import { databaseService } from '@/lib/database-service'

interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: string
  marks: number
  difficulty: 'easy' | 'medium' | 'hard'
}

export default function SimpleCreateExam() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  
  const [examData, setExamData] = useState({
    title: '',
    description: '',
    type: 'HSC',
    subject: '',
    duration: 60,
    instructions: 'Read all questions carefully and manage your time wisely.'
  })

  const [questions, setQuestions] = useState<Question[]>([])

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      marks: 1,
      difficulty: 'medium'
    }
    setQuestions([...questions, newQuestion])
  }

  const updateQuestion = (id: string, field: keyof Question, value: any) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ))
  }

  const updateQuestionOption = (id: string, optionIndex: number, value: string) => {
    setQuestions(questions.map(q => 
      q.id === id 
        ? { ...q, options: q.options.map((opt, idx) => idx === optionIndex ? value : opt) }
        : q
    ))
  }

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id))
  }

  const validateForm = () => {
    const newErrors: string[] = []
    
    if (!examData.title.trim()) newErrors.push('Exam title is required')
    if (!examData.subject.trim()) newErrors.push('Subject is required')
    if (examData.duration < 1) newErrors.push('Duration must be at least 1 minute')
    if (questions.length === 0) newErrors.push('At least one question is required')
    
    questions.forEach((q, index) => {
      if (!q.question.trim()) newErrors.push(`Question ${index + 1}: Question text is required`)
      if (q.options.some(opt => !opt.trim())) newErrors.push(`Question ${index + 1}: All options must be filled`)
      if (!q.correctAnswer.trim()) newErrors.push(`Question ${index + 1}: Correct answer is required`)
      if (!q.options.includes(q.correctAnswer)) newErrors.push(`Question ${index + 1}: Correct answer must match one of the options`)
    })
    
    setErrors(newErrors)
    return newErrors.length === 0
  }

  const saveExam = async () => {
    if (!validateForm()) return
    
    setLoading(true)
    setErrors([])
    
    try {
      const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0)
      
      // Create exam
      const { data: exam, error: examError } = await databaseService.createExam({
        title: examData.title,
        description: examData.description,
        type: examData.type,
        subject: examData.subject,
        duration: examData.duration,
        total_marks: totalMarks,
        instructions: examData.instructions,
        status: 'active',
        created_by: 'b1c2ef6a-975f-49e5-a5d0-f42b0ecdee46', // Admin user ID
        security: {
          randomizeQuestions: false,
          randomizeOptions: false,
          preventCopyPaste: true,
          fullScreenMode: false,
          timeLimit: true,
          showResults: true,
          allowReview: true,
          maxAttempts: 3,
          passingScore: 60
        }
      })
      
      if (examError || !exam) {
        throw new Error(examError?.message || 'Failed to create exam')
      }
      
      // Create questions
      const questionErrors: string[] = []
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i]
        const { error: questionError } = await databaseService.createQuestion({
          exam_id: exam.id,
          question: question.question,
          options: question.options,
          correct_answer: question.correctAnswer,
          marks: question.marks,
          difficulty: question.difficulty,
          order_index: i + 1
        })
        
        if (questionError) {
          questionErrors.push(`Question ${i + 1}: ${questionError.message}`)
        }
      }
      
      if (questionErrors.length > 0) {
        console.warn('Some questions failed:', questionErrors)
      }
      
      // Success - redirect to exam
      alert(`Exam "${exam.title}" created successfully!`)
      router.push(`/exam/${exam.id}`)
      
    } catch (error) {
      console.error('Error saving exam:', error)
      setErrors([error instanceof Error ? error.message : 'Failed to save exam'])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Simple Exam Creator</h1>
          <p className="text-gray-600">Create a basic exam with questions</p>
        </div>

        {errors.length > 0 && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              <ul className="list-disc list-inside">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Exam Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Exam Title *</Label>
                  <Input
                    id="title"
                    value={examData.title}
                    onChange={(e) => setExamData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., HSC Physics Practice Test"
                  />
                </div>
                
                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    value={examData.subject}
                    onChange={(e) => setExamData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="e.g., Physics, Mathematics"
                  />
                </div>
                
                <div>
                  <Label htmlFor="type">Exam Type</Label>
                  <Select value={examData.type} onValueChange={(value) => setExamData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
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
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={examData.duration}
                    onChange={(e) => setExamData(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                    min="1"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={examData.description}
                  onChange={(e) => setExamData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this exam covers..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Questions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Questions ({questions.length})</CardTitle>
                <Button onClick={addQuestion} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {questions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No questions added yet. Click "Add Question" to start.</p>
              ) : (
                questions.map((question, index) => (
                  <div key={question.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium">Question {index + 1}</h3>
                      <Button
                        onClick={() => removeQuestion(question.id)}
                        size="sm"
                        variant="outline"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label>Question Text *</Label>
                        <Textarea
                          value={question.question}
                          onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                          placeholder="Enter your question..."
                          rows={2}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {question.options.map((option, optIndex) => (
                          <div key={optIndex}>
                            <Label>Option {String.fromCharCode(65 + optIndex)} *</Label>
                            <Input
                              value={option}
                              onChange={(e) => updateQuestionOption(question.id, optIndex, e.target.value)}
                              placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                            />
                          </div>
                        ))}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Correct Answer *</Label>
                          <Select
                            value={question.correctAnswer}
                            onValueChange={(value) => updateQuestion(question.id, 'correctAnswer', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select correct answer" />
                            </SelectTrigger>
                            <SelectContent>
                              {question.options.map((option, optIndex) => (
                                <SelectItem key={optIndex} value={option}>
                                  {String.fromCharCode(65 + optIndex)}: {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label>Marks</Label>
                          <Input
                            type="number"
                            value={question.marks}
                            onChange={(e) => updateQuestion(question.id, 'marks', parseInt(e.target.value) || 1)}
                            min="1"
                          />
                        </div>
                        
                        <div>
                          <Label>Difficulty</Label>
                          <Select
                            value={question.difficulty}
                            onValueChange={(value) => updateQuestion(question.id, 'difficulty', value)}
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
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              onClick={() => router.push('/dashboard')}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={saveExam}
              disabled={loading || questions.length === 0}
              className="flex-1 bg-[#00e4a0] hover:bg-[#00d494] text-black"
            >
              {loading ? 'Creating Exam...' : 'Create Exam'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}