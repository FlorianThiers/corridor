'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface SupabaseVideoProps {
  bucket: string
  fileName?: string
  fallbackUrl?: string
  className?: string
  autoPlay?: boolean
  muted?: boolean
  loop?: boolean
  playsInline?: boolean
  preload?: 'none' | 'metadata' | 'auto'
  poster?: string
  onLoad?: () => void
  onError?: () => void
}

export function SupabaseVideo({
  bucket,
  fileName,
  fallbackUrl,
  className = '',
  autoPlay = false,
  muted = true,
  loop = false,
  playsInline = true,
  preload = 'metadata',
  poster,
  onLoad,
  onError,
}: SupabaseVideoProps) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const supabase = createClient()

  useEffect(() => {
    const loadVideo = async () => {
      try {
        setIsLoading(true)
        
        if (fileName) {
          // Use specific file name
          const { data: { publicUrl }, error } = supabase.storage
            .from(bucket)
            .getPublicUrl(fileName)
          
          if (error) {
            console.error('Error getting public URL:', error)
            if (fallbackUrl) {
              console.log('Using fallback URL:', fallbackUrl)
              setVideoUrl(fallbackUrl)
            }
          } else {
            console.log('Supabase video URL:', publicUrl)
            setVideoUrl(publicUrl)
          }
          setIsLoading(false)
          return
        }

        // Try to get latest file from bucket
        const { data: files, error } = await supabase.storage
          .from(bucket)
          .list('', {
            limit: 1,
            sortBy: { column: 'created_at', order: 'desc' }
          })

        if (error) {
          console.error('Error listing files:', error)
          if (fallbackUrl) {
            console.log('Using fallback URL:', fallbackUrl)
            setVideoUrl(fallbackUrl)
          }
          setIsLoading(false)
          return
        }

        if (files && files.length > 0) {
          const file = files[0]
          const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(file.name)
          
          console.log('Supabase video URL:', publicUrl)
          setVideoUrl(publicUrl)
        } else if (fallbackUrl) {
          console.log('No files found, using fallback URL:', fallbackUrl)
          setVideoUrl(fallbackUrl)
        }
      } catch (error) {
        console.error('Error loading video:', error)
        if (fallbackUrl) {
          console.log('Using fallback URL due to error:', fallbackUrl)
          setVideoUrl(fallbackUrl)
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadVideo()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bucket, fileName, fallbackUrl])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !videoUrl) return

    console.log('Loading video:', videoUrl)

    const handleLoadedData = () => {
      console.log('Video loaded successfully')
      if (autoPlay) {
        video.play().catch((err) => {
          console.warn('Autoplay failed:', err)
          // Autoplay failed, video will play on user interaction
        })
      }
      onLoad?.()
    }

    const handleCanPlay = () => {
      console.log('Video can play')
    }

    const handleError = (e: Event) => {
      console.error('Video failed to load:', videoUrl, e)
      if (fallbackUrl && videoUrl !== fallbackUrl) {
        console.log('Trying fallback URL:', fallbackUrl)
        setVideoUrl(fallbackUrl)
      }
      onError?.()
    }

    video.addEventListener('loadeddata', handleLoadedData)
    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('error', handleError)
    
    // Load the video
    video.load()

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData)
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('error', handleError)
    }
  }, [videoUrl, autoPlay, onLoad, onError, fallbackUrl])

  // Show poster while loading or if no video URL is available
  if (isLoading || !videoUrl) {
    if (poster) {
      return (
        <div className={className}>
          <img
            src={poster}
            alt="Video poster"
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )
    }
    // If no poster and no video, show nothing (or could show a placeholder)
    return null
  }

  return (
    <video
      ref={videoRef}
      className={className}
      muted={muted}
      loop={loop}
      playsInline={playsInline}
      preload={preload}
      poster={poster}
      autoPlay={autoPlay}
    >
      <source src={videoUrl} type="video/mp4" />
      Je browser ondersteunt geen video.
    </video>
  )
}
