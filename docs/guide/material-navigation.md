---
title: Material Navigation
permalink: /guide/material-navigation/
parent: User Guide
nav_order: 4
---

Material pages can show previous/next navigation cards near the content. These links are no longer purely based on a single rule.

## Navigation sources

Depending on the current page and learning context, Gutenberg can derive links from:

- the active event order
- the active course order
- the material dependency graph

This lets the navigation reflect either authored teaching order or conceptual prerequisites.

## Course-aware navigation

If the current section is part of the active course, Gutenberg can show course-linked previous/next navigation using the course's grouped authored order.

That navigation:

- crosses group boundaries
- keeps the learner moving through the course sequence
- switches the final next action into **Return to course** at the end of the course

## Event-aware navigation

If the current section is part of the active event, Gutenberg can also show event-linked navigation based on the event group's assigned material ordering.

## Dependency navigation

Dependency links still matter for the material itself. Gutenberg can continue to show internal or external links based on the material dependency graph, even when course or event navigation is also available.
