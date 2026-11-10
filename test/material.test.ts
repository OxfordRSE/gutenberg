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
  const tracks = parseTracks([["setup.md", "basics.md", "advanced.md", "additional_features.md"], ["short.md"]])

  assert.deepEqual(tracks, [
    { files: ["setup.md", "basics.md", "advanced.md", "additional_features.md"] },
    { files: ["short.md"] },
  ])
})

test("applies trackTitles to tracks by position", () => {
  const tracks = parseTracks(
    [
      ["a.md", "b.md"],
      ["c.md", "d.md"],
    ],
    ["Main Track", "Advanced Topics"]
  )

  assert.deepEqual(tracks, [
    { title: "Main Track", files: ["a.md", "b.md"] },
    { title: "Advanced Topics", files: ["c.md", "d.md"] },
  ])
})

test("applies a single title to a flat file list", () => {
  assert.deepEqual(parseTracks(["a.md", "b.md"], ["Main Track"]), [{ title: "Main Track", files: ["a.md", "b.md"] }])
})

test("leaves tracks without a title untitled when trackTitles is shorter", () => {
  const tracks = parseTracks([["a.md"], ["b.md"]], ["Main Track"])

  assert.deepEqual(tracks, [{ title: "Main Track", files: ["a.md"] }, { files: ["b.md"] }])
})

test("treats null and empty titles as untitled, so a track can be skipped", () => {
  const tracks = parseTracks([["a.md"], ["b.md"], ["c.md"], ["d.md"]], ["First", null, "", "Last"])

  assert.deepEqual(tracks, [
    { title: "First", files: ["a.md"] },
    { files: ["b.md"] },
    { files: ["c.md"] },
    { title: "Last", files: ["d.md"] },
  ])
})

test("ignores extra titles beyond the number of tracks", () => {
  assert.deepEqual(parseTracks([["a.md"]], ["One", "Two"]), [{ title: "One", files: ["a.md"] }])
})

test("ignores trackTitles that is not a list", () => {
  assert.deepEqual(parseTracks([["a.md"]], "Main Track"), [{ files: ["a.md"] }])
})

test("accepts numeric titles", () => {
  assert.deepEqual(parseTracks([["a.md"]], [2024]), [{ title: "2024", files: ["a.md"] }])
})

test("returns no tracks for an empty files list", () => {
  assert.deepEqual(parseTracks([]), [])
})

test("returns no tracks when files is missing", () => {
  assert.deepEqual(parseTracks(undefined), [])
})
