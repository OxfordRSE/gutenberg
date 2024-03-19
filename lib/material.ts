import fs from "fs"
import fsPromises from "fs/promises"
import fm from "front-matter"
import { basePath } from "./basePath"
import { EventItem } from "@prisma/client"
import * as yaml from "js-yaml"

export type Attribution = {
  citation: string
  url: string
  image: string
  license: string
}

export type Excludes = {
  themes: string[]
  courses: string[]
  sections: string[]
}

export type Section = {
  id: string
  file: string
  course: string
  theme: string
  name: string
  markdown: string
  dependsOn: string[]
  tags: string[]
  index: number
  type: string
  attribution: Attribution[]
  problems: string[]
}

export type Course = {
  id: string
  theme: string
  name: string
  dependsOn: string[]
  markdown: string
  sections: Section[]
  type: string
  attribution: Attribution[]
  summary: string
}

export type Theme = {
  repo: string
  id: string
  name: string
  markdown: string
  courses: Course[]
  type: string
  summary?: string
}

export type Material = {
  name: string
  markdown: string
  themes: Theme[]
  type: string
  themeNames?: {}
  courseNames?: {}
  sectionNames?: {}
}

export const sectionSplit = (
  section: String,
  material: Material
): { theme?: Theme; course?: Course; section?: Section; url?: string } => {
  const split = section.split(".")
  if (split.length === 4) {
    const theme = material.themes.find((theme) => theme.id === split[1])
    const course = theme?.courses.find((course) => course.id === split[2])
    const section = course?.sections.find((section) => section.id === split[3])
    const url = `${basePath}/material/${split[0]}/${split[1]}/${split[2]}/${split[3]}`
    return {
      theme,
      course,
      section,
      url,
    }
  } else if (split.length === 3) {
    const theme = material.themes.find((theme) => theme.id === split[1])
    const course = theme?.courses.find((course) => course.id === split[2])
    const url = `${basePath}/material/${split[0]}/${split[1]}/${split[2]}`
    return {
      theme,
      course,
      url,
    }
  } else if (split.length === 2) {
    const theme = material.themes.find((theme) => theme.id === split[1])
    const url = `${basePath}/material/${split[0]}/${split[1]}`
    return {
      theme,
      url,
    }
  }
  return {}
}

export const eventItemSplit = (
  eventItem: EventItem,
  material: Material
): { theme?: Theme; course?: Course; section?: Section; url?: string } => {
  return sectionSplit(eventItem.section, material)
}

export function removeMarkdown(material: Material, except: Material | Theme | Course | Section | undefined) {
  if (except === undefined || except.type !== "Material") {
    material.markdown = ""
  }

  for (let theme of material.themes) {
    // @ts-expect-error
    if (except === undefined || !(except.type === "Theme" && except.id == theme.id)) {
      theme.markdown = ""
    }
    for (let course of theme.courses) {
      // @ts-expect-error
      if (except === undefined || !(except.type === "Course" && except.id == course.id)) {
        course.markdown = ""
      }
      for (let section of course.sections) {
        // @ts-expect-error
        if (except === undefined || !(except.type === "Section" && except.id == section.id)) {
          section.markdown = ""
        }
      }
    }
  }
}

const materialDir = `${process.env.MATERIAL_DIR}`

function getrepos() {
  const fileContents = fs.readFileSync("config/oxford.yaml")
  // @ts-expect-error
  const repos = yaml.load(fileContents).material
  return repos
}

export function getExcludes(repo: string): Excludes {
  const repos = getrepos()
  const key = Object.keys(repos).find((key) => repos[key].path === repo)
  const repoConfig = repos[key]
  const excludeSections = repoConfig.exclude?.sections ?? []
  const excludeThemes = repoConfig.exclude?.themes ?? []
  const excludeCourses = repoConfig.exclude?.courses ?? []
  return { sections: excludeSections, themes: excludeThemes, courses: excludeCourses }
}

export function getRepoUrl(repo: string): string {
  const repos = getrepos()
  const key = Object.keys(repos).find((key) => repos[key].path === repo)
  const repoConfig = repos[key]
  return repoConfig.url
}

export async function getMaterial(no_markdown = false): Promise<Material> {
  const repos = getrepos()
  let allThemes: Theme[] = []
  let allSections: Section[] = []
  let allCourses: Course[] = []

  for (const key of Object.keys(repos)) {
    const repo = repos[key].path
    const dir = `${materialDir}/${repo}`
    const rel_dir = `../${materialDir}`
    const public_dir = `public/material`
    fs.symlink(rel_dir, public_dir, "dir", (err) => {
      if (!err) {
        console.log("\nSymlink created\n")
      }
    })
    const buffer = await fsPromises.readFile(`${dir}/index.md`, { encoding: "utf8" })
    const material = fm(buffer)

    // @ts-expect-error
    const name = material.attributes.name as string
    const markdown = no_markdown ? "" : (material.body as string)
    // @ts-expect-error
    const themesId = material.attributes.themes as [string]

    let themes = await Promise.all(themesId.map((theme) => getTheme(repo, theme, no_markdown)))
    const excludeThemes = getExcludes(repo).themes
    themes = themes.filter((theme) => !excludeThemes.includes(theme.id))
    for (const theme of themes) {
      allThemes.push(theme)
    }
  }
  const markdown = ""
  const name = "test"
  const type = "Material"
  return { name, markdown, themes: allThemes, type }
}

