import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Input } from '../components/ui/input.jsx'
import { Textarea } from '../components/ui/textarea.jsx'
import { Button } from '../components/ui/button.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const ROLES = ['learner', 'instructor', 'admin']

export const SignupPage = () => {
  const [role, setRole] = useState('learner')
  const [form, setForm] = useState({
    fullName: '',
    userName: '',
    phoneNumber: '',
    email: '',
    password: '',
    bank_account_number: '',
    bank_secret: '',
    bio: '',
  })
  const [message, setMessage] = useState(null)
  const { signup, loading, error } = useAuth()
  const navigate = useNavigate()

  const handleChange = (field) => (event) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }))

  const handleSubmit = async (event) => {
    event.preventDefault()
    await signup(role, { ...form, role: role.charAt(0).toUpperCase() + role.slice(1) })
    setMessage('Signup successful. Please login to continue.')
    setTimeout(() => navigate('/login'), 1500)
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="rounded-3xl border border-white/60 bg-white/80 p-8 shadow-xl">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Create account</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Join EduLearn</h1>
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
        <form className="mt-8 grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
          <div className="md:col-span-1 space-y-2">
            <label className="text-sm font-medium text-slate-600" htmlFor="fullName">
              Full name
            </label>
            <Input id="fullName" required value={form.fullName} onChange={handleChange('fullName')} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600" htmlFor="userName">
              Username
            </label>
            <Input id="userName" required value={form.userName} onChange={handleChange('userName')} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600" htmlFor="phoneNumber">
              Phone Number
            </label>
            <Input id="phoneNumber" required value={form.phoneNumber} onChange={handleChange('phoneNumber')} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600" htmlFor="email">
              Email
            </label>
            <Input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange('email')}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600" htmlFor="password">
              Password
            </label>
            <Input
              id="password"
              type="password"
              required
              value={form.password}
              onChange={handleChange('password')}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600" htmlFor="bank_account_number">
              Bank Account Number
            </label>
            <Input
              id="bank_account_number"
              required
              value={form.bank_account_number}
              onChange={handleChange('bank_account_number')}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600" htmlFor="bank_secret">
              Secret Key
            </label>
            <Input
              id="bank_secret"
              required
              value={form.bank_secret}
              onChange={handleChange('bank_secret')}
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-medium text-slate-600" htmlFor="bio">
              Motivation / Bio
            </label>
            <Textarea
              id="bio"
              rows="3"
              placeholder="Tell us about your learning or teaching goals..."
              value={form.bio}
              onChange={handleChange('bio')}
            />
          </div>
          {error && (
            <p className="md:col-span-2 rounded-xl bg-rose-50 px-4 py-2 text-sm text-rose-700">
              {error}
            </p>
          )}
          {message && (
            <p className="md:col-span-2 rounded-xl bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
              {message}
            </p>
          )}
          <div className="md:col-span-2">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Sign up'}
            </Button>
          </div>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">
          Already joined?{' '}
          <Link to="/login" className="font-semibold text-indigo-600">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}

