import { Table } from "flowbite-react"

type SortDirection = "asc" | "desc"

type Props = {
  label: string
  active: boolean
  direction: SortDirection
  onClick: () => void
  className?: string
}

const SortableHeadCell: React.FC<Props> = ({ label, active, direction, onClick, className }) => {
  const sortStateText = active ? `sorted ${direction === "asc" ? "ascending" : "descending"}` : "not sorted"

  return (
    <Table.HeadCell
      aria-sort={active ? (direction === "asc" ? "ascending" : "descending") : "none"}
      className={className}
    >
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center gap-2 text-left"
        aria-label={`Sort by ${label}`}
        data-sort-active={active ? "true" : "false"}
        data-sort-direction={active ? direction : "none"}
      >
        <span>{label}</span>
        <span className="sr-only">, {sortStateText}</span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {active ? (direction === "asc" ? "▲" : "▼") : "↕"}
        </span>
      </button>
    </Table.HeadCell>
  )
}

export type { SortDirection }
export default SortableHeadCell
