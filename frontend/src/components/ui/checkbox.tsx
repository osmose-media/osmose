"use client"

import * as React from "react"
import { CheckIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface CheckboxProps extends Omit<React.ComponentProps<"input">, "onChange"> {
  onCheckedChange?: (checked: boolean) => void;
}

function Checkbox({ className, checked, onCheckedChange, ...props }: CheckboxProps) {
  return (
    <div className="relative flex items-center justify-center">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        className={cn(
          "peer h-5 w-5 shrink-0 appearance-none rounded-md border border-white/20 bg-white/5 transition-all focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-white checked:bg-white checked:border-white cursor-pointer",
          className
        )}
        {...props}
      />
      <CheckIcon 
        className="pointer-events-none absolute h-3.5 w-3.5 text-black opacity-0 peer-checked:opacity-100 transition-opacity" 
      />
    </div>
  )
}

export { Checkbox }
