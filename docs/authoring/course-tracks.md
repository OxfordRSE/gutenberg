---
title: Course Tracks
permalink: /authoring/course-tracks/
parent: Writing Course Material
nav_order: 2
---

A course's `files:` field lists which section files belong to it, in the order they should be taught. It also controls how those sections are grouped into columns ("tracks") on the course page. Three shapes are supported, and can be mixed within one course.

## A single track (most courses)

If every entry is a plain filename, the whole course is one track, rendered as a single column:

```yaml
files: [
    01_running_python.md,
    02_variables_and_types.md,
    03_writing_and_running_ide.md,
]
```

## Multiple untitled tracks

Nest the filenames into separate lists to split the course into parallel tracks — for example, a long and a short version of the same material:

```yaml
files: [[setup.md, basics.md, advanced.md], [short.md]]
```

Each list becomes its own column. If every section in a track shares a common [tag]({{ "/authoring/structure-and-metadata/" | relative_url }}), that tag is used as the track's heading automatically; otherwise the track has no heading.

## Named tracks

To give a track an explicit heading instead of relying on a shared tag, precede its file list with a title string:

```yaml
files: [
    "Main Track", [intro.md, basics.md],
    "Advanced Topics", [deep_dive.md, edge_cases.md],
]
```

This is the way to group content like "core material" vs. "for people who want to go further" without having to tag every file in the track the same way. A title only applies to the array immediately after it; an untitled track can still appear alongside named ones:

```yaml
files: ["Main Track", [intro.md, basics.md], [bonus.md]]
```

Here `bonus.md` is its own untitled track (falling back to the shared-tag heading if one applies), while `intro.md`/`basics.md` are grouped under "Main Track".

## Which shape should I use?

Use the plain flat list unless you have a reason not to — it's what almost all existing courses use. Reach for multiple tracks when you have genuinely parallel content (e.g. a fast track and a deep-dive track), and give a track a manual title as soon as "the sections happen to share a tag" isn't a good enough reason for its heading.
