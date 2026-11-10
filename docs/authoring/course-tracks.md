---
title: Course Tracks
permalink: /authoring/course-tracks/
parent: Writing Course Material
nav_order: 2
---

A course's `files:` field lists which section files belong to it, in the order they should be taught.
It also controls how those sections are grouped into columns ("tracks") on the course page.
Two shapes are supported, and tracks can optionally be given headings with a separate `trackTitles:` field.

## A single track

If every entry is a plain filename, the whole course is one track, rendered as a single column:

```yaml
files:
  [
    01_running_python.md,
    02_variables_and_types.md,
    03_writing_and_running_ide.md,
    04_another_section.md,
    05_final_section.md,
  ]
```

## Multiple untitled tracks

Nest the filenames into separate lists to split the course into parallel tracks — for example, a long and a short version of the same material:

```yaml
files: [[setup.md, basics.md, advanced.md], [short.md]]
```

Each list becomes its own column.
If every section in a track shares a common [tag]({{ "/authoring/structure-and-metadata/" | relative_url }}), that tag is used as the track's heading automatically; otherwise the track has no heading.

## Track titles

To give tracks explicit headings instead of relying on a shared tag, add a `trackTitles:` list.
Titles are matched to tracks by position: the first title goes on the first track, and so on.
Putting `trackTitles:` directly above `files:`, one entry per line, makes it easy to check that the two lists line up:

```yaml
trackTitles:
  - Main Track
  - Advanced Topics
files:
  - [intro.md, basics.md]
  - [deep_dive.md, edge_cases.md]
```

This is the way to group content like "core material" vs. "for people who want to go further" without having to tag every file in the track the same way.

- If there are fewer titles than tracks, the remaining tracks are untitled.
- A `null` or empty entry leaves that track untitled, so you can skip one in the middle: `trackTitles: [Main Track, null, Extras]`.
- An untitled track can fall back to the shared-tag heading if one applies, as above.
- A flat file list is a single track, so it takes at most one title.

Extra titles beyond the number of tracks are ignored, with a warning in the build log.
If you add, remove or reorder tracks in `files:`, update `trackTitles:` to match.

## Which shape should I use?

You can use a single track for most courses, and multiple tracks when you have genuinely parallel or distinct content.
Reach for multiple tracks when you have genuinely parallel content (e.g. a fast track and a deep-dive track), and give a track a manual title as soon as "the sections happen to share a tag" isn't a good enough reason for its heading.
