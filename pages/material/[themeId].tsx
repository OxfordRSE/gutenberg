import type { NextPage, GetStaticProps, GetStaticPaths } from 'next'
import prisma from 'lib/prisma'
import { getMaterial, Theme, Material, remove_markdown } from 'lib/material'
import Layout from 'components/Layout'
import {makeSerializable} from 'lib/utils'
import Content from 'components/Content'
import NavDiagram from 'components/NavDiagram'
import Title from 'components/Title'

type ThemeComponentProps = {
  theme: Theme,
  material: Material
}

const ThemeComponent: NextPage<ThemeComponentProps> = ({ theme, material }) => {
  return (
    <Layout theme={theme}>
      <Title text={theme.name} />
      <NavDiagram material={material} theme={theme} />
      <Content markdown={theme.markdown} />
    </Layout>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const material = await getMaterial();
  return {
    paths: material.themes.map((t) => ({ params: { themeId: `${t.id}` } })),
    fallback: false,
  };
}


export const getStaticProps: GetStaticProps = async (context) => {
  let material = await getMaterial();
  const themeId= context?.params?.themeId;
  if (!themeId || Array.isArray(themeId)) {
    return { notFound: true };
  }
  const theme = material.themes.find(t => t.id === themeId);
  if (!theme) {
    return { notFound: true };
  }

  remove_markdown(material, theme)

  return { 
    props: makeSerializable({ material, theme }),
  }
}

export default ThemeComponent
