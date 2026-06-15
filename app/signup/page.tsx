'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function SignupPage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }
    setLoading(true)
    try {
  const response = await api.post('/api/auth/sign-up', { firstName, lastName, email, password })
  const data = response.data.data
  const token = data.stsTokenManager.accessToken

  login({
    uid: data.uid,
    email: data.email,
    firstName: firstName,
    lastName: lastName,
    role: 'user',
  }, token)
  router.push('/')
} catch (err: any) {
      const msg = err.response?.data?.message || 'Une erreur est survenue. Réessayez.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ backgroundColor: '#EFEDE6', minHeight: '100vh' }}>
      <Navbar variant="logo-only" />

      <div className="flex items-center justify-center px-4 pt-10 pb-8">
        <div className="bg-white rounded-2xl p-8 w-full max-w-sm"
          style={{ border: '1px solid #E4E2DA' }}>

          <h1 className="text-xl font-semibold text-center mb-1" style={{ color: '#1A1A18' }}>
            Créer votre compte
          </h1>
          <p className="text-sm text-center mb-6" style={{ color: '#7A7A74' }}>
            Rejoignez EventHub pour découvrir et créer des événements
          </p>

          {error && (
            <div className="text-sm rounded-lg px-4 py-3 mb-4"
              style={{ backgroundColor: '#FDEAE4', color: '#8C3018' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Prénom + Nom côte à côte */}
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs font-medium block mb-1" style={{ color: '#4A4A45' }}>
                  Prénom
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Ismail"
                  required
                  className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
                  style={{ border: '1px solid #E4E2DA', color: '#1A1A18' }}
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-medium block mb-1" style={{ color: '#4A4A45' }}>
                  Nom
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Idrissi"
                  required
                  className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
                  style={{ border: '1px solid #E4E2DA', color: '#1A1A18' }}
                />
              </div>
            </div>

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
              <label className="text-xs font-medium block mb-1" style={{ color: '#4A4A45' }}>
                Mot de passe
              </label>
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

            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: '#4A4A45' }}>
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? 'Création...' : 'Créer un compte'}
            </button>
          </form>

          <p className="text-center text-xs mt-4" style={{ color: '#7A7A74' }}>
            Déjà un compte ?{' '}
            <Link href="/login" className="font-medium hover:underline"
              style={{ color: '#0C6B54' }}>
              Se connecter
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}