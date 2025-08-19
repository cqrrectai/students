import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export interface EmailOptions {
  to: string | string[]
  subject?: string
  html?: string
  text?: string
  template_type?: string
  variables?: Record<string, any>
}

export interface EmailQueueOptions {
  email_type: string
  recipient_email: string
  user_data: Record<string, any>
}

class EmailService {
  private supabase = createClient(supabaseUrl, supabaseAnonKey)

  /**
   * Send email immediately using the send-email Edge Function
   */
  async sendEmail(options: EmailOptions): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options)
      })

      const result = await response.json()

      if (!response.ok) {
        return { success: false, error: result.error || 'Failed to send email' }
      }

      return { success: true, data: result.data }
    } catch (error: any) {
      console.error('Email service error:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Queue email for background processing
   */
  async queueEmail(options: EmailQueueOptions): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase
        .from('email_notifications')
        .insert([options])

      if (error) {
        console.error('Email queue error:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: any) {
      console.error('Email queue service error:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Send welcome email to new users
   */
  async sendWelcomeEmail(user: { name: string; email: string }): Promise<void> {
    await this.sendEmail({
      to: user.email,
      template_type: 'welcome',
      variables: {
        user_name: user.name,
        platform_url: process.env.NEXT_PUBLIC_SITE_URL || 'https://cqrrect.com',
        user_email: user.email
      }
    })
  }

  /**
   * Send exam result email
   */
  async sendExamResultEmail(user: { name: string; email: string }, examResult: {
    title: string
    score: number
    total_score: number
    percentage: number
    status: string
    time_taken: number
    exam_id: string
  }): Promise<void> {
    const statusColor = examResult.percentage >= 60 ? '#28a745' : '#dc3545'
    
    await this.sendEmail({
      to: user.email,
      template_type: 'exam_result',
      variables: {
        user_name: user.name,
        exam_title: examResult.title,
        score: examResult.score.toString(),
        total_score: examResult.total_score.toString(),
        percentage: examResult.percentage.toString(),
        status: examResult.status,
        status_color: statusColor,
        time_taken: examResult.time_taken.toString(),
        analytics_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://cqrrect.com'}/exam/${examResult.exam_id}/analytics`
      }
    })
  }

  /**
   * Send subscription activation email
   */
  async sendSubscriptionActivatedEmail(user: { name: string; email: string }, subscription: {
    plan: string
    student_limit: number
    exam_limit: number
    end_date: string
  }): Promise<void> {
    await this.sendEmail({
      to: user.email,
      template_type: 'subscription_activated',
      variables: {
        user_name: user.name,
        plan_name: subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1) + ' Plan',
        student_limit: subscription.student_limit === 9999 ? 'Unlimited' : subscription.student_limit.toString(),
        exam_limit: subscription.exam_limit === 9999 ? 'Unlimited' : subscription.exam_limit.toString(),
        end_date: new Date(subscription.end_date).toLocaleDateString(),
        dashboard_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://cqrrect.com'}/dashboard`
      }
    })
  }

  /**
   * Queue new user registration notification to admin
   */
  async queueNewUserNotification(user: { name: string; email: string; type?: string }): Promise<void> {
    await this.queueEmail({
      email_type: 'new_user_registration',
      recipient_email: 'admin@cqrrect.com', // Admin email
      user_data: {
        user_name: user.name,
        user_email: user.email,
        user_type: user.type || 'Student',
        registration_date: new Date().toLocaleDateString(),
        admin_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://cqrrect.com'}/admin`,
        admin_email: 'admin@cqrrect.com'
      }
    })
  }

  /**
   * Get email templates from database
   */
  async getEmailTemplates(): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('email_templates')
      .select('*')
      .eq('active', true)
      .order('template_type')

    if (error) {
      console.error('Failed to fetch email templates:', error)
      return []
    }

    return data || []
  }

  /**
   * Get email logs
   */
  async getEmailLogs(limit = 50): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('email_logs')
      .select('*')
      .order('sent_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Failed to fetch email logs:', error)
      return []
    }

    return data || []
  }

  /**
   * Get email queue status
   */
  async getEmailQueue(): Promise<{ pending: number; processing: number; sent: number; failed: number }> {
    const { data, error } = await this.supabase
      .from('email_notifications')
      .select('status')

    if (error) {
      console.error('Failed to fetch email queue:', error)
      return { pending: 0, processing: 0, sent: 0, failed: 0 }
    }

    const stats = { pending: 0, processing: 0, sent: 0, failed: 0 }
    data?.forEach(item => {
      if (item.status in stats) {
        stats[item.status as keyof typeof stats]++
      }
    })

    return stats
  }
}

// Export singleton instance
export const emailService = new EmailService()

// Export utility functions
export const sendWelcomeEmail = (user: { name: string; email: string }) => 
  emailService.sendWelcomeEmail(user)

export const sendExamResultEmail = (user: { name: string; email: string }, examResult: any) => 
  emailService.sendExamResultEmail(user, examResult)

export const sendSubscriptionActivatedEmail = (user: { name: string; email: string }, subscription: any) => 
  emailService.sendSubscriptionActivatedEmail(user, subscription)

export const queueNewUserNotification = (user: { name: string; email: string; type?: string }) => 
  emailService.queueNewUserNotification(user) 