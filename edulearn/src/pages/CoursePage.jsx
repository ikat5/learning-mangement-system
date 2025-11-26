import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { courseService } from '../services/api.js'
import { Button } from '../components/ui/button.jsx'
import { Badge } from '../components/ui/badge.jsx'
import { currency } from '../utils/formatters.js'
import { useAuth } from '../hooks/useAuth.js'
import { useToast } from '../hooks/useToast.js'
import { PurchaseCourseModal } from '../components/learner/PurchaseCourseModal.jsx'

export const CoursePage = () => {
  const { courseId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const { showToast } = useToast()
  const previewCourse = useMemo(() => location.state?.preview, [location.state])
  const [course, setCourse] = useState(previewCourse || null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(!course)
  const [purchaseOpen, setPurchaseOpen] = useState(false)

  useEffect(() => {
    const loadDetail = async () => {
      try {
        setLoading(true)
        const list = await courseService.getAll()
        const found = (list || []).find((item) => item._id === courseId)
        setCourse(found || previewCourse || null)
      } catch (err) {
        showToast({
          type: 'error',
          title: 'Unable to load course',
          message: err.message,
        })
      } finally {
        setLoading(false)
      }
    }
    if (!course) {
      loadDetail()
    }
  }, [courseId, course, previewCourse, showToast])

  useEffect(() => {
    const loadRelated = async () => {
      try {
        const trending = await courseService.getMostViewed(3)
        setRelated(trending || [])
      } catch (err) {
        console.error(err)
      }
    }
    loadRelated()
  }, [])

  const handleStart = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } })
      return
    }
    if (user?.role === 'Learner') {
      setPurchaseOpen(true)
    } else {
      showToast({
        type: 'info',
        title: 'Learner only',
        message: 'Switch to your learner account to watch this course.',
      })
    }
  }

  const handlePurchaseSuccess = () => {
    setPurchaseOpen(false)
    navigate('/dashboard/learner/courses', { replace: true })
  }

  if (loading) {
    return <div className="px-6 py-12 text-center text-slate-500">Loading course details...</div>
  }

  if (!course) {
    return (
      <div className="px-6 py-12 text-center text-slate-500">
        Course not found. Please go back to the catalog.
        <div className="mt-4">
          <Button onClick={() => navigate('/')}>Back home</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <Badge variant="outline" className="mb-3">
          {course.totalVideos || 0} lessons
        </Badge>
        <h1 className="text-4xl font-semibold text-slate-900">{course.title}</h1>
        <p className="mt-4 max-w-3xl text-lg text-slate-600">{course.description}</p>
        <p className="mt-4 text-sm text-slate-500">
          Instructor:{' '}
          {course.instructor?.fullName ||
            course.instructor?.name ||
            course.instructor?.username ||
            'Instructor'}
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Tuition</p>
            <p className="text-3xl font-semibold text-slate-900">{currency(course.price)}</p>
          </div>
          <Button className="min-w-[200px]" onClick={handleStart}>
            {isAuthenticated && user?.role === 'Learner' ? 'Buy course' : 'Start learning'}
          </Button>
          <Button variant="outline" onClick={() => navigate('/dashboard/learner/buy')}>
            Explore all buyable courses
          </Button>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-semibold text-slate-900">You may also like</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {related.map((item) => (
            <div
              key={item._id}
              className="rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                {item.totalVideos || 0} lessons
              </p>
              <p className="mt-2 font-semibold text-slate-900">{item.title}</p>
              <p className="text-sm text-slate-500 line-clamp-3">{item.description}</p>
              <Button
                variant="ghost"
                className="mt-3 px-0 text-indigo-600"
                onClick={() => navigate(`/courses/${item._id}`, { state: { preview: item } })}
              >
                View details
              </Button>
            </div>
          ))}
        </div>
      </div>

      <PurchaseCourseModal
        course={course}
        open={purchaseOpen}
        onClose={() => setPurchaseOpen(false)}
        onSuccess={handlePurchaseSuccess}
      />
    </div>
  )
}

