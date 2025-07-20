'use client'
import { useLoading } from '@/contexts/LoadingContext'

export default function Loader() {
  const { loading, progress } = useLoading()
  if (!loading) return null
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow p-4 w-56">
        <div className="h-2 bg-gray-200 rounded">
          <div
            className="h-full bg-green-500 rounded"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-center mt-2 text-sm font-medium text-gray-700">
          {Math.round(progress)}%
        </div>
      </div>
    </div>
  )
}
