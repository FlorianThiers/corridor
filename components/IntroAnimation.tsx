'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function IntroAnimation() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [showContainer, setShowContainer] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const supabase = createClient()

  useEffect(() => {
    const loadAnimation = async () => {
      try {
        console.log('Loading intro animation from Supabase Storage...')
        
        // Try to get AnimatieFlyer.mp4 from videos bucket
        const fileName = 'AnimatieFlyer.mp4'
        const { data: { publicUrl }, error } = supabase.storage
          .from('videos')
          .getPublicUrl(fileName)

        if (error) {
          console.error('Error getting public URL:', error)
          // Video not available, don't show container
          setShowContainer(false)
          return
        }

        console.log('Intro animation URL:', publicUrl)
        setVideoUrl(publicUrl)
        setShowContainer(true)
      } catch (error) {
        console.error('Error loading animation:', error)
        // Video not available, don't show container
        setShowContainer(false)
      }
    }

    loadAnimation()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !videoUrl) return

    console.log('Setting up video:', videoUrl)

    const handleLoadedData = () => {
      console.log('Intro video loaded')
      video.play().catch((err) => {
        console.warn('Autoplay failed:', err)
      })
    }

    const handleError = (e: Event) => {
      console.error('Intro video failed to load:', videoUrl, e)
      // Don't hide container, just log error
    }

    video.addEventListener('loadeddata', handleLoadedData)
    video.addEventListener('error', handleError)
    
    // Load the video
    video.load()

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData)
      video.removeEventListener('error', handleError)
    }
  }, [videoUrl])

  if (!showContainer || !videoUrl) return null

  return (
    <div className="flex justify-center">
      <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 card-hover">
        <video
          ref={videoRef}
          className="w-full h-auto rounded-2xl shadow-lg"
          autoPlay
          muted
          loop
          preload="metadata"
        >
          <source src={videoUrl} type="video/mp4" />
          Je browser ondersteunt geen video.
        </video>
      </div>
    </div>
  )
}
