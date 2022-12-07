import type { NextPage, GetStaticProps, GetStaticPaths } from 'next'
import { Theme as DbTheme } from '@prisma/client'
import prisma from 'lib/prisma'
import { getMaterial, Theme, Material, remove_markdown, markdown_to_html } from 'lib/material'
import Layout from 'components/Layout'
import {makeSerializable} from 'lib/utils'
import Content from 'components/Content'
import NavDiagram from 'components/NavDiagram'

type ThemeComponentProps = {
  theme: Theme,
  material: Material
}

const ThemeComponent: NextPage<ThemeComponentProps> = ({ theme, material }) => {
  return (
    <Layout theme={theme}>
      <Content markdown={theme.markdown} />
      <div className="grid m-2 gap-3 grid-cols-2">
        {theme.courses.map((course) => (
          <a key={course.id} href={`${theme.id}/${course.id}`} className="block max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow-md hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
              <h5 className="mb-2 text-lg font-bold tracking-tight text-gray-900 dark:text-white">{course.name}</h5>
              <p className="font-normal truncate ... text-gray-700 dark:text-gray-400">{course.summary}</p>
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
    props: makeSerializable({ material, theme }),
  }
}

export default ThemeComponent
