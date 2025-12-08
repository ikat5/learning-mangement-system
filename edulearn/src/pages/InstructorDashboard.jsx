import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useNavigate } from 'react-router-dom'
import { instructorService } from '../services/api.js'
import { DashboardSection } from '../components/dashboard/DashboardSection.jsx'
import { StatsGrid } from '../components/dashboard/StatsGrid.jsx'
import { CourseCard } from '../components/dashboard/CourseCard.jsx'
import { Button } from '../components/ui/button.jsx'
import { useToast } from '../hooks/useToast.js'
import { useAuth } from '../hooks/useAuth.js'
import { getInitials } from '../utils/formatters.js'

export const InstructorDashboard = () => {
  const [overview, setOverview] = useState({ courses: [], totalEarnings: 0 })
  const [earningsBreakdown, setEarningsBreakdown] = useState([])
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()
  const navigate = useNavigate()
  const { user } = useAuth()

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true)
      const [coursesPayload, earningsPayload] = await Promise.all([
        instructorService.myCourses(),
        instructorService.earningsChart(),
      ])
      setOverview({
        courses: coursesPayload?.courses || [],
        totalEarnings: coursesPayload?.totalEarnings || 0,
      })
      setEarningsBreakdown(earningsPayload || [])
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Unable to load dashboard',
        message: err.message,
      })
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  const stats = useMemo(() => {
    const activeCourses = overview.courses.length
    const totalLearners = overview.courses.reduce(
      (sum, course) => sum + (course.studentsEnrolled || 0),
      0,
    )
    return [
      { label: 'Live courses', value: activeCourses, format: 'number' },
      { label: 'Total learners', value: totalLearners, format: 'number' },
      { label: 'Lifetime earnings', value: overview.totalEarnings, format: 'currency' },
    ]
  }, [overview])

  if (loading) {
    return <div className="px-6 py-12 text-center text-slate-500">Loading instructor dashboard...</div>
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 lg:flex-row">
      <aside className="flex flex-col gap-6 lg:w-72">
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-lg font-semibold text-red-700">
              {getInitials(user?.fullName || user?.userName)}
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Profile</p>
              <p className="font-semibold text-slate-900">{user?.fullName}</p>
            </div>
          </div>
          <dl className="mt-5 space-y-2 text-sm text-slate-500">
            <div>
              <dt className="text-xs uppercase tracking-[0.2em] text-slate-400">Username</dt>
              <dd className="font-medium text-slate-900">{user?.userName}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.2em] text-slate-400">Email</dt>
              <dd className="font-medium text-slate-900 break-words">{user?.email}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Launch a new cohort whenever you&apos;re ready.</p>
          <Button className="mt-4 w-full" onClick={() => navigate('/dashboard/instructor/new-course')}>
            New course
          </Button>
          <Button variant="outline" className="mt-2 w-full" onClick={fetchDashboard}>
            Refresh stats
          </Button>
        </div>
      </aside>

      <div className="flex-1 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Instructor HQ</p>
            <h1 className="text-3xl font-semibold text-slate-900">Your teaching snapshot</h1>
            <p className="text-sm text-slate-500">Monitor course performance and launch new cohorts.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/dashboard/instructor/new-course')}>
              Launch course
            </Button>
            <Button onClick={fetchDashboard}>Refresh</Button>
          </div>
        </div>

        <StatsGrid stats={stats} />

        <DashboardSection title="Your courses" description="Track engagement and earnings per course.">
          {overview.courses.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {overview.courses.map((course) => (
                <CourseCard
                  key={course.courseId}
                  course={{
                    ...course,
                    title: course.title,
                    description: `Enrolled students: ${course.studentsEnrolled}`,
                  }}
                  primaryLabel="Manage course"
                  meta={{
                    students: course.studentsEnrolled,
                    earnings: course.earningsFromThisCourse,
                  }}
                  onPrimary={() => navigate(`/dashboard/instructor/course/${course.courseId}`)}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No courses yet. Launch your first course today.</p>
          )}
        </DashboardSection>

        <DashboardSection title="Earnings insights" description="Understand which courses perform the best.">
          {earningsBreakdown.length ? (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={earningsBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="title" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="totalEarning" fill="#dc2626" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-slate-500">No earnings data yet.</p>
          )}
        </DashboardSection>
      </div>
    </div>
  )
}

