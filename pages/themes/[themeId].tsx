import type { NextPage, GetStaticProps, GetStaticPaths } from 'next'
import { Theme as DbTheme } from '@prisma/client'
import prisma from 'lib/prisma'
import { getTheme, Theme } from 'pages/index'
import Layout from 'components/Layout'
import { marked } from 'marked';
import {makeSerializable} from 'lib/utils'
import ReactHtmlParser from 'react-html-parser';
import DOMPurify from 'isomorphic-dompurify';

type ThemeComponentProps = {
  theme: Theme
}

const ThemeComponent: NextPage<ThemeComponentProps> = ({ theme }) => {
  return (
    <Layout>
      <h1>
        {theme.name}
      </h1>

      { ReactHtmlParser(DOMPurify.sanitize(marked.parse(theme.markdown))) }

      <div>
        {theme.courses.map((courseId) => (
        <a key={courseId} href={`${theme.id}/${courseId}`}>
          <h2>{course}</h2>
        </a>
        ))}
      </div>
    </Layout>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const material = await getMaterial();
  let themes: Theme[] = []
  for (const theme of material.themes) {
    themes.push(await getTheme(theme))
  }
  return {
    paths: themes.map((t) => ({ params: { themeId: `${t.id}` } })),
    fallback: false,
  };
}


export const getStaticProps: GetStaticProps = async (context) => {
  const themeId= context?.params?.themeId;
  if (!themeId || Array.isArray(themeId)) {
    return { notFound: true }
  }
  const theme = await getTheme(themeId);
  return { 
    props: makeSerializable({ theme: theme }),
  }
}

export default ThemeComponent
