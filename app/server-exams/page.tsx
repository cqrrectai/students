import { supabase } from '@/lib/supabase'

export default async function ServerExamsPage() {
  let exams: any[] = []
  let error: string | null = null

  try {
    const { data, error: fetchError } = await supabase
      .from('exams')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (fetchError) {
      error = fetchError.message
    } else {
      exams = data || []
    }
  } catch (err) {
    error = 'Failed to fetch exams'
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Error</h1>
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Server-Side Exams List</h1>
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