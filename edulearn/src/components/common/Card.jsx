import React from 'react'
import PropTypes from 'prop-types'
import { twMerge } from 'tailwind-merge'

export const Card = ({ children, className, hover = false, ...props }) => {
    return (
        <div
            className={twMerge(
                'glass-card rounded-2xl p-6',
                hover && 'cursor-pointer',
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}

Card.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    hover: PropTypes.bool,
}
