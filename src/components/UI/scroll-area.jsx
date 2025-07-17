import { forwardRef } from "react"
import { cn } from "@/lib/utils"

const ScrollArea = forwardRef(({ className, children, orientation = "vertical", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative overflow-hidden",
      className
    )}
    {...props}
  >
    <div
      className={cn(
        "h-full w-full rounded-[inherit]",
        orientation === "horizontal" ? "overflow-x-auto overflow-y-hidden" : "overflow-y-auto overflow-x-hidden"
      )}
      style={{
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        "&::-webkit-scrollbar": {
          display: "none"
        }
      }}
    >
      {children}
    </div>
  </div>
))
ScrollArea.displayName = "ScrollArea"

export { ScrollArea } 