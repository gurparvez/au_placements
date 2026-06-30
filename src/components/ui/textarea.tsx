import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "placeholder:text-text-subtle bg-bg-2 border-border-strong flex min-h-20 w-full resize-y rounded-[9px] border px-3 py-[11px] text-[14px] leading-[1.6] outline-none transition-[color,box-shadow,border-color] disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-[var(--ring-soft)]",
        "aria-invalid:border-danger aria-invalid:ring-[3px] aria-invalid:ring-[var(--danger-soft)]",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
