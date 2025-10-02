import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive active:scale-95",
  {
    variants: {
      variant: {
        // Brand outlined (default): white bg, thick brand border, brand text
        default:
          "!bg-white !border-2 !border-[#283890] !text-[#283890] shadow-xs hover:bg-[#f8faff]",
        // Secondary maps to same brand outline for consistency
        secondary:
          "!bg-white !border-2 !border-[#283890] !text-[#283890] shadow-xs hover:bg-[#f8faff]",
        // Destructive: white bg, thick red border, red text
        destructive:
          "!bg-white !border-2 !border-red-600 !text-red-600 shadow-xs hover:bg-red-50",
        // Ghost still respects brand text and white bg
        ghost:
          "!bg-white !border-2 !border-[#283890] !text-[#283890] shadow-xs hover:bg-[#f8faff]",
        // Link appearance but keep brand color
        link: "bg-transparent border-0 underline-offset-4 !text-[#283890] hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  // Compute inline styles to override any page-level gradient/utility classes
  const classHints = String(className || "")
  const isDestructiveHint = /text-red-|bg-red-|destructive/.test(classHints) || variant === "destructive"
  const baseStyle: React.CSSProperties = {
    backgroundColor: "#ffffff",
    backgroundImage: "none",
    border: `2px solid ${isDestructiveHint ? "#dc2626" : "#283890"}`,
    color: isDestructiveHint ? "#dc2626" : "#283890",
  }

  return (
    <Comp
      data-slot="button"
      data-variant={variant || "default"}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
      // Inline styles take precedence over Tailwind utility classes
      style={{ ...baseStyle, ...(props as any).style }}
    />
  )
}

export { Button, buttonVariants }
