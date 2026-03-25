import { createClient } from '@/utils/supabase/server'
import { manageSubscription } from '../actions'

export default async function SubscribePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let subscription = null
  try {
    const { data } = await supabase.from('subscriptions').select('*').eq('user_id', user?.id).single()
    if (data) subscription = data
  } catch (e) {}

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Manage Subscription</h1>

      {subscription?.status === 'active' && (
        <div className="mb-8 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
          <h2 className="text-lg font-semibold text-green-800 dark:text-green-300">You are currently subscribed!</h2>
          <p className="text-green-700 dark:text-green-400 mt-1">
            Plan: <span className="capitalize font-medium">{subscription.plan}</span>
            <br />
            Renews on: {new Date(subscription.current_period_end).toLocaleDateString()}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Monthly Plan */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Monthly Plan</h3>
          <p className="mt-4 text-gray-500 dark:text-gray-400 flex-1">
            Perfect for casual golfers. Get a chance at the monthly draw to win prizes and support your favorite charity.
          </p>
          <div className="mt-6 mb-6">
            <span className="text-4xl font-extrabold text-gray-900 dark:text-white">$10</span>
            <span className="text-gray-500 dark:text-gray-400">/mo</span>
          </div>
          <form action={manageSubscription as any}>
            <input type="hidden" name="plan" value="monthly" />
            <button
              type="submit"
              className="w-full justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-black dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 transition-colors"
            >
              Select Monthly
            </button>
          </form>
        </div>

        {/* Yearly Plan */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border-2 border-green-500 dark:border-green-500 relative flex flex-col">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4">
            <span className="inline-block bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Best Value
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Yearly Plan</h3>
          <p className="mt-4 text-gray-500 dark:text-gray-400 flex-1">
            Save 20% on your subscription. Play all year round, enter every draw, and maximize your charitable impact.
          </p>
          <div className="mt-6 mb-6">
            <span className="text-4xl font-extrabold text-gray-900 dark:text-white">$96</span>
            <span className="text-gray-500 dark:text-gray-400">/yr</span>
          </div>
          <form action={manageSubscription as any}>
            <input type="hidden" name="plan" value="yearly" />
            <button
              type="submit"
              className="w-full justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
            >
              Select Yearly
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
