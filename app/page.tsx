import Link from 'next/link'
import { ArrowRight, Heart, Trophy, Target } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex flex-col items-center w-full">
      {/* Hero Section */}
      <section className="w-full py-20 lg:py-32 flex flex-col items-center justify-center text-center px-4 overflow-hidden relative">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-100 via-white to-white dark:from-green-900/20 dark:via-gray-950 dark:to-gray-950"></div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl text-gray-900 dark:text-white leading-tight">
          Swing for a <span className="text-green-600 dark:text-green-400">Purpose</span>
        </h1>
        <p className="mt-6 text-xl text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed">
          Join our monthly draw by submitting your golf scores. Win cash prizes and support charities making a real difference worldwide.
        </p>
        
        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Link href="/register" className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-green-600 rounded-full hover:bg-green-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
            Subscribe Now <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
          <Link href="/charities" className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">
            Explore Charities
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-24 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="flex flex-col items-center">
              <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-2xl mb-6 text-green-600 dark:text-green-400">
                <Target className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Log Your Scores</h3>
              <p className="text-gray-600 dark:text-gray-400">Keep track of your latest 5 rounds. We use these for our exciting monthly draws.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-2xl mb-6 text-blue-600 dark:text-blue-400">
                <Trophy className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Win the Pot</h3>
              <p className="text-gray-600 dark:text-gray-400">Match 3, 4, or 5 numbers in our monthly draw to win a share of the community prize pool.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="p-4 bg-rose-100 dark:bg-rose-900/30 rounded-2xl mb-6 text-rose-600 dark:text-rose-400">
                <Heart className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Support Causes</h3>
              <p className="text-gray-600 dark:text-gray-400">A portion of every subscription goes directly to a charity of your choice.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
