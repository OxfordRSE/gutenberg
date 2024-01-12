import fs from "fs"
import path from "path"

export function getDocsList(materialDir: string): string[] {
  const markdownFiles: string[] = []

  function traverseDirectory(currentPath: string) {
    const files = fs.readdirSync(currentPath)

    files.forEach((file) => {
      const filePath = path.join(currentPath, file)
      const stats = fs.statSync(filePath)

      if (stats.isDirectory()) {
        traverseDirectory(filePath)
      } else if (path.extname(file) === ".md") {
        markdownFiles.push(filePath)
      }
    })
  }

  traverseDirectory(materialDir)
  return markdownFiles
}

function removeHeader(pageMd: string): string {
  const sections = pageMd.split("---")
  const cleanedMd = sections.splice(2).join("\n")
  return cleanedMd
}

function removeChallenge(pageMd: string): string {
  const lines = pageMd.split("\n")

  // TODO: this only removes the lines containing the directive and not the contents of the directive block
  let cleanedLines = lines.filter((line) => !line.includes("::::challenge"))
  cleanedLines = cleanedLines.filter((line) => !line.includes(":::solution"))
  const cleanedPageMd = cleanedLines.join("\n")
  return cleanedPageMd
}

function removeDirectives(pageMd: string): string {
  const lines = pageMd.split("\n")
  const cleanedLines = lines.filter((line) => !line.includes("::"))
  const cleanedPageMd = cleanedLines.join("\n")
  return cleanedPageMd
}

function removeTableRows(pageMd: string): string {
  const lines = pageMd.split("\n")
  let cleanedLines = lines.map((line) => (line.length === 0 || !/^\|\s.*\s\|$/.test(line) ? line : ""))
  cleanedLines = lines.map((line) => (line.length === 0 || !/^\|\s.*\s\|$/.test(line) ? line : ""))
  const cleanedPageMd = cleanedLines.join("\n")
  return cleanedPageMd
}

function removeEscapedChars(pageMd: string): string {
  const cleanedPageMd = pageMd.replace(/\\_/g, "_").replace(/\\\*/g, "*")
  return cleanedPageMd
}

function parseMarkdown(pageMd: string): string {
  let cleanedMd = removeHeader(pageMd)
  cleanedMd = removeTableRows(cleanedMd)
  cleanedMd = removeChallenge(cleanedMd)
  // TODO: want to deal with challenges properly
  cleanedMd = removeDirectives(cleanedMd)
  cleanedMd = removeEscapedChars(cleanedMd)

  return cleanedMd
}

export function readPageMarkdown(mdFile: string): string {
  try {
    const pageMd = fs.readFileSync(mdFile, "utf-8")
    const parsedPage = parseMarkdown(pageMd)
    return parsedPage
  } catch (error) {
    console.error(`Error reading file or parsing Markdown: ${error}`)
    return ""
  }
}
