import type { NextPage, GetStaticProps } from "next"
import Layout from "components/Layout"
import { Material, getMaterial, removeMarkdown } from "lib/material"
import { PageTemplate, loadPageTemplate } from "lib/pageTemplate"
import { makeSerializable } from "lib/utils"
import Title from "components/ui/Title"
import Link from "next/link"

type NotFoundProps = {
  material: Material
  pageInfo: PageTemplate
}

const NotFound: NextPage<NotFoundProps> = ({ material, pageInfo }) => {
  return (
    <Layout material={material} pageInfo={pageInfo} pageTitle={`Not Found: ${pageInfo.title}`}>
      <div className="px-6 py-12 text-center">
        <Title text="Page not found" className="text-3xl font-bold" style={{ marginBottom: "0px" }} />
        <p className="mt-4 text-gray-700 dark:text-gray-300">
          The page you requested does not exist, or you do not have access to it.
        </p>
        <div className="mt-6">
          <Link href="/" className="text-blue-600 hover:underline dark:text-blue-400">
            Return to the homepage
          </Link>
        </div>
      </div>
    </Layout>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const pageInfo = loadPageTemplate()
  let material = await getMaterial()
  removeMarkdown(material, material)

  return {
    props: makeSerializable({ material, pageInfo }),
  }
}

export default NotFound
