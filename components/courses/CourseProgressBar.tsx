type Props = {
  completed: number
  total: number
  className?: string
  label?: string
  hideLabelRow?: boolean
  fillClassName?: string
}

const CourseProgressBar: React.FC<Props> = ({
  completed,
  total,
  className,
  label = "Progress",
  hideLabelRow = false,
  fillClassName = "bg-emerald-500",
}) => {
  const ratio = total > 0 ? completed / total : 0

  return (
    <div className={className}>
      {!hideLabelRow && (
        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
          <span>{label}</span>
          <span>
            {completed}/{total}
          </span>
        </div>
      )}
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className={`h-full rounded-full transition-[width] duration-300 ${fillClassName}`}
          style={{ width: `${Math.round(ratio * 100)}%` }}
        />
      </div>
    </div>
  )
}

export default CourseProgressBar
