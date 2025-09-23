import type { NextPage, GetStaticProps, GetStaticPaths } from "next"
import prisma from "lib/prisma"
import Layout from "components/Layout"
import { makeSerializable } from "lib/utils"
import { Material, Theme, getMaterial, removeMarkdown } from "lib/material"
import Content from "components/content/Content"
import NavDiagram from "components/navdiagram/NavDiagram"
import { pageTemplate, PageTemplate } from "lib/pageTemplate"

type HomeProps = {
  material: Material
  theme: Theme
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
  const events = await prisma.event
    .findMany({
      where: { hidden: false },
    })
    .catch((e) => {
      return []
    })
  let material = await getMaterial()
  removeMarkdown(material, material)

  return {
    props: {
      material: makeSerializable(material),
      events: makeSerializable(events),
    },
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const pageInfo = pageTemplate
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
    pageInfo,
  }
}

export default Home
