import { createClient } from '@/utils/supabase/server'
import Image from 'next/image'

export default async function CharitiesPage() {
  const supabase = await createClient()
  
  // Fetch charities
  let charities: any[] = []
  try {
    const { data } = await supabase.from('charities').select('*').order('name')
    if (data) charities = data
  } catch (err) {
    // If table doesn't exist yet gracefully degrade to mock
  }

  // Fallback to mock data if database not yet migrated
  if (charities.length === 0) {
    charities = [
      {
        id: '1',
        name: 'Global Golf Foundation',
        description: 'Supporting youth golf programs and education worldwide.',
        image_url: 'https://images.unsplash.com/photo-1593111774240-d529f12cb416?auto=format&fit=crop&q=80&w=600',
        website_url: 'https://example.com'
      },
      {
        id: '2',
        name: 'Green Keepers',
        description: 'Environmental conservation for golf courses and surrounding nature.',
        image_url: 'https://images.unsplash.com/photo-1587174486073-ae5e1c4e33bf?auto=format&fit=crop&q=80&w=600',
        website_url: 'https://example.com'
      },
      {
        id: '3',
        name: 'Fairway to Health',
        description: 'Funding critical medical research through golf tournaments.',
        image_url: 'https://images.unsplash.com/photo-1535139262971-c51845709a48?auto=format&fit=crop&q=80&w=600',
        website_url: 'https://example.com'
      }
    ]
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
          Supported <span className="text-green-600 dark:text-green-400">Charities</span>
        </h1>
        <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-400 mx-auto">
          Choose where your contribution goes. A minimum of 10% of your subscription goes directly to the charity you select.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {charities.map((charity) => (
          <div key={charity.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-48 w-full relative bg-gray-200 dark:bg-gray-700">
              {charity.image_url ? (
                /* Note: We use img instead of next/image here for external URLs without configuring next.config.js domains */
                <img src={charity.image_url} alt={charity.name} className="object-cover w-full h-full" />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
              )}
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{charity.name}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">{charity.description}</p>
              {charity.website_url && (
                <a href={charity.website_url} target="_blank" rel="noopener noreferrer" className="text-green-600 dark:text-green-400 font-medium hover:underline text-sm">
                  Visit Website &rarr;
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
