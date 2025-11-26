import PropTypes from 'prop-types'
import { cn } from '../../utils/cn.js'

export const Progress = ({ value, className }) => (
  <div className={cn('h-2 w-full rounded-full bg-slate-100', className)}>
    <div
      className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-400 transition-all"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
)

Progress.propTypes = {
  value: PropTypes.number,
  className: PropTypes.string,
}

Progress.defaultProps = {
  value: 0,
  className: '',
}


