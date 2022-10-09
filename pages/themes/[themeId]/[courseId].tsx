import type { NextPage, GetStaticProps, GetStaticPaths } from 'next'
import { Prisma, PrismaClient, Theme as DbTheme } from '@prisma/client'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { Course, Theme } from '../index'
import {getCourse, getTheme} from '../..';


type CourseComponentProps = {
  theme: Theme, 
  course: Course,
}

const CourseComponent: NextPage<CourseComponentProps> = ({theme, course}: CourseComponentProps) => {
  return (
    <div className={styles.container}>
      <Head>
        <title>HPC UNIVERSE</title>
        <meta name="description" content="Created by HPC-UNIVERSE team" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          {course.name}
        </h1>
        {course.markdown}
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


export const getStaticProps: GetStaticProps = async (context) => {
  const prisma = new PrismaClient()
  const themeIdStr = context?.params?.themeId
  const themeId = Number(Array.isArray(themeIdStr) ? themeIdStr[0] : themeIdStr)
  if (!themeId) {
    return { notFound: true }
  }
  const courseIdStr = context?.params?.courseId
  const courseId = Array.isArray(courseIdStr) ? courseIdStr[0] : courseIdStr
  if (!courseId) {
    return { notFound: true }
  }
  const themeRef = await prisma.theme.findUnique({
    where: { id: themeId },
  });
  if (!themeRef) {
    return { notFound: true }
  }
  const theme = await getTheme(themeRef)
  const courseRef = theme.courses.get(courseId)
  if (!courseRef) {
    return { notFound: true }
  }
  const course = await getCourse(themeRef, courseRef)
  return { props: { theme, course }
  
}

export default ThemeComponent
