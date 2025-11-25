import { useEffect, useState } from 'react'
import { DashboardSection } from '../components/dashboard/DashboardSection.jsx'
import { CourseCard } from '../components/dashboard/CourseCard.jsx'
import { StatsGrid } from '../components/dashboard/StatsGrid.jsx'
import { Button } from '../components/ui/button.jsx'
import { Input } from '../components/ui/input.jsx'
import { Textarea } from '../components/ui/textarea.jsx'
import { Badge } from '../components/ui/badge.jsx'
import { courseService, instructorService } from '../services/api.js'

export const InstructorDashboard = () => {
  const [launchForm, setLaunchForm] = useState({
    title: '',
    description: '',
    price: '',
    lumpSumPayment: '',
    videoTitles: '',
    videoDurations: '',
  })
  const [files, setFiles] = useState([])
  const [stats, setStats] = useState({ courses: [], totalEarnings: 0 })
  const [catalog, setCatalog] = useState([])
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [courseDetails, setCourseDetails] = useState(null)
  const [students, setStudents] = useState([])
  const [resourceForm, setResourceForm] = useState({ title: '', mediaType: 'document_link', url: '' })

  const fetchStats = async () => {
    const data = await instructorService.stats()
    setStats(data)
    if (data.courses?.length && !selectedCourseId) {
      setSelectedCourseId(data.courses[0].courseId)
    }
  }

  useEffect(() => {
    fetchStats()
    courseService.getAll().then(setCatalog)
  }, [])

  useEffect(() => {
    if (!selectedCourseId) return
    instructorService.courseDetails(selectedCourseId).then(setCourseDetails)
    instructorService.approvedStudents(selectedCourseId).then(setStudents)
  }, [selectedCourseId])

  const handleLaunch = async (event) => {
    event.preventDefault()
    const formData = new FormData()
    formData.append('title', launchForm.title)
    formData.append('description', launchForm.description)
    formData.append('price', launchForm.price)
    formData.append('lumpSumPayment', launchForm.lumpSumPayment)
    files.forEach((file) => formData.append('files', file))
    formData.append('videoTitles', JSON.stringify(launchForm.videoTitles.split(',').map((item) => item.trim())))
    formData.append(
      'videoDurations',
      JSON.stringify(launchForm.videoDurations.split(',').map((item) => Number(item.trim()))),
    )
    await instructorService.createCourse(formData)
    setLaunchForm({
      title: '',
      description: '',
      price: '',
      lumpSumPayment: '',
      videoTitles: '',
      videoDurations: '',
    })
    setFiles([])
    fetchStats()
  }

  const handleAddResource = async () => {
    if (!selectedCourseId) return
    await instructorService.addResources(selectedCourseId, { resources: [resourceForm] })
    setResourceForm({ title: '', mediaType: 'document_link', url: '' })
    const refreshed = await instructorService.courseDetails(selectedCourseId)
    setCourseDetails(refreshed)
  }

  const handleDeleteVideo = async (videoId) => {
    await instructorService.deleteVideo(selectedCourseId, videoId)
    setCourseDetails(await instructorService.courseDetails(selectedCourseId))
  }

  const handleDeleteResource = async (resourceId) => {
    await instructorService.deleteResource(selectedCourseId, resourceId)
    setCourseDetails(await instructorService.courseDetails(selectedCourseId))
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12">
      <StatsGrid
        stats={[
          { label: 'Total earnings', value: stats.totalEarnings, format: 'currency' },
          { label: 'Courses live', value: stats.courses?.length || 0, format: 'number' },
          {
            label: 'Top course students',
            value: stats.courses?.[0]?.studentsEnrolled || 0,
            format: 'number',
          },
        ]}
      />

      <DashboardSection title="Launch Course" description="Upload content and resources in one go.">
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleLaunch}>
          {['title', 'description', 'price', 'lumpSumPayment'].map((field) => (
            <div key={field} className={field === 'description' ? 'md:col-span-2 space-y-2' : 'space-y-2'}>
              <label className="text-sm font-medium text-slate-600" htmlFor={field}>
                {field === 'lumpSumPayment' ? 'Lump Sum Payment' : field.charAt(0).toUpperCase() + field.slice(1)}
              </label>
              {field === 'description' ? (
                <Textarea
                  id={field}
                  rows="3"
                  required
                  value={launchForm[field]}
                  onChange={(e) => setLaunchForm((prev) => ({ ...prev, [field]: e.target.value }))}
                />
              ) : (
                <Input
                  id={field}
                  required
                  value={launchForm[field]}
                  onChange={(e) => setLaunchForm((prev) => ({ ...prev, [field]: e.target.value }))}
                />
              )}
            </div>
          ))}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600" htmlFor="videoTitles">
              Video Titles (comma separated)
            </label>
            <Input
              id="videoTitles"
              required
              value={launchForm.videoTitles}
              onChange={(e) => setLaunchForm((prev) => ({ ...prev, videoTitles: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600" htmlFor="videoDurations">
              Durations (seconds, comma separated)
            </label>
            <Input
              id="videoDurations"
              required
              value={launchForm.videoDurations}
              onChange={(e) => setLaunchForm((prev) => ({ ...prev, videoDurations: e.target.value }))}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-slate-600" htmlFor="files">
              Upload Videos
            </label>
            <input
              id="files"
              type="file"
              multiple
              accept="video/*"
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
            />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" className="w-full">
              Launch Course
            </Button>
          </div>
        </form>
      </DashboardSection>

      <DashboardSection title="My Courses" description="Monitor performance and earnings.">
        <div className="grid gap-4 md:grid-cols-2">
          {stats.courses?.map((course) => (
            <CourseCard
              key={course.courseId}
              course={course}
              primaryLabel="View Details"
              onPrimary={() => setSelectedCourseId(course.courseId)}
              meta={{ students: course.studentsEnrolled, earnings: course.earningsFromThisCourse }}
            />
          ))}
        </div>
      </DashboardSection>

      <DashboardSection title="See Other Courses" description="Understand what’s trending platform-wide.">
        <div className="grid gap-4 md:grid-cols-3">
          {catalog.slice(0, 6).map((course) => (
            <div key={course._id} className="rounded-2xl border border-slate-100 bg-white p-4">
              <p className="text-sm font-semibold text-slate-900">{course.title}</p>
              <p className="text-xs text-slate-500">{course.description}</p>
              <Badge className="mt-3 w-fit">{course.enrolledStudents} learners</Badge>
            </div>
          ))}
        </div>
      </DashboardSection>

      <DashboardSection
        title="Students Enrolled"
        description="Every learner who purchased your course (approved)."
        action={
          <select
            className="rounded-full border border-slate-200 px-4 py-1 text-sm"
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
          >
            {stats.courses?.map((course) => (
              <option key={course.courseId} value={course.courseId}>
                {course.title}
              </option>
            ))}
          </select>
        }
      >
        {students.length ? (
          <div className="space-y-3">
            {students.map((student) => (
              <div key={student._id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-4 py-3">
                <div>
                  <p className="font-semibold text-slate-900">{student.from_user?.fullName}</p>
                  <p className="text-xs text-slate-500">{student.course_id}</p>
                </div>
                <p className="text-sm text-slate-500">{student.from_user?.bank_account_number}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No students yet.</p>
        )}
      </DashboardSection>

      {courseDetails && (
        <DashboardSection
          title="Course Content Management"
          description="Add or remove videos and learning resources."
        >
          <div className="space-y-5">
            <div>
              <h4 className="text-sm font-semibold text-slate-700">Videos</h4>
              <div className="mt-3 space-y-2">
                {courseDetails.videos?.map((video) => (
                  <div key={video.videoId} className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{video.title}</p>
                      <p className="text-xs text-slate-500">{Math.round(video.duration_seconds / 60)} mins</p>
                    </div>
                    <Button variant="ghost" onClick={() => handleDeleteVideo(video.videoId)}>
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-700">Resources</h4>
              <div className="mt-3 space-y-2">
                {courseDetails.resources?.map((resource) => (
                  <div key={resource.resourceId} className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{resource.title}</p>
                      <p className="text-xs text-slate-500">{resource.mediaType}</p>
                    </div>
                    <Button variant="ghost" onClick={() => handleDeleteResource(resource.resourceId)}>
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <Input
                  placeholder="Title"
                  value={resourceForm.title}
                  onChange={(e) => setResourceForm((prev) => ({ ...prev, title: e.target.value }))}
                />
                <select
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={resourceForm.mediaType}
                  onChange={(e) => setResourceForm((prev) => ({ ...prev, mediaType: e.target.value }))}
                >
                  <option value="document_link">Document</option>
                  <option value="image">Image</option>
                  <option value="audio">Audio</option>
                  <option value="text">Text</option>
                </select>
                <Input
                  placeholder="Resource URL"
                  value={resourceForm.url}
                  onChange={(e) => setResourceForm((prev) => ({ ...prev, url: e.target.value }))}
                />
              </div>
              <Button className="mt-3" onClick={handleAddResource}>
                Add Resource
              </Button>
            </div>
          </div>
        </DashboardSection>
      )}
    </div>
  )
}

