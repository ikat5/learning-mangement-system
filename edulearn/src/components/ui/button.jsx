import { cva } from 'class-variance-authority'
import PropTypes from 'prop-types'
import { cn } from '../../utils/cn.js'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-200',
        outline:
          'border border-slate-200 bg-white text-slate-900 hover:bg-slate-50',
        ghost: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60',
        soft: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100',
      },
      size: {
        default: 'px-5 py-2.5',
        sm: 'px-3 py-1.5 text-xs',
        lg: 'px-6 py-3 text-base',
        icon: 'h-9 w-9 rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export const Button = ({ className, variant, size, ...props }) => (
  <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
)

Button.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'outline', 'ghost', 'soft']),
  size: PropTypes.oneOf(['default', 'sm', 'lg', 'icon']),
}

Button.defaultProps = {
  className: '',
  variant: 'default',
  size: 'default',
}


