import type { NextPage, GetStaticProps, GetStaticPaths } from "next"
import prisma from "lib/prisma"
import Layout from "components/Layout"
import { makeSerializable } from "lib/utils"
import { Material, Theme, getMaterial, removeMarkdown } from "lib/material"
import { material2Html } from "lib/markdown"
import Content from "components/content/Content"
import NavDiagram from "components/navdiagram/NavDiagram"

type HomeProps = {
  material: Material
  theme: Theme
  html: string
}

const Home: NextPage<HomeProps> = ({ material, theme, html }) => {
  return (
    <Layout material={material} html={html}>
      <Content html={html} theme={theme} />
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
  const html = material2Html(material.markdown)
  removeMarkdown(material)

  return {
    props: {
      material: makeSerializable(material),
      events: makeSerializable(events),
      html: makeSerializable(html),
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
