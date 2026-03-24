---
title: "Admin: Default Courses"
permalink: /guide/admin-course-defaults/
parent: User Guide
nav_order: 5
---

Gutenberg now supports a curated set of **default courses** that can be synced into the database by an admin.

## Where defaults live

The current default course catalog lives in `config/courses.defaults.json`. It contains real grouped courses built from material sections rather than placeholder demo entries.

Examples in the current catalog include:

- software architecture tracks in C++ and Python
- introductory C++ and Python
- HPC introduction, OpenMP, and MPI
- Git, Docker, Snakemake, testing, continuous integration, and PyBaMM courses

## Syncing default courses

On the courses page, admins can use **Sync default courses** to compare the current database state with the default catalog.

The review modal shows:

- unchanged courses
- new courses that do not exist in the database yet
- changed courses with field-by-field diffs

Grouped material diffs are shown per group so changes are easier to review than a single large material blob.

## Applying changes

The sync workflow is selective. Admins can choose which new or changed courses to apply instead of updating everything at once.

This is useful when:

- the defaults have been edited in Git
- seed data needs to be aligned with the curated defaults
- an existing deployment wants to adopt new default course structure gradually

## Seed data and defaults

The seed data is intended to align with the current default course set so that a fresh local database reflects the same public-facing proof-of-concept catalog.

The defaults file is now the editorial source for the curated course list, while the seed data exists to make local development and demos start in a sensible state.
