import PropTypes from 'prop-types'
import { Button } from '../common/Button.jsx'
import { Badge } from '../common/Badge.jsx'
import { Card } from '../common/Card.jsx'
import { currency } from '../../utils/formatters.js'
import { Users, Clock, ArrowRight } from 'lucide-react'

const ProgressBar = ({ value }) => (
  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
    <div
      className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500 ease-out"
      style={{ width: `${value}%` }}
    />
  </div>
)

ProgressBar.propTypes = {
  value: PropTypes.number.isRequired,
}

export const MostViewedGrid = ({ courses, onSelectCourse, onViewAll, enrolledIds }) => (
  <section id="courses" className="mx-auto max-w-7xl px-6 py-20">
    <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="h-px w-8 bg-indigo-500"></span>
          <p className="text-sm font-bold uppercase tracking-widest text-indigo-500">Trending</p>
        </div>
        <h2 className="font-display text-4xl font-bold text-slate-900">Most Viewed Courses</h2>
      </div>
      <Button variant="ghost" onClick={onViewAll} className="group text-indigo-600 hover:text-indigo-700">
        View all courses
        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Button>
    </div>

    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => {
        const isEnrolled = enrolledIds?.has(course._id)
        return (
          <Card key={course._id} hover className="flex flex-col h-full !p-0 overflow-hidden border-0 group">
            {/* Image/Thumbnail Area */}
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
              {course.thumbnail ? (
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="h-full w-full bg-slate-200 flex items-center justify-center text-slate-400">
                  No Thumbnail
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-60" />
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center text-white">
                <Badge className="bg-white/20 backdrop-blur-md border-white/30 text-white">
                  {course.category || "Course"}
                </Badge>
                <div className="flex items-center gap-1 text-xs font-medium bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full">
                  <Clock className="w-3 h-3" />
                  <span>{course.totalVideos || 0} lessons</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col flex-grow p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display text-xl font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                  {course.title}
                </h3>
              </div>

              <p className="text-sm text-slate-600 line-clamp-2 mb-4 flex-grow">
                {course.description}
              </p>

              <div className="space-y-4">
                {/* Instructor & Price */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
                      {(course.instructor?.name || 'I')[0]}
                    </div>
                    <div className="text-sm">
                      <p className="text-slate-500 text-xs">Instructor</p>
                      <p className="font-semibold text-slate-900">{course.instructor?.name || 'Unknown'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-indigo-600">{currency(course.price)}</p>
                  </div>
                </div>

                {/* Engagement or Call to Action */}
                {isEnrolled ? (
                  <Button
                    variant="primary"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
                    onClick={() => window.location.href = `/dashboard/learner/course/${course._id}`}
                  >
                    Continue Learning
                  </Button>
                ) : (
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> Popularity</span>
                        <span>{(course.enrolledCount || 0) > 100 ? 'High' : 'Rising'}</span>
                      </div>
                      <ProgressBar value={Math.min(100, (course.enrolledCount || 0) / 5)} />
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onSelectCourse(course)}
                      className="shrink-0"
                    >
                      View Details
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  </section>
)

MostViewedGrid.propTypes = {
  courses: PropTypes.arrayOf(PropTypes.object).isRequired,
  onSelectCourse: PropTypes.func.isRequired,
  onViewAll: PropTypes.func,
  enrolledIds: PropTypes.object,
}

MostViewedGrid.defaultProps = {
  onViewAll: () => { },
}

