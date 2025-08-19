"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

function AdminLayoutContent({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAdmin, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !loading && !isAdmin && pathname !== '/admin/login') {
      router.replace('/admin/login')
    }
  }, [mounted, isAdmin, loading, router, pathname])

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00e4a0]"></div>
      </div>
    )
  }

  // Show loading state only after mounted
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00e4a0]"></div>
      </div>
    )
  }

  // Don't render anything while redirecting
  if (!loading && !isAdmin && pathname !== '/admin/login') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00e4a0]"></div>
      </div>
    )
  }

  // For login page, render without sidebar
  if (pathname === '/admin/login') {
    return <div className="min-h-screen bg-white">{children}</div>
  }

  // For authenticated admin pages, render with simple layout (no complex sidebar for now)
  return (
    <div className="bg-white min-h-screen">
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00e4a0] text-white">
              <span className="text-sm font-bold">A</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Admin Panel</h1>
            </div>
          </div>
          <nav className="flex items-center gap-6">
            <a href="/admin" className="text-sm font-medium text-gray-700 hover:text-[#00e4a0]">Dashboard</a>
            <a href="/admin/exams" className="text-sm font-medium text-gray-700 hover:text-[#00e4a0]">Exams</a>
            <a href="/admin/users" className="text-sm font-medium text-gray-700 hover:text-[#00e4a0]">Users</a>
            <a href="/admin/analytics" className="text-sm font-medium text-gray-700 hover:text-[#00e4a0]">Analytics</a>
          </nav>
        </div>
      </div>
      <div className="p-8">
        {children}
      </div>
    </div>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminLayoutContent>
      {children}
    </AdminLayoutContent>
  )
}