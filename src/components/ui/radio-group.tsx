"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const RadioGroupContext = React.createContext<{
    value: string | undefined
    onChange: (value: string) => void
} | null>(null)

const RadioGroup = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { value?: string; onValueChange?: (value: string) => void }
>(({ className, value, onValueChange, children, ...props }, ref) => {
    return (
        <RadioGroupContext.Provider value={{ value, onChange: onValueChange! }}>
            <div className={cn("grid gap-2", className)} ref={ref} {...props}>
                {children}
            </div>
        </RadioGroupContext.Provider>
    )
})
RadioGroup.displayName = "RadioGroup"

const RadioGroupItem = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }
>(({ className, value, ...props }, ref) => {
    const context = React.useContext(RadioGroupContext)
    const isChecked = context?.value === value

    return (
        <button
            type="button"
            ref={ref}
            role="radio"
            aria-checked={isChecked}
            data-state={isChecked ? "checked" : "unchecked"}
            onClick={() => context?.onChange(value)}
            className={cn(
                "aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                isChecked ? "bg-current" : "bg-transparent",
                className
            )}
            {...props}
        >
            <span className="flex items-center justify-center">
                {isChecked && <div className="h-2 w-2 rounded-full bg-zinc-950" />}
            </span>
        </button>
    )
})
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }
