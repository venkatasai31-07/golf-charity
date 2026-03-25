import { createClient } from '@/utils/supabase/server'
import { runDrawAndPublish } from './actions'
import { Dices, Trophy, Calendar } from 'lucide-react'

export default async function AdminDrawsPage() {
  const supabase = await createClient()

  // Fetch past draws
  let draws: any[] = []
  try {
    const { data } = await supabase.from('draws').select('*').order('created_at', { ascending: false })
    if (data) draws = data
  } catch (e) {}

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Draw System Controls</h1>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 mb-8 flex flex-col items-center text-center">
        <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4">
          <Dices className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Run Monthly Draw</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-xl">
          Execute the draw process. This will generate 5 random numbers, match them against users' latest 5 scores, calculate the prize pool based on active subscriptions, and assign payouts automatically.
        </p>
        <form action={runDrawAndPublish as any}>
          <button
            type="submit"
            className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-full shadow-sm transition-colors"
          >
            Launch Draw Sequence
          </button>
        </form>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Past Draws</h2>
      {draws.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No draws have been executed yet.</p>
      ) : (
        <div className="space-y-4">
          {draws.map(draw => (
            <div key={draw.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between">
              <div className="flex items-start md:items-center space-x-4 mb-4 md:mb-0">
                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <Calendar className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {new Date(draw.draw_date).toLocaleDateString(undefined, { month: 'long', year: 'numeric', day: 'numeric' })}
                  </h3>
                  <div className="flex space-x-2 mt-2">
                    {draw.result_numbers.map((n: number, i: number) => (
                      <span key={i} className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 font-bold text-sm">
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Prize Pool</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">${Number(draw.total_prize_pool).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
