import type { NextPage, GetStaticProps } from "next"
import { readFileSync } from "fs"
import Layout from "components/Layout"
import { Markdown } from "components/content/Content"
import { Material, getMaterial, removeMarkdown } from "lib/material"
import { PageTemplate, loadPageTemplate } from "lib/pageTemplate"
import { makeSerializable } from "lib/utils"

type PrivacyProps = {
  material: Material
  pageInfo: PageTemplate
  policy: string
}

const Privacy: NextPage<PrivacyProps> = ({ material, pageInfo, policy }) => {
  return (
    <Layout material={material} pageInfo={pageInfo} pageTitle={`Privacy policy: ${pageInfo.title}`}>
      <div className="px-4 py-8">
        <Markdown markdown={policy} />
      </div>
    </Layout>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const pageInfo = loadPageTemplate()
  if (!pageInfo?.privacyPolicy) {
    return { notFound: true }
  }

  // Strip HTML comments so authors can leave notes that are not rendered on the page
  const policy = readFileSync(pageInfo.privacyPolicy, "utf8").replace(/<!--[\s\S]*?-->/g, "")
  let material = await getMaterial()
  removeMarkdown(material, material)

  return {
    props: makeSerializable({ material, pageInfo, policy }),
  }
}

export default Privacy
