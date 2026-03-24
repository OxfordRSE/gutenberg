---
title: Learning Context
permalink: /guide/learning-context/
parent: User Guide
nav_order: 3
---

Gutenberg keeps track of an optional **learning context**. The context can be:

- an active event
- an active course
- or unset

This context affects how material pages and sidebars behave.

## Active event and active course

When you select an event or course, Gutenberg stores that as the current learning context. This lets the interface stay aligned with the thing you are working through.

Examples:

- the sidebar can prioritise the active event or active course
- material pages can tell you that the current page belongs to your active course
- enrolled material can offer quick actions like selecting a course as your active course

## Material hints

If a material page belongs to a course, Gutenberg can show a contextual hint at the top of the page. Depending on the situation, the hint can say that the material is part of:

- your active course
- one of your enrolled courses
- several courses

When there is an obvious enrolled course context, the hint can also offer a quick action to select that course as active.

## Persistence while navigating

Once a course or event is active, Gutenberg uses that state while you click around the site. This is especially useful when users move between:

- course pages and material pages
- event pages and assigned material
- the sidebar and section pages

The goal is that the interface reflects the teaching context the learner is actually in.
