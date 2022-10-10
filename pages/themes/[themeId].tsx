import type { NextPage, GetStaticProps, GetStaticPaths } from 'next'
import { Theme as DbTheme } from '@prisma/client'
import prisma from 'lib/prisma'
import styles from 'styles/Home.module.css'
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
      <h1 className={styles.title}>
        {theme.name}
      </h1>

      <p className={styles.description}>
        {theme.description}
      </p>

      { ReactHtmlParser(DOMPurify.sanitize(marked.parse(theme.markdown))) }

      <div className={styles.grid}>
        {Object.entries(theme.courses).map(([name, course]) => (
        <a key={name} href={`${theme.id}/${name}`} className={styles.card}>
          <h2>{name}</h2>
        </a>
        ))}
      </div>
    </Layout>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const themeRefs: DbTheme[] = await prisma.theme.findMany()
  return {
    paths: themeRefs.map((t) => ({ params: { themeId: `${t.id}` } })),
    fallback: false,
  };
}


export const getStaticProps: GetStaticProps = async (context) => {
  const themeIdStr = context?.params?.themeId
  const themeId = Number(Array.isArray(themeIdStr) ? themeIdStr[0] : themeIdStr)
  const themeRef = await prisma.theme.findUnique({
    where: { id: themeId },
  });
  if (!themeRef) {
    return { notFound: true }
  }
  const theme = await getTheme(themeRef)
  return { 
    props: makeSerializable({ theme: theme }),
  }
}

export default ThemeComponent
