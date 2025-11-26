import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { learnerService } from '../services/api.js'
import { DashboardSection } from '../components/dashboard/DashboardSection.jsx'
import { CourseCard } from '../components/dashboard/CourseCard.jsx'
import { StatsGrid } from '../components/dashboard/StatsGrid.jsx'
import { Button } from '../components/ui/button.jsx'
import { useToast } from '../hooks/useToast.js'
import { useAuth } from '../hooks/useAuth.js'
import { getInitials } from '../utils/formatters.js'

export const LearnerDashboard = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const data = await learnerService.myCourses()
        setCourses(Array.isArray(data) ? data : [])
      } catch (err) {
        showToast({
          type: 'error',
          title: 'Unable to load courses',
          message: err.message,
        })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [showToast])

  const stats = useMemo(() => {
    if (!courses.length) {
      return [
        { label: 'Active Courses', value: 0, format: 'number' },
        { label: 'Completed', value: 0, format: 'number' },
        { label: 'Average Progress', value: 0, format: 'number', subtext: '% completed' },
      ]
    }
    const completed = courses.filter(
      (course) => (course.status || '').toLowerCase() === 'completed',
    )
    const avgProgress = Math.round(
      courses.reduce((sum, course) => sum + (course.progress_percentage || 0), 0) /
        courses.length,
    )
    return [
      { label: 'Active Courses', value: courses.length, format: 'number' },
      { label: 'Completed', value: completed.length, format: 'number' },
      { label: 'Average Progress', value: avgProgress, format: 'number', subtext: '% completed' },
    ]
  }, [courses])

  const inProgress = courses
    .filter((course) => (course.status || '').toLowerCase() !== 'completed')
    .slice(0, 3)
  const completedCourses = courses.filter(
    (course) => (course.status || '').toLowerCase() === 'completed',
  )

  const handleContinueCourse = (course) => {
    navigate(`/dashboard/learner/course/${course.courseId}`)
  }

  if (loading) {
    return <div className="px-6 py-12 text-center text-slate-500">Loading your dashboard...</div>
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 lg:flex-row">
      <aside className="flex flex-col gap-6 lg:w-72">
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-lg font-semibold text-indigo-700">
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

        <div className="rounded-3xl border border-indigo-100 bg-indigo-50 p-6 text-slate-900">
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-500">Need a new course?</p>
          <h3 className="mt-2 text-xl font-semibold">Buy another course</h3>
          <p className="mt-2 text-sm text-indigo-700">
            Browse all courses you haven&apos;t purchased yet and enroll instantly.
          </p>
          <Button className="mt-4 w-full" onClick={() => navigate('/dashboard/learner/buy')}>
            Buy course
          </Button>
        </div>
      </aside>

      <div className="flex-1 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Learner hub</p>
            <h1 className="text-3xl font-semibold text-slate-900">Welcome back!</h1>
            <p className="text-sm text-slate-500">Continue where you left off or start something new.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/dashboard/learner/courses')}>
              View All
            </Button>
            <Button onClick={() => navigate('/dashboard/learner/buy')}>Discover Courses</Button>
          </div>
        </div>

        <StatsGrid stats={stats} />

        <DashboardSection
          title="Continue learning"
          description="Pick up right where you stopped last time."
          action={
            <Button variant="ghost" onClick={() => navigate('/dashboard/learner/courses')}>
              Manage courses
            </Button>
          }
        >
          {inProgress.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {inProgress.map((course) => (
                <CourseCard
                  key={course.courseId}
                  course={course}
                  onPrimary={handleContinueCourse}
                  primaryLabel="Continue course"
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No active courses yet. Explore the catalog to begin.</p>
          )}
        </DashboardSection>

        <DashboardSection title="Completed certificates" description="Celebrate your wins.">
          {completedCourses.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {completedCourses.map((course) => (
                <CourseCard
                  key={course.courseId}
                  course={course}
                  onPrimary={handleContinueCourse}
                  primaryLabel="Revisit content"
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">Complete a course to unlock your first certificate.</p>
          )}
        </DashboardSection>
      </div>
    </div>
  )
}

