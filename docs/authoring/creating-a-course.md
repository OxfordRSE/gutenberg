---
title: Creating a Course, Step by Step
permalink: /authoring/creating-a-course/
parent: Writing Course Material
nav_order: 6
---

A worked walkthrough for adding a new course to an existing theme, tying together [Structure and Metadata]({{ "/authoring/structure-and-metadata/" | relative_url }}), [Course Tracks]({{ "/authoring/course-tracks/" | relative_url }}), and [Directives and Links]({{ "/authoring/directives-and-links/" | relative_url }}).

## 1. Open an issue first

Before writing anything, open an issue on the material repo describing the course you want to add. Contributions are expected to reference an issue number in their commit messages (e.g. `#42 add version control material`).

## 2. Fork and branch

Fork the material repo and create a branch for your change.

## 3. Create the course folder

Inside the theme you're adding to, create a folder named for your new course's id:

```text
[theme.id]/[course.id]/
```

## 4. Write the course's `index.md`

A useful starting point is:

```yaml
---
id: my_new_course
name: My New Course
summary: |
    One or two sentences describing what this course covers.
files: []
dependsOn: []
---

## Overview

A longer, markdown-formatted description of the course.
```

Leave `files: []` empty for now — you'll fill it in as you add sections.

## 5. Add section files

Each section is a markdown file directly inside the course folder, e.g. `introduction.md`:

```yaml
---
name: Introduction
dependsOn: []
tags: []
---

## Introduction

Section content goes here, using the directives and link syntax from
[Directives and Links]({{ "/authoring/directives-and-links/" | relative_url }})
as needed.
```

Repeat for each section.

## 6. List the sections in `files:`

Back in the course's `index.md`, list the section filenames in teaching order:

```yaml
files: [introduction.md, basics.md, advanced.md]
```

If you want the course split into tracks — a short and a long version, say, or a main track plus optional extras — see [Course Tracks]({{ "/authoring/course-tracks/" | relative_url }}) for the list-of-lists and named-track shapes.

## 7. Register the course in its theme

Add your course's id to the `courses:` list in the theme's own `index.md`:

```yaml
courses: [existing_course_one, existing_course_two, my_new_course]
```

A course that exists on disk but isn't listed here won't be picked up at all.

## 8. Declare dependencies, if any

If your course (or a specific section) has a prerequisite elsewhere in the material, add it to `dependsOn` — see [Dependencies and Navigation]({{ "/authoring/dependencies-and-navigation/" | relative_url }}) for the exact format and what it drives.

## 9. Preview it locally

Follow the [Docker development guide]({{ "/development/docker" | relative_url }}) to run Gutenberg locally, pointing `MATERIAL_DIR` at your checked-out material branch, and check your course renders the way you expect — headings, tracks, challenges, and links included.

## 10. Run the checks

Before opening a PR, run through [Checks and Linting]({{ "/authoring/checks-and-linting/" | relative_url }}) — at minimum, `markdownlint` and the non-ASCII code-block check are quick to run locally.

## 11. Open a pull request

Open a PR against `main` on the material repo, referencing the issue from step 1.
