---
title: Dependencies and Navigation
permalink: /authoring/dependencies-and-navigation/
parent: Writing Course Material
nav_order: 4
---

`dependsOn` declares that a course or section has a prerequisite. It's the only thing tying material together into a graph, rather than a flat pile of pages.

## Format

Each entry is a dot-separated reference:

```text
<theme.id>.<course.id>              # depends on an entire course
<theme.id>.<course.id>.<section.id> # depends on one specific section
```

For example, a section titled "Arrays" that depends on the `functions_python` section of the `procedural` course in the `software_architecture_and_design` theme:

```yaml
name: Arrays
dependsOn: [
    software_architecture_and_design.procedural.functions_python,
]
```

`dependsOn` can be set at course level (the whole course depends on something) or section level (just this section does). Leave it as an empty list (`dependsOn: []`) if there's no prerequisite.

> **Note:** references are resolved by matching `theme.id`/`course.id`/`section.id` alone — the identifiers need to be unique within the material repos configured together in one deployment, not just within their own repo. If a Gutenberg instance pulls in multiple material repos and two of them happen to reuse the same theme or course id, a `dependsOn` reference could resolve against the wrong one. Keep ids repo-unique if your deployment combines more than one material repo.

## What it drives

- **The dependency diagram** (`/material/.../diagram`) draws an edge from each course/section to everything it depends on, so learners (and authors) can see the prerequisite graph at a glance.
- **Dependency-based navigation**: previous/next links can be derived from the dependency graph, and can appear alongside course- or event-authored ordering rather than only as a fallback — see [Material Navigation]({{ "/guide/material-navigation/" | relative_url }}) for how the sources interact.
- **Prerequisite hints** shown to learners on course/section pages.

## Ordering vs. dependency

`dependsOn` is about conceptual prerequisites, not the order sections are taught in — that's what [Course Tracks]({{ "/authoring/course-tracks/" | relative_url }})' `files:` field is for. A course's `files:` list is the authored teaching order; `dependsOn` is the (potentially cross-course, cross-theme) prerequisite graph. The two often agree but don't have to — a section can be taught in a fixed track order while also declaring a dependency on something from a completely different theme.
