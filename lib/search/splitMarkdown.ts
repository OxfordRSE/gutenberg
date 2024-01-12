import { v4 as uuid } from "uuid"
import fs from "fs"
import fsPromises from "fs/promises"
import fm from "front-matter"
import { getDocsList, readPageMarkdown } from "./readMarkdown"
import { createSectionVector } from "./createVectors"
import { title } from "process"
import { theme } from "flowbite-react"
import { hasMaterialChanged } from "./manageMaterial"

export type SectionObj = {
  id: string
  vector: number[]
  payload: {
    text: string
    title: string
    url: string
    sectionAnchor: string
    blockType: string
    theme: string
    course: string
    page: string
  }
}

const materialDir = process.env.MATERIAL_DIR as string

export async function materialToJson() {
  let sections = await parsePages()
  const replace = await hasMaterialChanged(sections)
  if (replace) {
    sections = await createSectionVector(sections)
    const json = await sectionsToJson(sections)
    fs.writeFileSync("material.json", json)
  } else {
  }
  return sections
}

export async function parsePages() {
  const fileList = getDocsList(materialDir)
  let sectionsList: SectionObj[][] = []
  for (const file of fileList) {
    const pageMd = readPageMarkdown(file)
    const [titles, sectionContents, sectionAnchors] = splitPageIntoSections(pageMd)
    sectionsList.push(await createSections(titles, sectionContents, sectionAnchors, file))
  }
  return sectionsList.flat()
}

function getPageUrl(filepath: string, anchor: string): string {
  let urlBase = `/material${filepath.split(materialDir)[1]}`.split(".md")[0]
  // if the file is "index.md" then we point to the directory instead
  if (urlBase.endsWith("/index")) {
    urlBase = urlBase.split("/index")[0]
  }
  if (anchor !== "") {
    return `${urlBase}#${anchor}`
  } else {
    return `${urlBase}`
  }
}

function extractTitleAndAnchor(header: string): [string, string] {
  const title = header.replace(/#/g, "").trim()
  const anchor = title.replace(/ /g, "-").replace(/:/g, "").replace(/`/g, "")
  return [title, anchor]
}

function splitTextCodeBlocks(pageMd: string): [string[], string[]] {
  const textAndCode = pageMd.split(/```|~~~/)
  // every even block will be a code block and every odd block will be a text block so we check if mod 2 is 0 or 1
  // to decide if the content is code or text
  const text = textAndCode.filter((_, index) => index % 2 === 0)
  const code = textAndCode.filter((_, index) => index % 2 !== 0)
  return [text, code]
}

function splitPageIntoSections(pageMd: string): [string[], string[], string[]] {
  const [text, code] = splitTextCodeBlocks(pageMd)

  let titles: string[] = []
  let sectionContents: string[] = []
  let sectionAnchors: string[] = []
  let currSectionContent: string = ""
  let sectionKey: string = ""
  let title: string = ""
  let anchor: string = ""

  for (let i = 0; i < text.length; i++) {
    const textBlockLines = text[i].split("\n")
    for (const line of textBlockLines) {
      if (line.trim().startsWith("#")) {
        // line is a title so we use it as a new section and save the old
        if (currSectionContent !== "") {
          sectionAnchors.push(sectionKey!)
          sectionContents.push(currSectionContent)
          titles.push(title!)
          currSectionContent = ""
        }

        ;[title, anchor] = extractTitleAndAnchor(line)
        currSectionContent += `${title}:`
        sectionKey = anchor
      } else {
        if (line.trim().startsWith("#") && line.includes(" ")) {
          currSectionContent += `\n${line.split(" ")[1]}:`
        } else {
          currSectionContent += `\n${line}`
        }
      }
    }

    // TODO: make each code block a section with the same anchor tag as the preceding content
  }

  if (sectionKey !== null) {
    sectionAnchors.push(sectionKey!)
    sectionContents.push(currSectionContent)
    titles.push(title)
  }

  return [titles, sectionContents, sectionAnchors]
}

async function createSections(
  titles: string[],
  sectionContents: string[],
  sectionAnchors: string[],
  file: string
): Promise<SectionObj[]> {
  const sectionsList: SectionObj[] = []
  for (let i = 0; i < sectionContents.length; i++) {
    const sectionContent = sectionContents[i]
    const sectionTitle = titles[i]
    const sectionAnchor = sectionAnchors[i]
    const pageUrl = getPageUrl(file, sectionAnchor)
    const blockType = "text"
    const themeTitle = await getThemeTitle(file)
    const courseTitle = await getCourseTitle(file)
    const pageTitle = await getPageTitle(file)
    const section = createSection(
      sectionContent,
      sectionAnchor,
      pageUrl,
      blockType,
      sectionTitle,
      themeTitle,
      courseTitle,
      pageTitle
    )
    sectionsList.push(section)
  }
  return sectionsList
}

async function getThemeTitle(file: string): Promise<string> {
  const dir = file.split("/").slice(0, 2).join("/")
  if (dir.includes(".md")) {
    return ""
  }
  const buffer = await fsPromises.readFile(`${dir}/index.md`, { encoding: "utf8" })
  const material = fm(buffer)

  // @ts-expect-error
  const themeTitle = (await material.attributes.name) as string
  return themeTitle
}

async function getCourseTitle(file: string): Promise<string> {
  const dir = file.split("/").slice(0, 3).join("/")
  if (dir.includes(".md")) {
    return ""
  }
  const buffer = await fsPromises.readFile(`${dir}/index.md`, { encoding: "utf8" })
  const material = fm(buffer)

  // @ts-expect-error
  const course = material.attributes.name as string
  return course
}

async function getPageTitle(file: string): Promise<string> {
  const buffer = await fsPromises.readFile(file, { encoding: "utf8" })
  const material = fm(buffer)
  // @ts-expect-error
  const section = material.attributes.name as string
  return section
}

function createSection(
  sectionContent: string,
  sectionAnchor: string,
  pageUrl: string,
  blockType: string,
  title: string,
  themeTitle: string,
  courseTitle: string,
  pageTitle: string
) {
  const id = uuid()
  const section: SectionObj = {
    id: id,
    vector: [],
    payload: {
      text: sectionContent,
      title: title,
      url: pageUrl,
      sectionAnchor: sectionAnchor,
      blockType: blockType,
      theme: themeTitle,
      course: courseTitle,
      page: pageTitle,
    },
  }
  return section
}

async function sectionsToJson(sections: SectionObj[] | SectionObj) {
  const json = JSON.stringify(sections)
  return json
}

export function jsonToSections(file: string) {
  const json = fs.readFileSync(file, "utf8")
  const sections = JSON.parse(json)
  return sections
}
