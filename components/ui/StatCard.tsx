import { Card } from "flowbite-react"

type Props = {
  label: string
  value: string | number
  helpText?: string
  dataCy?: string
}

const StatCard: React.FC<Props> = ({ label, value, helpText, dataCy }) => {
  return (
    <Card data-cy={dataCy}>
      <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
      <div className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</div>
      {helpText && <div className="text-xs text-gray-500 dark:text-gray-400">{helpText}</div>}
    </Card>
  )
}

export default StatCard
