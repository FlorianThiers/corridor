'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function BackgroundImage() {
  const parallaxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Register ScrollTrigger plugin inside useEffect to ensure it's loaded
    if (typeof window !== 'undefined' && typeof gsap !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger)
    }
  }, [])

  useEffect(() => {
    if (!parallaxRef.current || typeof window === 'undefined') return
    
    // Ensure ScrollTrigger is registered before using it
    if (typeof gsap === 'undefined' || !ScrollTrigger) {
      console.warn('GSAP ScrollTrigger not available')
      return
    }

    // Register plugin again to be safe
    gsap.registerPlugin(ScrollTrigger)

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
      if (ScrollTrigger) {
        ScrollTrigger.getAll().forEach(trigger => trigger.kill())
      }
    }
  }, [])

  return (
    <div ref={parallaxRef} id="parallax-container" className="fixed inset-0 pointer-events-none z-0">
      {/* Background Image Layer */}
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
      {/* Additional gradient layers */}
      <div className="parallax-layer bg-layer-skate" data-speed="0.2" />
      <div className="parallax-layer bg-layer-football" data-speed="0.3" />
      <div className="parallax-layer bg-layer-basketball" data-speed="0.4" />
      <div className="parallax-layer bg-layer-bar" data-speed="0.5" />
      <div className="parallax-layer bg-layer-freerun" data-speed="0.6" />
      <div className="parallax-layer bg-layer-community" data-speed="0.7" />
    </div>
  )
}
