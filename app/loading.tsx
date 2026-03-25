import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[50vh]">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-10 w-10 text-green-600 animate-spin" />
        <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">Loading...</p>
      </div>
    </div>
  )
}
