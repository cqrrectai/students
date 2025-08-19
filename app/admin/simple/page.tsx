export default function AdminSimplePage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Simple Admin Page</h1>
      <p className="mt-4">This is a server-side rendered admin page without client-side logic.</p>
      <div className="mt-8 p-4 bg-blue-100 rounded-lg">
        <p className="text-blue-800">✅ If you can see this, basic admin routing works!</p>
      </div>
    </div>
  )
}