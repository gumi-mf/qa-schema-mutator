import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-white text-black hover:bg-zinc-200 active:bg-zinc-300 font-semibold border border-transparent",
        destructive:
          "border border-zinc-800 bg-zinc-900 text-zinc-200 hover:bg-zinc-800 hover:text-white",
        outline:
          "border border-zinc-800 bg-black text-zinc-200 hover:bg-zinc-900 hover:text-white hover:border-zinc-700",
        secondary:
          "border border-zinc-800 bg-zinc-900 text-zinc-200 hover:bg-zinc-800 hover:text-white",
        ghost: "text-zinc-400 hover:bg-zinc-900 hover:text-white",
        link: "text-white underline-offset-4 hover:underline",
        accent: "bg-white text-black hover:bg-zinc-200 font-semibold",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-lg px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
