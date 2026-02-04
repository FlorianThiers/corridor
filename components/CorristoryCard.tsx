import type { Corristory } from '@/types'

interface CorristoryCardProps {
  story: Corristory
}

export function CorristoryCard({ story }: CorristoryCardProps) {
  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 card-hover">
      <h3 className="text-xl font-bold text-gray-800 mb-2">{story.title}</h3>
      <p className="text-gray-700 mb-2">{story.content}</p>
      <p className="text-gray-600 text-sm">Door: {story.author_name || 'Anoniem'}</p>
    </div>
  )
}
