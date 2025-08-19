"use client"

import { supabase } from './supabase'

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

class DataService {
  // Generic GET method
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(endpoint)
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}`)
      }
      
      return result
    } catch (error) {
      console.error(`GET ${endpoint} error:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      }
    }
  }

  // Generic POST method
  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}`)
      }
      
      return result
    } catch (error) {
      console.error(`POST ${endpoint} error:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      }
    }
  }

  // Generic PUT method
  async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}`)
      }
      
      return result
    } catch (error) {
      console.error(`PUT ${endpoint} error:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      }
    }
  }

  // Generic DELETE method
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(endpoint, {
        method: 'DELETE'
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}`)
      }
      
      return result
    } catch (error) {
      console.error(`DELETE ${endpoint} error:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      }
    }
  }

  // Exam-specific methods
  async getExams(filters?: { type?: string; subject?: string; status?: string }) {
    const params = new URLSearchParams()
    if (filters?.type) params.append('type', filters.type)
    if (filters?.subject) params.append('subject', filters.subject)
    if (filters?.status) params.append('status', filters.status)
    
    const query = params.toString() ? `?${params.toString()}` : ''
    return this.get(`/api/admin/exams${query}`)
  }

  async getExam(id: string) {
    return this.get(`/api/admin/exams/${id}`)
  }

  async createExam(examData: any) {
    return this.post('/api/admin/exams', examData)
  }

  async updateExam(id: string, examData: any) {
    return this.put(`/api/admin/exams/${id}`, examData)
  }

  async deleteExam(id: string) {
    return this.delete(`/api/admin/exams/${id}`)
  }

  // User-specific methods
  async getUsers() {
    return this.get('/api/admin/users')
  }

  async getUser(id: string) {
    return this.get(`/api/admin/users/${id}`)
  }

  async createUser(userData: any) {
    return this.post('/api/admin/users', userData)
  }

  async updateUser(id: string, userData: any) {
    return this.put(`/api/admin/users/${id}`, userData)
  }

  async deleteUser(id: string) {
    return this.delete(`/api/admin/users/${id}`)
  }

  // Student exam methods
  async getStudentExams(userId: string) {
    return this.get(`/api/student-exams?userId=${userId}`)
  }

  async createStudentExam(examData: any) {
    return this.post('/api/student-exams', examData)
  }

  async updateStudentExam(examData: any) {
    return this.put('/api/student-exams', examData)
  }

  async deleteStudentExam(id: string, userId: string) {
    return this.delete(`/api/student-exams?id=${id}&userId=${userId}`)
  }

  // Dashboard data
  async getDashboardData(userId?: string) {
    const query = userId ? `?userId=${userId}` : ''
    return this.get(`/api/dashboard${query}`)
  }

  // Direct Supabase queries with error handling
  async querySupabase<T>(
    table: string,
    options: {
      select?: string
      filters?: Record<string, any>
      orderBy?: { column: string; ascending?: boolean }
      limit?: number
    } = {}
  ): Promise<ApiResponse<T[]>> {
    try {
      let query = supabase.from(table).select(options.select || '*')

      // Apply filters
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value)
          }
        })
      }

      // Apply ordering
      if (options.orderBy) {
        query = query.order(options.orderBy.column, { 
          ascending: options.orderBy.ascending ?? false 
        })
      }

      // Apply limit
      if (options.limit) {
        query = query.limit(options.limit)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      return {
        success: true,
        data: data as T[]
      }
    } catch (error) {
      console.error(`Supabase query error for ${table}:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Database error'
      }
    }
  }

  // Batch operations
  async batchDelete(table: string, ids: string[]): Promise<ApiResponse> {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .in('id', ids)

      if (error) {
        throw error
      }

      return {
        success: true,
        message: `Deleted ${ids.length} records from ${table}`
      }
    } catch (error) {
      console.error(`Batch delete error for ${table}:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Batch delete failed'
      }
    }
  }

  // Health check
  async healthCheck(): Promise<ApiResponse> {
    return this.get('/api/system-health')
  }

  // Analytics functions
  async getAnalytics(timeRange: string = '30d'): Promise<ApiResponse<any>> {
    return this.get(`/api/admin/analytics?timeRange=${timeRange}`)
  }

  async getStats(): Promise<ApiResponse<any>> {
    return this.get('/api/admin/stats')
  }

  async getDashboardStats(): Promise<ApiResponse<any>> {
    return this.get('/api/admin/dashboard-stats')
  }

  async getExamAnalytics(examId: string): Promise<ApiResponse<any>> {
    return this.get(`/api/admin/exams/${examId}/analytics`)
  }

  async getUserAnalytics(userId: string): Promise<ApiResponse<any>> {
    return this.get(`/api/admin/users/${userId}/analytics`)
  }

  async getSystemMetrics(): Promise<ApiResponse<any>> {
    return this.get('/api/admin/system-metrics')
  }
}

// Singleton instance
export const dataService = new DataService()

// Export for direct usage
export default dataService