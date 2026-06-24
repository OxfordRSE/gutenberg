import test from "node:test"
import assert from "node:assert/strict"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { parseFrontMatter } from "lib/frontMatter"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const fixturesDir = path.join(__dirname, "fixtures", "front-matter")

function readFixture(name: string): string {
  return fs.readFileSync(path.join(fixturesDir, name), "utf8")
}

test("parses a course index fixture with arrays, block scalars, and attribution objects", () => {
  const parsed = parseFrontMatter(readFixture("course-index.md"))

  assert.equal(parsed.bodyBegin, 24)
  assert.ok(parsed.frontmatter?.includes("summary: |"))
  assert.ok(parsed.body.startsWith("## What is Continuous Integration?"))
  assert.equal(parsed.attributes.name, "Continuous Integration")
  assert.equal(parsed.attributes.id, "continuous_integration")
  assert.deepEqual(parsed.attributes.dependsOn, ["software_project_management.collaboration"])
  assert.deepEqual(parsed.attributes.files, ["github_actions.md", "code_coverage.md", "documentation.md"])

  assert.deepEqual(parsed.attributes.learningOutcomes, [
    "Use GitHub actions to build automated workflows running on multiple platforms.",
    "Explore code coverage tools for assessing the extent of software testing.",
    "Appreciate the benefits of having good documentation.",
    "Use Sphinx to generate documentation for a project.",
  ])

  assert.equal(
    parsed.attributes.summary,
    "This course introduces the concept of continuous integration and how to set it up for a Python project using GitHub Actions.\n"
  )

  assert.deepEqual(parsed.attributes.attribution, [
    {
      citation:
        'This material has been adapted from the "Software Engineering" module of the SABS R³ Center for Doctoral Training.',
      url: "https://www.sabsr3.ox.ac.uk",
      image:
        "https://www.sabsr3.ox.ac.uk/sites/default/files/styles/site_logo/public/styles/site_logo/public/sabsr3/site-logo/sabs_r3_cdt_logo_v3_111x109.png",
      license: "CC-BY-4.0",
    },
    {
      citation:
        "This course material was developed as part of UNIVERSE-HPC, which is funded through the SPF ExCALIBUR programme under grant number EP/W035731/1",
      url: "https://www.universe-hpc.ac.uk",
      image: "https://www.universe-hpc.ac.uk/assets/images/universe-hpc.png",
      license: "CC-BY-4.0",
    },
  ])
})

test("parses a section fixture with tags and list-valued learning outcomes", () => {
  const parsed = parseFrontMatter(readFixture("section.md"))

  assert.equal(parsed.bodyBegin, 22)
  assert.ok(parsed.body.startsWith("## Overview"))
  assert.equal(parsed.attributes.name, "GitHub Actions")
  assert.deepEqual(parsed.attributes.dependsOn, [])
  assert.deepEqual(parsed.attributes.tags, ["github"])
  assert.deepEqual(parsed.attributes.learningOutcomes, [
    "Describe the structure and steps of a basic GitHub Actions workflow.",
    "Build a basic workflow and run it on GitHub.",
    "Create a workflow for a Python program to run a static code analysis tool and unit tests over the codebase.",
    "Diagnose and fix a workflow fault.",
    "Parameterise the running of a workflow over multiple operating systems.",
  ])
})

test("returns the original document unchanged when no front matter is present", () => {
  const source = "# Heading\n\nBody text.\n"
  const parsed = parseFrontMatter(source)

  assert.deepEqual(parsed.attributes, {})
  assert.equal(parsed.body, source)
  assert.equal(parsed.bodyBegin, 1)
  assert.equal(parsed.frontmatter, undefined)
})
