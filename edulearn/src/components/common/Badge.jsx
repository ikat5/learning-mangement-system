import React from 'react'
import PropTypes from 'prop-types'
import { twMerge } from 'tailwind-merge'

export const Badge = ({ children, variant = 'primary', className, ...props }) => {
    const variants = {
        primary: 'bg-indigo-50 text-indigo-700 border border-indigo-100',
        success: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
        warning: 'bg-amber-50 text-amber-700 border border-amber-100',
        error: 'bg-rose-50 text-rose-700 border border-rose-100',
        neutral: 'bg-slate-50 text-slate-600 border border-slate-100',
    }

    return (
        <span
            className={twMerge(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
                variants[variant],
                className
            )}
            {...props}
        >
            {children}
        </span>
    )
}

Badge.propTypes = {
    children: PropTypes.node.isRequired,
    variant: PropTypes.oneOf(['primary', 'success', 'warning', 'error', 'neutral']),
    className: PropTypes.string,
}
