import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { learnerService } from '../services/api.js'
import { ResourceList } from '../components/dashboard/ResourceList.jsx'
import { Button } from '../components/ui/button.jsx'
import { useToast } from '../hooks/useToast.js'

export const LearnerVideoPlayer = () => {
  const { courseId, videoId } = useParams()
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const { showToast } = useToast()

  const [course, setCourse] = useState(null)
  const [video, setVideo] = useState(null)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const autosaveRef = useRef(null)

  // Load course content and find the video
  const load = useCallback(async () => {
    try {
      setLoading(true)
      const content = await learnerService.courseContent(courseId)
      setCourse(content?.course)
      const found = (content?.course?.videos || []).find(
        (v) => v._id === videoId || v.videoId === videoId,
      )
      setVideo(found || content?.course?.videos?.[0] || null)
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Unable to load video',
        message: err.message,
      })
    } finally {
      setLoading(false)
    }
  }, [courseId, showToast, videoId])

  // On mount: load course & video, and call updateProgress to mark that the user opened the video
  useEffect(() => {
    load()
  }, [load])

  // Call updateProgress once when page opens (to register start/open)
  useEffect(() => {
    if (!video) return
    let cancelled = false

    const registerOpen = async () => {
      try {
        setStatus('Registering video open...')
        await learnerService.updateProgress({
          courseId,
          videoId: video._id || video.videoId,
          currentTime: 0,
          completed: false,
        })
        if (!cancelled) setStatus('')
      } catch (err) {
        if (!cancelled) {
          const message = err.message || 'Failed to register progress'
          setStatus(message)
          showToast({
            type: 'error',
            title: 'Progress error',
            message,
          })
        }
      }
    }

    registerOpen()
    return () => {
      cancelled = true
    }
  }, [video, courseId, showToast])

  // Autosave handler: save every 30 seconds while playing
  useEffect(() => {
    if (!videoRef.current) return

    const videoEl = videoRef.current
    const saveProgress = async () => {
      if (!videoEl) return
      try {
        const currentTime = Math.floor(videoEl.currentTime || 0)
        await learnerService.updateProgress({
          courseId,
          videoId: video._id || video.videoId,
          currentTime,
          completed: false,
        })
      } catch (err) {
        console.error('Auto-save progress failed', err)
      }
    }

    // Set interval to save every 30 seconds if the video is playing
    autosaveRef.current = setInterval(() => {
      if (!videoEl) return
      if (!videoEl.paused && !videoEl.ended) {
        saveProgress().catch(console.error)
      }
    }, 30000)

    return () => {
      if (autosaveRef.current) clearInterval(autosaveRef.current)
    }
  }, [video, courseId])

  // When user clicks complete button (or video ends), mark as completed
  const markCompleted = async () => {
    if (!videoRef.current || !video) return
    try {
      setStatus('Updating progress...')
      await learnerService.updateProgress({
        courseId,
        videoId: video._id || video.videoId,
        currentTime: Math.floor(videoRef.current.currentTime || 0),
        completed: true,
      })
      setStatus('Progress updated successfully!')
      showToast({
        type: 'success',
        title: 'Course progress',
        message: 'Great job! This lesson is now marked completed.',
      })
      // Optionally navigate back to course page or refresh
      setTimeout(() => setStatus(''), 3000)
    } catch (err) {
      const message = err.message || 'Failed to update progress'
      setStatus(message)
      showToast({
        type: 'error',
        title: 'Progress update failed',
        message,
      })
      setTimeout(() => setStatus(''), 3000)
    }
  }

  if (loading) {
    return <div className="px-6 py-12 text-center text-slate-500">Loading video...</div>
  }

  if (!course || !video) {
    return <div className="px-6 py-12 text-center text-slate-500">Video not found</div>
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Now playing</p>
          <h1 className="text-2xl font-semibold text-slate-900">{video.title}</h1>
          <p className="text-sm text-slate-500">{course.title}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => navigate(`/courses/${courseId}`)}>Back to Course</Button>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="aspect-video w-full overflow-hidden rounded-2xl bg-slate-900">
          <video
            ref={videoRef}
            key={video._id || video.videoId}
            controls
            className="h-full w-full object-cover"
            onEnded={() => {
              // mark completed automatically if you want on ended
              markCompleted().catch(console.error)
            }}
            onTimeUpdate={async () => {
              // small optimization: don't call update on every frame; autosave handles periodic saves
              // but update UI if needed in future
            }}
          >
            <source src={video.url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Lesson</p>
            <p className="text-lg font-semibold text-slate-900">{video.title}</p>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={() => {
              // Quick-save current timestamp without marking complete
              if (!videoRef.current) return
              learnerService.updateProgress({
                courseId,
                videoId: video._id || video.videoId,
                currentTime: Math.floor(videoRef.current.currentTime || 0),
                completed: false,
              }).then(() => {
                setStatus('Progress saved')
                showToast({
                  type: 'success',
                  title: 'Progress saved',
                  message: 'We will resume from this timestamp next time.',
                })
              }).catch(err => {
                const message = err.message || 'Save failed'
                setStatus(message)
                showToast({
                  type: 'error',
                  title: 'Auto-save failed',
                  message,
                })
              })
              setTimeout(() => setStatus(''), 2000)
            }}>
              Save Progress
            </Button>

            <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={markCompleted}>
              Mark as Complete
            </Button>
          </div>
        </div>

        {status && (
          <div className={`mt-3 rounded-xl px-4 py-2 text-sm ${status.includes('successfully') ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
            {status}
          </div>
        )}

        <div className="mt-6">
          <h3 className="mb-3 text-lg font-semibold text-slate-900">Resources</h3>
          {course.resources?.length > 0 ? (
            <ResourceList resources={course.resources} />
          ) : (
            <p className="text-sm text-slate-500">No resources available for this lesson.</p>
          )}
        </div>
      </div>
    </div>
  )
}
