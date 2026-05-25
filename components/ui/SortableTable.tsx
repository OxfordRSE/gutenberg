import React, { useState, useMemo } from "react"
import { Table } from "flowbite-react"

type SortDirection = "asc" | "desc"

export type Column<T> = {
  key: string
  label: string
  sortable?: boolean
  getValue: (row: T) => string | number | null
  render: (row: T) => React.ReactNode
  headCellClassName?: string
  cellClassName?: string
}

type Props<T> = {
  columns: Column<T>[]
  data: T[]
  rowKey: (row: T) => string
  defaultSort?: { key: string; direction: SortDirection }
  dataCy?: string
  tableClassName?: string
  wrapperClassName?: string
}

function SortableTable<T>({ columns, data, rowKey, defaultSort, dataCy, tableClassName, wrapperClassName }: Props<T>) {
  const [sortKey, setSortKey] = useState(defaultSort?.key ?? "")
  const [sortDir, setSortDir] = useState<SortDirection>(defaultSort?.direction ?? "desc")

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDir === "desc") {
        setSortDir("asc")
      } else {
        setSortKey("")
      }
    } else {
      setSortKey(key)
      setSortDir("desc")
    }
  }

  const sortedData = useMemo(() => {
    const col = columns.find((c) => c.key === sortKey)
    if (!col || !col.sortable) return data
    return [...data].sort((a, b) => {
      const aVal = col.getValue(a)
      const bVal = col.getValue(b)
      if (aVal === null && bVal === null) return 0
      if (aVal === null) return 1
      if (bVal === null) return -1
      const cmp = typeof aVal === "string" ? aVal.localeCompare(bVal as string) : (aVal as number) - (bVal as number)
      return sortDir === "asc" ? cmp : -cmp
    })
  }, [data, sortKey, sortDir, columns])

  return (
    <div className={wrapperClassName ?? "mt-3 overflow-x-auto"}>
      <Table data-cy={dataCy} className={tableClassName}>
        <Table.Head>
          {columns.map((col) => (
            <Table.HeadCell
              key={col.key}
              className={`${col.headCellClassName ?? ""} ${col.sortable ? "cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700" : ""}`.trim()}
              onClick={col.sortable ? () => handleSort(col.key) : undefined}
            >
              <span className="inline-flex items-center gap-1">
                {col.label}
                {col.sortable && (
                  <span className={`text-xs ${sortKey === col.key ? "" : "opacity-30"}`}>
                    {sortKey === col.key ? (sortDir === "asc" ? "▲" : "▼") : "⇅"}
                  </span>
                )}
              </span>
            </Table.HeadCell>
          ))}
        </Table.Head>
        <Table.Body className="divide-y">
          {sortedData.map((row) => (
            <Table.Row key={rowKey(row)}>
              {columns.map((col) => (
                <Table.Cell key={col.key} className={col.cellClassName}>
                  {col.render(row)}
                </Table.Cell>
              ))}
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  )
}

export default SortableTable
