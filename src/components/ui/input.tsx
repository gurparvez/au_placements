import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-text-subtle selection:bg-primary selection:text-primary-foreground bg-bg-2 border-border-strong w-full min-w-0 rounded-[9px] border px-3 py-[11px] text-[14px] outline-none transition-[color,box-shadow,border-color] file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-[var(--ring-soft)]",
        "aria-invalid:border-danger aria-invalid:ring-[3px] aria-invalid:ring-[var(--danger-soft)]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
