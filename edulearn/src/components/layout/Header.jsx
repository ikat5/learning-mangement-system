import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useMemo } from 'react'
import { Button } from '../ui/button.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { roleRoutes } from '../../utils/formatters.js'

const navLinks = [
  { label: 'Courses', to: '/#courses' },
  { label: 'Dashboards', to: '/#dashboards' },
  { label: 'Community', to: '/#community' },
  { label: 'Support', to: '/#support' },
]

export const Header = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const dashboardRoute = useMemo(() => {
    if (!user?.role) return '/login'
    return roleRoutes[user.role.toLowerCase()] || '/login'
  }, [user])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/30 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2 font-semibold text-indigo-700">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-500 text-white font-bold">
            EL
          </span>
          <span className="text-xl tracking-tight">EduLearn</span>
        </Link>
        <nav className="hidden gap-6 text-sm font-medium text-slate-600 md:flex">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className="hover:text-indigo-600">
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Button variant="outline" onClick={() => navigate(dashboardRoute)}>
                Dashboard
              </Button>
              <Button variant="ghost" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button onClick={() => navigate('/signup')}>Get Started</Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

