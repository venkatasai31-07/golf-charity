import { createClient } from '@/utils/supabase/server'
import { submitScore } from '../actions'

export default async function ScoresPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch recent scores
  let scores: any[] = []
  try {
    const { data } = await supabase
      .from('scores')
      .select('*')
      .eq('user_id', user?.id)
      .order('played_at', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(5)
    if (data) scores = data
  } catch (e) {}

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Your Golf Scores</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Enter New Score</h2>
          <form action={submitScore as any} className="space-y-4">
            <div>
              <label htmlFor="score" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Score (1-45)
              </label>
              <input
                type="number"
                id="score"
                name="score"
                min="1"
                max="45"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white dark:bg-gray-700 focus:border-green-500 focus:ring-green-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Date Played
              </label>
              <input
                type="date"
                id="date"
                name="date"
                required
                defaultValue={new Date().toISOString().split('T')[0]}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white dark:bg-gray-700 focus:border-green-500 focus:ring-green-500 sm:text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            >
              Submit Score
            </button>
          </form>
          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            * Note: Only your 5 most recent scores are kept. The oldest will be automatically replaced.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Recent Entries</h2>
          {scores.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">No scores recorded yet. Time to hit the course!</p>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {scores.map((score, index) => (
                <li key={score.id} className="py-3 flex justify-between items-center">
                  <div>
                    <span className="block text-sm font-medium text-gray-900 dark:text-white">
                      Score: <strong className="text-lg text-green-600 dark:text-green-400">{score.score}</strong>
                    </span>
                    <span className="block text-xs text-gray-500 dark:text-gray-400">
                      Played: {score.played_at}
                    </span>
                  </div>
                  {index === 0 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                      Latest
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
