import type { NextPage, GetStaticProps, GetStaticPaths } from 'next'
import { Theme as DbTheme } from '@prisma/client'
import prisma from 'lib/prisma'
import styles from 'styles/Home.module.css'
import { Course, Theme } from 'pages/index'
import {getCourse, getTheme} from '../..';
import Layout from 'components/Layout'
import { makeSerializable } from 'lib/utils'
import { marked } from 'marked';
import ReactHtmlParser from 'react-html-parser';
import DOMPurify from 'isomorphic-dompurify';

type CourseComponentProps = {
  theme: Theme, 
  course: Course,
}

const CourseComponent: NextPage<CourseComponentProps> = ({theme, course}: CourseComponentProps) => {
  return (
    <Layout>
      <h1 className={styles.title}>
        {course.name}
      </h1>
      { ReactHtmlParser(DOMPurify.sanitize(marked.parse(course.markdown))) }
    </Layout>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const themeRefs: DbTheme[] = await prisma.theme.findMany()
  let paths = []
  for (const themeRef of themeRefs) {
    const theme = await getTheme(themeRef)
    for (const [name, courseRef] of theme.courses) {
      paths.push({
        params: { themeId: `${theme.id}`, courseId: name }
      })
    }
  }
  return {
    paths,
    fallback: false,
  };
}


export const getStaticProps: GetStaticProps = async (context) => {
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
  return { props: makeSerializable({ theme, course: course }) }
}

export default CourseComponent 
