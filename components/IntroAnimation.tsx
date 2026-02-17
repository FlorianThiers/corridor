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
        
        // Check if Supabase client is available
        if (!supabase) {
          console.error('Supabase client not available')
          setShowContainer(false)
          return
        }

        // Try both bucket name variations
        const bucketNames = ['intro-animation', 'intro-animations']
        let files: any[] | null = null
        let bucketName: string | null = null
        let listError: any = null

        for (const bucket of bucketNames) {
          try {
            const { data, error } = await supabase.storage
              .from(bucket)
              .list('', {
                sortBy: { column: 'created_at', order: 'desc' },
                limit: 1
              })

            if (!error && data && data.length > 0) {
              files = data
              bucketName = bucket
              console.log(`✅ Found video in bucket: ${bucket}`, files[0].name)
              break
            } else if (error) {
              console.log(`❌ Bucket ${bucket} error:`, error.message, error)
              listError = error
            } else {
              console.log(`⚠️ Bucket ${bucket} is empty`)
            }
          } catch (err) {
            console.error(`❌ Exception accessing bucket ${bucket}:`, err)
            listError = err
          }
        }

        if (!files || files.length === 0 || !bucketName) {
          console.error('❌ No intro animation found in storage. Tried buckets:', bucketNames)
          if (listError) {
            console.error('Last error details:', listError)
          }
          // Video not available, don't show container
          setShowContainer(false)
          return
        }

        // Get public URL for the most recent file
        const { data: { publicUrl }, error: urlError } = supabase.storage
          .from(bucketName)
          .getPublicUrl(files[0].name)

        if (urlError) {
          console.error('❌ Error getting public URL:', urlError)
          // Video not available, don't show container
          setShowContainer(false)
          return
        }

        console.log('✅ Intro animation URL:', publicUrl)
        console.log('✅ Video file name:', files[0].name)
        setVideoUrl(publicUrl)
        setShowContainer(true)
      } catch (error) {
        console.error('❌ Error loading animation:', error)
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

  // Always show container, even if video is not loaded yet
  // This ensures the layout doesn't shift when video loads
  return (
    <div className="flex justify-center">
      <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 card-hover">
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-auto rounded-2xl shadow-lg"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          >
            Je browser ondersteunt geen video.
          </video>
        ) : (
          <div className="w-full h-auto rounded-2xl shadow-lg bg-gray-200 flex items-center justify-center min-h-[200px]">
            <p className="text-gray-500 text-center p-4">
              Video wordt geladen...
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
