import { supabase } from './supabase'
import type { Database } from './database.types'

// Type aliases for easier use
type Exam = Database['public']['Tables']['exams']['Row']
type ExamInsert = Database['public']['Tables']['exams']['Insert']
type Question = Database['public']['Tables']['questions']['Row']
type QuestionInsert = Database['public']['Tables']['questions']['Insert']
type ExamAttempt = Database['public']['Tables']['exam_attempts']['Row']
type ExamAttemptInsert = Database['public']['Tables']['exam_attempts']['Insert']
type ExamAnalytics = Database['public']['Tables']['exam_analytics']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']
type AdminSetting = Database['public']['Tables']['admin_settings']['Row']

export interface DashboardStats {
  totalExams: number
  totalAttempts: number
  totalUsers: number
  activeExams: number
  recentExams: Exam[]
  topPerformers: Array<{
    name: string
    score: number
    exam: string
  }>
  examsBySubject: Array<{
    subject: string
    count: number
  }>
  attemptsByDate: Array<{
    date: string
    attempts: number
  }>
}

export class DatabaseService {
  private subscribers: Map<string, Function[]> = new Map()

  // Subscription methods for real-time updates
  subscribe(table: string, callback: Function) {
    if (!this.subscribers.has(table)) {
      this.subscribers.set(table, [])
    }
    this.subscribers.get(table)?.push(callback)

    // Set up real-time subscription with better error handling
    const channel = supabase
      .channel(`db-service-${table}-${Date.now()}`) // Unique channel name
      .on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => {
        console.log(`Database service real-time update for ${table}:`, payload)
        this.notify(table, payload.new || payload.old, payload.eventType)
      })
      .subscribe((status) => {
        console.log(`Database service subscription status for ${table}:`, status)
      })

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(table)
      if (callbacks) {
        const index = callbacks.indexOf(callback)
        if (index > -1) {
          callbacks.splice(index, 1)
        }
      }
      supabase.removeChannel(channel)
    }
  }

  private notify(table: string, data: any, eventType = 'update') {
    const callbacks = this.subscribers.get(table) || []
    callbacks.forEach(callback => {
      try {
        callback(data, eventType)
      } catch (error) {
        console.error('Error in subscription callback:', error)
      }
    })
  }

  // Exam operations
  async getExams(filters?: { type?: string; subject?: string; status?: string }) {
    try {
      let query = supabase
        .from('exams')
        .select('*')
        .order('created_at', { ascending: false })

      if (filters?.type) {
        query = query.eq('type', filters.type)
      }
      if (filters?.subject) {
        query = query.eq('subject', filters.subject)
      }
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      const { data, error } = await query
      return { data: data || [], error }
    } catch (error) {
      return { data: [], error }
    }
  }

  async getExamById(id: string) {
    try {
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .eq('id', id)
        .single()
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }

  async createExam(examData: ExamInsert) {
    try {
      // Ensure required fields are present
      const examInsert = {
        title: examData.title,
        description: examData.description || null,
        type: examData.type,
        subject: examData.subject,
        duration: examData.duration,
        total_marks: examData.total_marks,
        instructions: examData.instructions || null,
        status: examData.status || 'draft',
        security: examData.security || {},
        created_by: examData.created_by || null,
        exam_type: examData.exam_type || 'admin'
      }

      const { data, error } = await supabase
        .from('exams')
        .insert(examInsert)
        .select()
        .single()
      
      if (!error) {
        this.notify('exams', data, 'insert')
      }
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }

  async updateExam(id: string, updates: Partial<Exam>) {
    try {
      const { data, error } = await supabase
        .from('exams')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (!error) {
        this.notify('exams', data, 'update')
      }
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }

  async deleteExam(id: string) {
    try {
      const { error } = await supabase
        .from('exams')
        .delete()
        .eq('id', id)
      
      if (!error) {
        this.notify('exams', { id }, 'delete')
      }
      return { error }
    } catch (error) {
      return { error }
    }
  }

  // Question operations
  async getQuestions(filters?: { examId?: string; difficulty?: string }) {
    try {
      let query = supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false })

      if (filters?.examId) {
        query = query.eq('exam_id', filters.examId)
      }

      if (filters?.difficulty) {
        query = query.eq('difficulty', filters.difficulty)
      }

      const { data, error } = await query
      return { data: data || [], error }
    } catch (error) {
      return { data: [], error }
    }
  }

  async getQuestionsByExamId(examId: string) {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('exam_id', examId)
        .order('order_index', { ascending: true })
      return { data: data || [], error }
    } catch (error) {
      return { data: [], error }
    }
  }

  async createQuestion(questionData: QuestionInsert) {
    try {
      // Ensure required fields are present
      const questionInsert = {
        exam_id: questionData.exam_id || null,
        question: questionData.question,
        options: questionData.options,
        correct_answer: questionData.correct_answer,
        marks: questionData.marks || 1,
        difficulty: questionData.difficulty || 'medium',
        explanation: questionData.explanation || null,
        tags: questionData.tags || null,
        order_index: questionData.order_index || null
      }

      const { data, error } = await supabase
        .from('questions')
        .insert(questionInsert)
        .select()
        .single()
      
      if (!error) {
        this.notify('questions', data, 'insert')
      }
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }

  async updateQuestion(id: string, updates: Partial<Question>) {
    try {
      const { data, error } = await supabase
        .from('questions')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (!error) {
        this.notify('questions', data, 'update')
      }
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }

  async deleteQuestion(id: string) {
    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', id)
      
      if (!error) {
        this.notify('questions', { id }, 'delete')
      }
      return { error }
    } catch (error) {
      return { error }
    }
  }

  // Exam attempt operations
  async getExamAttempts(filters?: { examId?: string; userId?: string }) {
    try {
      let query = supabase
        .from('exam_attempts')
        .select(`
          *,
          exam:exams(title, type, subject),
          user:profiles(full_name, email)
        `)
        .order('created_at', { ascending: false })

      if (filters?.examId) {
        query = query.eq('exam_id', filters.examId)
      }
      if (filters?.userId) {
        query = query.eq('user_id', filters.userId)
      }

      const { data, error } = await query
      return { data: data || [], error }
    } catch (error) {
      return { data: [], error }
    }
  }

  async createExamAttempt(attemptData: ExamAttemptInsert) {
    try {
      // Ensure required fields are present
      const attemptInsert = {
        exam_id: attemptData.exam_id,
        user_id: attemptData.user_id,
        score: attemptData.score,
        total_marks: attemptData.total_marks,
        percentage: attemptData.percentage,
        time_taken: attemptData.time_taken || null,
        answers: attemptData.answers,
        proctoring_data: attemptData.proctoring_data || null,
        started_at: attemptData.started_at,
        completed_at: attemptData.completed_at || null
      }

      const { data, error } = await supabase
        .from('exam_attempts')
        .insert(attemptInsert)
        .select()
        .single()
      
      if (!error) {
        this.notify('exam_attempts', data, 'insert')
      }
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }

  async updateExamAttempt(id: string, updates: Partial<ExamAttempt>) {
    try {
      const { data, error } = await supabase
        .from('exam_attempts')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (!error) {
        this.notify('exam_attempts', data, 'update')
      }
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Analytics operations
  async getDashboardAnalytics(): Promise<{ data: DashboardStats | null; error: any }> {
    try {
      // Get total counts
      const [examsResult, attemptsResult, usersResult] = await Promise.all([
        supabase.from('exams').select('*', { count: 'exact' }),
        supabase.from('exam_attempts').select('*', { count: 'exact' }),
        supabase.from('profiles').select('*', { count: 'exact' })
      ])

      const totalExams = examsResult.count || 0
      const totalAttempts = attemptsResult.count || 0
      const totalUsers = usersResult.count || 0

      // Get active exams
      const { data: activeExamsData } = await supabase
        .from('exams')
        .select('*', { count: 'exact' })
        .eq('status', 'active')

      const activeExams = activeExamsData?.length || 0

      // Get recent exams
      const { data: recentExams } = await supabase
        .from('exams')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      // Get exams by subject
      const { data: examsBySubjectData } = await supabase
        .from('exams')
        .select('subject')

      const examsBySubject = examsBySubjectData?.reduce((acc: any[], exam) => {
        const existing = acc.find(item => item.subject === exam.subject)
        if (existing) {
          existing.count++
        } else {
          acc.push({ subject: exam.subject, count: 1 })
        }
        return acc
      }, []) || []

      // Get top performers (simplified)
      const { data: topPerformersData } = await supabase
        .from('exam_attempts')
        .select(`
          score,
          percentage,
          exam:exams(title),
          user:profiles(full_name)
        `)
        .order('percentage', { ascending: false })
        .limit(5)

      const topPerformers = topPerformersData?.map(attempt => ({
        name: attempt.user?.full_name || 'Unknown',
        score: attempt.percentage,
        exam: attempt.exam?.title || 'Unknown'
      })) || []

      // Get attempts by date (last 7 days)
      const { data: attemptsByDateData } = await supabase
        .from('exam_attempts')
        .select('created_at')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

      const attemptsByDate = attemptsByDateData?.reduce((acc: any[], attempt) => {
        const date = attempt.created_at ? new Date(attempt.created_at).toISOString().split('T')[0] : 'unknown'
        const existing = acc.find(item => item.date === date)
        if (existing) {
          existing.attempts++
        } else {
          acc.push({ date, attempts: 1 })
        }
        return acc
      }, []) || []

      const stats: DashboardStats = {
        totalExams,
        totalAttempts,
        totalUsers,
        activeExams,
        recentExams: recentExams || [],
        topPerformers,
        examsBySubject,
        attemptsByDate
      }

      return { data: stats, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Admin settings operations
  async getAdminSettings() {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
      
      // Convert to key-value object
      const settings: Record<string, any> = {}
      data?.forEach(setting => {
        settings[setting.key] = setting.value
      })
      
      return { data: settings, error }
    } catch (error) {
      return { data: {}, error }
    }
  }

  async updateAdminSetting(key: string, value: any, updatedBy?: string) {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .upsert({
          key,
          value,
          updated_by: updatedBy,
          updated_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (!error) {
        this.notify('admin_settings', data, 'upsert')
      }
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }
}

// Export singleton instance
export const databaseService = new DatabaseService() 