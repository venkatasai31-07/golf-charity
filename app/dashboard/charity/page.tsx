import { createClient } from '@/utils/supabase/server'
import { selectCharity } from '../actions'

export default async function CharitySelectionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch charities
  let charities: any[] = []
  try {
    const { data } = await supabase.from('charities').select('*').order('name')
    if (data) charities = data
  } catch (e) {}

  // Fetch current selection
  let currentSelection = null
  try {
    const { data } = await supabase.from('user_charity').select('*, charities(name)').eq('user_id', user?.id).single()
    if (data) currentSelection = data
  } catch (e) {}

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Manage Your Charity</h1>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Current Selection</h2>
        {currentSelection ? (
          <div>
            <p className="text-gray-900 dark:text-white text-lg font-medium">
              {currentSelection.charities?.name}
            </p>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Contribution: <strong className="text-green-600 dark:text-green-400">{currentSelection.contribution_percentage}%</strong> of your pool allocation.
            </p>
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">You haven't selected a beneficiary charity yet.</p>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Update Selection</h2>
        <form action={selectCharity as any} className="space-y-6">
          <div>
            <label htmlFor="charityId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Select a Charity
            </label>
            <select
              id="charityId"
              name="charityId"
              required
              defaultValue={currentSelection?.charity_id || ''}
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white dark:bg-gray-700 focus:border-green-500 focus:ring-green-500 sm:text-sm"
            >
              <option value="" disabled>Select a charity...</option>
              {charities.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="percentage" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Contribution Percentage (Min 10%)
            </label>
            <div className="mt-1 flex items-center gap-4">
              <input
                type="range"
                id="percentage"
                name="percentage"
                min="10"
                max="100"
                defaultValue={currentSelection?.contribution_percentage || 10}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-green-600"
                onInput={(e) => document.getElementById('pctDisplay')!.innerText = e.currentTarget.value + '%'}
              />
              <span id="pctDisplay" className="font-bold w-12 text-right dark:text-white">
                {currentSelection?.contribution_percentage || 10}%
              </span>
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Increase your contribution to give back more to the community.
            </p>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 flex-none transition-colors"
          >
            Save Charity Preferences
          </button>
        </form>
      </div>
    </div>
  )
}
