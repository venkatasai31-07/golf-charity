import { createClient } from '@/utils/supabase/server'
import { Users, CreditCard, Gift, Ticket } from 'lucide-react'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Fetch some metrics (mocked if DB not setup)
  let totalUsers = 0
  let activeSubs = 0
  let totalPool = 0
  let totalDraws = 0

  try {
    const { count: uCount } = await supabase.from('users').select('*', { count: 'exact', head: true })
    totalUsers = uCount || 0
    
    const { count: sCount } = await supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active')
    activeSubs = sCount || 0

    const { data: dData } = await supabase.from('draws').select('total_prize_pool')
    totalPool = dData?.reduce((acc, curr) => acc + Number(curr.total_prize_pool), 0) || 0

    const { count: dCount } = await supabase.from('draws').select('*', { count: 'exact', head: true })
    totalDraws = dCount || 0
  } catch (e) {}

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Admin Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-2">
            <Users className="h-5 w-5 text-blue-500" />
            <h3 className="font-medium text-gray-500 dark:text-gray-400">Total Users</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalUsers}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-2">
            <CreditCard className="h-5 w-5 text-green-500" />
            <h3 className="font-medium text-gray-500 dark:text-gray-400">Active Subs</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{activeSubs}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-2">
            <Gift className="h-5 w-5 text-rose-500" />
            <h3 className="font-medium text-gray-500 dark:text-gray-400">Prize Pool Distributed</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">${totalPool.toFixed(2)}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-2">
            <Ticket className="h-5 w-5 text-purple-500" />
            <h3 className="font-medium text-gray-500 dark:text-gray-400">Total Draws</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalDraws}</p>
        </div>
      </div>
    </div>
  )
}
