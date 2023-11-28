import { simpleGit, CleanOptions } from "simple-git";
import * as fs from 'fs';
import * as yaml from 'js-yaml';

const yamlTemplate = process.env.YAML_TEMPLATE || 'config/oxford.yaml';
const baseMaterialDir = process.env.MATERIAL_DIR as string;

// for each repo defined in the yaml, make a git repo and pull the material into basematerial
function readRepos() {
    const fileContents = fs.readFileSync(yamlTemplate, 'utf8');
    // @ts-expect-error
    const repos = yaml.load(fileContents).repos;
    return repos
}

async function initRepos() {
    const repos = readRepos()
    for (const [dir, url] of Object.entries(repos)) {
        console.log(dir, url)
        // @ts-expect-error
        await initRepo(dir, url)
    }
}

async function initRepo(dir: string, url: string) {
    const materialDir = baseMaterialDir + '/' + dir
    console.log(materialDir)
    console.log(fs.existsSync(materialDir as string))
    if (!fs.existsSync(materialDir as string)) {
        fs.mkdirSync(materialDir as string)
        }
    const git = simpleGit({baseDir: materialDir})
    const remotes = await git.getRemotes()
    if (remotes.length === 0) {
        git.init().addRemote('origin', url)
    }
    if (fs.readdirSync(materialDir).length === 0) {
        await git.clone(url, '.').then(() => {
            return git
        }
    )}
    git.stash()
    git.pull()
}

initRepos()