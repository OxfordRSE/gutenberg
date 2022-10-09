import type { NextPage, GetStaticProps } from 'next'
import git from 'isomorphic-git'
import http from 'isomorphic-git/http/node'
import fm from 'front-matter'
import fs, { access, constants } from 'node:fs/promises';
import { Prisma, PrismaClient, Theme as DbTheme } from '@prisma/client'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'

export type CourseRef = {
  file: string,
  dependsOn: string[],
  content?: Course,
}

export type Course = {
  id: string,
  name: string,
  markdown: string,
}

export type Theme = {
  id: string,
  name: string,
  description: string,
  markdown: string,
  courses: Map<string, CourseRef>,
}

const Home: NextPage<Theme[]> = (themes) => {
  return (
    <div className={styles.container}>
      <Head>
        <title>HPC UNIVERSE</title>
        <meta name="description" content="Created by HPC-UNIVERSE team" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Themes
        </h1>

        <p className={styles.description}>
          Click on a theme to get started
        </p>

        <div className={styles.grid}>
          {themes.map(theme => (
          <a key={theme.id} href="https://nextjs.org/docs" className={styles.card}>
            <h2>{theme.name}</h2>
            <p>{theme.description}</p>
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

export async function getTheme(themeRef: DbTheme) : Promise<Theme> {
  const dir = `./${themeRef.id}`;
  try {
    //await access(dir, constants.R_OK)
    await git.pull({
      fs,
      http,
      dir,
      ref: themeRef.commit,
      singleBranch: true
    })
  } catch {
    await git.clone({
      fs,
      http,
      dir,
      corsProxy: 'https://cors.isomorphic-git.org',
      url: themeRef.url,
      ref: themeRef.commit,
      singleBranch: true,
      depth: 10
    });
  }
  const themeBuffer = await fs.readFile(`${dir}/index.md`);
  const themeObject = fm(themeBuffer);
  const id = themeObject.attributes.id as string
  const name = themeObject.attributes.name as string
  const description = themeObject.attributes.description as string
  const markdown = themeObject.body as string
  const courseRefs = themeObject.attributes.courses as Map<string, CourseRef>;

  return {
    id: id,
    name: name,
    description: description,
    markdown: markdown,
    courses: courseRefs,
  }
}

// assumes that git repo has already been pulled/cloned by getTheme
export async function getCourse(themeRef: DbTheme, courseRef: CourseRef) : Promise<Course> {
  const dir = `./${themeRef.id}`;
  const courseBuffer = await fs.readFile(`${dir}/${courseRef.file}`);
  const courseObject = fm(courseBuffer);
  const id = courseObject.attributes.id as string
  const name = courseObject.attributes.name as string
  const markdown = themeObject.body as string

  return {
    id: id,
    name: name,
    markdown: markdown,
  }
}

export const getStaticProps: GetStaticProps = async (context) => {
  const prisma = new PrismaClient()
  const themeRefs = await prisma.theme.findMany()
  let themes: Theme[] = []
  for (const themeRef of themeRefs) {
    const theme = await getTheme(themeRef)
    themes.push(theme)
  }
    
  return {
    props: {
      themes,
    },
  }
}

export default Home
