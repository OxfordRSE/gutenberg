import type { NextPage, GetStaticProps, GetStaticPaths } from 'next'
import { Theme as DbTheme } from '@prisma/client'
import prisma from 'lib/prisma'
import { getMaterial, Theme, Material, remove_markdown, markdown_to_html } from 'lib/material'
import Layout from 'components/Layout'
import {makeSerializable} from 'lib/utils'
import Content from 'components/Content'

type ThemeComponentProps = {
  theme: Theme,
  material: Material
}

const ThemeComponent: NextPage<ThemeComponentProps> = ({ theme, material }) => {
  return (
    <Layout theme={theme}>
      <h1>
        {theme.name}
      </h1>

      <Content markdown={theme.markdown} />

      <div>
        {theme.courses.map((course) => (
        <a key={course.id} href={`${theme.id}/${course.id}`}>
          <h2>{course.name}</h2>
        </a>
        ))}
      </div>
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
    props: makeSerializable({ theme: theme }),
  }
}

export default ThemeComponent
