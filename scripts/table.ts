import { Section, getMaterial, sectionSplit } from "../lib/material"
import * as fs from "fs"

async function generateTable() {
  let material = await getMaterial()
  const filename = "table.md"
  const headers = ["Theme", "Course", "Description"]
  const hostname = "https://train.oxrse.uk"
  let content = `| ${headers.join(" | ")} |\n| ${headers.map(() => "---").join(" | ")} |\n`
  for (let theme of material.themes) {
    console.log(theme.name)
    for (let course of theme.courses) {
      const courseString = `${theme.id}.${course.id}`
      const themeString = `${theme.id}`
      let { url: courseUrl } = sectionSplit(courseString, material)
      let { url: themeUrl } = sectionSplit(themeString, material)
      console.log(`  ${course.name}`)
      if (course.id === theme.courses[0].id) {
        content += `| [${theme.name}](${hostname}${themeUrl}) | [${
          course.name
        }](${hostname}${courseUrl}) | ${course.summary.replaceAll("\n", " ")} |\n`
      } else {
        content += `| | [${course.name}](${hostname}${courseUrl}) | ${course.summary.replaceAll("\n", " ")} |\n`
      }
    }
  }
  fs.writeFileSync(filename, content)
}

generateTable()
