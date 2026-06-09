import { formatPercent } from "lib/stats"

type PercentageMeterProps = {
  value: number | null
  valueClassName?: string
  barClassName?: string
  className?: string
}

export default function PercentageMeter({
  value,
  valueClassName = "w-12 text-xs font-medium tabular-nums text-gray-700 dark:text-gray-200",
  barClassName = "h-2 w-20",
  className = "flex min-w-[7.5rem] items-center gap-2 whitespace-nowrap",
}: PercentageMeterProps) {
  const boundedValue = Math.max(0, Math.min(value ?? 0, 100))

  return (
    <div className={className}>
      <div className={valueClassName}>{formatPercent(value)}</div>
      <div className={`${barClassName} overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700`}>
        <div
          className="h-full rounded-full bg-cyan-600 transition-[width] dark:bg-cyan-400"
          style={{ width: `${boundedValue}%` }}
        />
      </div>
    </div>
  )
}
