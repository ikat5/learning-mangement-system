import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HeroSection } from '../components/home/HeroSection.jsx'
import { MostViewedGrid } from '../components/home/MostViewedGrid.jsx'
import { CategoryCarousel } from '../components/home/CategoryCarousel.jsx'
import { ValueStrip } from '../components/home/ValueStrip.jsx'
import { courseService } from '../services/api.js'

export const HomePage = () => {
  const navigate = useNavigate()
  const [mostViewed, setMostViewed] = useState([])
  const [categories, setCategories] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const [trending, grouped] = await Promise.all([
          courseService.getMostViewed(6),
          courseService.getByTitleGroup(),
        ])
        setMostViewed(trending || [])
        setCategories(grouped || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const scrollToCourses = () => {
    document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleViewCourse = (course) => {
    navigate(`/courses/${course?._id || ''}`, { state: { preview: course } })
  }

  return (
    <div className="space-y-10 pb-16">
      <HeroSection onExplore={scrollToCourses} />
      {error && (
        <div className="mx-auto max-w-3xl rounded-2xl border border-rose-100 bg-rose-50 px-6 py-4 text-rose-700">
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
            onViewAll={scrollToCourses}
          />
          <CategoryCarousel categories={categories} />
          <ValueStrip />
        </>
      )}
    </div>
  )
}

