import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { instructorService } from '../services/api.js'
import { Button } from '../components/ui/button.jsx'
import { ResourceList } from '../components/dashboard/ResourceList.jsx'
import { useToast } from '../hooks/useToast.js'

export const InstructorCoursePage = () => {
  const { courseId } = useParams()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const data = await instructorService.courseDetails(courseId)
        setCourse(data)
      } catch (err) {
        showToast({
          type: 'error',
          title: 'Unable to fetch course',
          message: err.message,
        })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [courseId, showToast])

  if (loading) {
    return <div className="px-6 py-12 text-center text-slate-500">Loading course details...</div>
  }

  if (!course) {
    return (
      <div className="px-6 py-12 text-center text-slate-500">
        Course not found. Please go back to your dashboard.
        <div className="mt-4">
          <Button onClick={() => navigate('/dashboard/instructor')}>Back</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="max-w-2xl space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Course management</p>
          <h1 className="text-3xl font-semibold text-slate-900">{course.title}</h1>
          <p className="text-sm text-slate-500">{course.description}</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            disabled={!course.videos?.length}
            onClick={() =>
              course.videos?.length &&
              navigate(
                `/dashboard/instructor/course/${courseId}/video/${
                  course.videos?.[0]?.videoId || course.videos?.[0]?._id
                }`,
              )
            }
          >
            Preview first lesson
          </Button>
          <Button onClick={() => navigate('/dashboard/instructor')}>Back to dashboard</Button>
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[2fr,1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Published lessons</h2>
            <p className="text-sm text-slate-500">{course.totalVideos || 0} videos</p>
          </div>
          <div className="mt-6 space-y-4">
            {(course.videos || []).map((video) => (
              <div
                key={video.videoId || video._id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">{video.title}</p>
                  <p className="text-xs text-slate-500">
                    Duration: {Math.round((video.duration_seconds || 0) / 60)} mins
                  </p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() =>
                    navigate(
                      `/dashboard/instructor/course/${courseId}/video/${video.videoId || video._id}`,
                    )
                  }
                >
                  Open
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Key metrics</h3>
            <dl className="mt-4 space-y-3 text-sm text-slate-500">
              <div className="flex items-center justify-between">
                <dt>Students enrolled</dt>
                <dd className="font-semibold text-slate-900">{course.totalEnrolled}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>Total earnings (80%)</dt>
                <dd className="font-semibold text-slate-900">${course.instructorEarnings}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>Resources</dt>
                <dd className="font-semibold text-slate-900">{course.totalResources}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Resources</h3>
            {course.resources?.length ? (
              <div className="mt-4">
                <ResourceList resources={course.resources} />
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-500">No resources uploaded.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

