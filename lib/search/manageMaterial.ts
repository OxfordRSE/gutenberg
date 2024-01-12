import { materialToJson } from "./splitMarkdown"
import { jsonToIndex } from "./vectorDb"
import fs from "fs"
import { SectionObj, jsonToSections } from "./splitMarkdown"
import { countIndex } from "./vectorDb"
import { initRepos } from "../../scripts/pullMaterial"

const materialDir = process.env.MATERIAL_DIR as string

export async function refreshMaterial() {
  console.log("Material refresh running")
  // check if material directory exists
  initRepos().then(() => {
    console.log("Parsing pages into JSON")
    materialToJson().then((sections) => {
      if (sections[0].vector.length !== 0) {
        // if this condition passes then it means that we have embedded vectors
        // if we have embedded vectors then we should write the json to index
        // otherwise we should not
        console.log("Writing JSON to index")
        jsonToIndex(sections)
      }
    })
  })
}

export async function hasMaterialChanged(sections: SectionObj[]) {
  let oldSections: SectionObj[] = []
  // check if the number of vectors in the db is not the same as the number of sections parsed
  const vectorsInDb = await countIndex()
  if (vectorsInDb !== sections.length) {
    console.log("material has changed")
    return true
  }
  // check if previous material.json exists and if it does, check if the number of sections is the same
  if (fs.existsSync("material.json")) {
    oldSections = jsonToSections("material.json")
  }
  if (sections.length !== oldSections.length) {
    console.log("material has changed")
    return true
  }
  // if the prev material exists AND the number of sections is the same, check if the text is the same
  for (let i = 0; i < sections.length; i++) {
    if (sections[i].payload.text !== oldSections[i].payload.text) {
      console.log("material has changed")
      return true
    }
  }
  // if the text is all the same then do material has not changes
  console.log("material has not changed")
  return false
}
