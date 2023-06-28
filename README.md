This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

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

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Fly.io

Make sure you have set the .env.local file with the correct values for the
production deployment. You will also need to install the [Fly CLI](https://fly.io/docs/hands-on/installing-the-fly-cli/).

Then run the following commands:

```bash
fly deploy
```

The deployment uses Docker and the Dockerfile is included in the repository.

If you are hosting your database on fly.io as well, you can proxy the
database connection to your development machine. This is useful for debugging
using your fly.io database, or for running the prisma studio.

```bash
fly proxy 5432 -a <database app name>
```

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
