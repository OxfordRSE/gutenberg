import { simpleGit, CleanOptions } from "simple-git"
import * as fs from "fs"
import * as yaml from "js-yaml"

const yamlTemplate = process.env.YAML_TEMPLATE || "config/oxford.yaml"
const baseMaterialDir = process.env.MATERIAL_DIR as string

export async function initRepos() {
  if (!fs.existsSync(baseMaterialDir)) {
    fs.mkdirSync(baseMaterialDir)
  }
  const repos = readRepos()
  Object.keys(repos).forEach((key: string) => {
    {
      console.log(repos[key].url, repos[key].path)
      // @ts-ignore-error
      initRepo(repos[key].path, repos[key].url)
    }
  })
}

// for each repo defined in the yaml, make a git repo and pull the material into basematerial
function readRepos() {
  const fileContents = fs.readFileSync(yamlTemplate, "utf8")
  // @ts-expect-error
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
    git.init().addRemote("origin", url)
  }
  if (fs.readdirSync(materialDir).length === 0) {
    await git.clone(url, ".").then(() => {
      return git
    })
  }
  git.stash()
  git.pull()
}

initRepos()
