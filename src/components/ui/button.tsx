
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:scale-[1.02] active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700 shadow-md hover:shadow-lg",
        destructive: "bg-red-500 text-white hover:bg-red-600 active:bg-red-700 shadow-md hover:shadow-lg",
        outline: "border border-input/50 bg-transparent backdrop-blur-sm hover:bg-accent/50 hover:text-accent-foreground",
        secondary: "bg-secondary/70 backdrop-blur-sm text-secondary-foreground hover:bg-secondary/90 shadow-sm hover:shadow-md",
        ghost: "hover:bg-accent/50 backdrop-blur-sm hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        neo: "bg-white/70 backdrop-blur-sm shadow-neo-btn hover:shadow-neo-btn-pressed active:shadow-neo-btn-pressed text-neo-text",
        "neo-primary": "bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-md hover:shadow-xl hover:from-brand-600 hover:to-brand-700",
        glass: "bg-white/40 backdrop-blur-md border border-white/30 text-gray-800 shadow-md hover:shadow-lg hover:bg-white/50",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3",
        lg: "h-11 rounded-lg px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "neo",
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
