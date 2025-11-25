import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardSection } from '../components/dashboard/DashboardSection.jsx'
import { CourseCard } from '../components/dashboard/CourseCard.jsx'
import { ResourceList } from '../components/dashboard/ResourceList.jsx'
import { Button } from '../components/ui/button.jsx'
import { Input } from '../components/ui/input.jsx'
import { Modal } from '../components/ui/modal.jsx'
import { courseService, learnerService } from '../services/api.js'

export const LearnerDashboard = () => {
  const [availableCourses, setAvailableCourses] = useState([])
  const [myCourses, setMyCourses] = useState([])
  const [completedCourses, setCompletedCourses] = useState([])
  const [resources, setResources] = useState([])
  const [bankForm, setBankForm] = useState({ bankAccountNumber: '', secretKey: '' })
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const [courses, enrolled] = await Promise.all([
          courseService.getAll(),
          learnerService.myCourses(),
        ])
        setAvailableCourses(courses || [])
        setMyCourses(enrolled || [])
        setCompletedCourses((enrolled || []).filter((item) => item.status === 'Completed'))
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    const loadResources = async () => {
      if (!myCourses.length) return
      try {
        const firstCourse = myCourses[0]
        const content = await learnerService.courseContent(firstCourse.courseId)
        setResources(content?.course?.resources || [])
      } catch (err) {
        console.error(err)
      }
    }
    loadResources()
  }, [myCourses])

  const openBankModal = (course) => {
    setSelectedCourse(course)
    setModalOpen(true)
  }

  const handleEnroll = async () => {
    if (!selectedCourse) return
    try {
      await learnerService.enroll({
        courseId: selectedCourse._id,
        ...bankForm,
      })
      const updated = await learnerService.myCourses()
      setMyCourses(updated)
      setCompletedCourses(updated.filter((item) => item.status === 'Completed'))
      setModalOpen(false)
      setBankForm({ bankAccountNumber: '', secretKey: '' })
      setError(null)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleViewCourse = (course) => {
    navigate(`/courses/${course.courseId || course._id}`)
  }

  if (loading) {
    return <div className="px-6 py-12 text-center text-slate-500">Loading your dashboard...</div>
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12">
      {error && (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 px-6 py-4 text-rose-700">
          {error}
        </div>
      )}
      <DashboardSection
        title="Buy Course"
        description="Explore premium content and enroll with secure banking verification."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {availableCourses.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
              onPrimary={openBankModal}
              primaryLabel="Enroll Now"
            />
          ))}
        </div>
      </DashboardSection>

      <DashboardSection
        title="My Enrolled Courses"
        description="Track your active learning journeys and resume instantly."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {myCourses.map((course) => (
            <CourseCard
              key={course.courseId}
              course={course}
              onPrimary={handleViewCourse}
              primaryLabel="View Course"
            />
          ))}
        </div>
      </DashboardSection>

      <DashboardSection
        title="Completed Courses"
        description="Celebrate milestones and unlock certificates."
      >
        {completedCourses.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {completedCourses.map((course) => (
              <CourseCard
                key={course.courseId}
                course={course}
                onPrimary={handleViewCourse}
                primaryLabel="View Course"
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">Finish a course to see it here.</p>
        )}
      </DashboardSection>

      <DashboardSection
        title="Resources"
        description="Downloadable assets curated for your enrolled courses."
      >
        {resources.length ? (
          <ResourceList resources={resources} />
        ) : (
          <p className="text-sm text-slate-500">Resources unlock after enrolling.</p>
        )}
      </DashboardSection>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Enroll in ${selectedCourse?.title || ''}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEnroll}>Confirm Enrollment</Button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-600" htmlFor="bankAccountNumber">
              Account Number
            </label>
            <Input
              id="bankAccountNumber"
              value={bankForm.bankAccountNumber}
              onChange={(e) =>
                setBankForm((prev) => ({ ...prev, bankAccountNumber: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-600" htmlFor="secretKey">
              Secret Key
            </label>
            <Input
              id="secretKey"
              type="password"
              value={bankForm.secretKey}
              onChange={(e) => setBankForm((prev) => ({ ...prev, secretKey: e.target.value }))}
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}

