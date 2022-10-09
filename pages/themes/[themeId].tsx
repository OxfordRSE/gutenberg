import type { NextPage, GetStaticProps, GetStaticPaths } from 'next'
import { Prisma, PrismaClient, Theme as DbTheme } from '@prisma/client'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { CourseRef, getTheme, Theme } from '../index'



const ThemeComponent: NextPage<Theme> = (theme) => {
  return (
    <div className={styles.container}>
      <Head>
        <title>HPC UNIVERSE</title>
        <meta name="description" content="Created by HPC-UNIVERSE team" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          {theme.name}
        </h1>

        <p className={styles.description}>
          {theme.description}
        </p>

        {theme.markdown}

        <div className={styles.grid}>
          {Object.entries(theme.courses).map(([name, course]) => (
          <a key={name} href="https://nextjs.org/docs" className={styles.card}>
            <h2>{name}</h2>
          </a>
          ))}
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prisma = new PrismaClient()
  const themeRefs: DbTheme[] = await prisma.theme.findMany()
  return {
    paths: themeRefs.map((t) => ({ params: { themeId: `${t.id}` } })),
    fallback: false,
  };
}


export const getStaticProps: GetStaticProps = async (context) => {
  const prisma = new PrismaClient()
  const themeIdStr = context?.params?.themeId
  const themeId = Number(Array.isArray(themeIdStr) ? themeIdStr[0] : themeIdStr)
  const themeRef = await prisma.theme.findUnique({
    where: { id: themeId },
  });
  // why doesn't it return DbTheme?
  if (!themeRef) {
    return { notFound: true }
  }
  const theme = await getTheme(themeRef)
  return { props: theme }
}

export default ThemeComponent
