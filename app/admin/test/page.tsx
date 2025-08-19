"use client"

export default function AdminTestPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Admin Test Page</h1>
      <p className="mt-4">This is a simple test page to verify admin routing works.</p>
      <div className="mt-8 p-4 bg-green-100 rounded-lg">
        <p className="text-green-800">✅ If you can see this, the admin layout is working!</p>
      </div>
    </div>
  )
}