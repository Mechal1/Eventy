'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setError('')
  setLoading(true)
 
  try {
  const response = await api.post('/api/auth/sign-in', { email, password })
  const data = response.data.data
  const token = data.stsTokenManager.accessToken

  // Récupérer le profil complet
  const profileRes = await api.get(`/api/profile/${data.uid}`)
  const profile = profileRes.data.data

  login({
    uid: data.uid,
    email: data.email,
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    role: profile?.role || 'user',
  }, token)
  router.push('/')
} catch (err: any) {
    const msg = err.response?.data?.message || err.response?.data?.error || 'Email ou mot de passe incorrect'
    setError(msg)
  } finally {
    setLoading(false)
  }
}
  return (
    <div style={{ backgroundColor: '#EFEDE6', minHeight: '100vh' }}>

      {/* NAVBAR EN HAUT */}
      <Navbar variant="logo-only" />

      {/* CARD CENTRÉ EN DESSOUS */}
      <div className="flex items-center justify-center px-4 pt-16">
        <div className="bg-white rounded-2xl p-8 w-full max-w-sm"
          style={{ border: '1px solid #E4E2DA' }}>

          <h1 className="text-xl font-semibold text-center mb-1" style={{ color: '#1A1A18' }}>
            Bienvenue
          </h1>
          <p className="text-sm text-center mb-6" style={{ color: '#7A7A74' }}>
            Connectez-vous à votre compte EventHub
          </p>

          {error && (
            <div className="text-sm rounded-lg px-4 py-3 mb-4"
              style={{ backgroundColor: '#FDEAE4', color: '#8C3018' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: '#4A4A45' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@email.com"
                required
                className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={{ border: '1px solid #E4E2DA', color: '#1A1A18' }}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium" style={{ color: '#4A4A45' }}>
                  Mot de passe
                </label>
                <span className="text-xs font-medium cursor-pointer hover:underline"
                  style={{ color: '#0C6B54' }}>
                  Mot de passe oublié ?
                </span>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={{ border: '1px solid #E4E2DA', color: '#1A1A18' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full font-medium rounded-lg py-2 text-sm transition-colors disabled:opacity-50"
              style={{ backgroundColor: '#0C6B54', color: '#fff' }}>
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <p className="text-center text-xs mt-4" style={{ color: '#7A7A74' }}>
            Pas de compte ?{' '}
            <Link href="/signup" className="font-medium hover:underline"
              style={{ color: '#0C6B54' }}>
              S'inscrire gratuitement
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}