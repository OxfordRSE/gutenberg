import { materialToJson } from "./splitMarkdown";
import { jsonToIndex } from "./vectorDb";
import { simpleGit, CleanOptions } from "simple-git";
import fs from 'fs';
import { baseMaterialUrl } from "../baseMaterialUrl";
import { SectionObj, jsonToSections } from "./splitMarkdown";
import { countIndex } from "./vectorDb";

const materialDir = process.env.MATERIAL_DIR as string;

export async function refreshMaterial() {
    console.log('Material refresh running')
    // check if material directory exists
    initMaterialRepo().then(() => {
      console.log('Parsing pages into JSON')
      materialToJson().then((sections) => {
        if (sections[0].vector.length !== 0) {
          // if this condition passes then it means that we have embedded vectors
          // if we have embedded vectors then we should write the json to index
          // otherwise we should not
          console.log('Writing JSON to index')
          jsonToIndex(sections);}
      })
    })
  }
  
  async function initMaterialRepo() {
    if (!fs.existsSync(materialDir as string)) {
      fs.mkdirSync(materialDir as string)
    }
    const git = simpleGit({baseDir: process.cwd()+'/'+materialDir})
    const remotes = await git.getRemotes()
    if (remotes.length === 0) {
      console.log('Adding remote')
      await git.init().addRemote('origin', baseMaterialUrl as string)
    }
    // if directory is empty then clone
    if (fs.readdirSync(materialDir as string).length === 0) {
      console.log('Cloning material repo')
      await git.clone(baseMaterialUrl as string, '.').then(() => {
        return git
      }
    )}
    // stash and pull, stash should do nothing if there are no changes (which there shouldnt be)
    git.stash()
    git.pull()
  }

  export async function hasMaterialChanged(sections: SectionObj[]) {
    let oldSections: SectionObj[] = [];
    // check if the number of vectors in the db is not the same as the number of sections parsed
    const vectorsInDb = await countIndex();
    if (vectorsInDb !== sections.length) {
      console.log('material has changed')
      return true
    }
    // check if previous material.json exists and if it does, check if the number of sections is the same
    if (fs.existsSync('material.json')) {
      oldSections = jsonToSections('material.json');
    }
    if (sections.length !== oldSections.length) {
      console.log('material has changed')
      return true
    }
    // if the prev material exists AND the number of sections is the same, check if the text is the same
    for (let i = 0; i < sections.length; i++) {
      if (sections[i].payload.text !== oldSections[i].payload.text) {
        console.log('material has changed')
        return true
      }
    }
    // if the text is all the same then do material has not changes
    console.log('material has not changed')
    return false
  }