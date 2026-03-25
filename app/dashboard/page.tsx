import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Trophy, History, Settings, Heart } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user profile
  let profile = { full_name: 'Golfer', role: 'user' }
  try {
    const { data } = await supabase.from('users').select('*').eq('id', user.id).single()
    if (data) profile = data
  } catch (e) {
    // Graceful fallback for unmigrated DB
  }

  // Fetch subscription
  let subscription = null
  try {
    const { data } = await supabase.from('subscriptions').select('*').eq('user_id', user.id).single()
    if (data) subscription = data
  } catch (e) {}

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {profile.full_name}
        </h1>
        {profile.role === 'admin' && (
          <Link href="/admin" className="px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-md font-medium text-sm">
            Admin Panel
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Subscription Status Card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <Trophy className="h-6 w-6 text-yellow-500" />
            <h2 className="text-lg font-semibold dark:text-white">Subscription Status</h2>
          </div>
          {subscription?.status === 'active' ? (
            <div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                Active ({subscription.plan})
              </span>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                You are entered in the next draw!
              </p>
            </div>
          ) : (
            <div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                Inactive
              </span>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                Subscribe to enter the draw and support charities.
              </p>
              <Link href="/dashboard/subscribe" className="text-green-600 dark:text-green-400 font-medium hover:underline text-sm">
                Manage Subscription &rarr;
              </Link>
            </div>
          )}
        </div>

        {/* Charity Pick Card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <Heart className="h-6 w-6 text-rose-500" />
            <h2 className="text-lg font-semibold dark:text-white">Your Charity</h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            You haven't selected a charity yet.
          </p>
          <Link href="/dashboard/charity" className="text-green-600 dark:text-green-400 font-medium hover:underline text-sm">
            Select Charity &rarr;
          </Link>
        </div>

        {/* Enter Score Card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <History className="h-6 w-6 text-blue-500" />
            <h2 className="text-lg font-semibold dark:text-white">Recent Scores</h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Enter your latest round scores to participate in the draw. (1-45 ranges)
          </p>
          <Link href="/dashboard/scores" className="text-green-600 dark:text-green-400 font-medium hover:underline text-sm">
            Manage Scores &rarr;
          </Link>
        </div>
      </div>
    </div>
  )
}
