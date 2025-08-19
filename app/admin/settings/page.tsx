"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Settings, 
  Save, 
  RefreshCw, 
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Shield,
  Database,
  Users
} from "lucide-react"
import Link from "next/link"

interface AdminSettings {
  [key: string]: {
    value: any
    description?: string
    updated_at?: string
    updated_by?: string
  }
}

interface User {
  id: string
  email: string
  full_name: string | null
  role: string | null
  created_at: string
  updated_at: string
}

interface AdminUser {
  id: string
  username: string
  email: string | null
  full_name: string | null
  is_active: boolean | null
  created_at: string | null
  updated_at: string | null
}

function UserManagementSection() {
  const [users, setUsers] = useState<User[]>([])
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'regular' | 'admin'>('regular')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    loadUsers()
  }, [activeTab])

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)

      const endpoint = activeTab === 'regular' ? '/api/admin/users' : '/api/admin/users/admin'
      const response = await fetch(endpoint)
      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to load users')
      }

      if (activeTab === 'regular') {
        setUsers(result.data || [])
      } else {
        setAdminUsers(result.data || [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      const endpoint = activeTab === 'regular' ? `/api/admin/users/${userId}` : `/api/admin/users/admin/${userId}`
      const response = await fetch(endpoint, { method: 'DELETE' })
      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to delete user')
      }

      setSuccess('User deleted successfully!')
      await loadUsers()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>Manage regular users and admin users</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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

        {/* User Type Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('regular')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'regular'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Regular Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'admin'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Admin Users ({adminUsers.length})
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00e4a0]"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {activeTab === 'regular' ? (
              users.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No regular users found
                </div>
              ) : (
                users.map((user) => (
                  <Card key={user.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-[#00e4a0] rounded-full flex items-center justify-center text-white font-medium">
                          {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-medium">{user.full_name || 'No name'}</h4>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <p className="text-xs text-gray-500">
                            Role: {user.role || 'student'} • Created: {new Date(user.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </div>
                  </Card>
                ))
              )
            ) : (
              adminUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No admin users found
                </div>
              ) : (
                adminUsers.map((adminUser) => (
                  <Card key={adminUser.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-white font-medium">
                          {adminUser.full_name ? adminUser.full_name.charAt(0).toUpperCase() : adminUser.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-medium">{adminUser.full_name || adminUser.username}</h4>
                          <p className="text-sm text-gray-600">{adminUser.email || 'No email'}</p>
                          <p className="text-xs text-gray-500">
                            Username: {adminUser.username} • 
                            Status: {adminUser.is_active ? 'Active' : 'Inactive'} • 
                            Created: {adminUser.created_at ? new Date(adminUser.created_at).toLocaleDateString() : 'Unknown'}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteUser(adminUser.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </div>
                  </Card>
                ))
              )
            )}
          </div>
        )}

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-2">🔧 API Endpoints Available</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• GET /api/admin/users - List regular users</p>
            <p>• POST /api/admin/users - Create regular user</p>
            <p>• PUT /api/admin/users/[id] - Update regular user</p>
            <p>• DELETE /api/admin/users/[id] - Delete regular user</p>
            <p>• GET /api/admin/users/admin - List admin users</p>
            <p>• POST /api/admin/users/admin - Create admin user</p>
            <p>• PUT /api/admin/users/admin/[id] - Update admin user</p>
            <p>• DELETE /api/admin/users/admin/[id] - Delete admin user</p>
          </div>
        </div>

        <div className="flex space-x-4">
          <Button 
            onClick={() => window.open('/api/admin/users', '_blank')}
          >
            Test Regular Users API
          </Button>
          <Button 
            onClick={() => window.open('/api/admin/users/admin', '_blank')}
            variant="outline"
          >
            Test Admin Users API
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AdminSettings>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Form state for different setting categories
  const [generalSettings, setGeneralSettings] = useState({
    site_name: '',
    site_description: '',
    contact_email: '',
    support_email: '',
    maintenance_mode: false
  })

  const [examSettings, setExamSettings] = useState({
    default_exam_duration: 60,
    max_attempts_per_exam: 3,
    passing_score_percentage: 60,
    enable_proctoring: true,
    allow_question_review: true,
    randomize_questions: false,
    randomize_options: false
  })

  const [securitySettings, setSecuritySettings] = useState({
    enable_two_factor: false,
    session_timeout: 30,
    max_login_attempts: 5,
    password_min_length: 8,
    require_password_complexity: true
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/settings')
      const result = await response.json()

      if (!response.ok || !result.success) {
        setError('Failed to load settings')
        return
      }

      const settingsData = result.data || {}
      setSettings(settingsData)

      // Populate form states
      setGeneralSettings({
        site_name: settingsData.site_name?.value || 'Cqrrect AI',
        site_description: settingsData.site_description?.value || 'Bangladesh\'s leading AI-powered exam platform',
        contact_email: settingsData.contact_email?.value || '',
        support_email: settingsData.support_email?.value || '',
        maintenance_mode: settingsData.maintenance_mode?.value || false
      })

      setExamSettings({
        default_exam_duration: settingsData.default_exam_duration?.value || 60,
        max_attempts_per_exam: settingsData.max_attempts_per_exam?.value || 3,
        passing_score_percentage: settingsData.passing_score_percentage?.value || 60,
        enable_proctoring: settingsData.enable_proctoring?.value || true,
        allow_question_review: settingsData.allow_question_review?.value || true,
        randomize_questions: settingsData.randomize_questions?.value || false,
        randomize_options: settingsData.randomize_options?.value || false
      })

      setSecuritySettings({
        enable_two_factor: settingsData.enable_two_factor?.value || false,
        session_timeout: settingsData.session_timeout?.value || 30,
        max_login_attempts: settingsData.max_login_attempts?.value || 5,
        password_min_length: settingsData.password_min_length?.value || 8,
        require_password_complexity: settingsData.require_password_complexity?.value || true
      })

    } catch (err) {
      setError('Failed to load settings')
      console.error('Settings loading error:', err)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async (category: 'general' | 'exam' | 'security') => {
    setSaving(true)
    setError(null)

    try {
      let settingsToSave: Record<string, any> = {}

      switch (category) {
        case 'general':
          settingsToSave = {
            site_name: { value: generalSettings.site_name, description: 'Site name displayed in header' },
            site_description: { value: generalSettings.site_description, description: 'Site description for SEO' },
            contact_email: { value: generalSettings.contact_email, description: 'Contact email for inquiries' },
            support_email: { value: generalSettings.support_email, description: 'Support email for technical issues' },
            maintenance_mode: { value: generalSettings.maintenance_mode, description: 'Enable maintenance mode' }
          }
          break
        case 'exam':
          settingsToSave = {
            default_exam_duration: { value: examSettings.default_exam_duration, description: 'Default exam duration in minutes' },
            max_attempts_per_exam: { value: examSettings.max_attempts_per_exam, description: 'Maximum attempts allowed per exam' },
            passing_score_percentage: { value: examSettings.passing_score_percentage, description: 'Minimum percentage to pass' },
            enable_proctoring: { value: examSettings.enable_proctoring, description: 'Enable exam proctoring by default' },
            allow_question_review: { value: examSettings.allow_question_review, description: 'Allow students to review questions' },
            randomize_questions: { value: examSettings.randomize_questions, description: 'Randomize question order' },
            randomize_options: { value: examSettings.randomize_options, description: 'Randomize option order' }
          }
          break
        case 'security':
          settingsToSave = {
            enable_two_factor: { value: securitySettings.enable_two_factor, description: 'Enable two-factor authentication' },
            session_timeout: { value: securitySettings.session_timeout, description: 'Session timeout in minutes' },
            max_login_attempts: { value: securitySettings.max_login_attempts, description: 'Maximum login attempts before lockout' },
            password_min_length: { value: securitySettings.password_min_length, description: 'Minimum password length' },
            require_password_complexity: { value: securitySettings.require_password_complexity, description: 'Require complex passwords' }
          }
          break
      }

      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: settingsToSave,
          updated_by: 'admin' // In a real app, get this from auth context
        })
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to save settings')
      }

      setSuccess(`${category.charAt(0).toUpperCase() + category.slice(1)} settings saved successfully!`)
      await loadSettings() // Reload to get updated timestamps
      
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings')
      console.error('Settings save error:', err)
    } finally {
      setSaving(false)
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
            <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
            <p className="text-gray-600 mt-1">Configure system-wide settings and preferences</p>
          </div>
        </div>
        <Button variant="outline" onClick={loadSettings}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
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

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general" className="gap-2">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="exam" className="gap-2">
            <Database className="h-4 w-4" />
            Exam
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Basic site configuration and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="site_name">Site Name</Label>
                  <Input
                    id="site_name"
                    value={generalSettings.site_name}
                    onChange={(e) => setGeneralSettings({...generalSettings, site_name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_email">Contact Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={generalSettings.contact_email}
                    onChange={(e) => setGeneralSettings({...generalSettings, contact_email: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="site_description">Site Description</Label>
                <Textarea
                  id="site_description"
                  value={generalSettings.site_description}
                  onChange={(e) => setGeneralSettings({...generalSettings, site_description: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="support_email">Support Email</Label>
                  <Input
                    id="support_email"
                    type="email"
                    value={generalSettings.support_email}
                    onChange={(e) => setGeneralSettings({...generalSettings, support_email: e.target.value})}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="maintenance_mode"
                    checked={generalSettings.maintenance_mode}
                    onCheckedChange={(checked) => setGeneralSettings({...generalSettings, maintenance_mode: checked})}
                  />
                  <Label htmlFor="maintenance_mode">Maintenance Mode</Label>
                </div>
              </div>

              <Button onClick={() => saveSettings('general')} disabled={saving}>
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save General Settings
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Exam Settings */}
        <TabsContent value="exam">
          <Card>
            <CardHeader>
              <CardTitle>Exam Settings</CardTitle>
              <CardDescription>Default exam configuration and behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="default_exam_duration">Default Duration (minutes)</Label>
                  <Input
                    id="default_exam_duration"
                    type="number"
                    min="1"
                    value={examSettings.default_exam_duration}
                    onChange={(e) => setExamSettings({...examSettings, default_exam_duration: parseInt(e.target.value) || 60})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_attempts_per_exam">Max Attempts</Label>
                  <Input
                    id="max_attempts_per_exam"
                    type="number"
                    min="1"
                    value={examSettings.max_attempts_per_exam}
                    onChange={(e) => setExamSettings({...examSettings, max_attempts_per_exam: parseInt(e.target.value) || 3})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passing_score_percentage">Passing Score (%)</Label>
                  <Input
                    id="passing_score_percentage"
                    type="number"
                    min="0"
                    max="100"
                    value={examSettings.passing_score_percentage}
                    onChange={(e) => setExamSettings({...examSettings, passing_score_percentage: parseInt(e.target.value) || 60})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enable_proctoring"
                    checked={examSettings.enable_proctoring}
                    onCheckedChange={(checked) => setExamSettings({...examSettings, enable_proctoring: checked})}
                  />
                  <Label htmlFor="enable_proctoring">Enable Proctoring by Default</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="allow_question_review"
                    checked={examSettings.allow_question_review}
                    onCheckedChange={(checked) => setExamSettings({...examSettings, allow_question_review: checked})}
                  />
                  <Label htmlFor="allow_question_review">Allow Question Review</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="randomize_questions"
                    checked={examSettings.randomize_questions}
                    onCheckedChange={(checked) => setExamSettings({...examSettings, randomize_questions: checked})}
                  />
                  <Label htmlFor="randomize_questions">Randomize Questions</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="randomize_options"
                    checked={examSettings.randomize_options}
                    onCheckedChange={(checked) => setExamSettings({...examSettings, randomize_options: checked})}
                  />
                  <Label htmlFor="randomize_options">Randomize Options</Label>
                </div>
              </div>

              <Button onClick={() => saveSettings('exam')} disabled={saving}>
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Exam Settings
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Authentication and security configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="session_timeout">Session Timeout (minutes)</Label>
                  <Input
                    id="session_timeout"
                    type="number"
                    min="5"
                    value={securitySettings.session_timeout}
                    onChange={(e) => setSecuritySettings({...securitySettings, session_timeout: parseInt(e.target.value) || 30})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_login_attempts">Max Login Attempts</Label>
                  <Input
                    id="max_login_attempts"
                    type="number"
                    min="1"
                    value={securitySettings.max_login_attempts}
                    onChange={(e) => setSecuritySettings({...securitySettings, max_login_attempts: parseInt(e.target.value) || 5})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password_min_length">Min Password Length</Label>
                  <Input
                    id="password_min_length"
                    type="number"
                    min="6"
                    value={securitySettings.password_min_length}
                    onChange={(e) => setSecuritySettings({...securitySettings, password_min_length: parseInt(e.target.value) || 8})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enable_two_factor"
                    checked={securitySettings.enable_two_factor}
                    onCheckedChange={(checked) => setSecuritySettings({...securitySettings, enable_two_factor: checked})}
                  />
                  <Label htmlFor="enable_two_factor">Enable Two-Factor Authentication</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="require_password_complexity"
                    checked={securitySettings.require_password_complexity}
                    onCheckedChange={(checked) => setSecuritySettings({...securitySettings, require_password_complexity: checked})}
                  />
                  <Label htmlFor="require_password_complexity">Require Complex Passwords</Label>
                </div>
              </div>

              <Button onClick={() => saveSettings('security')} disabled={saving}>
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Security Settings
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Settings */}
        <TabsContent value="users">
          <UserManagementSection />
        </TabsContent>
      </Tabs>
    </div>
  )
}