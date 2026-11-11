import type { NextPage, GetStaticProps } from "next"
import { readFileSync } from "fs"
import Layout from "components/Layout"
import { Markdown } from "components/content/Content"
import { Material, getMaterial, removeMarkdown } from "lib/material"
import { PageTemplate, loadPageTemplate } from "lib/pageTemplate"
import { makeSerializable } from "lib/utils"

type AccessibilityProps = {
  material: Material
  pageInfo: PageTemplate
  statement: string
}

const Accessibility: NextPage<AccessibilityProps> = ({ material, pageInfo, statement }) => {
  return (
    <Layout material={material} pageInfo={pageInfo} pageTitle={`Accessibility statement: ${pageInfo.title}`}>
      <div className="px-4 py-8">
        <Markdown markdown={statement} />
      </div>
    </Layout>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const pageInfo = loadPageTemplate()
  if (!pageInfo?.accessibilityStatement) {
    return { notFound: true }
  }

  // Strip HTML comments so authors can leave notes that are not rendered on the page
  const statement = readFileSync(pageInfo.accessibilityStatement, "utf8").replace(/<!--[\s\S]*?-->/g, "")
  let material = await getMaterial()
  removeMarkdown(material, material)

  return {
    props: makeSerializable({ material, pageInfo, statement }),
  }
}

export default Accessibility
