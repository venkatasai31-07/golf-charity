import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is admin
  let isAdmin = false
  try {
    const { data } = await supabase.from('users').select('role').eq('id', user.id).single()
    if (data && data.role === 'admin') {
      isAdmin = true
    }
  } catch (e) {
    // Graceful
  }

  if (!isAdmin) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-3xl font-bold mb-4 text-red-600">Access Denied</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">You do not have permission to view the admin dashboard.</p>
        <Link href="/dashboard" className="text-green-600 hover:text-green-700 font-medium">
          &larr; Return to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex-shrink-0">
        <div className="p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-6">
            Admin Panel
          </h2>
          <nav className="space-y-2">
            <Link href="/admin" className="block px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">
              Overview
            </Link>
            <Link href="/admin/draws" className="block px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">
              Draw System
            </Link>
            <Link href="/admin/users" className="block px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">
              Users & Subs
            </Link>
            <Link href="/admin/charities" className="block px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">
              Charities CRUD
            </Link>
            <Link href="/admin/winners" className="block px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">
              Verify Winners
            </Link>
          </nav>
        </div>
      </aside>

      {/* Admin Content */}
      <main className="flex-1 p-6 lg:p-10">
        {children}
      </main>
    </div>
  )
}
