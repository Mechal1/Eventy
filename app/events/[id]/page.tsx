'use client'
import { useState, useEffect } from 'react'
import { use } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

const CATEGORY_COLORS: Record<string, { bg: string; color: string }> = {
  Music:    { bg: '#D6F0E8', color: '#0C6B54' },
  Tech:     { bg: '#DDEAF9', color: '#1A56A0' },
  Sports:   { bg: '#FDF0D8', color: '#7C4A00' },
  Arts:     { bg: '#ECEAFB', color: '#4A3DAA' },
  Business: { bg: '#D6F0E8', color: '#0C6B54' },
}

const CATEGORY_EMOJI: Record<string, string> = {
  Music: '🎵', Tech: '💻', Sports: '🏃', Arts: '🎨', Business: '🌿',
}

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)
  const [booked, setBooked] = useState(false)
  const [error, setError] = useState('')
  const { user } = useAuth()
  const router = useRouter()

  const fetchEvent = async () => {
    try {
      const response = await api.get(`/api/events/${id}`)
      setEvent(response.data.data)
    } catch (err) {
      console.error('Erreur chargement event', err)
    }finally {
      setLoading(false)
    }
  }
  
  useEffect(() => { fetchEvent() }, [])

  

  const handleBook = async () => {
    if (!user) { router.push('/login'); return }
    setBooking(true)
    setError('')
    try {
      await api.post(`/api/events/${id}/book`, {userId: user!.uid})
      setBooked(true)
      setEvent((prev: any) => ({ ...prev, reservationsCount: (prev.reservationsCount || 0) + 1 }))
    } /*catch (err) {
      setError('Erreur lors de la réservation. Réessayez.')
    }*/ catch (err: any) {
  console.log('Erreur réservation:', err.response?.data)
  const msg = err.response?.data?.message || err.response?.data?.error || 'Erreur lors de la réservation. Réessayez.'
  setError(msg)
} finally {
      setBooking(false)
    }
  }

  if (loading) return (
    <div style={{ backgroundColor: '#EFEDE6', minHeight: '100vh' }}>
      <Navbar variant="full" />
      <div className="flex items-center justify-center py-20 text-sm" style={{ color: '#7A7A74' }}>
        Chargement...
      </div>
    </div>
  )

  if (!event) return null

  const cat = event.category || 'Music'
  const colors = CATEGORY_COLORS[cat] || CATEGORY_COLORS.Music
  const bookedCount = event.reservationsCount || 0
  const capacity = event.maxCapacity || 0
  const spotsLeft = capacity - bookedCount
  //const spotsLeft = capacity === 0 ? -1 : capacity - bookedCount
  const percent = capacity > 0 ? Math.round((bookedCount / capacity) * 100) : 0
  const organizerName = event.organizerName ||
    (event.organizer?.firstName ? `${event.organizer.firstName} ${event.organizer.lastName}` : 'Organisateur')

  // ✅ Vérifie si l'utilisateur connecté est l'organisateur de cet événement
  const organizerId = event.organizerId || event.organizer?.id || event.organizer?.uid
  const isOrganizer = !!user && !!organizerId && user.uid === organizerId

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      <Navbar variant="full" />

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '20px 18px' }}>

        {/* BACK */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#7A7A74', marginBottom: '14px', textDecoration: 'none' }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M10 3L5 8l5 5"/>
          </svg>
          Retour
        </Link>

        {/* IMAGE */}
        <div style={{ height: '100px', borderRadius: '14px', background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', marginBottom: '14px', border: '1px solid #E4E2DA' }}>
          {CATEGORY_EMOJI[cat] || '🎉'}
        </div>

        {/* BADGE + SPOTS */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 500, backgroundColor: colors.bg, color: colors.color }}>
            {cat}
          </span>
          <span style={{ fontSize: '11px', color: '#7A7A74' }}>{spotsLeft} places restantes</span>
        </div>

        {/* TITLE */}
        <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#1A1A18', letterSpacing: '-.02em', marginBottom: '12px' }}>
          {event.title}
        </h1>

        {/* INFOS */}
        <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #E4E2DA', padding: '14px', marginBottom: '10px' }}>
          {/* Date */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#7A7A74', marginBottom: '7px' }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#1A9070" strokeWidth="1.5">
              <rect x="2" y="3" width="12" height="11" rx="2"/><path d="M2 7h12M6 1v4M10 1v4"/>
            </svg>
            <span style={{ color: '#1A1A18' }}>
              {new Date(event.date).toLocaleDateString('fr-FR')}
              {event.time && ` · ${event.time}`}
              {event.duration && ` · ${event.duration}`}
            </span>
          </div>
          {/* Location */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#7A7A74', marginBottom: '7px' }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#1A9070" strokeWidth="1.5">
              <path d="M8 8.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/><path d="M8 14S3 10.5 3 7a5 5 0 0 1 10 0c0 3.5-5 7-5 7z"/>
            </svg>
            <span style={{ color: '#1A1A18' }}>{event.city}</span>
          </div>
          {/* Organizer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#7A7A74' }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#1A9070" strokeWidth="1.5">
              <circle cx="8" cy="6" r="3"/><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6"/>
            </svg>
            <span>Organisé par <span style={{ color: '#1A1A18' }}>{organizerName}</span></span>
          </div>
        </div>

        {/* MAP */}
        {event.googleMapLocation && (
          <a href={event.googleMapLocation} target="_blank" rel="noreferrer"
            style={{ height: '72px', borderRadius: '8px', background: '#EEF9F4', border: '1px solid #D6F0E8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '11px', color: '#0C6B54', marginBottom: '10px', textDecoration: 'none' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 4l4-2 4 2 4-2v10l-4 2-4-2-4 2V4z"/><path d="M6 2v10M10 4v10"/>
            </svg>
            Voir sur la carte — {event.city}
          </a>
        )}

        {/* DESCRIPTION */}
        <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #E4E2DA', padding: '14px', marginBottom: '14px' }}>
          <div style={{ fontSize: '10px', fontWeight: 500, color: '#7A7A74', letterSpacing: '.07em', textTransform: 'uppercase', fontFamily: 'monospace', marginBottom: '6px' }}>
            À propos
          </div>
          <p style={{ fontSize: '12px', color: '#7A7A74', lineHeight: 1.7 }}>
            {event.description || 'Aucune description disponible.'}
          </p>
        </div>

        {/* RÉSERVER */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #E4E2DA' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 500, color: '#1A1A18', marginBottom: '4px' }}>
              {bookedCount} / {capacity} réservés
            </div>
            <div style={{ height: '4px', borderRadius: '2px', background: '#E4E2DA', width: '140px', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: '2px', background: '#1A9070', width: `${percent}%` }} />
            </div>
          </div>

          {isOrganizer ? (
            // ✅ L'organisateur ne peut pas réserver son propre événement
            <div style={{ padding: '9px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 500, backgroundColor: '#F6F5F0', color: '#7A7A74', border: '1px solid #E4E2DA' }}>
              Vous êtes l'organisateur
            </div>
          ) : booked ? (
            <div style={{ padding: '9px 24px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, backgroundColor: '#D6F0E8', color: '#0C6B54' }}>
              ✓ Réservé
            </div>
          ) : (
            <button onClick={handleBook} disabled={booking || spotsLeft === 0}
              style={{ padding: '9px 24px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, backgroundColor: spotsLeft === 0 ? '#E4E2DA' : '#0C6B54', color: spotsLeft === 0 ? '#7A7A74' : '#fff', border: 'none', cursor: spotsLeft === 0 ? 'not-allowed' : 'pointer' }}>
              {booking ? 'En cours...' : spotsLeft === 0 ? 'Complet' : 'Réserver'}
            </button>
          )}
        </div>

        {error && (
          <div style={{ fontSize: '12px', marginTop: '10px', padding: '10px 12px', borderRadius: '8px', backgroundColor: '#FDEAE4', color: '#8C3018' }}>
            {error}
          </div>
        )}

      </div>
    </div>
  )
}