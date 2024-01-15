[![Build and Test](https://github.com/OxfordRSE/gutenberg/actions/workflows/test.yml/badge.svg)](https://github.com/OxfordRSE/gutenberg/actions/workflows/test.yml)

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

To see our full documentation, please visit [our documentation site](https://blog.oxrse.uk/gutenberg/).

To get a development environment running, follow the instructions below:

## Installing dependencies

Install Node.js and npm or yarn. Then run:

```bash
yarn install
# or
npm install
```

You will also need a postgres database that you can use.

## Getting Started

Clone the repository at https://github.com/UNIVERSE-HPC/course-material into the `.material` folder.

Copy the `.env` file to `.env.local` and fill in the values. If you don't need to be able to authenticate, you only need to edit the `DATABASE_URL` value to the URL of your database.

Then run the migrations:

```bash
yarn prisma migrate dev
```

## Running the development server

The development server can be started with:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

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

## Deployment

Gutenberg is automatically deployed to fly.io by a [GitHub action](https://github.com/OxfordRSE/gutenberg/actions/workflows/deploy.yml) whenever a new commit is pushed to the `main` branch.

To see how to deploy the application, see our [deployment guide](https://blog.oxrse.uk/gutenberg/deployment).
