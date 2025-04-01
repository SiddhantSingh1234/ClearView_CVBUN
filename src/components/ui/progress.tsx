import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cn } from "@/lib/utils"

function Progress({
  className,
  value = 0, // Provide a default value of 0
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & { 
  value?: number 
}) {
  const getProgressColor = (progressValue: number) => {
    if (progressValue <= 25) {
      return {
        background: "bg-green-100 dark:bg-green-900",
        text: "text-green-500 dark:text-green-400"
      }
    } else if (progressValue <= 50) {
      return {
        background: "bg-yellow-100 dark:bg-yellow-900",
        text: "text-yellow-500 dark:text-yellow-400"
      }
    } else if (progressValue <= 75) {
      return {
        background: "bg-orange-100 dark:bg-orange-900",
        text: "text-orange-500 dark:text-orange-400"
      }
    } else {
      return {
        background: "bg-red-100 dark:bg-red-900",
        text: "text-red-500 dark:text-red-400"
      }
    }
  }

  const getIndicatorColor = (progressValue: number) => {
    if (progressValue <= 25) {
      return "bg-green-500 dark:bg-green-400"
    } else if (progressValue <= 50) {
      return "bg-yellow-500 dark:bg-yellow-400"
    } else if (progressValue <= 75) {
      return "bg-orange-500 dark:bg-orange-400"
    } else {
      return "bg-red-500 dark:bg-red-400"
    }
  }

  const colorScheme = getProgressColor(value);

  return (
    <div className="flex items-center space-x-2">
      <ProgressPrimitive.Root
        data-slot="progress"
        className={cn(
          "relative h-2 w-full overflow-hidden rounded-full flex-grow",
          colorScheme.background,
          className
        )}
        {...props}
      >
        <ProgressPrimitive.Indicator
          data-slot="progress-indicator"
          className={cn(
            "h-full w-full flex-1 transition-all",
            getIndicatorColor(value)
          )}
          style={{ transform: `translateX(-${100 - value}%)` }}
        />
      </ProgressPrimitive.Root>
      <span className={cn(
        "text-xs w-10 text-right",
        colorScheme.text
      )}>
        {value}%
      </span>
    </div>
  )
}

export { Progress }