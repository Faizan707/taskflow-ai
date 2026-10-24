import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register, token } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (token) {
    return <Navigate to="/dashboard" replace />
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await register(name, email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create account')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="surface-grid relative flex min-h-screen items-center justify-center px-4 py-10">
      <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-sea-mist/80 to-transparent" />
      <div className="relative w-full max-w-md animate-rise">
        <Link to="/" className="font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
          TaskFlow
        </Link>
        <p className="mt-3 max-w-sm text-ink-soft">
          Create your account and start organizing work on a clean kanban board.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-4 rounded-2xl border border-line bg-white/90 p-6 shadow-sm backdrop-blur"
        >
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-ink">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              enterKeyHint="next"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-line bg-paper px-3 py-2.5 outline-none ring-sea/30 transition focus:border-sea focus:ring-2"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              spellCheck={false}
              required
              enterKeyHint="next"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-line bg-paper px-3 py-2.5 outline-none ring-sea/30 transition focus:border-sea focus:ring-2"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="new-password" className="block text-sm font-medium text-ink">
                Password
              </label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowPassword((v) => !v)}
                className="px-0 text-xs font-medium text-sea hover:bg-transparent hover:text-ink"
              >
                {showPassword ? 'Hide' : 'Show'}
              </Button>
            </div>
            <input
              id="new-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              minLength={6}
              enterKeyHint="done"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-line bg-paper px-3 py-2.5 outline-none ring-sea/30 transition focus:border-sea focus:ring-2"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-coral/10 px-3 py-2 text-sm text-danger">{error}</p>
          )}

          <Button type="submit" fullWidth disabled={submitting}>
            {submitting ? 'Creating…' : 'Create Account'}
          </Button>
        </form>

        <p className="mt-5 text-sm text-ink-soft">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-sea hover:text-ink">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
