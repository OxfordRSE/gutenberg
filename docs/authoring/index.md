---
title: Writing Course Material
permalink: /authoring/
nav_order: 5.5
has_children: true
---

This guide is for people writing or editing **course material** — the markdown content that themes, courses, and sections are built from — rather than people deploying or administering a Gutenberg instance. If that's you, see the [User Guide]({{ "/guide/" | relative_url }}) instead.

Course material lives in its own git repository, separate from the Gutenberg application. For Oxford's default deployment that's [UNIVERSE-HPC/course-material](https://github.com/UNIVERSE-HPC/course-material); a Gutenberg instance can pull in one or more material repos, configured via `YAML_TEMPLATE` (see [Configuration]({{ "/config/" | relative_url }})).

## Pages

- [Structure and Metadata]({{ "/authoring/structure-and-metadata/" | relative_url }}) — folder layout for themes, courses, and sections, and every frontmatter field each level supports.
- [Course Tracks]({{ "/authoring/course-tracks/" | relative_url }}) — the shapes a course's `files:` list can take, including grouping content into named tracks.
- [Directives and Links]({{ "/authoring/directives-and-links/" | relative_url }}) — challenge, solution, and callout syntax, and how internal links get resolved.
- [Dependencies and Navigation]({{ "/authoring/dependencies-and-navigation/" | relative_url }}) — how `dependsOn` works and what it drives.
- [Checks and Linting]({{ "/authoring/checks-and-linting/" | relative_url }}) — every automated check material goes through, and how to run each one locally.
- [Creating a Course, Step by Step]({{ "/authoring/creating-a-course/" | relative_url }}) — a worked walkthrough that ties the above together.

If you just want to see your change rendered, follow the [Docker development guide]({{ "/development/docker" | relative_url }}) to run Gutenberg locally against your material branch.
