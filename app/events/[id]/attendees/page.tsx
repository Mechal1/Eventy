'use client'
import { useState, useEffect, use, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

interface Attendee {
  bookingId: string
  userId: string
  firstName: string
  lastName: string
  email: string
  bookedAt: string
  status?: string
}

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  confirmed: { bg: '#DFF3E8', color: '#2F9E63', label: 'Confirmed' },
  pending:   { bg: '#FBEBD3', color: '#C7893A', label: 'Pending' },
  cancelled: { bg: '#FBE3E1', color: '#D5645A', label: 'Cancelled' },
}

function getStatusStyle(status?: string) {
  const key = (status || 'confirmed').toLowerCase()
  return STATUS_STYLES[key] || STATUS_STYLES.confirmed
}

export default function AttendeesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user, loading } = useAuth()
  const router = useRouter()
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [event, setEvent] = useState<any>(null)
  const [loadingData, setLoadingData] = useState(true)

  // ✅ Fix : fetchData déclarée AVANT useEffect
  const fetchData = useCallback(async () => {
    try {
      const eventRes = await api.get(`/api/events/${id}`)

      const eventData = eventRes.data.data || eventRes.data

      setEvent(eventData)
      setAttendees(eventData.attendeesList || [])
    } catch (err) {
      console.error('Erreur chargement', err)
    } finally {
      setLoadingData(false)
    }
  }, [id])

  useEffect(() => {
    if (loading) return
    if (!user) { router.push('/login'); return }
    fetchData()
  }, [user, loading, fetchData])

  if (loading || loadingData) return (
    <div style={{ backgroundColor: '#EFEDE6', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: '13px', color: '#7A7A74' }}>Chargement...</div>
    </div>
  )

  if (!user) return null

  return (
    <div style={{ backgroundColor: '#EFEDE6', minHeight: '100vh' }}>
      <Navbar variant="full" />

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '20px 18px' }}>

        <Link href="/manage" style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#7A7A74', marginBottom: '14px', textDecoration: 'none' }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M10 3L5 8l5 5"/>
          </svg>
          Mes evenements
        </Link>

        <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#1A1A18', marginBottom: '2px' }}>
          Liste des participants
        </h1>
        {event && (
          <p style={{ fontSize: '12px', color: '#7A7A74', marginBottom: '16px' }}>
            {event.title} · {new Date(event.date).toLocaleDateString('fr-FR')}
          </p>
        )}

        {/* STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '14px' }}>
          {[
            { n: attendees.length, l: 'Inscrits' },
            { n: (event?.capacity || event?.maxCapacity || 0) - attendees.length, l: 'Restantes' },
            { n: event?.capacity || event?.maxCapacity || 0, l: 'Capacite' },
          ].map((s, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: '10px', border: '1px solid #E4E2DA', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '22px', fontWeight: 600, color: '#1A1A18' }}>{s.n}</div>
              <div style={{ fontSize: '10px', color: '#7A7A74', marginTop: '2px' }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* TABLE */}
        <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #E4E2DA', overflow: 'hidden' }}>
          {attendees.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', fontSize: '12px', color: '#7A7A74' }}>
              Aucun participant pour le moment
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
              <thead>
                <tr style={{ background: '#F6F5F0', borderBottom: '1px solid #E4E2DA' }}>
                  <th style={{ padding: '8px 12px', textAlign: 'left', color: '#7A7A74', fontWeight: 500 }}>#</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', color: '#7A7A74', fontWeight: 500 }}>Nom</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', color: '#7A7A74', fontWeight: 500 }}>Email</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', color: '#7A7A74', fontWeight: 500 }}>Inscrit le</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', color: '#7A7A74', fontWeight: 500 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendees.map((attendee, i) => {
                  const statusStyle = getStatusStyle(attendee.status)
                  return (
                    <tr key={attendee.bookingId} style={{ borderBottom: i < attendees.length - 1 ? '1px solid #E4E2DA' : 'none' }}>
                      <td style={{ padding: '10px 12px', color: '#7A7A74' }}>{i + 1}</td>
                      <td style={{ padding: '10px 12px', color: '#1A1A18', fontWeight: 500 }}>
                        {attendee.firstName} {attendee.lastName}
                      </td>
                      <td style={{ padding: '10px 12px', color: '#7A7A74' }}>{attendee.email}</td>
                      <td style={{ padding: '10px 12px', color: '#7A7A74' }}>
                        {attendee.bookedAt ? new Date(attendee.bookedAt).toLocaleDateString('fr-FR') : '-'}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 10px',
                          borderRadius: '999px',
                          fontSize: '10px',
                          fontWeight: 500,
                          background: statusStyle.bg,
                          color: statusStyle.color,
                        }}>
                          {statusStyle.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  )
}