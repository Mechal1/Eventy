'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

interface Event {
  id: string
  title: string
  date: string
  city: string
  category: string
  maxCapacity: number
  bookedCount: number
  status: string
}

export default function ManageEventsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [cancelling, setCancelling] = useState<string | null>(null)

  useEffect(() => {
    if (loading) return
    if (!user) { router.push('/login'); return }
    //if (user.role !== 'organizer') { router.push('/'); return }
    
    fetchEvents()
  }, [user, loading])

  const fetchEvents = async () => {
    try {
      const response = await api.get(`/api/events/created?userId=${user!.uid}`)
      setEvents(response.data.data || [])
    } catch (err) {
      console.error('Erreur chargement events', err)
    } finally {
      setLoadingEvents(false)
    }
  }

  const handleDelete = async (eventId: string) => {
    setCancelling(eventId)
    try {
      await api.delete(`/api/events/${eventId}`)
      setEvents(prev => prev.filter(e => e.id !== eventId))
    } catch (err) {
      console.error('Erreur suppression', err)
    } finally {
      setCancelling(null)
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

        {/* HEADER */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#1A1A18' }}>Mes événements</h1>
            <p style={{ fontSize: '12px', color: '#7A7A74', marginTop: '2px' }}>Gérez vos événements publiés et brouillons</p>
          </div>
          <Link href="/events/create"
            style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 500, backgroundColor: '#0C6B54', color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 2v12M2 8h12"/>
            </svg>
            Créer un événement
          </Link>
        </div>

        {/* EVENTS LIST */}
        <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #E4E2DA', overflow: 'hidden' }}>
          {loadingEvents ? (
            <div style={{ padding: '20px', textAlign: 'center', fontSize: '12px', color: '#7A7A74' }}>
              Chargement...
            </div>
          ) : events.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', fontSize: '12px', color: '#7A7A74' }}>
              Aucun événement créé pour le moment
            </div>
          ) : (
            events.map((event, i) => {
              const percent = event.maxCapacity > 0 ? Math.round((event.bookedCount / event.maxCapacity) * 100) : 0
              return (
                <div key={event.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', borderBottom: i < events.length - 1 ? '1px solid #E4E2DA' : 'none' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#1A1A18' }}>{event.title}</div>
                    <div style={{ fontSize: '10px', color: '#7A7A74', marginTop: '2px' }}>
                      {new Date(event.date).toLocaleDateString('fr-FR')} · {event.city} · {event.category}
                    </div>
                    {/* Progress bar */}
                    <div style={{ height: '4px', borderRadius: '2px', background: '#E4E2DA', width: '120px', marginTop: '6px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: '2px', background: '#1A9070', width: `${percent}%` }} />
                    </div>
                    <div style={{ fontSize: '10px', color: '#7A7A74', marginTop: '2px' }}>
                      {event.bookedCount} / {event.maxCapacity} réservés
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', marginLeft: '10px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 500, backgroundColor: event.status === 'published' ? '#D6F0E8' : '#FDF0D8', color: event.status === 'published' ? '#0C6B54' : '#7C4A00' }}>
                      {event.status === 'published' ? 'Publié' : 'Brouillon'}
                    </span>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      {/* Voir participants */}
                      <Link href={`/events/${event.id}/attendees`}
                        style={{ padding: '5px 8px', borderRadius: '8px', border: '1px solid #E4E2DA', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#4A4A45" strokeWidth="1.5">
                          <circle cx="6" cy="5" r="2.5"/><path d="M1 14c0-3.3 2.2-5.5 5-5.5S11 10.7 11 14"/>
                          <circle cx="12.5" cy="5.5" r="2"/><path d="M11 13.5c0-1.7.7-3.2 2-4"/>
                        </svg>
                      </Link>
                      {/* Modifier */}
                      <Link href={`/events/${event.id}/edit`}
                        style={{ padding: '5px 8px', borderRadius: '8px', border: '1px solid #E4E2DA', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#4A4A45" strokeWidth="1.5">
                          <path d="M11 2l3 3-9 9H2v-3L11 2z"/>
                        </svg>
                      </Link>
                      {/* Supprimer */}
                      <button
                        onClick={() => handleDelete(event.id)}
                        disabled={cancelling === event.id}
                        style={{ padding: '5px 8px', borderRadius: '8px', border: '1px solid #F0BDB1', background: '#FDEAE4', cursor: 'pointer', display: 'flex', alignItems: 'center', opacity: cancelling === event.id ? 0.5 : 1 }}>
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#8C3018" strokeWidth="1.8">
                          <path d="M3 3l10 10M13 3L3 13"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

      </div>
    </div>
  )
}