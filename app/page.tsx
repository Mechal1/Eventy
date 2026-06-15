'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'
import { Calendar, MapPin } from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

const CATEGORIES = ['Tous', 'Music', 'Tech', 'Sports', 'Arts', 'Business']

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

interface Event {
  id: string
  title: string
  category: string
  date: string
  city: string
  capacity: number
  bookedCount: number
}

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('Tous')
  const { user } = useAuth()

  useEffect(() => {
    fetchEvents()
  }, [activeCategory])

  const fetchEvents = async () => {
    setLoading(true)
    try {
      let response
      if (activeCategory === 'Tous') {
        response = await api.get('/api/events/')
      } else {
        response = await api.get('/api/events/filter?category=' + activeCategory)
      }
      setEvents(response.data.data || [])
    } catch (err) {
      console.error('Erreur chargement', err)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ backgroundColor: '#EFEDE6', minHeight: '100vh' }}>
      <Navbar variant="full" />

      <div className="max-w-6xl mx-auto px-6 py-6">
        <h1 className="text-3xl font-bold mb-1" style={{ color: '#1A1A18' }}>
          Événements à venir
        </h1>
        <p className="text-sm mb-6" style={{ color: '#7A7A74' }}>
          Découvrez et réservez des événements près de chez vous
        </p>

        {/* FILTRES */}
        <div className="flex gap-2 flex-wrap mb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="px-4 py-1.5 rounded-full text-sm font-medium border transition-all"
              style={activeCategory === cat
                ? { backgroundColor: '#0C6B54', color: '#fff', borderColor: '#0C6B54' }
                : { backgroundColor: '#fff', color: '#7A7A74', borderColor: '#E4E2DA' }
              }>
              {cat}
            </button>
          ))}
        </div>

        {/* EVENTS */}
        {loading ? (
          <div className="text-center py-12 text-sm" style={{ color: '#7A7A74' }}>
            Chargement...
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 text-sm" style={{ color: '#7A7A74' }}>
            Aucun événement trouvé
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {events.map((event) => {
              const cat = event.category || 'Music'
              const colors = CATEGORY_COLORS[cat] || CATEGORY_COLORS.Music
              const spotsLeft = (event.capacity || 0) - (event.bookedCount || 0)
              return (
                <Link
                  href={'/events/' + event.id}
                  key={event.id}
                  className="bg-white rounded-2xl border overflow-hidden block transition-all hover:-translate-y-1"
                  style={{ borderColor: '#E4E2DA' }}>

                  {/* IMAGE */}
                  <div
                    className="h-40 flex items-center justify-center text-5xl"
                    style={{ backgroundColor: colors.bg }}>
                    {CATEGORY_EMOJI[cat] || '🎉'}
                  </div>

                  {/* CONTENU */}
                  <div className="p-4">
                    <div className="text-base font-semibold mb-2" style={{ color: '#1A1A18' }}>
                      {event.title}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm mb-1" style={{ color: '#7A7A74' }}>
                      <Calendar size={14} />
                      {new Date(event.date).toLocaleDateString('fr-FR')}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm mb-3" style={{ color: '#7A7A74' }}>
                      <MapPin size={14} />
                      {event.city}
                    </div>
                    <div className="flex items-center justify-between">
                      <span
                        className="text-xs font-medium px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: colors.bg, color: colors.color }}>
                        {cat}
                      </span>
                      <span className="text-xs" style={{ color: '#7A7A74' }}>
                        {spotsLeft} places restantes
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}