import type { NextPage, GetStaticProps, GetStaticPaths } from "next"
import prisma from "lib/prisma"
import { getMaterial, Theme, Material, removeMarkdown, getExcludes, Excludes } from "lib/material"
import Layout from "components/Layout"
import { makeSerializable } from "lib/utils"
import Content from "components/content/Content"
import NavDiagram from "components/NavDiagram"
import Title from "components/ui/Title"
import { Event } from "lib/types"
import { PageTemplate, pageTemplate } from "lib/pageTemplate"
import revalidateTimeout from "lib/revalidateTimeout"

type ThemeComponentProps = {
  theme: Theme
  material: Material
  events: Event[]
  pageInfo?: PageTemplate
  excludes?: Excludes
}

const ThemeComponent: NextPage<ThemeComponentProps> = ({ theme, material, events, pageInfo, excludes }) => {
  return (
    <Layout material={material} theme={theme} pageInfo={pageInfo}>
      <Title text={theme.name} />
      <NavDiagram material={material} theme={theme} excludes={excludes} />
      <Content markdown={theme.markdown} theme={theme} />
    </Layout>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const material = await getMaterial()
  return {
    paths: material.themes.map((t) => ({ params: { themeId: `${t.id}`, repoId: `${t.repo}` } })),
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps = async (context) => {
  const pageInfo = pageTemplate
  const events = await prisma.event
    .findMany({
      where: { hidden: false },
    })
    .catch((e) => {
      return []
    })
  let material = await getMaterial()
  const themeId = context?.params?.themeId
  const repoId = context?.params?.repoId
  if (!themeId || Array.isArray(themeId)) {
    return { notFound: true }
  }
  const excludes = getExcludes(repoId as string)
  const theme = material.themes.find((t) => t.id === themeId && t.repo === repoId)
  if (!theme) {
    return { notFound: true }
  }

  removeMarkdown(material, theme)

  return {
    props: makeSerializable({ material, theme, events, pageInfo, excludes }),
    revalidate: revalidateTimeout,
  }
}

export default ThemeComponent
