import PropTypes from 'prop-types'
import { Button } from '../ui/button.jsx'
import { Progress } from '../ui/progress.jsx'
import { Badge } from '../ui/badge.jsx'
import { currency } from '../../utils/formatters.js'

export const CourseCard = ({ course, onPrimary, primaryLabel, meta }) => (
  <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
    <div className="flex items-start justify-between gap-4">
      <div>
        <h4 className="text-lg font-semibold text-slate-900">{course.title}</h4>
        <p className="text-sm text-slate-500">
          {course.description || 'Details coming soon.'}
        </p>
      </div>
      {course.status && <Badge variant="outline">{course.status}</Badge>}
    </div>
    {typeof course.progress_percentage === 'number' && (
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Progress</span>
          <span>{course.progress_percentage}%</span>
        </div>
        <Progress value={course.progress_percentage} />
      </div>
    )}
    {meta && (
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-500">
        {meta.students !== undefined && (
          <div>
            <p className="text-slate-400">Students</p>
            <p className="font-semibold text-slate-900">{meta.students}</p>
          </div>
        )}
        {meta.earnings !== undefined && (
          <div>
            <p className="text-slate-400">Earnings</p>
            <p className="font-semibold text-slate-900">{currency(meta.earnings)}</p>
          </div>
        )}
      </div>
    )}
    <Button className="mt-5 w-full" onClick={() => onPrimary(course)}>
      {primaryLabel}
    </Button>
  </div>
)

CourseCard.propTypes = {
  course: PropTypes.object.isRequired,
  onPrimary: PropTypes.func.isRequired,
  primaryLabel: PropTypes.string.isRequired,
  meta: PropTypes.shape({
    students: PropTypes.number,
    earnings: PropTypes.number,
  }),
}

CourseCard.defaultProps = {
  meta: null,
}

