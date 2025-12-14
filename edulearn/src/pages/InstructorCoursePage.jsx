import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { instructorService } from '../services/api.js'
import { Button } from '../components/ui/button.jsx'
import { ResourceList } from '../components/dashboard/ResourceList.jsx'
import { Modal } from '../components/ui/modal.jsx'
import { Input } from '../components/ui/input.jsx'
import { useToast } from '../hooks/useToast.js'

export const InstructorCoursePage = () => {
  const { courseId } = useParams()
  const [course, setCourse] = useState(null)
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
          <div className="mt-2">
            <label htmlFor="thumb-upload" className="cursor-pointer text-xs font-medium text-cyan-700 hover:text-cyan-800 hover:underline">
              Change Thumbnail
            </label>
            <input
              id="thumb-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                if (e.target.files?.[0]) {
                  try {
                    const fd = new FormData()
                    fd.append('thumbnail', e.target.files[0])
                    await instructorService.updateThumbnail(courseId, fd)
                    showToast({ type: 'success', title: 'Thumbnail updated', message: 'Course thumbnail updated successfully' })
                    // Reload
                    const data = await instructorService.courseDetails(courseId)
                    setCourse(data)
                  } catch (err) {
                    showToast({ type: 'error', title: 'Update failed', message: err.message })
                  }
                }
              }}
            />
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setShowUploadModal(true)}>
            Upload videos
          </Button>
          <Button
            variant="outline"
            disabled={!course.videos?.length}
            onClick={() =>
              course.videos?.length &&
              navigate(
                `/dashboard/instructor/course/${courseId}/video/${course.videos?.[0]?.videoId || course.videos?.[0]?._id
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
                  <p className="text-xs text-slate-500">Published lesson</p>
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

                return (
                  <div key={index} className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-medium text-slate-600">Video {index + 1}</p>
                    <Input
                      type="text"
                      placeholder="Video title"
                      value={video.title}
                      onChange={(e) => handleVideoMetadataChange(index, 'title', e.target.value)}
                    />
                    {/* Duration is auto-detected but not displayed per requirements */}
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

