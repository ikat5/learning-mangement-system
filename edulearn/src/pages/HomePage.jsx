import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HeroSection } from '../components/home/HeroSection.jsx'
import { MostViewedGrid } from '../components/home/MostViewedGrid.jsx'
import { CategoryCarousel } from '../components/home/CategoryCarousel.jsx'
import { ValueStrip } from '../components/home/ValueStrip.jsx'
import { courseService, learnerService } from '../services/api.js'
import { useToast } from '../hooks/useToast.js'
import { useAuth } from '../hooks/useAuth.js'

import { BankSetupModal } from '../components/common/BankSetupModal.jsx'

export const HomePage = () => {
  const navigate = useNavigate()
  const [mostViewed, setMostViewed] = useState([])
  const [categories, setCategories] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()
  const { isAuthenticated, user } = useAuth()
  const [showBankModal, setShowBankModal] = useState(false)

  const [enrolledIds, setEnrolledIds] = useState(new Set())

  useEffect(() => {
    if (isAuthenticated && user?.role === 'Learner' && !user.bank_account_number) {
      setShowBankModal(true)
    }
  }, [isAuthenticated, user])

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const promises = [
          courseService.getMostViewed(6),
          courseService.getByTitleGroup(),
        ]

        const [trending, grouped] = await Promise.all(promises)
        setMostViewed(trending || [])
        setCategories(grouped || [])
      } catch (err) {
        setError(err.message)
        showToast({
          type: 'error',
          title: 'Unable to load courses',
          message: err.message,
        })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [showToast])

  // Separate effect for enrolled courses to not block main content
  useEffect(() => {
    const loadEnrolled = async () => {
      if (isAuthenticated && user?.role === 'Learner') {
        try {
          const myCourses = await learnerService.myCourses()
          const ids = new Set((myCourses || []).map(c => c.courseId))
          setEnrolledIds(ids)
        } catch (err) {
          console.error('Failed to load enrolled courses', err)
        }
      }
    }
    loadEnrolled()
  }, [isAuthenticated, user])

  const scrollToCourses = () => {
    document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleExplore = () => {
    if (isAuthenticated && user?.role === 'Learner') {
      navigate('/dashboard/learner/buy')
      return
    }
    scrollToCourses()
  }

  const handleViewCourse = (course) => {
    navigate(`/courses/${course?._id || ''}`, { state: { preview: course } })
  }

  return (
    <div className="space-y-10 pb-16">
      <HeroSection
        onExplore={handleExplore}
        featuredCourse={mostViewed[0]}
        enrolledIds={enrolledIds}
      />
      {error && (
        <div className="mx-auto max-w-3xl rounded-2xl border border-amber-100 bg-amber-50 px-6 py-4 text-amber-800">
          {error}
        </div>
      )}
      {loading ? (
        <div className="mx-auto max-w-6xl px-6 text-center text-slate-500">Loading courses...</div>
      ) : (
        <>
          <MostViewedGrid
            courses={mostViewed.slice(0, 3)}
            onSelectCourse={handleViewCourse}
            onViewAll={handleExplore}
            enrolledIds={enrolledIds}
          />
          <CategoryCarousel categories={categories} />
          <ValueStrip />
        </>
      )}
      <BankSetupModal isOpen={showBankModal} onClose={() => setShowBankModal(false)} />
    </div>
  )
}

