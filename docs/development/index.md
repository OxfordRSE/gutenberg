---
title: Development
permalink: /development/
---

`Gutenberg` is a node.js application built using Next.js and Prisma.

This will guide you through the process of setting up a development environment.

If you instead wish to build the application via docker then please refer to the [docker guide]({{"/development/docker" | relative_url }})

To see how to to build the docs, please see the [documentation guide]({{"/development/docs" | relative_url }}).

<!-- prettier-ignore -->
- TOC
{:toc}

## Getting Started

First, clone the repository:

```bash
git clone https://github.com/OxfordRSE/gutenberg.git
```

Then navigate to the newly created gutenberg base directory and clone the [material repository](https://github.com/UNIVERSE-HPC/course-material) into the `.material` folder.

```bash
git clone https://github.com/UNIVERSE-HPC/course-material .material
```

This will populate the teaching material into the app when the application is launched.

Copy the `.env` file to a new file named `.env.local` and fill in the values. If you don't need to be able to authenticate or enable the search feature, you only need to edit the `DATABASE_URL` value to the URL of your database.

## Installing dependencies

You will Node.js and npm or yarn (yarn is preferred) installed on your system, follow along with their respective documentation if you do not have them. Then run:

```bash
yarn install
# or
npm install
```

## Providing a database

You will also need a postgres database that you can use, this can be hosted locally or remotely. If remote, you can either access directly or proxy the connection, either way you will need to set the `DATABASE_URL` environment variable in `.env.local` to the connection string for the database. We leave it up to you how you wish to do this.

Use a different database than your live site, **_do not_** connect your development environment to your production DB.

If it is your first time running the application, you will need to run the migrations to set up the database schema. This can be done with:

```bash
yarn prisma migrate dev
```

## Providing course material

Course material is provided by git repositories defined by the "repos" in the [configuration yaml]({{ "/config/template" | relative_url }}).

Once you have installed the dependencies, you can populate the material directory with:

```bash
yarn pullmat
```

This will pull the course material into the "MATERIAL_DIR" directory, which defaults to `.material`.

Any course material in this directory will be automatically rendered by gutenberg at `/material`.

## Running the development server

The development server can now be started with:

```bash
yarn dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result!

Alternatively, to test a production build:

```bash
yarn build
yarn start
```

Will build and run a production optimised version of the application.

## Prisma Studio

Prisma Studio is a GUI for viewing and editing the database. It can be started with:

```bash
npx prisma studio
```

The `prisma` command only reads from `.env` and not `.env.local`, so you will need to either copy the values from `.env.local` to `.env`, or use a command like `dotenv` to populate the environment variables. For example:

```bash
npm install dotenv-cli -g
dotenv -e .env.local npx prisma studio
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/)
