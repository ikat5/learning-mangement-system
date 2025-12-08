import PropTypes from 'prop-types'
import { cn } from '../../utils/cn.js'

export const Badge = ({ children, className = '', variant = 'default' }) => {
  const base =
    'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold'
  const variants = {
    default: 'bg-red-100 text-red-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-amber-100 text-amber-800',
    outline: 'border border-red-200 text-red-700',
  }

  return <span className={cn(base, variants[variant], className)}>{children}</span>
}

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'success', 'warning', 'outline']),
}


