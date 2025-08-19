"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Users,
  Clock,
  BookOpen,
  BarChart3,
  Eye,
  Copy
} from 'lucide-react'
import Link from 'next/link'
import { dataService } from '@/lib/data-service'
import { realtimeManager } from '@/lib/realtime-manager'
import type { Database } from '@/lib/database.types'

type Exam = Database['public']['Tables']['exams']['Row'] & {
  question_count?: number
  attempt_count?: number
}
type ExamAttempt = Database['public']['Tables']['exam_attempts']['Row']

export default function AdminExamsPage() {
  const [exams, setExams] = useState<Exam[]>([])
  const [examAttempts, setExamAttempts] = useState<ExamAttempt[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedSubject, setSelectedSubject] = useState<string>('all')
  const [deletingExamId, setDeletingExamId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('Loading admin exams data...')
      
      // Use the new data service
      const [examsResult, attemptsResult] = await Promise.all([
        dataService.getExams(),
        dataService.get('/api/admin/exam-attempts')
      ])
      
      if (!examsResult.success) {
        throw new Error(examsResult.error || 'Failed to load exams')
      }
      
      if (!attemptsResult.success) {
        console.warn('Failed to load attempts:', attemptsResult.error)
        setExamAttempts([])
      } else {
        setExamAttempts(attemptsResult.data || [])
      }
      
      setExams(examsResult.data || [])
      console.log('Loaded exams:', examsResult.data?.length || 0)
      
    } catch (error) {
      console.error('Error loading data:', error)
      setError(error instanceof Error ? error.message : 'Failed to load data')
      setExams([])
      setExamAttempts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()

    // Subscribe to real-time updates using the centralized manager
    const cleanupExams = realtimeManager.subscribe('admin-exams', {
      table: 'exams',
      callback: (payload) => {
        console.log('Admin exams real-time update:', payload)
        loadData()
      }
    })

    const cleanupAttempts = realtimeManager.subscribe('admin-attempts', {
      table: 'exam_attempts',
      callback: (payload) => {
        console.log('Admin attempts real-time update:', payload)
        loadData()
      }
    })

    return () => {
      cleanupExams()
      cleanupAttempts()
    }
  }, [])

  // Filter exams based on search and filters
  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.subject.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = selectedStatus === 'all' || exam.status === selectedStatus
    const matchesType = selectedType === 'all' || exam.type === selectedType
    const matchesSubject = selectedSubject === 'all' || exam.subject === selectedSubject
    
    return matchesSearch && matchesStatus && matchesType && matchesSubject
  })

  // Get unique values for filters
  const statuses = Array.from(new Set(exams.map(exam => exam.status).filter(Boolean)))
  const types = Array.from(new Set(exams.map(exam => exam.type)))
  const subjects = Array.from(new Set(exams.map(exam => exam.subject)))

  // Get exam statistics
  const getExamStats = (examId: string) => {
    const attempts = examAttempts.filter(attempt => attempt.exam_id === examId)
    const completed = attempts.filter(attempt => attempt.completed_at)
    const averageScore = completed.length > 0 
      ? completed.reduce((sum, attempt) => sum + attempt.percentage, 0) / completed.length 
      : 0
    
    return {
      totalAttempts: attempts.length,
      completedAttempts: completed.length,
      averageScore: Math.round(averageScore)
    }
  }

  // Delete exam function using data service
  const handleDeleteExam = async (examId: string, examTitle: string) => {
    const stats = getExamStats(examId)
    
    const confirmMessage = `Are you sure you want to delete "${examTitle}"?\n\n` +
      `This will permanently delete:\n` +
      `• The exam and all its questions\n` +
      `• ${stats.totalAttempts} exam attempts\n` +
      `• All associated data\n\n` +
      `This action cannot be undone.`
    
    if (!confirm(confirmMessage)) {
      return
    }

    setDeletingExamId(examId)
    setError(null)

    try {
      console.log('Deleting exam:', examId, examTitle)
      
      const result = await dataService.deleteExam(examId)
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete exam')
      }
      
      console.log('Exam deleted successfully:', result.message)
      
      // Remove the exam from the local state for immediate UI update
      setExams(prevExams => prevExams.filter(exam => exam.id !== examId))
      setExamAttempts(prevAttempts => prevAttempts.filter(attempt => attempt.exam_id !== examId))
      
      // Show success message
      alert(`✅ Exam "${examTitle}" deleted successfully!`)
      
    } catch (error) {
      console.error('Error deleting exam:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete exam'
      setError(errorMessage)
      alert(`❌ ${errorMessage}`)
    } finally {
      setDeletingExamId(null)
    }
  }



  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'archived': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00e4a0]"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <svg className="h-16 w-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Exams</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadData} className="bg-[#00e4a0] hover:bg-[#00d494] text-black">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Exam Management</h1>
          <p className="text-gray-600 mt-1">Manage and monitor all exams</p>
        </div>
        <div className="flex gap-3">

          <Button asChild className="bg-[#00e4a0] hover:bg-[#00d494] text-black">
            <Link href="/admin/create-exam">
              <Plus className="h-4 w-4 mr-2" />
              Create Exam
            </Link>
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Exams</p>
                <p className="text-3xl font-bold text-gray-900">{exams.length}</p>
              </div>
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Exams</p>
                <p className="text-3xl font-bold text-gray-900">
                  {exams.filter(exam => exam.status === 'active').length}
                </p>
              </div>
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Attempts</p>
                <p className="text-3xl font-bold text-gray-900">{examAttempts.length}</p>
              </div>
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Score</p>
                <p className="text-3xl font-bold text-gray-900">
                  {examAttempts.length > 0 
                    ? Math.round(examAttempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / examAttempts.length)
                    : 0}%
                </p>
              </div>
              <BarChart3 className="h-6 w-6 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search exams..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {statuses.map(status => (
                    <SelectItem key={status} value={status!}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {types.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map(subject => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          Showing {filteredExams.length} of {exams.length} exams
        </p>
      </div>

      {/* Exams Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Exam Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type & Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration & Marks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attempts
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredExams.map((exam) => {
                  const stats = getExamStats(exam.id)
                  
                  return (
                    <tr key={exam.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {exam.title}
                          </div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {exam.description}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <Badge variant="outline" className="text-xs">
                            {exam.type}
                          </Badge>
                          <div className="text-sm text-gray-500">
                            {exam.subject}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="h-4 w-4 mr-1" />
                            {exam.duration}m
                          </div>
                          <div className="text-sm text-gray-500">
                            {exam.total_marks} marks
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-900">
                            {stats.totalAttempts} attempts
                          </div>
                          <div className="text-sm text-gray-500">
                            Avg: {stats.averageScore}%
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={getStatusColor(exam.status)}>
                          {exam.status || 'draft'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/exam/${exam.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                Preview
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/exams/${exam.id}/edit`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/exam/${exam.id}/analytics`}>
                                <BarChart3 className="h-4 w-4 mr-2" />
                                Analytics
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDeleteExam(exam.id, exam.title)}
                              disabled={deletingExamId === exam.id}
                            >
                              {deletingExamId === exam.id ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                                  Deleting...
                                </>
                              ) : (
                                <>
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          
          {filteredExams.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No exams found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedStatus !== 'all' || selectedType !== 'all' || selectedSubject !== 'all'
                  ? 'Try adjusting your filters to see more results.'
                  : 'Get started by creating your first exam.'}
              </p>
              <Button asChild className="bg-[#00e4a0] hover:bg-[#00d494] text-black">
                <Link href="/admin/create-exam">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Exam
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
