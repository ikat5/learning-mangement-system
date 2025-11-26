import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { learnerService } from '../services/api.js'
import { Button } from '../components/ui/button.jsx'
import { Progress } from '../components/ui/progress.jsx'
import { ResourceList } from '../components/dashboard/ResourceList.jsx'
import { useToast } from '../hooks/useToast.js'

export const LearnerCoursePage = () => {
  const { courseId } = useParams()
  const [course, setCourse] = useState(null)
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { showToast } = useToast()

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const data = await learnerService.courseContent(courseId)
        setCourse(data?.course)
        setProgress(data?.yourProgress || 0)
      } catch (err) {
        showToast({
          type: 'error',
          title: 'Unable to open course',
          message: err.message,
        })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [courseId, showToast])

  if (loading) {
    return <div className="px-6 py-12 text-center text-slate-500">Loading course...</div>
  }

  if (!course) {
    return (
      <div className="px-6 py-12 text-center text-slate-500">
        Course not found. Please return to your dashboard.
        <div className="mt-4">
          <Button variant="outline" onClick={() => navigate('/dashboard/learner')}>
            Back to dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="max-w-2xl space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Enrolled course</p>
          <h1 className="text-3xl font-semibold text-slate-900">{course.title}</h1>
          <p className="text-sm text-slate-500">{course.description}</p>
          <p className="text-xs text-slate-400">Instructor: {course.instructor?.fullName}</p>
        </div>
        <div className="min-w-[220px] rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs text-slate-500">Overall progress</p>
          <p className="mt-1 text-3xl font-semibold text-slate-900">{progress}%</p>
          <Progress className="mt-3" value={progress} />
          <Button className="mt-4 w-full" onClick={() => navigate('/dashboard/learner/courses')}>
            Manage courses
          </Button>
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[2fr,1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Video lessons</h2>
            <p className="text-sm text-slate-500">{course.videos?.length || 0} lessons</p>
          </div>
          <div className="mt-6 space-y-4">
            {(course.videos || []).length ? (
              (course.videos || []).map((video) => (
                <div
                  key={video._id || video.videoId}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">{video.title}</p>
                    <p className="text-xs text-slate-500">
                      {Math.round((video.duration_seconds || 0) / 60)} mins •{' '}
                      {video.completed ? 'Completed' : 'Not completed'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      onClick={() =>
                        navigate(
                          `/dashboard/learner/course/${courseId}/video/${video._id || video.videoId}`,
                        )
                      }
                    >
                      Open
                    </Button>
                    {video.completed && (
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                        Completed
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No lessons have been uploaded for this course yet.</p>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Resources</h3>
          {course.resources?.length ? (
            <div className="mt-4">
              <ResourceList resources={course.resources} />
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-500">No extra resources yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}

