import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { learnerService } from '../services/api.js'
import { Button } from '../components/ui/button.jsx'
import { Progress } from '../components/ui/progress.jsx'
import { ResourceList } from '../components/dashboard/ResourceList.jsx'

export const CoursePage = () => {
  const { courseId } = useParams()
  const [course, setCourse] = useState(null)
  const [activeVideo, setActiveVideo] = useState(null)
  const [status, setStatus] = useState('')
  const [overallProgress, setOverallProgress] = useState(0)

  const loadCourse = async () => {
    const content = await learnerService.courseContent(courseId)
    setCourse(content?.course)
    setActiveVideo(content?.course?.videos?.[0])
    setOverallProgress(content?.yourProgress || 0)
  }

  useEffect(() => {
    loadCourse()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId])

  const markProgress = async (completed) => {
    if (!activeVideo) return
    try {
      await learnerService.updateProgress({
        courseId,
        videoId: activeVideo._id,
        currentTime: completed ? activeVideo.duration_seconds : 0,
        completed,
      })
      setStatus('Progress updated')
      loadCourse()
    } catch (err) {
      setStatus(err.message)
    } finally {
      setTimeout(() => setStatus(''), 2000)
    }
  }

  if (!course) {
    return <div className="px-6 py-12 text-center text-slate-500">Loading course...</div>
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Now learning</p>
            <h1 className="text-3xl font-semibold text-slate-900">{course.title}</h1>
            <p className="text-slate-600">{course.description}</p>
          </div>
          <div className="rounded-3xl border border-white/40 bg-white/80 p-5 shadow-lg">
            {activeVideo ? (
              <>
                <div className="aspect-video w-full overflow-hidden rounded-2xl bg-slate-900">
                  <video key={activeVideo._id} controls className="h-full w-full object-cover">
                    <source src={activeVideo.url} type="video/mp4" />
                  </video>
                </div>
                <div className="mt-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Lesson</p>
                    <p className="text-lg font-semibold text-slate-900">{activeVideo.title}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="soft" onClick={() => markProgress(false)}>
                      Save Progress
                    </Button>
                    <Button onClick={() => markProgress(true)}>Mark Completed</Button>
                  </div>
                </div>
                {status && (
                  <p className="text-sm text-emerald-600" role="status">
                    {status}
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-slate-500">No videos uploaded yet.</p>
            )}
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/40 bg-white/80 p-5 shadow">
            <h3 className="text-lg font-semibold text-slate-900">Course Outline</h3>
            <div className="mt-4 space-y-3">
              {course.videos?.map((video, index) => (
                <button
                  type="button"
                  key={video._id}
                  onClick={() => setActiveVideo(video)}
                  className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left ${
                    activeVideo?._id === video._id
                      ? 'border-indigo-200 bg-indigo-50'
                      : 'border-slate-100 bg-white'
                  }`}
                >
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{video.title}</p>
                    <p className="text-xs text-slate-500">{Math.round(video.duration_seconds / 60)} min</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-white/40 bg-white/80 p-5 shadow">
            <h3 className="text-lg font-semibold text-slate-900">Progress</h3>
            <div className="mt-4">
              <Progress value={overallProgress} />
              <p className="mt-2 text-sm text-slate-500">{overallProgress}% complete</p>
            </div>
          </div>
          <div className="rounded-3xl border border-white/40 bg-white/80 p-5 shadow">
            <h3 className="text-lg font-semibold text-slate-900">Resources</h3>
            {course.resources?.length ? (
              <ResourceList resources={course.resources} />
            ) : (
              <p className="text-sm text-slate-500">Resources will appear here.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

