"use client"

import { useState, useEffect } from 'react'

export default function SimpleExamsPage() {
  const [exams, setExams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await fetch('/api/test-exams-fetch')
        const data = await response.json()
        
        if (data.success) {
          setExams(data.exams)
        } else {
          setError(data.error)
        }
      } catch (err) {
        setError('Failed to fetch exams')
      } finally {
        setLoading(false)
      }
    }

    fetchExams()
  }, [])

  if (loading) return <div className="p-8">Loading...</div>
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Simple Exams List</h1>
      <p className="mb-4">Found {exams.length} exams</p>
      
      <div className="grid gap-4">
        {exams.map((exam) => (
          <div key={exam.id} className="border p-4 rounded-lg">
            <h2 className="text-xl font-semibold">{exam.title}</h2>
            <p className="text-gray-600">{exam.description}</p>
            <div className="mt-2 text-sm text-gray-500">
              <span className="mr-4">Type: {exam.type}</span>
              <span className="mr-4">Subject: {exam.subject}</span>
              <span className="mr-4">Status: {exam.status}</span>
              <span>Duration: {exam.duration}min</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}