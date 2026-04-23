import React from "react"
import { Button } from "flowbite-react"
import { CourseStatus } from "@prisma/client"
import { HiArrowNarrowRight } from "react-icons/hi"
import useActiveCourse from "lib/hooks/useActiveCourse"
import useLearningContext from "lib/hooks/useLearningContext"

type Props = {
  courseExternalId: string
  status: CourseStatus | null
  verbose?: boolean
  size?: "xs" | "sm"
}

const CourseActiveActions: React.FC<Props> = ({ courseExternalId, status, verbose = false, size = "xs" }) => {
  const [activeCourseExternalId, setActiveCourseExternalId] = useActiveCourse()
  const [, setLearningContext] = useLearningContext()

  const isSelectable = status === CourseStatus.ENROLLED || status === CourseStatus.COMPLETED
  const isActiveCourse = activeCourseExternalId === courseExternalId

  if (!isSelectable) return null

  return isActiveCourse ? (
    <Button
      size={size}
      color="gray"
      className="[&>span]:items-center"
      onClick={() => {
        setActiveCourseExternalId(undefined)
        setLearningContext(undefined)
      }}
      style={{ zIndex: 1 }}
    >
      {verbose ? "Deselect as active course" : "Unselect"}
      <HiArrowNarrowRight className="ml-2 h-3 w-3" />
    </Button>
  ) : (
    <Button
      size={size}
      color="gray"
      className="[&>span]:items-center"
      onClick={() => {
        setActiveCourseExternalId(courseExternalId)
        setLearningContext({ type: "course", externalId: courseExternalId })
      }}
      style={{ zIndex: 1 }}
    >
      {verbose ? "Select as your active course" : "Select"}
      <HiArrowNarrowRight className="ml-2 h-3 w-3" />
    </Button>
  )
}

export default CourseActiveActions
