---
title: How to sync default courses
permalink: /how-to/sync-default-courses/
parent: How-To Guides
nav_order: 3
---

Use this workflow when the curated course defaults in the repository have changed and you want to apply those changes to the database.

## Before you start

You need admin access. The current default course catalog is defined in `config/courses.defaults.json`.

## Steps

1. Go to the courses page.
2. Click **Sync default courses**.
3. Review the sync summary:
   - unchanged courses
   - new courses
   - changed courses
4. For changed courses, inspect the field-by-field diffs. Material changes are shown per material group.
5. Select which changes you wish to apply, only new courses are selected by default.
6. Apply the selected changes.

## What happens next

Selected new and changed defaults are written into the database. This lets you adopt updates gradually instead of forcing the whole catalog to change at once.
