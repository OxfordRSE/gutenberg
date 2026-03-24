import type { NextPage, GetStaticProps, GetStaticPaths } from "next"
import Layout from "components/Layout"
import { makeSerializable } from "lib/utils"
import { Material, MaterialTheme, getMaterial, removeMarkdown } from "lib/material"
import Content from "components/content/Content"
import NavDiagram from "components/navdiagram/NavDiagram"
import { loadPageTemplate, PageTemplate } from "lib/pageTemplate"
import { runBuildPrismaQuery } from "lib/buildPrisma"

type HomeProps = {
  material: Material
  theme: MaterialTheme
  pageInfo: PageTemplate
}

const Home: NextPage<HomeProps> = ({ material, theme, pageInfo }) => {
  return (
    <Layout material={material} pageInfo={pageInfo}>
      <Content markdown={material.markdown} theme={theme} />
      <NavDiagram material={material} />
    </Layout>
  )
}

export const getStaticProps: GetStaticProps = async (context) => {
  const events = await runBuildPrismaQuery("pages/material/[repoId]/[themeId]/diagram.tsx events", [], (prisma) =>
    prisma.event.findMany({
      where: { hidden: false },
    })
  )
  let material = await getMaterial()
  removeMarkdown(material, material)
  const pageInfo = loadPageTemplate()

  return {
    props: {
      material: makeSerializable(material),
      events: makeSerializable(events),
      pageInfo: makeSerializable(pageInfo),
    },
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const material = await getMaterial()
  let paths = []
  for (const theme of material.themes) {
    for (const course of theme.courses) {
      paths.push({
        params: { repoId: `${theme.repo}`, themeId: `${theme.id}`, courseId: `${course.id}` },
      })
    }
  }
  return {
    paths,
    fallback: false,
  }
}

export default Home
