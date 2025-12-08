import React from 'react'
import PropTypes from 'prop-types'
import { Loader2 } from 'lucide-react'
import { twMerge } from 'tailwind-merge'

export const Button = React.forwardRef(({
    children,
    variant = 'primary',
    size = 'md',
    className,
    isLoading = false,
    disabled,
    type = 'button',
    ...props
}, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95'

    const variants = {
        primary: 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 border border-transparent',
        secondary: 'bg-white text-indigo-700 border border-indigo-100 shadow-sm hover:bg-indigo-50 hover:border-indigo-200',
        ghost: 'text-slate-600 hover:bg-slate-100 hover:text-indigo-600',
        glass: 'bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-lg hover:bg-white/30',
        danger: 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100',
    }

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-5 py-2.5 text-base',
        lg: 'px-8 py-3.5 text-lg',
    }

    return (
        <button
            ref={ref}
            type={type}
            className={twMerge(baseStyles, variants[variant], sizes[size], className)}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children}
        </button>
    )
})

Button.displayName = 'Button'

Button.propTypes = {
    children: PropTypes.node.isRequired,
    variant: PropTypes.oneOf(['primary', 'secondary', 'ghost', 'glass', 'danger']),
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
    className: PropTypes.string,
    isLoading: PropTypes.bool,
    disabled: PropTypes.bool,
    type: PropTypes.string,
}
