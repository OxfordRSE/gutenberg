import { useMemo, useState } from "react"
import type { SortDirection } from "components/ui/SortableHeadCell"

type CompareFn<T> = (left: T, right: T) => number

type Props<T, SortKey extends string> = {
  rows: T[]
  compareMap: Record<SortKey, CompareFn<T>>
  initialSortKey: SortKey | null
  initialDirection?: SortDirection
  getDefaultDirection?: (key: SortKey) => SortDirection
  tieBreaker?: CompareFn<T>
}

const defaultTieBreaker = <T>(_: T, __: T) => 0

function useSortableRows<T, SortKey extends string>({
  rows,
  compareMap,
  initialSortKey,
  initialDirection = "desc",
  getDefaultDirection,
  tieBreaker = defaultTieBreaker,
}: Props<T, SortKey>) {
  const [sortKey, setSortKey] = useState<SortKey | null>(initialSortKey)
  const [sortDirection, setSortDirection] = useState<SortDirection>(initialDirection)

  const sortedRows = useMemo(() => {
    if (!sortKey) return rows

    return [...rows].sort((left, right) => {
      const value = compareMap[sortKey](left, right)
      if (value !== 0) return sortDirection === "asc" ? value : -value
      return tieBreaker(left, right)
    })
  }, [compareMap, rows, sortDirection, sortKey, tieBreaker])

  const updateSort = (nextKey: SortKey) => {
    if (sortKey === nextKey) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"))
      return
    }

    setSortKey(nextKey)
    setSortDirection(getDefaultDirection?.(nextKey) ?? initialDirection)
  }

  return {
    sortedRows,
    sortKey,
    sortDirection,
    updateSort,
  }
}

export default useSortableRows
