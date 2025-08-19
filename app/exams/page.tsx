"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Clock, Search, Play, Star, BookOpen } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PublicLayout } from '@/components/public-layout'
import { dataService } from '@/lib/data-service'
import { realtimeManager } from '@/lib/realtime-manager'
import type { Database } from '@/lib/database.types'

type Exam = Database['public']['Tables']['exams']['Row']

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubject, setSelectedSubject] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const router = useRouter()

  const loadExams = async () => {
    try {
      console.log('Loading public exams...')
      
      const result = await dataService.get('/api/exams')
      
      if (result.success) {
        console.log('Loaded exams via API:', result.count)
        setExams(result.exams || [])
      } else {
        console.error('Failed to load exams:', result.error)
        setExams([])
      }
    } catch (error) {
      console.error('Error loading exams:', error)
      setExams([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadExams()

    // Subscribe to real-time updates using the centralized manager
    const cleanup = realtimeManager.subscribe('public-exams', {
      table: 'exams',
      callback: (payload) => {
        console.log('Public exams real-time update:', payload)
        loadExams()
      }
    })

    return cleanup
  }, [])

  // Filter exams based on search term and filters
  const filteredExams = exams.filter(exam => {
    const matchesSearch = !searchTerm || 
      exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.subject.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesSubject = selectedSubject === 'all' || exam.subject === selectedSubject
    const matchesType = selectedType === 'all' || exam.type === selectedType
    const matchesStatus = selectedStatus === 'all' || exam.status === selectedStatus
    
    return matchesSearch && matchesSubject && matchesType && matchesStatus
  })

  // Get difficulty color based on type
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'SSC': return 'bg-green-100 text-green-800'
      case 'HSC': return 'bg-blue-100 text-blue-800'
      case 'University': return 'bg-purple-100 text-purple-800'
      case 'Job Preparation': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }



  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00e4a0] mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading exams...</p>
            </div>
          </div>
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      <div className="min-h-screen bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Practice Exams</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Test your knowledge with AI-generated practice exams tailored to your level
            </p>
            

          </div>



          {/* Filters */}
          <div className="bg-white rounded-lg border shadow-sm p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search exams..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white"
                  />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="w-full sm:w-40 bg-white">
                    <SelectValue placeholder="Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {Array.from(new Set(exams.map(exam => exam.subject))).map((subject) => (
                      <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-full sm:w-40 bg-white">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {Array.from(new Set(exams.map(exam => exam.type))).map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full sm:w-40 bg-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

          </div>

          {/* Results count */}
          <div className="mb-6">
            <p className="text-gray-600">
              Showing {filteredExams.length} of {exams.length} exams
            </p>
          </div>

          {/* Exams Grid */}
          {filteredExams.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No exams found</h3>
              <p className="text-gray-600">
                {searchTerm || selectedSubject !== 'all' || selectedType !== 'all' || selectedStatus !== 'all'
                  ? 'Try adjusting your filters to see more results.'
                  : 'No exams are currently available.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExams.map((exam) => {
                return (
                  <Card key={exam.id} className="bg-white border shadow-sm hover:shadow-md transition-shadow duration-200 relative overflow-hidden">
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <Badge className={getTypeColor(exam.type)}>
                          {exam.type}
                        </Badge>
                        <Badge variant="outline" className="bg-white">
                          {exam.status}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl font-semibold text-gray-900 mb-2">
                        {exam.title}
                      </CardTitle>
                      <CardDescription className="text-gray-600">
                        {exam.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {exam.duration} minutes
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4" />
                            {exam.total_marks} marks
                          </div>
                        </div>
                        
                        <Button
                          className="w-full bg-[#00e4a0] hover:bg-[#00c88f] text-white"
                          onClick={() => router.push(`/exam/${exam.id}`)}
                        >
                          <Play className="mr-2 h-4 w-4" />
                          Start Exam
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  )
}