export async function getTheme(repo: string, theme: string, no_markdown = false): Promise<Theme> {
  const dir = `${materialDir}/${repo}/${theme}`
  const themeBuffer = await fsPromises.readFile(`${dir}/index.md`, { encoding: "utf8" })
  const themeObject = fm(themeBuffer)
  // @ts-expect-error
  const name = themeObject.attributes.name as string
  // @ts-expect-error
  const summary = themeObject.attributes.summary as string
  const markdown = no_markdown ? "" : (themeObject.body as string)
  const id = theme
  // @ts-expect-error
  const coursesId = themeObject.attributes.courses as [string]
  let courses = await Promise.all(coursesId.map((course) => getCourse(repo, theme, course)))
  const excludeCourses = getExcludes(repo).courses
  const excludeThemes = getExcludes(repo).themes
  courses = courses.filter((course) => !excludeCourses.includes(course.id))
  courses = courses.filter((course) => !excludeThemes.includes(id))
  const type = "Theme"
  return { repo, id, name, markdown, courses, type, summary }
}

export async function getCourse(repo: string, theme: string, course: string, no_markdown = false): Promise<Course> {
  const dir = `${materialDir}/${repo}/${theme}/${course}`
  const courseBuffer = await fsPromises.readFile(`${dir}/index.md`, { encoding: "utf8" })
  const courseObject = fm(courseBuffer)
  // @ts-expect-error
  const name = courseObject.attributes.name as string
  // @ts-expect-error
  const summary = (courseObject.attributes.summary as string) || ""
  // @ts-expect-error
  const dependsOn = (courseObject.attributes.dependsOn as string[]) || []
  // @ts-expect-error
  const filenames = (courseObject.attributes.files as string[]) || []
  const markdown = no_markdown ? "" : (courseObject.body as string)
  // @ts-expect-error
  const files = courseObject.attributes.files as [string]
  // @ts-expect-error
  const attribution = (courseObject.attributes.attribution as Attribution[]) || []
  const id = course
  let sections = await Promise.all(files.map((file, i) => getSection(repo, theme, course, i, file)))
  const excludeSections = getExcludes(repo).sections
  sections = sections.filter((section) => !excludeSections.includes(section.id))
  const type = "Course"

  return { id, theme, name, sections, dependsOn, markdown, type, attribution, summary }
}

// https://stackoverflow.com/questions/21792367/replace-underscores-with-spaces-and-capitalize-words
function humanize(str: string) {
  var i,
    frags = str.replace(/\.[^/.]+$/, "").split("_")
  for (i = 0; i < frags.length; i++) {
    frags[i] = frags[i].charAt(0).toUpperCase() + frags[i].slice(1)
  }
  return frags.join(" ")
}

export async function getSection(
  repo: string,
  theme: string,
  course: string,
  index: number,
  file: string,
  no_markdown = false
): Promise<Section> {
  const id = file.replace(/\.[^/.]+$/, "")
  const dir = `${materialDir}/${repo}/${theme}/${course}`
  const sectionBuffer = await fsPromises.readFile(`${dir}/${file}`, { encoding: "utf8" })
  const sectionObject = fm(sectionBuffer)
  // @ts-expect-error
  const dependsOn = (sectionObject.attributes.dependsOn as string[]) || []
  // @ts-expect-error
  const tags = (sectionObject.attributes.tags as string[]) || []
  // @ts-expect-error
  const name = (sectionObject.attributes.name as string) || humanize(file)
  // @ts-expect-error
  const attribution = (sectionObject.attributes.attribution as Attribution[]) || []
  const markdown = no_markdown ? "" : (sectionObject.body as string)
  const type = "Section"
  const regex =
    /:{3,}challenge\s*{\s*(?:id\s*=\s*"?([^"\s]+)"?\s*title\s*=\s*"[^"]+"|title\s*=\s*"[^"]+"\s*id\s*=\s*"?([^"\s]+)"?)\s*}/g
  const problems = Array.from(markdown.matchAll(regex)).map((match) => match[1] || match[2])
  return { id, file, theme, course, name, markdown, index, type, tags, dependsOn, attribution, problems }
}
