import { materialToJson } from "./splitMarkdown"
import { jsonToIndex } from "./vectorDb"
import fs from "fs"
import path from "path"
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

const MATERIAL_JSON_PATH =
  process.env.NODE_ENV === "production" ? "/tmp/material.json" : path.resolve(process.cwd(), "material.json")

export async function hasMaterialChanged(sections: SectionObj[]) {
  let oldSections: SectionObj[] = []

  const vectorsInDb = await countIndex()
  if (vectorsInDb !== sections.length) {
    console.log("material has changed")
    return true
  }

  // read the previous snapshot from the hardcoded path
  if (fs.existsSync(MATERIAL_JSON_PATH)) {
    oldSections = jsonToSections(MATERIAL_JSON_PATH)
  }

  if (sections.length !== oldSections.length) {
    console.log("material has changed")
    return true
  }

  for (let i = 0; i < sections.length; i++) {
    if (sections[i].payload.text !== oldSections[i].payload.text) {
      console.log("material has changed")
      return true
    }
  }

  console.log("material has not changed")
  return false
}
