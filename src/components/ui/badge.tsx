import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-blue-600 text-white shadow",
        secondary:
          "border-slate-700 bg-slate-800 text-slate-300",
        destructive:
          "border-transparent bg-red-900/60 text-red-300 border-red-700/50",
        outline: "text-slate-300 border-slate-700",
        success:
          "border-emerald-700/50 bg-emerald-950/60 text-emerald-300",
        warning:
          "border-amber-700/50 bg-amber-950/60 text-amber-300",
        info:
          "border-cyan-700/50 bg-cyan-950/60 text-cyan-300",
        purple:
          "border-purple-700/50 bg-purple-950/60 text-purple-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
