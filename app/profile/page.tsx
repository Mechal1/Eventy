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

type ApplicationStatus = 'none' | 'pending' | 'approved' | 'declined'

interface OrganizerApplication {
  id?: string
  status: ApplicationStatus
  message?: string
}

export default function ProfilePage() {
  const { user, logout, loading } = useAuth()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loadingData, setLoadingData] = useState(true)
  const [cancelling, setCancelling] = useState<string | null>(null)
  const [showCancelConfirm, setShowCancelConfirm] = useState<Booking | null>(null)
  const [cancelledCount, setCancelledCount] = useState(0)
  const [editing, setEditing] = useState(false)
  const [editFirstName, setEditFirstName] = useState('')
  const [editLastName, setEditLastName] = useState('')
  const [saving, setSaving] = useState(false)

  // --- Organizer application state ---
  const [application, setApplication] = useState<OrganizerApplication>({ status: 'none' })
  const [loadingApplication, setLoadingApplication] = useState(true)
  const [applying, setApplying] = useState(false)
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [applyEmail, setApplyEmail] = useState('')
  const [applyPhone, setApplyPhone] = useState('')
  const [applyOrgName, setApplyOrgName] = useState('')
  const [applyOrgType, setApplyOrgType] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [applyError, setApplyError] = useState('')

  const ORG_TYPES = [
    { value: 'individual', label: 'Particulier' },
    { value: 'association', label: 'Association' },
    { value: 'company', label: 'Entreprise' },
    { value: 'other', label: 'Autre' },
  ]

  useEffect(() => {
    if (loading) return
    if (!user) { router.push('/login'); return }
    fetchProfile()
    fetchBookings()
    fetchOrganizerApplication()
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

  // GET /api/become-organizer/user/{userId} — dernière candidature de l'utilisateur
  const fetchOrganizerApplication = async () => {
    try {
      const response = await api.get(`/api/become-organizer/user/${user!.uid}`)
      const data = response.data.data
      if (data) {
        setApplication({ id: data.id, status: data.status || 'pending', message: data.message })
      } else {
        setApplication({ status: 'none' })
      }
    } catch (err: any) {
      // 404 = aucune candidature existante, ce n'est pas une vraie erreur
      if (err?.response?.status !== 404) {
        console.error('Erreur chargement candidature organisateur', err)
      }
      setApplication({ status: 'none' })
    } finally {
      setLoadingApplication(false)
    }
  }

  const handleCancel = async (eventId: string) => {
    setCancelling(eventId)
    try {
      await api.post(`/api/events/${eventId}/unbook`, { userId: user!.uid })
      setBookings(prev => prev.filter(b => b.id !== eventId))
      setCancelledCount(prev => prev + 1)
    } catch (err) {
      console.error('Erreur annulation', err)
    } finally {
      setCancelling(null)
      setShowCancelConfirm(null)
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

  const openApplyModal = () => {
    setApplyEmail(profile?.email || user?.email || '')
    setApplyPhone('')
    setApplyOrgName('')
    setApplyOrgType('')
    setAcceptTerms(false)
    setApplyError('')
    setShowApplyModal(true)
  }

  const isApplyFormValid =
    applyEmail.trim() !== '' &&
    applyPhone.trim() !== '' &&
    applyOrgName.trim() !== '' &&
    applyOrgType !== '' &&
    acceptTerms

  // POST /api/become-organizer/ — soumettre une candidature
  const handleSubmitApplication = async () => {
    if (!isApplyFormValid) {
      setApplyError('Merci de remplir tous les champs et d’accepter les conditions.')
      return
    }
    setApplyError('')
    setApplying(true)
    try {
      const response = await api.post(`/api/become-organizer/`, {
        userId: user!.uid,
        email: applyEmail,
        phone: applyPhone,
        organizationName: applyOrgName,
        organizationType: applyOrgType,
      })
      const data = response.data?.data
      setApplication({ id: data?.id, status: 'pending' })
      setShowApplyModal(false)
    } catch (err) {
      console.error('Erreur envoi candidature organisateur', err)
      setApplyError('Une erreur est survenue, réessaie plus tard.')
    } finally {
      setApplying(false)
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
              { n: cancelledCount, l: 'Annulées' },
            ].map((s, i) => (
              <div key={i} style={{ background: '#F6F5F0', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 600, color: '#1A1A18' }}>{s.n}</div>
                <div style={{ fontSize: '10px', color: '#7A7A74', marginTop: '1px' }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* Bloc "Devenir organisateur" — dépend du rôle + statut de candidature */}
          {role !== 'organizer' && !loadingApplication && (
            <div style={{ borderTop: '1px solid #E4E2DA', paddingTop: '8px' }}>
              {application.status === 'none' && (
                <div
                  onClick={openApplyModal}
                  style={{ textAlign: 'center', fontSize: '11px', color: '#0C6B54', cursor: 'pointer', padding: '6px 0', fontWeight: 500 }}
                >
                  Devenir organisateur →
                </div>
              )}

              {application.status === 'pending' && (
                <div style={{ textAlign: 'center', fontSize: '11px', color: '#8A6D1D', padding: '6px 0', fontWeight: 500, background: '#FFF6E0', borderRadius: '8px' }}>
                  Candidature en attente de validation
                </div>
              )}

              {application.status === 'declined' && (
                <div style={{ textAlign: 'center', padding: '6px 0' }}>
                  <div style={{ fontSize: '11px', color: '#8C3018', fontWeight: 500, marginBottom: '4px' }}>
                    Candidature refusée
                  </div>
                  <div
                    onClick={openApplyModal}
                    style={{ fontSize: '11px', color: '#0C6B54', cursor: 'pointer', fontWeight: 500 }}
                  >
                    Postuler à nouveau →
                  </div>
                </div>
              )}
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
                  onClick={() => setShowCancelConfirm(booking)}
                  disabled={cancelling === booking.id}
                  style={{ padding: '5px 10px', borderRadius: '8px', fontSize: '11px', border: '1px solid #F0BDB1', background: '#FDEAE4', color: '#8C3018', cursor: 'pointer', opacity: cancelling === booking.id ? 0.5 : 1 }}>
                  {cancelling === booking.id ? '...' : 'Annuler'}
                </button>
              </div>
            ))
          )}
        </div>

      </div>

      {/* MODAL CONFIRMATION ANNULATION */}
      {showCancelConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60 }}>
          <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #E4E2DA', padding: '24px', width: '100%', maxWidth: '320px', margin: '0 18px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#1A1A18', marginBottom: '8px' }}>
              Annuler la réservation ?
            </h2>
            <p style={{ fontSize: '12px', color: '#7A7A74', marginBottom: '18px', lineHeight: 1.5 }}>
              Tu es sur le point d'annuler ta réservation pour{' '}
              <strong style={{ color: '#1A1A18' }}>{showCancelConfirm.title}</strong>.
              Cette action est irréversible.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setShowCancelConfirm(null)}
                disabled={cancelling === showCancelConfirm.id}
                style={{ flex: 1, padding: '9px', borderRadius: '8px', fontSize: '12px', border: '1px solid #E4E2DA', background: '#fff', color: '#1A1A18', cursor: 'pointer' }}>
                Retour
              </button>
              <button
                onClick={() => handleCancel(showCancelConfirm.id)}
                disabled={cancelling === showCancelConfirm.id}
                style={{ flex: 1, padding: '9px', borderRadius: '8px', fontSize: '12px', border: 'none', background: '#8C3018', color: '#fff', cursor: 'pointer', opacity: cancelling === showCancelConfirm.id ? 0.5 : 1 }}>
                {cancelling === showCancelConfirm.id ? 'Annulation...' : 'Oui, annuler'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL MODIFIER PROFIL */}
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

      {/* MODAL DEVENIR ORGANISATEUR */}
      {showApplyModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #E4E2DA', padding: '24px', width: '100%', maxWidth: '380px', margin: '0 18px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#1A1A18', marginBottom: '6px' }}>
              Devenir organisateur
            </h2>
            <p style={{ fontSize: '11px', color: '#7A7A74', marginBottom: '16px' }}>
              Remplis ce formulaire pour soumettre ta candidature. Elle sera examinée par un administrateur.
            </p>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '11px', fontWeight: 500, color: '#4A4A45', display: 'block', marginBottom: '4px' }}>Email de contact</label>
              <input
                type="email"
                value={applyEmail}
                onChange={e => setApplyEmail(e.target.value)}
                placeholder="contact@exemple.com"
                style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', fontSize: '12px', border: '1px solid #E4E2DA', color: '#1A1A18', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '11px', fontWeight: 500, color: '#4A4A45', display: 'block', marginBottom: '4px' }}>Téléphone</label>
              <input
                type="tel"
                value={applyPhone}
                onChange={e => setApplyPhone(e.target.value)}
                placeholder="06 12 34 56 78"
                style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', fontSize: '12px', border: '1px solid #E4E2DA', color: '#1A1A18', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '11px', fontWeight: 500, color: '#4A4A45', display: 'block', marginBottom: '4px' }}>Nom de l'organisation</label>
              <input
                value={applyOrgName}
                onChange={e => setApplyOrgName(e.target.value)}
                placeholder="Ex : Casa Events"
                style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', fontSize: '12px', border: '1px solid #E4E2DA', color: '#1A1A18', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '11px', fontWeight: 500, color: '#4A4A45', display: 'block', marginBottom: '4px' }}>Type d'organisation</label>
              <select
                value={applyOrgType}
                onChange={e => setApplyOrgType(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', fontSize: '12px', border: '1px solid #E4E2DA', color: applyOrgType ? '#1A1A18' : '#9A9A94', outline: 'none', boxSizing: 'border-box', background: '#fff' }}
              >
                <option value="" disabled>Sélectionner un type</option>
                {ORG_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '14px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={e => setAcceptTerms(e.target.checked)}
                style={{ marginTop: '2px', width: '14px', height: '14px', accentColor: '#0C6B54', cursor: 'pointer', flexShrink: 0 }}
              />
              <span style={{ fontSize: '11px', color: '#4A4A45', lineHeight: 1.4 }}>
                J'accepte les{' '}
                <a href="/cgu" target="_blank" rel="noopener noreferrer" style={{ color: '#0C6B54', textDecoration: 'underline' }}>
                  conditions générales
                </a>{' '}
                et la charte des organisateurs.
              </span>
            </label>

            {applyError && (
              <div style={{ fontSize: '11px', color: '#8C3018', marginBottom: '10px' }}>
                {applyError}
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setShowApplyModal(false)}
                style={{ flex: 1, padding: '9px', borderRadius: '8px', fontSize: '12px', border: '1px solid #E4E2DA', background: '#fff', color: '#1A1A18', cursor: 'pointer' }}>
                Annuler
              </button>
              <button onClick={handleSubmitApplication} disabled={applying || !isApplyFormValid}
                style={{ flex: 2, padding: '9px', borderRadius: '8px', fontSize: '12px', border: 'none', background: '#0C6B54', color: '#fff', cursor: 'pointer', opacity: (applying || !isApplyFormValid) ? 0.5 : 1 }}>
                {applying ? 'Envoi...' : 'Envoyer la candidature'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}