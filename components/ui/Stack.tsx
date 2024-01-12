import React, { ReactNode } from "react"

interface StackProps {
  spacing?: number
  children: ReactNode
  direction?: "row" | "col" | "row-reverse" | "col-reverse" | undefined
  className?: React.ComponentProps<"div">["className"]
}

function Stack({ spacing = 4, children, direction, className }: StackProps) {
  if (direction === undefined) {
    direction = "col"
  }
  const flexVariants = {
    row: "flex-row",
    col: "flex-col",
    "row-reverse": "flex-row-reverse",
    "col-reverse": "flex-col-reverse",
  }
  const spaceVariants: Record<string, Record<number, string>> = {
    row: {
      1: "space-x-1",
      2: "space-x-2",
      3: "space-x-3",
      4: "space-x-4",
    },
    col: {
      1: "space-y-1",
      2: "space-y-2",
      3: "space-y-3",
      4: "space-y-4",
    },
  }

  const axis = direction.includes("col") ? "col" : "row"
  return (
    <div className={`flex ${flexVariants[direction]} ${spaceVariants[axis][spacing]} ${className}`}>{children}</div>
  )
}

export default Stack
