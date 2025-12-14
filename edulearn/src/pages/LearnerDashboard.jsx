import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { learnerService } from '../services/api.js'
import { DashboardSection } from '../components/dashboard/DashboardSection.jsx'
import { StatsGrid } from '../components/dashboard/StatsGrid.jsx'
import { Button } from '../components/ui/button.jsx'
import { useToast } from '../hooks/useToast.js'
import { useAuth } from '../hooks/useAuth.js'
import { getInitials } from '../utils/formatters.js'
import { CircularProgress } from '../components/ui/CircularProgress.jsx'
import { Clock, CheckCircle } from 'lucide-react'

const ContinueLearningCard = ({ course, onContinue }) => (
  <div className="relative flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-lg transition-transform hover:scale-[1.02]">
    <div className="flex-1">
      <p className="text-xs uppercase tracking-[0.3em] text-cyan-700">
        Continue where you left off
      </p>
      <h3 className="mt-2 text-2xl font-bold text-slate-900">{course.title}</h3>
      <p className="mt-1 text-sm text-slate-500">
        You are {Math.round(course.progress_percentage || 0)}% through this course.
      </p>
    </div>
    <div className="mt-6 flex items-end justify-between">
      <CircularProgress value={course.progress_percentage || 0} size={80} strokeWidth={8} />
      <Button onClick={() => onContinue(course)}>Jump back in</Button>
    </div>
  </div>
)

const EnrolledCourseCard = ({ course, onContinue }) => (
  <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
    <CircularProgress value={course.progress_percentage || 0} size={60} strokeWidth={6} />
    <div className="flex-1">
      <h4 className="font-semibold text-slate-800">{course.title}</h4>
      <p className="text-sm text-slate-500">{course.instructorName}</p>
    </div>
    <Button size="sm" variant="outline" onClick={() => onContinue(course)}>
      {course.progress_percentage > 99 ? 'Revisit' : 'Continue'}
    </Button>
  </div>
)

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
        // Sort by last viewed (most recent first)
        const sorted = (Array.isArray(data) ? data : []).sort(
          (a, b) => new Date(b.last_accessed_at) - new Date(a.last_accessed_at),
        )
        setCourses(sorted)
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

  const { lastViewed, otherInProgress, completedCourses } = useMemo(() => {
    const inProgress = courses.filter(
      (course) => (course.status || '').toLowerCase() !== 'completed',
    )
    const completed = courses.filter(
      (course) => (course.status || '').toLowerCase() === 'completed',
    )

    return {
      lastViewed: inProgress[0] || null,
      otherInProgress: inProgress.slice(1),
      completedCourses: completed,
    }
  }, [courses])

  const stats = useMemo(() => {
    if (!courses.length) {
      return [
        { label: 'Enrolled Courses', value: 0, format: 'number' },
        { label: 'Completed', value: 0, format: 'number' },
        { label: 'Avg. Progress', value: 0, format: 'percent' },
      ]
    }
    const avgProgress =
      courses.reduce((sum, course) => sum + (course.progress_percentage || 0), 0) /
      courses.length
    return [
      { label: 'Enrolled Courses', value: courses.length, format: 'number' },
      { label: 'Completed', value: completedCourses.length, format: 'number' },
      { label: 'Avg. Progress', value: avgProgress, format: 'percent' },
    ]
  }, [courses, completedCourses])

  const handleContinueCourse = (course) => {
    // If a specific video was last watched, go there, otherwise go to the course page
    const url = course.last_watched_video_id
      ? `/dashboard/learner/course/${course.courseId}/video/${course.last_watched_video_id}`
      : `/dashboard/learner/course/${course.courseId}`
    navigate(url)
  }

  if (loading) {
    return <div className="px-6 py-12 text-center text-slate-500">Loading your dashboard...</div>
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-12 lg:flex-row">
      {/* Left Sidebar */}
      <aside className="flex flex-col gap-6 lg:w-80">
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-100 text-lg font-semibold text-cyan-800">
              {getInitials(user?.fullName || user?.userName)}
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Learner</p>
              <p className="font-semibold text-slate-900">{user?.fullName}</p>
            </div>
          </div>
          <dl className="mt-5 space-y-2 text-sm text-slate-500">
            <div>
              <dt className="text-xs uppercase tracking-[0.2em] text-slate-400">Username</dt>
              <dd className="font-medium text-slate-900">{user?.userName}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-3xl border border-cyan-200 bg-cyan-50 p-6 text-slate-900">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-700">Expand your skills</p>
          <h3 className="mt-2 text-xl font-semibold">Discover new courses</h3>
          <p className="mt-2 text-sm text-cyan-800">
            Browse our catalog and find your next learning adventure.
          </p>
          <Button className="mt-4 w-full" onClick={() => navigate('/dashboard/learner/buy')}>
            Explore Courses
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 space-y-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Welcome back!</h1>
            <p className="mt-1 text-slate-500">
              Your learning journey is looking great. Let&apos;s keep the momentum going.
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate('/dashboard/learner/certificates')}>
            View certificates
          </Button>
        </div>

        <StatsGrid stats={stats} />

        {/* Continue Learning Section */}
        {lastViewed && (
          <div>
            <h2 className="mb-4 text-2xl font-bold text-slate-800">Continue Learning</h2>
            <ContinueLearningCard course={lastViewed} onContinue={handleContinueCourse} />
          </div>
        )}

        {/* Other In-Progress Courses */}
        {otherInProgress.length > 0 && (
          <DashboardSection
            title="Your Active Courses"
            description="Keep making progress in your other enrolled courses."
            icon={<Clock className="text-slate-500" />}
          >
            <div className="grid grid-cols-1 gap-4">
              {otherInProgress.map((course) => (
                <EnrolledCourseCard
                  key={course.courseId}
                  course={course}
                  onContinue={handleContinueCourse}
                />
              ))}
            </div>
          </DashboardSection>
        )}

        {/* Completed Courses */}
        {completedCourses.length > 0 && (
          <DashboardSection
            title="Completed Courses"
            description="Congratulations on your achievements!"
            icon={<CheckCircle className="text-emerald-500" />}
          >
            <div className="grid grid-cols-1 gap-4">
              {completedCourses.map((course) => (
                <EnrolledCourseCard
                  key={course.courseId}
                  course={course}
                  onContinue={handleContinueCourse}
                />
              ))}
            </div>
          </DashboardSection>
        )}

        {!courses.length && (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
            <h3 className="text-xl font-semibold text-slate-800">Your dashboard is empty!</h3>
            <p className="mt-2 text-slate-500">
              It looks like you haven&apos;t enrolled in any courses yet.
            </p>
            <Button className="mt-6" onClick={() => navigate('/dashboard/learner/buy')}>
              Find Your First Course
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

