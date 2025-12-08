import PropTypes from 'prop-types'
import { Card } from '../common/Card.jsx'
import { Layers, User } from 'lucide-react'

export const CategoryCarousel = ({ categories }) => (
  <section className="mx-auto max-w-7xl px-6 py-12">
    <div className="mb-10 text-center">
      <span className="inline-block rounded-full bg-indigo-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-indigo-500 mb-4 border border-indigo-100">
        Discover
      </span>
      <h2 className="font-display text-3xl font-bold text-slate-900 sm:text-4xl">
        Explore Top Categories
      </h2>
      <p className="mt-4 text-slate-500 max-w-2xl mx-auto">
        Browse through our most popular topics and find the perfect course to start your learning journey.
      </p>
    </div>

    <div className="flex gap-6 overflow-x-auto pb-8 pt-2 scrollbar-none snap-x">
      {categories.map((category) => (
        <Card
          key={category._id}
          hover
          className="min-w-[280px] snap-center bg-white/60 p-6 group border-white/50"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform duration-300">
              <Layers className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
              {category.totalCourses} Courses
            </span>
          </div>

          <h3 className="text-lg font-display font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
            {category._id}
          </h3>

          <div className="mt-2 text-sm text-slate-500 flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>{category.totalEnrollments} active learners</span>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100/50 space-y-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Top Instructors</p>
            {(category.courses || []).slice(0, 2).map((course) => {
              const instructorName =
                course.instructor?.fullName ||
                course.instructor?.name ||
                course.instructor?.userName ||
                'Instructor'
              return (
                <div key={course._id} className="flex items-center gap-2 group/item cursor-pointer">
                  <div className="h-6 w-6 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                    <img
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${instructorName}`}
                      alt={instructorName}
                    />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-medium text-slate-700 truncate group-hover/item:text-indigo-600 transition-colors">
                      {course.title}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">{instructorName}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      ))}
    </div>
  </section>
)

CategoryCarousel.propTypes = {
  categories: PropTypes.arrayOf(PropTypes.object).isRequired,
}

