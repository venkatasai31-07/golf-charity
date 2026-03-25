import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

async function updateWinnerStatus(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  const status = formData.get('status') as string

  const supabase = await createClient()
  await supabase.from('winners').update({ status }).eq('id', id)
  
  revalidatePath('/admin/winners')
  return { success: true }
}

export default async function AdminWinnersPage() {
  const supabase = await createClient()

  let winners: any[] = []
  try {
    const { data } = await supabase.from('winners').select(`
      *,
      users (full_name, email),
      draws (draw_date)
    `).order('created_at', { ascending: false })
    if (data) winners = data
  } catch (e) {}

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Winner Verification & Payouts</h1>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Draw Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Winner</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Match / Prize</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Proof</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status / Action</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {winners.map((winner) => (
                <tr key={winner.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {new Date(winner.draws?.draw_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{winner.users?.full_name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{winner.users?.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-300">Match {winner.match_count}</div>
                    <div className="text-sm font-bold text-green-600 dark:text-green-400">${Number(winner.prize_amount).toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {winner.proof_url ? (
                      <a href={winner.proof_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View Proof</a>
                    ) : 'Not uploaded'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <form action={updateWinnerStatus as any} className="flex items-center justify-end space-x-2">
                      <input type="hidden" name="id" value={winner.id} />
                      <select 
                        name="status" 
                        defaultValue={winner.status}
                        className="block rounded-md border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-gray-900 dark:text-white dark:bg-gray-700 focus:border-green-500 focus:ring-green-500 sm:text-sm"
                        onChange={(e) => e.target.form?.requestSubmit()}
                      >
                        <option value="pending">Pending</option>
                        <option value="verified">Verified</option>
                        <option value="paid">Paid</option>
                      </select>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {winners.length === 0 && (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">No winners to verify.</div>
          )}
        </div>
      </div>
    </div>
  )
}
