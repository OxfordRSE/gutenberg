import { Table } from "flowbite-react"

type Props = {
  children: React.ReactNode
  dataCy?: string
  className?: string
  containerClassName?: string
}

const SortableTable: React.FC<Props> = ({ children, dataCy, className, containerClassName }) => {
  return (
    <div
      className={`mt-3 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 ${containerClassName || ""}`}
    >
      <div className="overflow-x-auto">
        <Table data-cy={dataCy} className={className}>
          {children}
        </Table>
      </div>
    </div>
  )
}

export default SortableTable
