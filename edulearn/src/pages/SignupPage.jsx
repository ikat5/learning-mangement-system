import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button.jsx'
import { Input } from '../components/ui/input.jsx'
import { Label } from '../components/ui/label.jsx'
import { useToast } from '../hooks/useToast.js'
import { useAuth } from '../hooks/useAuth.js'

const roles = [
  { label: 'Learner', value: 'learner' },
  { label: 'Instructor', value: 'instructor' },
]

export const SignupPage = () => {
  const [form, setForm] = useState({
    role: 'learner',
    fullName: '',
    userName: '',
    phoneNumber: '',
    email: '',
    password: '',
    bank_account_number: '',
    bank_secret: '',
  })
  const [loading, setLoading] = useState(false)
  const { signup } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      setLoading(true)
      await signup(form.role, form)
      showToast({
        type: 'success',
        title: 'Account created',
        message: 'Sign in with your credentials to get started.',
      })
      navigate('/login')
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Signup failed',
        message: err.message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-12">
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Create account</p>
        <h1 className="text-3xl font-semibold text-slate-900">Join EduLearn today</h1>
        <p className="mt-2 text-sm text-slate-500">Choose a role and complete the secure signup form.</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-5 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:grid-cols-2"
      >
        <div className="grid gap-3">
          <Label htmlFor="role">Role</Label>
          <select
            id="role"
            name="role"
            value={form.role}
            onChange={handleChange}
            className="rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          >
            {roles.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-3">
          <Label htmlFor="fullName">Full name</Label>
          <Input
            id="fullName"
            name="fullName"
            placeholder="Jane Doe"
            required
            value={form.fullName}
            onChange={handleChange}
          />
        </div>

        <div className="grid gap-3">
          <Label htmlFor="userName">Username</Label>
          <Input
            id="userName"
            name="userName"
            placeholder="janedoe"
            required
            value={form.userName}
            onChange={handleChange}
          />
        </div>

        <div className="grid gap-3">
          <Label htmlFor="phoneNumber">Phone number</Label>
          <Input
            id="phoneNumber"
            name="phoneNumber"
            placeholder="+1 555 123 4567"
            required
            value={form.phoneNumber}
            onChange={handleChange}
          />
        </div>

        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            value={form.email}
            onChange={handleChange}
          />
        </div>

        <div className="grid gap-3">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="********"
            required
            value={form.password}
            onChange={handleChange}
          />
        </div>

        <div className="grid gap-3">
          <Label htmlFor="bank_account_number">Bank account number</Label>
          <Input
            id="bank_account_number"
            name="bank_account_number"
            placeholder="2022 3310 54"
            required
            value={form.bank_account_number}
            onChange={handleChange}
          />
        </div>

        <div className="grid gap-3">
          <Label htmlFor="bank_secret">Bank secret key</Label>
          <Input
            id="bank_secret"
            name="bank_secret"
            placeholder="*******"
            required
            value={form.bank_secret}
            onChange={handleChange}
          />
        </div>

        <div className="md:col-span-2">
          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </Button>
          <p className="mt-3 text-center text-sm text-slate-500">
            Already registered?{' '}
            <button
              type="button"
              className="font-semibold text-indigo-600 underline-offset-2 hover:underline"
              onClick={() => navigate('/login')}
            >
              Sign in
            </button>
          </p>
        </div>
      </form>
    </div>
  )
}



