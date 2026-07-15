'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useEffect } from 'react'
import api from '@/lib/api'
import Navbar from '@/components/Navbar'



interface OrganizerEvent {
  id: string
  title: string
  date: string
  city: string
  category: string
  capacity: number
  bookedCount: number
  status: 'published' | 'draft'
}



export default function OrganizerDashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [events, setEvents] = useState<OrganizerEvent[]>([])

  useEffect(() => {
    async function fetchMyEvents() {
      const res = await api.get(`/api/events?organizerId=${user?.uid}`)
      setEvents(res.data.data)
    }
    fetchMyEvents()
  }, [user])

  const publishedCount = events.filter(e => e.status === 'published').length
  const draftCount = events.filter(e => e.status === 'draft').length
  const totalBookings = events.reduce((sum, e) => sum + e.bookedCount, 0)

  async function handleCancelEvent(id: string) {
    await api.patch(`/api/events/${id}`, { status: 'cancelled' })
    setEvents(prev => prev.filter(e => e.id !== id))
  }

  return (
    <div style={{ backgroundColor: '#EFEDE6', minHeight: '100vh' }}>
      <Navbar />

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px' }}>

        <h1 style={{ fontSize: 20, fontWeight: 600, color: '#1A1A18', marginBottom: 2 }}>
          Bienvenue{user?.firstName ? `, ${user.firstName}` : ''}
        </h1>
        <p style={{ fontSize: 12, color: '#7A7A74', marginBottom: 20 }}>
          Voici un aperçu de vos événements
        </p>

        {/* QUICK ACTIONS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 20 }}>
          <ActionButton
            label="Créer un événement"
            onClick={() => router.push('/events/create')}
            icon={
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 2v12M2 8h12" />
              </svg>
            }
          />
          <ActionButton
            label="Gérer mes événements"
            onClick={() => router.push('/events/manage')}
            icon={
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="2" width="5" height="5" rx="1" />
                <rect x="9" y="2" width="5" height="5" rx="1" />
                <rect x="2" y="9" width="5" height="5" rx="1" />
                <rect x="9" y="9" width="5" height="5" rx="1" />
              </svg>
            }
          />
          <ActionButton
            label="Inscrits"
            onClick={() => router.push('/events/attendees')}
            icon={
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="6" cy="5" r="2.5" />
                <path d="M1 14c0-3.3 2.2-5.5 5-5.5S11 10.7 11 14" />
                <circle cx="12.5" cy="5.5" r="2" />
                <path d="M11 13.5c0-1.7.7-3.2 2-4" />
              </svg>
            }
          />
        </div>

        {/* STATS */}
        <div style={{ display: 'grid',textAlign: 'center', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 20 }}>
          <StatBox n={events.length} label="Événements créés" />
          <StatBox n={publishedCount} label="Publiés" />
          <StatBox n={draftCount} label="Brouillons" />
          <StatBox n={totalBookings} label="Réservations" />
        </div>

        {/* LISTE DES EVENTS */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{
            fontSize: 10, fontWeight: 500, color: '#7A7A74', letterSpacing: '0.07em',
            textTransform: 'uppercase',
          }}>
            Mes événements
          </span>
        </div>

        {events.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '40px 20px', color: '#7A7A74', fontSize: 13,
            backgroundColor: '#fff', borderRadius: 14, border: '1px solid #E4E2DA',
          }}>
            Aucun événement pour le moment. Crée ton premier événement !
          </div>
        )}

        <div style={{ backgroundColor: '#fff', borderRadius: 14, border: '1px solid #E4E2DA', overflow: 'hidden' }}>
          {events.map((ev, i) => {
            const pct = Math.round((ev.bookedCount / ev.capacity) * 100)
            return (
              <div
                key={ev.id}
                style={{
                  display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                  padding: 12, borderBottom: i < events.length - 1 ? '1px solid #E4E2DA' : 'none',
                }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#1A1A18' }}>{ev.title}</div>
                  <div style={{ fontSize: 10, color: '#7A7A74', marginTop: 2 }}>
                    {ev.date} · {ev.city} · {ev.category}
                  </div>
                  <div style={{ height: 4, borderRadius: 2, backgroundColor: '#E4E2DA', width: 120, marginTop: 6, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, backgroundColor: '#1A9070', borderRadius: 2 }} />
                  </div>
                  <div style={{ fontSize: 10, color: '#7A7A74', marginTop: 3 }}>
                    {ev.bookedCount} / {ev.capacity} réservés
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, marginLeft: 10 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 500, padding: '2px 8px', borderRadius: 20,
                    backgroundColor: ev.status === 'published' ? '#D6F0E8' : '#FDF0D8',
                    color: ev.status === 'published' ? '#0C6B54' : '#7C4A00',
                  }}>
                    {ev.status === 'published' ? 'Publié' : 'Brouillon'}
                  </span>
                  <div style={{ display: 'flex', gap: 5 }}>
                    <IconButton onClick={() => router.push(`/events/attendees?id=${ev.id}`)} title="Voir les inscrits">👥</IconButton>
                    <IconButton onClick={() => router.push(`/events/edit/${ev.id}`)} title="Modifier">✏️</IconButton>
                    <IconButton onClick={() => handleCancelEvent(ev.id)} title="Annuler" danger>✕</IconButton>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}

function ActionButton({
  label, onClick, icon,
}: {
  label: string
  onClick: () => void
  icon?: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      style={{
        backgroundColor: '#0C6B54',
        border: '1px solid #0C6B54',
        borderRadius: 10,
        padding: '10px 8px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        cursor: 'pointer',
        fontSize: 11.5, fontWeight: 500,
        color: '#fff',
      }}>
      {icon}
      {label}
    </button>
  )
}

function StatBox({ n, label }: { n: number; label: string }) {
  return (
    <div style={{ backgroundColor: '#fff', border: '1px solid #E4E2DA', borderRadius: 10, padding: '12px 10px' }}>
      <div style={{ fontSize: 18, fontWeight: 600, color: '#1A1A18' }}>{n}</div>
      <div style={{ fontSize: 10, color: '#7A7A74', marginTop: 2 }}>{label}</div>
    </div>
  )
}

function IconButton({
  children, onClick, title, danger = false,
}: { children: React.ReactNode; onClick: () => void; title: string; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        padding: 5, borderRadius: 8, border: '1px solid',
        borderColor: danger ? '#F0BDB1' : '#E4E2DA',
        backgroundColor: danger ? '#FDEAE4' : '#fff',
        cursor: 'pointer', fontSize: 12, lineHeight: 1,
      }}>
      {children}
    </button>
  )
}