"use client"

import React, { useState, useEffect } from "react"

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00e4a0]"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <h1>Test Analytics Page</h1>
    </div>
  )
}