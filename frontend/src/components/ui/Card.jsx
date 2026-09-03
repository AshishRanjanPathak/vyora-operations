import * as React from "react"
import { cn } from "@/lib/utils"

const cardVariants = {
  default: "bg-white text-[#121316] border-[#e4e4df] shadow-sm hover:border-[#cbd5e1]",
  kpi: "bg-white text-[#121316] border-[#e4e4df] shadow-sm hover:border-[#121316] transition-all duration-150",
  alert: "bg-rose-50/70 text-rose-950 border-rose-300 shadow-sm hover:border-rose-400 transition-all duration-150",
  compact: "bg-white text-[#121316] border-[#e4e4df] p-3.5 sm:p-4 shadow-sm text-xs",
  featured: "bg-white text-[#121316] border-[#e4e4df] border-t-2 border-t-[#ea580c] shadow-md relative overflow-hidden",
}

const Card = React.forwardRef(({ className, variant = "default", title, subtitle, action, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border transition-colors",
      cardVariants[variant] || cardVariants.default,
      className
    )}
    {...props}
  >
    {(title || action) ? (
      <>
        <div className="px-6 py-4 border-b border-[#e4e4df] flex items-center justify-between bg-[#fafaf8]">
          <div>
            {title && <h3 className="text-sm font-bold text-[#121316] tracking-tight font-display">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
        <div className={variant === "compact" ? "p-3.5" : "p-6"}>{children}</div>
      </>
    ) : (
      children
    )}
  </div>
))
Card.displayName = "Card"

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-sm font-bold leading-none tracking-tight font-display text-[#121316]",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-xs text-slate-500", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants }
export default Card;