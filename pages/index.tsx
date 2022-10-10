import type { NextPage, GetStaticProps } from 'next'
import git from 'isomorphic-git'
import http from 'isomorphic-git/http/node'
import fm from 'front-matter'
import { Theme as DbTheme } from '@prisma/client'
import prisma from 'lib/prisma'
import fs from 'fs'
import fsPromises from 'fs/promises'
import styles from 'styles/Home.module.css'
import Layout from 'components/Layout'
import { makeSerializable } from 'lib/utils'

export type CourseRef = {
  file: string,
  dependsOn: string[],
  content?: Course,
}

export type Course = {
  uid: string,
  name: string,
  markdown: string,
}

export type Theme = {
  id: number,
  uid: string,
  name: string,
  description: string,
  markdown: string,
  courses: Map<string, CourseRef>,
}

type HomeProps = {
  themes: Theme[]
}

const Home: NextPage<HomeProps> = ({ themes }) => {
  return (
    <Layout>
      <h1 className={styles.title}>
        Themes
      </h1>

      <p className={styles.description}>
        Click on a theme to get started
      </p>

      <div className={styles.grid}>
        {themes.map(theme => (
        <a key={theme.id} href={`/themes/${theme.id}`} className={styles.card}>
          <h2>{theme.name}</h2>
          <p>{theme.description}</p>
        </a>
        ))}
      </div>
    </Layout>
  )
}

const materialDir = './.material'

export async function getTheme(themeRef: DbTheme) : Promise<Theme> {
  const dir = `${materialDir}/${themeRef.id}`;
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
  const themeBuffer = await fsPromises.readFile(`${dir}/index.md`, {encoding: "utf8"});
  const themeObject = fm(themeBuffer);
  const uid = themeObject.attributes.id as string
  const name = themeObject.attributes.name as string
  const description = themeObject.attributes.description as string
  const markdown = themeObject.body as string
  const courseRefs = new Map<string, CourseRef>(Object.entries(themeObject.attributes.courses))

  return {
    id: themeRef.id,
    uid: uid,
    name: name,
    description: description,
    markdown: markdown,
    courses: courseRefs,
  }
}

// assumes that git repo has already been pulled/cloned by getTheme
export async function getCourse(themeRef: DbTheme, courseRef: CourseRef) : Promise<Course> {
  const dir = `${materialDir}/${themeRef.id}`;
  const courseBuffer = await fsPromises.readFile(`${dir}/${courseRef.file}`, {encoding: "utf8"});
  const courseObject = fm(courseBuffer);
  const uid = courseObject.attributes.id as string
  const name = courseObject.attributes.name as string
  const markdown = courseObject.body as string

  return {
    uid: uid,
    name: name,
    markdown: markdown,
  }
}

export const getStaticProps: GetStaticProps = async (context) => {
  const themeRefs = await prisma.theme.findMany()
  let themes: Theme[] = []
  for (const themeRef of themeRefs) {
    const theme = await getTheme(themeRef)
    themes.push(theme)
  }
    
  return {
    props: {
      themes: makeSerializable(themes),
    },
  }
}

export default Home
