---
title: How to set up local development with seed data
permalink: /how-to/local-dev-seed-data/
parent: How-To Guides
nav_order: 4
---

Use this workflow when you want a local Gutenberg instance with demo data, default courses, and seeded content ready to inspect.

## Steps

1. Clone the repository and pull the material:
   - `git clone https://github.com/OxfordRSE/gutenberg.git`
   - `cd gutenberg`
   - `yarn pullmat`
2. Start a local PostgreSQL instance that matches the repo's local development settings.
3. Install dependencies:
   - `yarn install`
4. Apply the database schema:
   - `yarn prisma migrate dev`
5. Seed the database:
   - `npx prisma db seed`

## Reset and reseed

If you want to recreate the local database from scratch and reload the seed data in one step, run:

- `yarn prisma migrate reset --force`

## What happens next

Start the app with `yarn dev` and browse the local courses, events, and seeded demo content.
