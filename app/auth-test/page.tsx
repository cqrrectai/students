"use client"

import { useAuth } from '@/lib/auth-context'

export default function AuthTestPage() {
  const { user, session, isAdmin, adminUser, loading, signOut, signOutAdmin } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Authentication Test</h1>
        
        {/* User Auth Status */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">User Authentication</h2>
          <div className="space-y-2">
            <p><strong>Status:</strong> {user ? 'Signed In' : 'Not Signed In'}</p>
            <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
            <p><strong>User ID:</strong> {user?.id || 'N/A'}</p>
            <p><strong>Session:</strong> {session ? 'Active' : 'None'}</p>
          </div>
          {user && (
            <button
              onClick={signOut}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Sign Out
            </button>
          )}
        </div>

        {/* Admin Auth Status */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Admin Authentication</h2>
          <div className="space-y-2">
            <p><strong>Status:</strong> {isAdmin ? 'Admin Signed In' : 'Not Admin'}</p>
            <p><strong>Username:</strong> {adminUser?.username || 'N/A'}</p>
            <p><strong>Admin Email:</strong> {adminUser?.email || 'N/A'}</p>
            <p><strong>Full Name:</strong> {adminUser?.full_name || 'N/A'}</p>
          </div>
          {isAdmin && (
            <button
              onClick={signOutAdmin}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Sign Out Admin
            </button>
          )}
        </div>

        {/* Quick Links */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
          <div className="space-y-2">
            <div>
              <a href="/auth/sign-in" className="text-blue-600 hover:text-blue-800">
                User Sign In
              </a>
            </div>
            <div>
              <a href="/auth/sign-up" className="text-blue-600 hover:text-blue-800">
                User Sign Up
              </a>
            </div>
            <div>
              <a href="/admin/login" className="text-red-600 hover:text-red-800">
                Admin Login
              </a>
            </div>
            <div>
              <a href="/dashboard" className="text-green-600 hover:text-green-800">
                User Dashboard
              </a>
            </div>
            <div>
              <a href="/admin" className="text-purple-600 hover:text-purple-800">
                Admin Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}