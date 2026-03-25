import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

async function addCharity(formData: FormData) {
  'use server'
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const website_url = formData.get('website_url') as string
  const image_url = formData.get('image_url') as string

  if (!name) return { error: 'Name is required' }

  const supabase = await createClient()
  await supabase.from('charities').insert({
    name, description, website_url, image_url
  })
  
  revalidatePath('/admin/charities')
  revalidatePath('/charities')
  return { success: true }
}

async function deleteCharity(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  const supabase = await createClient()
  await supabase.from('charities').delete().eq('id', id)
  
  revalidatePath('/admin/charities')
  revalidatePath('/charities')
}

export default async function AdminCharitiesPage() {
  const supabase = await createClient()

  let charities: any[] = []
  try {
    const { data } = await supabase.from('charities').select('*').order('created_at', { ascending: false })
    if (data) charities = data
  } catch (e) {}

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Manage Charities</h1>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Add New Charity</h2>
        <form action={addCharity as any} className="space-y-4 max-w-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
              <input name="name" required className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white dark:bg-gray-700 focus:border-green-500 focus:ring-green-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Website URL</label>
              <input name="website_url" type="url" className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white dark:bg-gray-700 focus:border-green-500 focus:ring-green-500 sm:text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Image URL</label>
            <input name="image_url" type="url" className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white dark:bg-gray-700 focus:border-green-500 focus:ring-green-500 sm:text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
            <textarea name="description" rows={3} className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white dark:bg-gray-700 focus:border-green-500 focus:ring-green-500 sm:text-sm"></textarea>
          </div>
          <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors">
            Add Charity
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Charity</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Website</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {charities.map((charity) => (
              <tr key={charity.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {charity.image_url && (
                      <div className="flex-shrink-0 h-10 w-10 relative rounded border overflow-hidden mr-4">
                        <img src={charity.image_url} alt="" className="object-cover h-full w-full" />
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{charity.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">{charity.description}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {charity.website_url ? (
                    <a href={charity.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Link</a>
                  ) : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <form action={deleteCharity}>
                    <input type="hidden" name="id" value={charity.id} />
                    <button type="submit" className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">Delete</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {charities.length === 0 && (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">No charities found.</div>
        )}
      </div>
    </div>
  )
}
