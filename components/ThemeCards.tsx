import { Material, Excludes } from "lib/material"
import { basePath } from "lib/basePath"
import { Card } from "flowbite-react"

interface Props {
  material: Material
  excludes?: Excludes
  includeSummary?: boolean
}

const ThemeCards = ({ material, excludes, includeSummary = true }: Props) => {
  const numberCols = includeSummary ? 2 : 1
  const textSize = includeSummary ? "text-2xl" : "text-md"
  const themeCards = material?.themes
    .filter((theme) => !excludes || !excludes.themes.includes(theme.id))
    .map((theme) => (
      <Card key={theme.repo + theme.id} href={`${basePath}/material/${theme.repo}/${theme.id}`} className="w-90%">
        <h2 className={`mb-2 ${textSize} font-bold tracking-tight text-gray-900 dark:text-white`}>{theme.name}</h2>
        {includeSummary && <p>{theme.summary}</p>}
      </Card>
    ))

  return <div className={`px-2 mt-2 mb-2 grid grid-cols-${numberCols} gap-4`}>{themeCards}</div>
}

export default ThemeCards
