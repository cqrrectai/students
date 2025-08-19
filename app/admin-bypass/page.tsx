export default function AdminBypassPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Admin Bypass Page</h1>
      <p className="mt-4">This page bypasses the admin layout completely.</p>
      <div className="mt-8 p-4 bg-red-100 rounded-lg">
        <p className="text-red-800">✅ If you can see this, the issue is in the admin layout!</p>
      </div>
    </div>
  )
}