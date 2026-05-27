import type { ProgressBandKey } from "lib/progressBands"

type ProgressDistributionEntry = {
  band: Exclude<ProgressBandKey, "noTrackable">
  label: string
  count: number
}

type ProgressDistributionProps = {
  entries: ProgressDistributionEntry[]
  totalCount: number
  noTrackableCount?: number
  noTrackableLabel?: string
}

export default function ProgressDistribution({
  entries,
  totalCount,
  noTrackableCount = 0,
  noTrackableLabel = "No trackable problems",
}: ProgressDistributionProps) {
  const safeTotal = Math.max(totalCount, 1)

  return (
    <div className="mt-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="space-y-3">
        {entries.map((entry) => (
          <div key={entry.band} className="grid grid-cols-[5rem_1fr_5.5rem] items-center gap-3">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-200">{entry.label}</div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                className="h-full rounded-full bg-cyan-600 dark:bg-cyan-400"
                style={{ width: `${Math.max(0, (entry.count / safeTotal) * 100)}%` }}
              />
            </div>
            <div className="text-right text-sm text-gray-600 tabular-nums dark:text-gray-300">
              {entry.count} ({Math.round((entry.count / safeTotal) * 100)}%)
            </div>
          </div>
        ))}
      </div>

      {noTrackableCount > 0 && (
        <div className="mt-4 border-t border-slate-200 pt-3 text-sm text-gray-600 dark:border-slate-700 dark:text-gray-300">
          {noTrackableLabel}: <span className="font-medium tabular-nums">{noTrackableCount}</span>
        </div>
      )}
    </div>
  )
}
