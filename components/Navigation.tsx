'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import Image from 'next/image'

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [adminNavOpen, setAdminNavOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, userProfile, isAdmin, isAuthenticated } = useAuth()

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }

  const closeSidebar = () => {
    setIsOpen(false)
    document.body.style.overflow = ''
  }

  const toggleAdminNav = () => {
    setAdminNavOpen(!adminNavOpen)
  }

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeSidebar()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  const isActive = (path: string) => {
    if (!pathname) return false
    if (path === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(path)
  }

  return (
    <>
      {/* Sidebar Overlay */}
      {isOpen && (
        <div
          className="sidebar-overlay active"
          onClick={closeSidebar}
        />
      )}

      {/* Hamburger Button */}
      <button
        onClick={toggleSidebar}
        className="hamburger-btn fixed top-6 left-6 z-[10001] w-12 h-12 bg-gray-600/80 backdrop-blur-sm rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-gray-500/80 hover:scale-110 shadow-lg transition-all cursor-pointer"
        aria-label="Menu"
        type="button"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Sidebar */}
      <nav className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-content">
          {/* Logo */}
          <div className="sidebar-header">
            <div className="flex items-center space-x-3 mb-6">
              <Image
                src="/LogoCorridor-removebg-preview.png"
                alt="Corridor Logo"
                width={40}
                height={40}
                className="h-10 w-10"
              />
              <span className="text-xl font-bold text-gray-800">CORRIDOR</span>
            </div>
          </div>

          {/* Auth Section */}
          <div className="sidebar-auth-top mb-4">
            {!isAuthenticated ? (
              <button
                data-open-login
                onClick={(e) => {
                  e.preventDefault()
                  closeSidebar()
                  window.dispatchEvent(new CustomEvent('openLoginModal'))
                }}
                className="sidebar-link w-full bg-pink-500 text-white hover:bg-pink-600 mb-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span>Inloggen</span>
              </button>
            ) : (
              <Link
                href="/profiel"
                onClick={closeSidebar}
                className="sidebar-link"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Profiel</span>
              </Link>
            )}
          </div>

          {/* Admin Links */}
          {isAdmin && isAuthenticated && (
            <div className="mb-4">
              <button
                onClick={toggleAdminNav}
                className="sidebar-link w-full text-left text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              >
                <svg
                  className={`w-4 h-4 inline mr-2 transition-transform ${adminNavOpen ? '' : '-rotate-90'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
                <span>Admin</span>
              </button>

              {adminNavOpen && (
                <div className="ml-4 space-y-1">
                  <Link href="/beheer/evenementen" onClick={closeSidebar} className={`nav-link sidebar-link ${isActive('/beheer/evenementen') ? 'active' : ''}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Evenementen</span>
                  </Link>
                  <Link href="/beheer/corristories" onClick={closeSidebar} className={`nav-link sidebar-link ${isActive('/beheer/corristories') ? 'active' : ''}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Corristories</span>
                  </Link>
                  <Link href="/beheer/zones" onClick={closeSidebar} className={`nav-link sidebar-link ${isActive('/beheer/zones') ? 'active' : ''}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Zones</span>
                  </Link>
                  <Link href="/beheer/gebruikers" onClick={closeSidebar} className={`nav-link sidebar-link ${isActive('/beheer/gebruikers') ? 'active' : ''}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span>Gebruikers</span>
                  </Link>
                  <Link href="/beheer/partners" onClick={closeSidebar} className={`nav-link sidebar-link ${isActive('/beheer/partners') ? 'active' : ''}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Partners</span>
                  </Link>
                  <Link href="/beheer/animatie" onClick={closeSidebar} className={`nav-link sidebar-link ${isActive('/beheer/animatie') ? 'active' : ''}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Animatie</span>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Navigation Links */}
          <div className="sidebar-nav">
            <Link href="/" onClick={closeSidebar} className={`nav-link sidebar-link ${isActive('/') ? 'active' : ''}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Home</span>
            </Link>
            <Link href="/agenda" onClick={closeSidebar} className={`nav-link sidebar-link ${isActive('/agenda') ? 'active' : ''}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <span>Agenda</span>
            </Link>
            <Link href="/zones" onClick={closeSidebar} className={`nav-link sidebar-link ${isActive('/zones') ? 'active' : ''}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>Zones</span>
            </Link>
            <Link href="/evenementen" onClick={closeSidebar} className={`nav-link sidebar-link ${isActive('/evenementen') ? 'active' : ''}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Evenementen</span>
            </Link>
            <Link href="/corristories" onClick={closeSidebar} className={`nav-link sidebar-link ${isActive('/corristories') ? 'active' : ''}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span>Corristories</span>
            </Link>
            <Link href="/partners" onClick={closeSidebar} className={`nav-link sidebar-link ${isActive('/partners') ? 'active' : ''}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Partners</span>
            </Link>
          </div>
        </div>
      </nav>
    </>
  )
}
