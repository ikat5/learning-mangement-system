import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { adminService } from '../services/api.js'
import { DashboardSection } from '../components/dashboard/DashboardSection.jsx'
import { StatsGrid } from '../components/dashboard/StatsGrid.jsx'
import { currency } from '../utils/formatters.js'

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const data = await adminService.stats()
        setStats(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return <div className="px-6 py-12 text-center text-slate-500">Loading admin dashboard...</div>
  }

  if (error) {
    return (
      <div className="px-6 py-12 text-center text-orange-800">
        {error}
      </div>
    )
  }

  const overview = stats?.overview || {}

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12">
      <StatsGrid
        stats={[
          { label: 'Total students', value: overview.totalLearners, format: 'number' },
          { label: 'Total instructors', value: overview.totalInstructors, format: 'number' },
          { label: 'Organization income', value: overview.adminIncome, format: 'currency' },
        ]}
      />

      <DashboardSection title="Platform Overview" description="High-level KPIs updated in real-time.">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: 'Total Courses', value: overview.totalCourses },
            { label: 'Total Enrollments', value: overview.totalEnrollments },
            { label: 'Total Revenue', value: currency(overview.totalRevenue) },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{item.label}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{item.value}</p>
            </div>
          ))}
        </div>
      </DashboardSection>

      <DashboardSection title="Monthly Revenue" description="Bar chart visualizing the last 12 months.">
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats?.monthlyRevenueChart || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="revenue" fill="#4f46e5" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </DashboardSection>
    </div>
  )
}



