import test from "node:test"
import assert from "node:assert/strict"
import { parseTracks } from "lib/material"

test("parses a flat file list as one untitled track (legacy shorthand)", () => {
  const tracks = parseTracks(["01_running_python.md", "02_variables_and_types.md", "03_writing_and_running_ide.md"])

  assert.deepEqual(tracks, [
    { files: ["01_running_python.md", "02_variables_and_types.md", "03_writing_and_running_ide.md"] },
  ])
})

test("parses a list of lists as untitled tracks (legacy)", () => {
  const tracks = parseTracks([
    ["setup.md", "basics.md", "advanced.md", "additional_features.md"],
    ["short.md"],
  ])

  assert.deepEqual(tracks, [
    { files: ["setup.md", "basics.md", "advanced.md", "additional_features.md"] },
    { files: ["short.md"] },
  ])
})

test("pairs a title string with the array that follows it into a named track", () => {
  const tracks = parseTracks(["Main Track", ["a.md", "b.md"], "Advanced Topics", ["c.md", "d.md"]])

  assert.deepEqual(tracks, [
    { title: "Main Track", files: ["a.md", "b.md"] },
    { title: "Advanced Topics", files: ["c.md", "d.md"] },
  ])
})

test("allows mixing named and untitled tracks in the same course", () => {
  const tracks = parseTracks(["Main Track", ["a.md", "b.md"], ["c.md"]])

  assert.deepEqual(tracks, [{ title: "Main Track", files: ["a.md", "b.md"] }, { files: ["c.md"] }])
})
