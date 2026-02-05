'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Image from 'next/image'
import { SupabaseVideo } from '@/components/SupabaseVideo'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export function HeroSection() {
  const parallaxRef = useRef<HTMLDivElement>(null)
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false)

  useEffect(() => {
    if (!parallaxRef.current) return

    const layers = parallaxRef.current.querySelectorAll('.parallax-layer')
    
    layers.forEach((layer) => {
      const speed = parseFloat(layer.getAttribute('data-speed') || '0.5')
      gsap.to(layer, {
        yPercent: -50 * speed,
        ease: 'none',
        scrollTrigger: {
          trigger: layer,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      })
    })

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])

  useEffect(() => {
    // Load video on user interaction
    const loadVideo = () => {
      setShouldLoadVideo(true)
    }

    document.addEventListener('click', loadVideo, { once: true })
    document.addEventListener('touchstart', loadVideo, { once: true })
    document.addEventListener('scroll', loadVideo, { once: true })

    return () => {
      document.removeEventListener('click', loadVideo)
      document.removeEventListener('touchstart', loadVideo)
      document.removeEventListener('scroll', loadVideo)
    }
  }, [])

  return (
    <>
      {/* Parallax Container */}
      <div ref={parallaxRef} id="parallax-container" className="fixed inset-0 pointer-events-none z-0">
        {/* Background Layers */}
        <div
          className="parallax-layer"
          data-speed="0.1"
          style={{
            backgroundImage: 'url(/asVanDeBrug.webp)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.3,
          }}
        />
        <div className="parallax-layer bg-layer-skate" data-speed="0.2" />
        <div className="parallax-layer bg-layer-football" data-speed="0.3" />
        <div className="parallax-layer bg-layer-basketball" data-speed="0.4" />
        <div className="parallax-layer bg-layer-bar" data-speed="0.5" />
        <div className="parallax-layer bg-layer-freerun" data-speed="0.6" />
        <div className="parallax-layer bg-layer-community" data-speed="0.7" />
      </div>

      {/* Hero Section */}
      <section id="hero" className="min-h-screen flex items-center justify-center relative overflow-hidden z-10">
        {/* Fallback Background Image */}
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat z-0"
          style={{
            backgroundImage: 'url(/FlyerVoorkant.webp)',
          }}
        />

        {/* Video Background - Lazy loaded on user interaction from Supabase Storage */}
        {shouldLoadVideo && (
          <SupabaseVideo
            bucket="animations"
            className="absolute inset-0 w-full h-full object-cover z-0"
            muted
            loop
            playsInline
            autoPlay
            preload="metadata"
            poster="/FlyerVoorkant.webp"
            fallbackUrl="/FlyerVoorkant.webp"
            onLoad={() => {
              console.log('Hero video loaded')
            }}
            onError={() => {
              console.error('Hero video failed to load')
            }}
          />
        )}

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/40 z-10" />

        {/* Social Media Icons */}
        <div className="social-icons-fixed z-[10000] flex flex-col space-y-3" style={{ top: '5rem' }}>
          <a
            href="https://www.facebook.com/corridor.gentbrugge"
            className="w-10 h-10 text-white/80 hover:text-white hover:scale-110 transition-all backdrop-blur-sm bg-gray-600/80 rounded-full flex items-center justify-center shadow-lg"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
          >
            <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </a>
          <a
            href="https://www.instagram.com/corridor9050/"
            className="w-10 h-10 text-white/80 hover:text-white hover:scale-110 transition-all backdrop-blur-sm bg-gray-600/80 rounded-full flex items-center justify-center shadow-lg"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
          >
            <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </a>
          <a
            href="https://www.tiktok.com/@corridor9050"
            className="w-10 h-10 text-white/80 hover:text-white hover:scale-110 transition-all backdrop-blur-sm bg-gray-600/80 rounded-full flex items-center justify-center shadow-lg"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok"
          >
            <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
            </svg>
          </a>
        </div>

        {/* Hero Content */}
        <div className="flex flex-col items-center justify-center text-center z-20 relative">
          {/* Logo */}
          <div className="mb-2 mt-2">
            <div className="w-32 h-32 md:w-40 md:h-40 mx-auto organic-shape shadow-lg opacity-95 bg-white/90 backdrop-blur-sm flex items-center justify-center">
              <Image
                src="/LogoCorridor-removebg-preview.webp"
                alt="Corridor Logo"
                width={144}
                height={144}
                className="w-28 h-28 md:w-36 md:h-36 object-contain"
                priority
              />
            </div>
          </div>

          <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold text-white graffiti-text mb-4 animate-pulse">
            CORRIDOR
          </h1>
          <p className="text-xl md:text-2xl lg:text-3xl text-white/90 font-medium graffiti-text">
            Urban Hub onder het Viaduct van Gentbrugge
          </p>
          <div className="mt-8">
            <div className="w-16 h-1 bg-white/60 mx-auto rounded-full" />
          </div>
        </div>

        {/* Bridge visual elements */}
        <div id="bridge-silhouette" className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-800/30 to-transparent" />
      </section>
    </>
  )
}
