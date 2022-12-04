import type { NextPage, GetStaticProps, GetStaticPaths } from 'next'
import { Theme as DbTheme } from '@prisma/client'
import prisma from 'lib/prisma'
import { getMaterial, Course, Theme, Material, remove_markdown } from 'lib/material'
import Layout from 'components/Layout'
import { makeSerializable } from 'lib/utils'
import { remove } from 'cypress/types/lodash'
import Content from 'components/Content'

type CourseComponentProps = {
  theme: Theme, 
  course: Course,
}

const CourseComponent: NextPage<CourseComponentProps> = ({theme, course}: CourseComponentProps) => {
  return (
    <Layout theme={theme} course={course}>
      <Content markdown={course.markdown} />
      <div className="m-4 bg-white border rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-700">
      <ol role="list" className="grid grid-cols-1 justify-center divide-y divide-gray-200 dark:divide-gray-700">
        {course.sections.map((s, i) => (
          <li key={s.file} className="">
            <a  href={`${course.id}/${s.file}`} className="flex items-center space-x-4 p-4 hover:bg-gray-100  dark:hover:bg-gray-700">
              <h5 className="text-2xl font-bold text-gray-900 dark:text-white">{s.name}</h5>
              <p className="font-normal truncate ... text-gray-700 dark:text-gray-400">{s.summary}</p>
            </a>
          </li>
        ))}
      </ol>
      </div>
    </Layout>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const material = await getMaterial()
  let paths = []
  for (const theme of material.themes) {
    for (const course of theme.courses) {
      paths.push({
        params: { themeId: `${theme.id}`, courseId: `${course.id}`}
      })
    }
  }
  return {
    paths,
    fallback: false,
  };
}


export const getStaticProps: GetStaticProps = async (context) => {
  const themeId = context?.params?.themeId
  if (!themeId || Array.isArray(themeId)) {
    return { notFound: true }
  }
  const courseId = context?.params?.courseId
  if (!courseId || Array.isArray(courseId)) {
    return { notFound: true }
  }
  const material = await getMaterial()
  const theme = material.themes.find(t => t.id === themeId);
  if (!theme) {
    return { notFound: true }
  }
  const course = theme.courses.find(c => c.id === courseId);
  if (!course) {
    return { notFound: true }
  }
  remove_markdown(material, course);
  return { props: makeSerializable({ theme, course }) }
}

export default CourseComponent 
