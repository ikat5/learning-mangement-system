import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { instructorService } from '../services/api.js'
import { ResourceList } from '../components/dashboard/ResourceList.jsx'
import { Button } from '../components/ui/button.jsx'
import { useToast } from '../hooks/useToast.js'

export const InstructorVideoPlayer = () => {
  const { courseId, videoId } = useParams()
  const [course, setCourse] = useState(null)
  const [video, setVideo] = useState(null)
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const data = await instructorService.courseDetails(courseId)
        setCourse(data)
        const found = (data?.videos || []).find(
          (item) => item.videoId === videoId || item._id === videoId,
        )
        setVideo(found || data?.videos?.[0] || null)
      } catch (err) {
        showToast({
          type: 'error',
          title: 'Unable to load video',
          message: err.message,
        })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [courseId, videoId, showToast])

  if (loading) {
    return <div className="px-6 py-12 text-center text-slate-500">Preparing player...</div>
  }

  if (!course || !video) {
    return (
      <div className="px-6 py-12 text-center text-slate-500">
        Video not found.
        <div className="mt-4">
          <Button onClick={() => navigate(`/dashboard/instructor/course/${courseId}`)}>
            Back to course
          </Button>
        </div>
      </div>
    )
  }

  const currentVideoId = video.videoId || video._id

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Now previewing</p>
          <h1 className="text-2xl font-semibold text-slate-900">{video.title}</h1>
          <p className="text-sm text-slate-500">{course.title}</p>
        </div>
        <Button variant="ghost" onClick={() => navigate(`/dashboard/instructor/course/${courseId}`)}>
          Back to course
        </Button>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="aspect-video w-full overflow-hidden rounded-2xl bg-slate-900">
          <video
            key={video.videoId || video._id}
            controls
            className="h-full w-full object-cover"
            src={video.url}
          >
            Your browser does not support the video tag.
          </video>
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-[2fr,1fr]">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">All lessons</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {(course.videos || []).map((item) => {
                const itemId = item.videoId || item._id
                return (
                <Button
                  key={itemId}
                  variant={itemId === currentVideoId ? 'default' : 'outline'}
                  onClick={() =>
                    navigate(`/dashboard/instructor/course/${courseId}/video/${item.videoId || item._id}`)
                  }
                >
                  {item.title}
                </Button>
              )})}
            </div>
          </div>
          <div>
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


