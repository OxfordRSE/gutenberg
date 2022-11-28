import type { NextPage, GetStaticProps } from 'next'
import git from 'isomorphic-git'
import http from 'isomorphic-git/http/node'
import fm from 'front-matter'
import { Theme as DbTheme } from '@prisma/client'
import prisma from 'lib/prisma'
import fs from 'fs'
import fsPromises from 'fs/promises'
import Layout from 'components/Layout'
import { makeSerializable } from 'lib/utils'

export type Course = {
  id: string,
  theme: string,
  name: string,
  markdown: string,
  dependsOn: string[],
  files: string[],
}

export type Theme = {
  id: string,
  name: string,
  markdown: string,
  courses: Course[],
}

export type Material = {
  name: string,
  markdown: string,
  themes: Theme[],
}

type HomeProps = {
  themes: Theme[]
}

const Home: NextPage<HomeProps> = ({ themes }) => {
  return (
    <Layout>
      <h1>
        Themes
      </h1>

      <p>
        Click on a theme to get started
      </p>

      <div>
        {themes.map(theme => (
        <a key={theme.id} href={`/themes/${theme.id}`}>
          <h2>{theme.name}</h2>
          <p>{theme.markdown}</p>
        </a>
        ))}
      </div>
    </Layout>
  )
}

const materialDir = process.env.MATERIAL_DIR;

export async function getMaterial() : Promise<Material> {
  const dir = `${materialDir}`;
  const buffer = await fsPromises.readFile(`${dir}/index.md`, {encoding: "utf8"});
  const material = fm(buffer);
  const name = material.attributes.name as string
  const markdown = material.body as string
  const themesId = material.attributes.themes as [string];
  const themes = await Promise.all(themesId.map(theme => getTheme(theme)));

  return { name, markdown, themes };
}

export async function getTheme(theme: string) : Promise<Theme> {
  const dir = `${materialDir}/${theme}`;
  const themeBuffer = await fsPromises.readFile(`${dir}/index.md`, {encoding: "utf8"});
  const themeObject = fm(themeBuffer);
  const name = themeObject.attributes.name as string
  const markdown = themeObject.body as string
  const id = theme;
  const coursesId = themeObject.attributes.courses as [string];
  const courses = await Promise.all(coursesId.map(course => getCourse(course)));

  return { id, name, markdown, courses };
}

export async function getCourse(theme: string, course: string) : Promise<Course> {
  const dir = `${materialDir}/${theme}/${course}`;
  const courseBuffer = await fsPromises.readFile(`${dir}/index.md`, {encoding: "utf8"});
  const courseObject = fm(courseBuffer);
  const name = courseObject.attributes.name as string
  const filenames = courseObject.attributes.files as [string];
  const dependsOn = courseObject.attributes.dependsOn as [string];
  const markdown = courseObject.body as string
  const id = course;
  const files = await Promise.all(filenames.map(filename => fsPromises.readFile(`${dir}/${filename}`, {encoding: "utf8"})));

  return { id, theme, name, files, dependsOn, markdown }
}

export const getStaticProps: GetStaticProps = async (context) => {
  const material = await getMaterial();
    
  return {
    props: {
      themes: makeSerializable(material.themes),
    },
  }
}

export default Home
