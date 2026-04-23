---
title: Core Concepts
permalink: /concepts/
nav_order: 5
---

This page explains the main ideas behind Gutenberg.

## Material repositories

Gutenberg renders authored markdown learning material from one or more configured material repositories. Those repositories provide the underlying course material and metadata that appear under `/material`.

Gutenberg adds teaching tools on top of that material rather than replacing it.

## Courses

Courses are reusable, self-paced learning paths built from grouped material sections.

Use a course when you want:

- a structured sequence of material
- enrolment and progress tracking outside a live event
- a reusable teaching path that can also serve as the basis for future events

## Events

Events are scheduled deliveries of material to a cohort.

Use an event when you want:

- dates, times, and locations
- enrolment keys and instructor flows
- event-specific groupings of lectures, labs, or sessions
- cohort progress tracking

An event can be created blank or copied from a course blueprint.

## Learning context

Gutenberg can remember an active course or active event while a learner moves around the site.

This context is used to shape:

- the sidebar
- material-page hints
- course-aware and event-aware navigation

This keeps the interface aligned with what the learner is currently working through.

## Default courses

Gutenberg also has a curated set of default courses stored in the repository. Admins can review and sync those defaults into the database from the courses page.

This gives a deployment a starting course list without forcing every site to author everything from scratch.
