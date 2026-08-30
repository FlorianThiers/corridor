import type { HistoryPhoto } from '@/lib/geschiedenis'
import { HistoryPhotoCard } from '@/components/HistoryPhotoCard'

interface HistoryPhotoGridProps {
  photos: HistoryPhoto[]
}

export function HistoryPhotoGrid({ photos }: HistoryPhotoGridProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {photos.map((photo) => (
        <HistoryPhotoCard key={photo.src} photo={photo} />
      ))}
    </div>
  )
}
