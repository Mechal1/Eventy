'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

const CATEGORIES = ['Music', 'Tech', 'Sports', 'Arts', 'Business']

export default function CreateEventPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [city, setCity] = useState('')
  const [category, setCategory] = useState('Music')
  const [capacity, setCapacity] = useState('')
  const [googleMapLocation, setGoogleMapLocation] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

 useEffect(() => {
  if (loading) return
  if (!user) { router.push('/login'); return }
  // if (user.role !== 'organizer') { router.push('/'); return }
}, [user, loading])

    const handleSubmit = async (status: 'draft' | 'published') => {
    setError('')
    setSubmitting(true)
    try {
       await api.post('/api/events/', {
            title,
            description,
            date,
            time,
            city,
            category,
            maxCapacity: parseInt(capacity),
            googleMapLocation,
            eventIcon: '🎉',
            organizerId: user!.uid,
            status,
      })
      router.push('/events/manage')
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Erreur lors de la création. Réessayez.'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div style={{ backgroundColor: '#EFEDE6', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: '13px', color: '#7A7A74' }}>Chargement...</div>
    </div>
  )

  // if (!user || user.role !== 'organizer') return null
if (!user) return null

  return (
    <div style={{ backgroundColor: '#EFEDE6', minHeight: '100vh' }}>
      <Navbar variant="full" />

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '20px 18px' }}>

        {/* BACK */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#7A7A74', marginBottom: '14px', textDecoration: 'none' }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M10 3L5 8l5 5"/>
          </svg>
          Retour
        </Link>

        <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#1A1A18', marginBottom: '4px' }}>
          Créer un événement
        </h1>
        <p style={{ fontSize: '12px', color: '#7A7A74', marginBottom: '16px' }}>
          Remplissez les détails, puis publiez votre événement
        </p>

        {error && (
          <div style={{ fontSize: '12px', padding: '10px 12px', borderRadius: '8px', backgroundColor: '#FDEAE4', color: '#8C3018', marginBottom: '12px' }}>
            {error}
          </div>
        )}

        <form onSubmit={(e) => e.preventDefault()}>
          <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #E4E2DA', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

            {/* Titre */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 500, color: '#4A4A45', display: 'block', marginBottom: '4px' }}>
                Titre de l'événement
              </label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Donnez un titre clair à votre événement"
                required
                style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', fontSize: '12px', border: '1px solid #E4E2DA', color: '#1A1A18', outline: 'none' }}
              />
            </div>

            {/* Description */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 500, color: '#4A4A45', display: 'block', marginBottom: '4px' }}>
                Description
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="De quoi s'agit-il ? Pour qui ?"
                required
                rows={3}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', fontSize: '12px', border: '1px solid #E4E2DA', color: '#1A1A18', outline: 'none', resize: 'none' }}
              />
            </div>

            {/* Date + Heure */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 500, color: '#4A4A45', display: 'block', marginBottom: '4px' }}>
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', fontSize: '12px', border: '1px solid #E4E2DA', color: '#1A1A18', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 500, color: '#4A4A45', display: 'block', marginBottom: '4px' }}>
                  Heure
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', fontSize: '12px', border: '1px solid #E4E2DA', color: '#1A1A18', outline: 'none' }}
                />
              </div>
            </div>

            {/* Ville */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 500, color: '#4A4A45', display: 'block', marginBottom: '4px' }}>
                Ville
              </label>
              <input
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="Ex: Casablanca"
                required
                style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', fontSize: '12px', border: '1px solid #E4E2DA', color: '#1A1A18', outline: 'none' }}
              />
            </div>

            {/* Catégorie + Capacité */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 500, color: '#4A4A45', display: 'block', marginBottom: '4px' }}>
                  Catégorie
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', fontSize: '12px', border: '1px solid #E4E2DA', color: '#1A1A18', outline: 'none', background: '#fff' }}>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 500, color: '#4A4A45', display: 'block', marginBottom: '4px' }}>
                  Capacité max
                </label>
                <input
                  type="number"
                  value={capacity}
                  onChange={e => setCapacity(e.target.value)}
                  placeholder="Ex: 100"
                  required
                  min="1"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', fontSize: '12px', border: '1px solid #E4E2DA', color: '#1A1A18', outline: 'none' }}
                />
              </div>
            </div>

            {/* Google Map */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 500, color: '#4A4A45', display: 'block', marginBottom: '4px' }}>
                Lien Google Maps (optionnel)
              </label>
              <input
                value={googleMapLocation}
                onChange={e => setGoogleMapLocation(e.target.value)}
                placeholder="https://maps.google.com/?q=..."
                style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', fontSize: '12px', border: '1px solid #E4E2DA', color: '#1A1A18', outline: 'none' }}
              />
            </div>

            {/* Boutons */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleSubmit('draft')}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 500,
                    border: '1px solid #E4E2DA',
                    background: '#fff',
                    color: '#1A1A18',
                    cursor: submitting ? 'not-allowed' : 'pointer'
                  }}>
                  {submitting ? '...' : 'Enregistrer brouillon'}
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleSubmit('published')}
                  style={{
                    flex: 2,
                    padding: '10px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 500,
                    border: 'none',
                    background: submitting ? '#E4E2DA' : '#0C6B54',
                    color: '#fff',
                    cursor: submitting ? 'not-allowed' : 'pointer'
                  }}>
                  {submitting ? 'Publication...' : "Publier l'événement"}
                </button>
            </div>

          </div>
        </form>
      </div>
    </div>
  )
}