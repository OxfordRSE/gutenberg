import * as fs from "fs"
import * as yaml from "js-yaml"

const yamlTemplate = process.env.YAML_TEMPLATE || "config/oxford.yaml"

export type PageTemplate = {
  title: string
  logo: { src: string; alt: string }
  description: string
  frontpage: { intro: string }
  footer: string
}

export const pageTemplate: PageTemplate | undefined = (() => {
  try {
    const fileContents = fs.readFileSync(yamlTemplate, "utf8")
    // @ts-expect-error
    const data = yaml.load(fileContents).template as PageTemplate
    return data
  } catch (e) {
    console.error(e)
  }
})()
