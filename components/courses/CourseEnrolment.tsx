import { Button } from "flowbite-react"
import { CourseStatus } from "@prisma/client"
import CourseProgressBar from "components/courses/CourseProgressBar"

type Props = {
  status: CourseStatus | null
  isLoggedIn: boolean
  isUpdating: boolean
  onEnrol: () => void
  onUnenrol: () => void
  progressTotal?: number
  progressCompleted?: number
  completedAt?: string | Date | null
  size?: "xs" | "sm"
  className?: string
}

const CourseEnrolment: React.FC<Props> = ({
  status,
  isLoggedIn,
  isUpdating,
  onEnrol,
  onUnenrol,
  progressTotal,
  progressCompleted,
  completedAt,
  size = "xs",
  className,
}) => {
  const statusLabel = status ? status.charAt(0) + status.slice(1).toLowerCase() : null
  const hasTrackableProblems = (progressTotal ?? 0) > 0
  const showProgress = (status === "ENROLLED" || status === "COMPLETED") && hasTrackableProblems
  const completed = progressCompleted ?? 0
  const total = progressTotal ?? 0
  const completedDate =
    status === "COMPLETED" && completedAt
      ? new Date(completedAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
      : null

  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 ${className ?? ""}`}>
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {isLoggedIn ? (
          showProgress ? (
            <CourseProgressBar completed={completed} total={total} className="w-full sm:min-w-[320px] sm:w-auto" />
          ) : completedDate ? (
            <span className="font-medium text-emerald-600 dark:text-emerald-300">Completed on {completedDate}</span>
          ) : status === "ENROLLED" || status === "COMPLETED" ? (
            <span>No trackable problems</span>
          ) : (
            <span>{status ? `Status: ${statusLabel}` : "Not enrolled"}</span>
          )
        ) : (
          <span>Sign in to enrol</span>
        )}
      </div>
      {isLoggedIn && (
        <Button
          size={size}
          color={status === "ENROLLED" ? "gray" : "info"}
          onClick={status === "ENROLLED" ? onUnenrol : onEnrol}
          disabled={isUpdating}
        >
          {status === "ENROLLED" ? "Unenrol" : "Enrol"}
        </Button>
      )}
    </div>
  )
}

export default CourseEnrolment
