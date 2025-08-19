"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from './supabase'
import type { Database } from './database.types'

// Type definitions
type Exam = Database['public']['Tables']['exams']['Row']
type ExamAttempt = Database['public']['Tables']['exam_attempts']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']

interface GlobalDataContextType {
  // Data
  exams: Exam[]
  examAttempts: ExamAttempt[]
  profiles: Profile[]
  
  // Loading states
  loading: boolean
  examsLoading: boolean
  attemptsLoading: boolean
  
  // Statistics
  stats: {
    totalExams: number
    totalAttempts: number
    totalUsers: number
    averageScore: number
  }
  
  // CRUD operations
  refreshData: () => Promise<void>
  
  // Filter helpers
  getExamsBySubject: (subject: string) => Exam[]
  getExamsByType: (type: string) => Exam[]
  getActiveExams: () => Exam[]
}

const GlobalDataContext = createContext<GlobalDataContextType | undefined>(undefined)

export const useGlobalData = () => {
  const context = useContext(GlobalDataContext)
  if (!context) {
    throw new Error('useGlobalData must be used within a GlobalDataProvider')
  }
  return context
}

interface GlobalDataProviderProps {
  children: ReactNode
}

export const GlobalDataProvider = ({ children }: GlobalDataProviderProps) => {
  // State
  const [exams, setExams] = useState<Exam[]>([])
  const [examAttempts, setExamAttempts] = useState<ExamAttempt[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false) // Start with false to prevent blocking
  const [examsLoading, setExamsLoading] = useState(false)
  const [attemptsLoading, setAttemptsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    let isMounted = true
    setMounted(true)
    
    const initializeData = async () => {
      try {
        if (supabase?.from && isMounted) {
          // Load basic data with timeout
          await Promise.race([
            loadExams(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Data load timeout')), 5000))
          ])
        }
      } catch (error) {
        console.warn('Data initialization error:', error)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    initializeData()

    return () => {
      isMounted = false
    }
  }, [])

  // Data loading functions
  const loadExams = async () => {
    if (!supabase?.from) return
    
    try {
      setExamsLoading(true)
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50) // Limit to prevent large loads
      
      if (error) {
        console.warn('Error loading exams:', error)
      } else {
        setExams(data || [])
      }
    } catch (error) {
      console.warn('Error loading exams:', error)
    } finally {
      setExamsLoading(false)
    }
  }

  const loadAttempts = async () => {
    if (!supabase?.from) return
    
    try {
      setAttemptsLoading(true)
      const { data, error } = await supabase
        .from('exam_attempts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100) // Limit to prevent large loads
      
      if (error) {
        console.warn('Error loading attempts:', error)
      } else {
        setExamAttempts(data || [])
      }
    } catch (error) {
      console.warn('Error loading attempts:', error)
    } finally {
      setAttemptsLoading(false)
    }
  }

  const loadProfiles = async () => {
    if (!supabase?.from) return
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50) // Limit to prevent large loads
      
      if (error) {
        console.warn('Error loading profiles:', error)
      } else {
        setProfiles(data || [])
      }
    } catch (error) {
      console.warn('Error loading profiles:', error)
    }
  }

  // CRUD operations
  const refreshData = async () => {
    await Promise.all([
      loadExams(),
      loadAttempts(),
      loadProfiles()
    ])
  }

  // Filter helpers
  const getExamsBySubject = (subject: string) => {
    return exams.filter(exam => exam.subject === subject)
  }

  const getExamsByType = (type: string) => {
    return exams.filter(exam => exam.type === type)
  }

  const getActiveExams = () => {
    return exams.filter(exam => exam.status === 'active')
  }

  // Calculate statistics
  const stats = {
    totalExams: exams.length,
    totalAttempts: examAttempts.length,
    totalUsers: new Set(examAttempts.map(a => a.user_id).filter(Boolean)).size,
    averageScore: examAttempts.length > 0 
      ? Math.round((examAttempts.reduce((sum, a) => sum + a.percentage, 0) / examAttempts.length) * 100) / 100
      : 0,
  }

  // Don't render until mounted to prevent hydration issues
  if (!mounted || typeof window === 'undefined') {
    return <>{children}</>
  }

  const value: GlobalDataContextType = {
    // Data
    exams,
    examAttempts,
    profiles,
    
    // Loading states
    loading,
    examsLoading,
    attemptsLoading,
    
    // Statistics
    stats,
    
    // CRUD operations
    refreshData,
    
    // Filter helpers
    getExamsBySubject,
    getExamsByType,
    getActiveExams,
  }

  return (
    <GlobalDataContext.Provider value={value}>
      {children}
    </GlobalDataContext.Provider>
  )
}

// Simplified hooks
export const useExams = (filters?: { subject?: string; type?: string; status?: string }) => {
  const { exams, examsLoading } = useGlobalData()
  
  const filteredExams = exams.filter(exam => {
    if (filters?.subject && exam.subject !== filters.subject) return false
    if (filters?.type && exam.type !== filters.type) return false
    if (filters?.status && exam.status !== filters.status) return false
    return true
  })
  
  return { exams: filteredExams, loading: examsLoading }
}