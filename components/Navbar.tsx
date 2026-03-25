import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { logout } from '@/app/auth/actions'

export default async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Note: For role, we would fetch from the public.users table if needed,
  // but for basic nav, we just check if user exists.

  return (
    <nav className="w-full border-b border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="font-bold text-xl tracking-tight text-green-600 dark:text-green-500">
              CharityLinks
            </Link>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
            <Link href="/" className="text-gray-900 dark:text-gray-100 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Home
            </Link>
            <Link href="/charities" className="text-gray-900 dark:text-gray-100 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Charities
            </Link>
            {user && (
              <Link href="/dashboard" className="text-gray-900 dark:text-gray-100 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Dashboard
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <form action={logout}>
                <button type="submit" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-red-600 transition-colors">
                  Sign out
                </button>
              </form>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-green-600 transition-colors">
                  Log in
                </Link>
                <Link href="/register" className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
