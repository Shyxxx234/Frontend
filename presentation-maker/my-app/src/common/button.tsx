import type React from "react"

type ButtonProps = {
    children: React.ReactNode
    onClick?: () => void
    disabled?: boolean   
    className?: string 
}

export function Button({children, onClick, disabled = false, className}:ButtonProps)
{
    return (
        <button 
            className={className}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    )
}