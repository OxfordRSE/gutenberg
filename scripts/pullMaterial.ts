import { simpleGit, CleanOptions } from "simple-git"
import * as fs from "fs"
import yaml from "js-yaml"

const yamlTemplate = process.env.YAML_TEMPLATE || "config/oxford.yaml"
const baseMaterialDir = process.env.MATERIAL_DIR || ".material"

export async function initRepos() {
  if (!fs.existsSync(baseMaterialDir)) {
    fs.mkdirSync(baseMaterialDir)
  }
  const repos = readRepos()
  await Promise.all(
    Object.keys(repos).map((key: string) => {
      console.log(repos[key].url, repos[key].path)
      // @ts-ignore-error
      return initRepo(repos[key].path, repos[key].url)
    })
  )
}

// for each repo defined in the yaml, make a git repo and pull the material into basematerial
function readRepos() {
  const fileContents = fs.readFileSync(yamlTemplate, "utf8")
  // @ts-ignore-error
  const repos = yaml.load(fileContents).material
  return repos
}

async function initRepo(dir: string, url: string) {
  const materialDir = baseMaterialDir + "/" + dir
  console.log(materialDir)
  console.log(fs.existsSync(materialDir as string))
  if (!fs.existsSync(materialDir as string)) {
    fs.mkdirSync(materialDir as string)
  }
  const git = simpleGit({ baseDir: materialDir })
  const remotes = await git.getRemotes()
  if (remotes.length === 0) {
    await git.init().addRemote("origin", url)
  }
  if (fs.readdirSync(materialDir).length === 0) {
    await git.clone(url, ".")
  }
  await git.stash()
  await git.pull()
}

// only run when this script is executed directly (e.g. `yarn pullmat`), not when
// initRepos is imported elsewhere — importing used to trigger a second, racing pull
const isMain = import.meta.url === `file://${process.argv[1]}`
if (isMain) {
  initRepos()
}
