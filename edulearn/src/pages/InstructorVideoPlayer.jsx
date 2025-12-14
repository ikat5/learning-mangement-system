import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { instructorService } from '../services/api.js'
import { ResourceList } from '../components/dashboard/ResourceList.jsx'
import { Button } from '../components/ui/button.jsx'
import { Modal } from '../components/ui/modal.jsx'
import { Input } from '../components/ui/input.jsx'
import { useToast } from '../hooks/useToast.js'

export const InstructorVideoPlayer = () => {
  const { courseId, videoId } = useParams()
  const [course, setCourse] = useState(null)
  const [video, setVideo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [videoFiles, setVideoFiles] = useState([])
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

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || [])
    const videoFilesWithDuration = []

    for (const file of files) {
      const duration = await getVideoDuration(file)
      videoFilesWithDuration.push({
        file,
        title: file.name.replace(/\.[^/.]+$/, ''),
        duration: Math.round(duration),
      })
    }

    setVideoFiles(videoFilesWithDuration)
  }

  const getVideoDuration = (file) => {
    return new Promise((resolve) => {
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src)
        resolve(video.duration)
      }
      video.onerror = () => {
        resolve(0)
      }
      video.src = URL.createObjectURL(file)
    })
  }

  const handleVideoMetadataChange = (index, field, value) => {
    setVideoFiles((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v)),
    )
  }

  const handleUpload = async () => {
    if (!videoFiles.length) {
      showToast({
        type: 'error',
        title: 'No videos selected',
        message: 'Please select at least one video file',
      })
      return
    }

    const hasInvalidData = videoFiles.some((v) => !v.title || v.duration <= 0)
    if (hasInvalidData) {
      showToast({
        type: 'error',
        title: 'Invalid video data',
        message: 'Please provide title and duration for all videos',
      })
      return
    }

    try {
      setUploading(true)
      const formData = new FormData()

      videoFiles.forEach((v) => {
        formData.append('files', v.file)
      })

      formData.append('videoTitles', JSON.stringify(videoFiles.map((v) => v.title)))
      formData.append('videoDurations', JSON.stringify(videoFiles.map((v) => Number(v.duration))))

      await instructorService.addVideos(courseId, formData)

      showToast({
        type: 'success',
        title: 'Videos uploaded',
        message: 'Your videos have been uploaded successfully',
      })

      setShowUploadModal(false)
      setVideoFiles([])

      // Reload course data
      const data = await instructorService.courseDetails(courseId)
      setCourse(data)
      const found = (data?.videos || []).find(
        (item) => item.videoId === videoId || item._id === videoId,
      )
      setVideo(found || data?.videos?.[0] || null)
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Upload failed',
        message: err.message,
      })
    } finally {
      setUploading(false)
    }
  }

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
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowUploadModal(true)}>
            Upload videos
          </Button>
          <Button variant="ghost" onClick={() => navigate(`/dashboard/instructor/course/${courseId}`)}>
            Back to course
          </Button>
        </div>
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

      <Modal
        open={showUploadModal}
        onClose={() => {
          setShowUploadModal(false)
          setVideoFiles([])
        }}
        title="Upload videos"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setShowUploadModal(false)
                setVideoFiles([])
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={uploading || !videoFiles.length}>
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Select video files
            </label>
            <input
              type="file"
              accept="video/*"
              multiple
              onChange={handleFileChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
            />
            <p className="mt-1 text-xs text-slate-500">You can select multiple video files</p>
          </div>

          {videoFiles.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-700">Video details</p>
              {videoFiles.map((video, index) => {
                const seconds = video.duration || 0
                const hours = Math.floor(seconds / 3600)
                const minutes = Math.floor((seconds % 3600) / 60)
                const secs = Math.floor(seconds % 60)
                const durationText = hours > 0 
                  ? `${hours}h ${minutes}m ${secs}s`
                  : minutes > 0 
                  ? `${minutes}m ${secs}s` 
                  : `${secs}s`
                
                return (
                  <div key={index} className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-medium text-slate-600">Video {index + 1}</p>
                    <Input
                      type="text"
                      placeholder="Video title"
                      value={video.title}
                      onChange={(e) => handleVideoMetadataChange(index, 'title', e.target.value)}
                    />
                    <div className="rounded-lg bg-slate-100 px-3 py-2">
                      <p className="text-xs text-slate-600">Duration: <span className="font-medium text-slate-900">{durationText}</span></p>
                      <p className="text-xs text-slate-500 mt-1">Auto-detected from video file</p>
                    </div>
                    <p className="text-xs text-slate-500">File: {video.file.name}</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}




