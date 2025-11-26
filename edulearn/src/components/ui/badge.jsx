import PropTypes from 'prop-types'
import { cn } from '../../utils/cn.js'

export const Badge = ({ children, className, variant }) => {
  const base =
    'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold'
  const variants = {
    default: 'bg-indigo-100 text-indigo-700',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-800',
    outline: 'border border-slate-200 text-slate-700',
  }

  return <span className={cn(base, variants[variant], className)}>{children}</span>
}

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'success', 'warning', 'outline']),
}

Badge.defaultProps = {
  className: '',
  variant: 'default',
}


