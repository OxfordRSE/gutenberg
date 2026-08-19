---
title: Structure and Metadata
permalink: /authoring/structure-and-metadata/
parent: Writing Course Material
nav_order: 1
---

A material repo has three levels of folders, each with an `index.md` carrying YAML frontmatter metadata, plus a body of markdown that becomes that level's description:

```text
- index.md              # material-level metadata
- [theme.id]/
  - index.md             # theme-level metadata
  - [course.id]/
    - index.md           # course-level metadata
    - [section.id].md    # section content — one file per section
```

A section's `id` is implicit: `variables.md` has the id `variables`. Theme and course ids are just their folder names.

## Material-level (`index.md`)

| field | required | type | notes |
| --- | --- | --- | --- |
| `id` | yes | string | unique id for this material repo |
| `name` | yes | string | material title |
| `themes` | yes | string[] | folder names of the themes to include, in order |

## Theme-level (`[theme.id]/index.md`)

| field | required | type | notes |
| --- | --- | --- | --- |
| `id` | yes | string | unique within the material |
| `name` | yes | string | theme title |
| `summary` | no | string | short description shown on theme cards |
| `courses` | yes | string[] | folder names of the courses to include, in order |

## Course-level (`[theme.id]/[course.id]/index.md`)

| field | required | type | notes |
| --- | --- | --- | --- |
| `id` | yes | string | unique within the theme |
| `name` | yes | string | course title |
| `summary` | no | string | short description shown on course cards |
| `files` | yes | see [Course Tracks]({{ "/authoring/course-tracks/" | relative_url }}) | section filenames, in teaching order and/or grouped into tracks |
| `dependsOn` | no | string[] | prerequisite courses/sections — see [Dependencies and Navigation]({{ "/authoring/dependencies-and-navigation/" | relative_url }}) |
| `learningOutcomes` | no | string[] or null | shown as a collapsible "Learning outcomes" list on the course page |
| `attribution` | no | object[] | see below |

An `attribution` entry looks like:

```yaml
attribution:
  - citation: >
      "Programming with Python" course by the Carpentries
    url: https://swcarpentry.github.io/python-novice-inflammation/
    image: https://carpentries.org/carpentries-logo.svg
    license: CC-BY-4.0
```

Every attribution object must contain the four string fields shown above. Use an empty list when there is no attribution. A missing or null `learningOutcomes` value is treated as no learning-outcomes list.

## Section-level (each `.md` file in a course folder)

| field | required | type | notes |
| --- | --- | --- | --- |
| `name` | no | string | section title (defaults to a title-cased version of the filename if omitted) |
| `dependsOn` | no | string[] | prerequisites — same format as course-level |
| `tags` | no | string[] | short labels shown as chips next to the section, and used to auto-derive a track heading — see [Course Tracks]({{ "/authoring/course-tracks/" | relative_url }}) |
| `learningOutcomes` | no | string[] or null | same as course-level, scoped to this section |
| `attribution` | no | object[] | same shape as course-level |

The section body is standard [GitHub-flavored Markdown](https://docs.github.com/en/get-started/writing-on-github), plus the directives and link rules described in [Directives and Links]({{ "/authoring/directives-and-links/" | relative_url }}).

## What CI validates

The [course-material front-matter action](https://github.com/alasdairwilson/course-material-front-matter) checks required fields, common field types, attribution objects, and that every listed theme, course, and section file exists. It accepts flat, grouped, and named course tracks. Extra front-matter fields are allowed for compatibility with older material; Gutenberg ignores fields it does not consume. Dependency targets are not checked because they may refer to another material repository in the same deployment.
