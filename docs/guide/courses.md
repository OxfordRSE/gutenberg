---
title: Courses
permalink: /guide/courses/
parent: User Guide
nav_order: 1
---

Courses are Gutenberg's self-paced learning paths. They are built from grouped material sections and are intended to be reusable outside any single live event.

## Browsing and enrolling

- Browse courses from the home page or the main [Courses]({{ "/guide/" | relative_url }}) area.
- Courses can be filtered by search term, level, tags, and language.
- Enrolled courses appear in your personal course lists and can show progress on the home page and course cards.

## Active course selection

If you are enrolled on a course, you can select it as your **active course**. This is used as part of the learning context:

- the sidebar can reflect the active course
- material pages can show course-aware hints
- course-aware previous/next navigation can be shown while you work through material

Use the `Select` or `Unselect` action on course cards and course pages to control the active course.

## Course pages

A course page shows:

- the course summary, level, tags, and languages
- grouped material sections
- learning outcomes
- enrolment-aware actions and progress

When editing is enabled, course material is managed directly on the course page. Material is grouped, and each group owns its own ordered list of sections.

## Editing courses

Admins create or import courses from the add-course page, then edit them on the course detail page.

The current editor supports:

- grouped course structure on one page
- adding, removing, and reordering sections inside groups
- JSON import using the same grouped shape as the default courses file

Ungrouped material is no longer the intended authoring flow. If a course has no groups yet, the edit page prompts the admin to add groups before adding material.
