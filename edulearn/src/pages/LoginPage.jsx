import { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { Input } from '../components/ui/input.jsx'
import { Button } from '../components/ui/button.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { roleRoutes } from '../utils/formatters.js'

const ROLES = ['learner', 'instructor', 'admin']

export const LoginPage = () => {
  const [role, setRole] = useState('learner')
  const [form, setForm] = useState({ email: '', password: '' })
  const { login, loading, error } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleSubmit = async (event) => {
    event.preventDefault()
    await login(role, form)
    const redirect = location.state?.from?.pathname || roleRoutes[role]
    navigate(redirect, { replace: true })
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <div className="rounded-3xl border border-white/60 bg-white/80 p-8 shadow-xl">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Access portal</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Log into EduLearn</h1>
        <div className="mt-6 flex gap-3 rounded-full bg-slate-100 p-1">
          {ROLES.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setRole(item)}
              className={`flex-1 rounded-full py-2 text-sm font-semibold capitalize ${
                role === item ? 'bg-white shadow text-slate-900' : 'text-slate-500'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600" htmlFor="email">
              Email
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600" htmlFor="password">
              Password
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            />
          </div>
          {error && (
            <p className="rounded-xl bg-rose-50 px-4 py-2 text-sm text-rose-700">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Log in'}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">
          Don’t have an account?{' '}
          <Link to="/signup" className="font-semibold text-indigo-600">
            Sign up first
          </Link>
        </p>
      </div>
    </div>
  )
}

