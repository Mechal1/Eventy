'use client'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'


interface NavbarProps {
  variant?: 'full' | 'logo-only'
}

export default function Navbar({ variant = 'full' }: NavbarProps) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  
  const dropdownRef = useRef<HTMLDivElement>(null)

  

  // Ferme le dropdown si on clique dehors
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    router.push('/')
    setOpen(false)
  }

  // ✅ Utilise le profil API sinon fallback sur user
  const firstName = user?.firstName || ''
const lastName  = user?.lastName  || ''
const initials  = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || '?'
  return (
    <div
      style={{ backgroundColor: '#FFFFFE', borderBottom: '1px solid #E4E2DA' }}
      className="flex items-center justify-between px-6 py-3 sticky top-0 z-10"
    >
      <Link href="/" className="font-semibold text-base" style={{ color: '#0C6B54' }}>
        EventHub
      </Link>

      {variant === 'full' && (
        <div className="flex gap-2 items-center">
          {user ? (
            <div ref={dropdownRef} style={{ position: 'relative' }}>

              {/* ✅ Avatar même couleur que page profil */}
              <button
                onClick={() => setOpen(!open)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: '#EEF9F4',
                  border: '1.5px solid #D6F0E8',
                  color: '#0C6B54',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                {initials}
              </button>

              {/* Dropdown */}
              {open && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '44px',
                  backgroundColor: '#fff',
                  border: '1px solid #E4E2DA',
                  borderRadius: '10px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  minWidth: '160px',
                  overflow: 'hidden',
                  zIndex: 100,
                }}>
                  {user.role === 'organizer' && (
                    <Link
                      href="/events/manage"
                      onClick={() => setOpen(false)}
                      style={{
                        display: 'block',
                        padding: '10px 16px',
                        fontSize: '13px',
                        color: '#1A1A18',
                        textDecoration: 'none',
                        borderBottom: '1px solid #E4E2DA',
                      }}>
                      Mes événements
                    </Link>
                  )}
                  <Link
                    href="/profile"
                    onClick={() => setOpen(false)}
                    style={{
                      display: 'block',
                      padding: '10px 16px',
                      fontSize: '13px',
                      color: '#1A1A18',
                      textDecoration: 'none',
                      borderBottom: '1px solid #E4E2DA',
                    }}>
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: '10px 16px',
                      fontSize: '13px',
                      color: '#8C3018',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                    }}>
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="text-xs font-medium px-3 py-1.5 rounded-lg border"
                style={{ borderColor: '#E4E2DA', color: '#1A1A18' }}>
                Se connecter
              </Link>
              <Link
                href="/signup"
                className="text-xs font-medium px-3 py-1.5 rounded-lg"
                style={{ backgroundColor: '#0C6B54', color: '#fff' }}>
                S'inscrire
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  )
}