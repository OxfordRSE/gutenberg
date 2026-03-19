import React from "react"
import { Button } from "flowbite-react"
import { CourseStatus } from "@prisma/client"
import { HiArrowNarrowRight } from "react-icons/hi"
import useActiveCourse from "lib/hooks/useActiveCourse"

type Props = {
  courseId: number
  status: CourseStatus | null
  verbose?: boolean
  size?: "xs" | "sm"
}

const CourseActiveActions: React.FC<Props> = ({ courseId, status, verbose = false, size = "xs" }) => {
  const [activeCourseId, setActiveCourseId] = useActiveCourse()

  const isSelectable = status === CourseStatus.ENROLLED || status === CourseStatus.COMPLETED
  const isActiveCourse = activeCourseId === courseId

  if (!isSelectable) return null

  return isActiveCourse ? (
    <Button size={size} color="gray" onClick={() => setActiveCourseId(undefined)} style={{ zIndex: 1 }}>
      {verbose ? "Deselect as active course" : "Unselect"}
      <HiArrowNarrowRight className="ml-2 h-3 w-3" />
    </Button>
  ) : (
    <Button size={size} color="gray" onClick={() => setActiveCourseId(courseId)} style={{ zIndex: 1 }}>
      {verbose ? "Select as your active course" : "Select"}
      <HiArrowNarrowRight className="ml-2 h-3 w-3" />
    </Button>
  )
}

export default CourseActiveActions
