import { readFileSync } from "fs"
import { load } from "js-yaml"

const yamlTemplate = process.env.YAML_TEMPLATE || "config/oxford.yaml"

export type SiteConfig = {
  template: PageTemplate
  material: Record<
    string,
    {
      path: string
      url: string
      exclude?: {
        sections?: string[]
        themes?: string[]
        courses?: string[]
      }
    }
  >
}

export function loadConfig(): SiteConfig | undefined {
  try {
    const fileContents = readFileSync(yamlTemplate, "utf8")
    return load(fileContents) as SiteConfig
  } catch (e) {
    console.error(e)
  }
}

export type PageTemplate = {
  title: string
  logo: { src: string; alt: string }
  description: string
  frontpage: { intro: string }
  footer: string
}

function loadPagetemplate(): PageTemplate | undefined {
  try {
    const siteConfig = loadConfig()
    return siteConfig?.template as PageTemplate
  } catch (e) {
    console.error(e)
  }
}

export const pageTemplate: PageTemplate | undefined = loadPagetemplate()
