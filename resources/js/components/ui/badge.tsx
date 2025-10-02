import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-auto",
  {
    variants: {
      variant: {
        // Default - General purpose
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        // Secondary - Neutral information
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        // Success - Complete, Active, Approved
        success:
          "border-transparent text-white bg-gradient-to-r from-green-600 to-emerald-600",
        // Warning - Pending, Awaiting Approval
        warning:
          "border-transparent text-white bg-gradient-to-r from-yellow-500 to-amber-500",
        // Danger - Urgent, Error, Failed
        destructive:
          "border-transparent text-white bg-gradient-to-r from-red-600 to-rose-600 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        // Info - New, In Progress
        info:
          "border-transparent text-white bg-gradient-to-r from-blue-600 to-indigo-600",
        // Active - Current state
        active:
          "border-transparent bg-[var(--color-active)] text-[var(--color-active-foreground)] [a&]:hover:bg-[color-mix(in_oklab,var(--color-active)_90%,black)]",
        // Outline - Subtle information
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
