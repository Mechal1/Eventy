'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'
import Navbar from '@/components/Navbar'

interface Booking {
  id: string
  title: string
  date: string
  city: string
  category: string
}

interface Profile {
  firstName: string
  lastName: string
  email: string
  role: string
}

export default function ProfilePage() {
  const { user, logout, loading } = useAuth()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loadingData, setLoadingData] = useState(true)
  const [cancelling, setCancelling] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [editFirstName, setEditFirstName] = useState('')
  const [editLastName, setEditLastName] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (loading) return
    if (!user) { router.push('/login'); return }
    fetchProfile()
    fetchBookings()
  }, [user, loading])

  const fetchProfile = async () => {
    try {
      const response = await api.get(`/api/profile/${user!.uid}`)
      setProfile(response.data.data)
    } catch (err) {
      console.error('Erreur chargement profil', err)
    }
  }

  const fetchBookings = async () => {
    try {
      const response = await api.get(`/api/events/booked?userId=${user!.uid}`)
      setBookings(response.data.data || [])
    } catch (err) {
      console.error('Erreur chargement bookings', err)
    } finally {
      setLoadingData(false)
    }
  }

  const handleCancel = async (eventId: string) => {
    setCancelling(eventId)
    try {
      await api.post(`/api/events/${eventId}/unbook`, { userId: user!.uid })
      setBookings(prev => prev.filter(b => b.id !== eventId))
    } catch (err) {
      console.error('Erreur annulation', err)
    } finally {
      setCancelling(null)
    }
  }

  const handleEdit = () => {
    setEditFirstName(firstName)
    setEditLastName(lastName)
    setEditing(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put(`/api/profile/${user!.uid}`, {
        firstName: editFirstName,
        lastName: editLastName,
      })
      setProfile(prev => prev ? { ...prev, firstName: editFirstName, lastName: editLastName } : prev)
      setEditing(false)
    } catch (err) {
      console.error('Erreur modification', err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div style={{ backgroundColor: '#EFEDE6', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: '13px', color: '#7A7A74' }}>Chargement...</div>
    </div>
  )

  if (!user) return null

  if (!profile) return (
    <div style={{ backgroundColor: '#EFEDE6', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: '13px', color: '#7A7A74' }}>Chargement du profil...</div>
    </div>
  )

  const capitalize = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : ''
  const firstName = capitalize(profile.firstName || user.firstName || '')
  const lastName = capitalize(profile.lastName || user.lastName || '')
  const email = profile.email || user.email || ''
  const role = profile.role || user.role || 'user'
  const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || '?'

  return (
    <div style={{ backgroundColor: '#EFEDE6', minHeight: '100vh' }}>
      <Navbar variant="full" />

      <div style={{ maxWidth: '100%', padding: '20px 32px' }}>

        {/* PROFILE CARD */}
        <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #E4E2DA', padding: '14px', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#EEF9F4', border: '1.5px solid #D6F0E8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 600, color: '#0C6B54', flexShrink: 0 }}>
              {initials}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A18' }}>
                {firstName && lastName ? `${firstName} ${lastName}` : email}
              </div>
              <div style={{ fontSize: '11px', color: '#7A7A74', marginTop: '1px' }}>
                {email}
              </div>
              <span style={{ display: 'inline-block', marginTop: '5px', padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 500, backgroundColor: '#D6F0E8', color: '#0C6B54' }}>
                {role}
              </span>
            </div>
            <button onClick={handleEdit} style={{ padding: '5px 10px', borderRadius: '8px', fontSize: '11px', border: '1px solid #E4E2DA', background: '#fff', color: '#1A1A18', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M11 2l3 3-9 9H2v-3L11 2z"/>
              </svg>
              Modifier
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
            {[
              { n: bookings.length, l: 'Réservations' },
              { n: bookings.filter(b => new Date(b.date) >= new Date()).length, l: 'À venir' },
              { n: 0, l: 'Créés' },
            ].map((s, i) => (
              <div key={i} style={{ background: '#F6F5F0', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 600, color: '#1A1A18' }}>{s.n}</div>
                <div style={{ fontSize: '10px', color: '#7A7A74', marginTop: '1px' }}>{s.l}</div>
              </div>
            ))}
          </div>

          {role !== 'organizer' && (
            <div style={{ textAlign: 'center', fontSize: '11px', color: '#0C6B54', cursor: 'pointer', padding: '6px 0', borderTop: '1px solid #E4E2DA', fontWeight: 500 }}>
              Devenir organisateur →
            </div>
          )}
        </div>

        {/* BOOKINGS */}
        <div style={{ fontSize: '10px', fontWeight: 500, color: '#7A7A74', letterSpacing: '.07em', textTransform: 'uppercase', fontFamily: 'monospace', marginBottom: '8px' }}>
          Mes réservations
        </div>

        <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #E4E2DA', overflow: 'hidden' }}>
          {loadingData ? (
            <div style={{ padding: '20px', textAlign: 'center', fontSize: '12px', color: '#7A7A74' }}>
              Chargement...
            </div>
          ) : bookings.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', fontSize: '12px', color: '#7A7A74' }}>
              Aucune réservation pour le moment
            </div>
          ) : (
            bookings.map((booking, i) => (
              <div key={booking.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderBottom: i < bookings.length - 1 ? '1px solid #E4E2DA' : 'none' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 500, color: '#1A1A18' }}>
                    {booking.title}
                  </div>
                  <div style={{ fontSize: '10px', color: '#7A7A74', marginTop: '2px' }}>
                    {new Date(booking.date).toLocaleDateString('fr-FR')} · {booking.city} · {booking.category}
                  </div>
                </div>
                <button
                  onClick={() => handleCancel(booking.id)}
                  disabled={cancelling === booking.id}
                  style={{ padding: '5px 10px', borderRadius: '8px', fontSize: '11px', border: '1px solid #F0BDB1', background: '#FDEAE4', color: '#8C3018', cursor: 'pointer', opacity: cancelling === booking.id ? 0.5 : 1 }}>
                  {cancelling === booking.id ? '...' : 'Annuler'}
                </button>
              </div>
            ))
          )}
        </div>

      </div>

      {/* MODAL MODIFIER */}
      {editing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #E4E2DA', padding: '24px', width: '100%', maxWidth: '320px', margin: '0 18px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#1A1A18', marginBottom: '16px' }}>
              Modifier le profil
            </h2>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '11px', fontWeight: 500, color: '#4A4A45', display: 'block', marginBottom: '4px' }}>Prénom</label>
              <input
                value={editFirstName}
                onChange={e => setEditFirstName(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', fontSize: '12px', border: '1px solid #E4E2DA', color: '#1A1A18', outline: 'none' }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '11px', fontWeight: 500, color: '#4A4A45', display: 'block', marginBottom: '4px' }}>Nom</label>
              <input
                value={editLastName}
                onChange={e => setEditLastName(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', fontSize: '12px', border: '1px solid #E4E2DA', color: '#1A1A18', outline: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setEditing(false)}
                style={{ flex: 1, padding: '9px', borderRadius: '8px', fontSize: '12px', border: '1px solid #E4E2DA', background: '#fff', color: '#1A1A18', cursor: 'pointer' }}>
                Annuler
              </button>
              <button onClick={handleSave} disabled={saving}
                style={{ flex: 2, padding: '9px', borderRadius: '8px', fontSize: '12px', border: 'none', background: '#0C6B54', color: '#fff', cursor: 'pointer', opacity: saving ? 0.5 : 1 }}>
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}