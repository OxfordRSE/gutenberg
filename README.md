[![Build and Test](https://github.com/OxfordRSE/gutenberg/actions/workflows/test.yml/badge.svg)](https://github.com/OxfordRSE/gutenberg/actions/workflows/test.yml)

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

To see our full documentation, please visit [our documentation site](https://blog.oxrse.uk/gutenberg/).

To get a development environment running, follow the instructions below:

## Getting started

Setting up a local development requires the following software:
- `git` version 2.43.0 or later - install according to instructions for your system
- `npm` version `9.2.0` or later - install according to instructions for your system
- `node` version v18.19.1 or later - packaged with `npm`
- `corepack` version `0.28.0` or later - install with `npm install -g corepack`
- `yarn` version `3.3.0` or later - installed via `corepack` with `yarn --version`
- For developing the renderer rather than just materials, you'll also need a `postgres` instance

### 1. Clone repository

Clone the repository with `git clone https://github.com/OxfordRSE/gutenberg.git`.

Enter the directory with `cd gutenberg`.

### 2. Enable `corepack`

Install `corepack` if necessary with `npm install -g corepack`. 

Enable `corepack` with `corepack enable`.

### 3. Install dependencies

Run `yarn --version` to check the version of your yarn package manager. 
`corepack` will prompt you to install it if you don't have it already.

With `yarn` installed you can run `yarn install` to install dependencies listed in `package.json`.
The specific versions of packages we use are frozen in `yarn.lock`, 
so you'll be guaranteed to have working versions of each dependency.

### 4. Pull the material from any target repositories

Gutenberg separates its source material from its rendering engine by design.
This means you need to copy some source material before you have anything to display!

The HPC materials are already listed as a source via the `NEXT_PUBLIC_MATERIAL_URL` variable in the `.env` file.

To download those materials, so we have something to work with, run `yarn pullmat` and they will be cloned into 
a local `.materials` directory.

### 5. (Setting up a postgres database)

**If you just want to develop materials and preview their rendering, skip this step.**

If you want to change the *rendering system itself*, you'll need a database.
The database is required for the interactive parts of the site - tracking users' behaviour etc.

The connection string for the database is listed in `.env`.
It wants a postgres service listening on `localhost:5432` (the default port),
that will accept connections from `postgres:password`.

One way to do this fairly simply is using `docker`.
```shell
docker run -d -e POSTGRES_PASSWORD=password -p 5432:5432 postgres
```

If you're already in a docker container, you can install postgres directly with
`apt install postgresql` and then run it with `service postgresql start`.
You'll also need to do a couple more steps to enable serving over `localhost:5432` 
and connecting with `postgres:password` as the username:password.
Those steps can be found [on the Ubuntu support pages](https://ubuntu.com/server/docs/install-and-configure-postgresql).
If that's all too hard, you can install `docker` within a container using `apt install docker`
and it _should_ all be fine, at least for local development.
The instructions for doing so are [on the Docker support pages](https://docs.docker.com/engine/install/ubuntu/#install-using-the-repository).

With the database available, we then need to create the various tables etc. that Gutenberg uses with
`yarn prisma migrate dev`.

### 6. Start the development server

The local development server can be started with `yarn dev`.

When the `next` server is ready, it will print out its URL. 
This will probably be `http://localhost:3000`. 

Visit that URL in your browser to see your local instance deployed.
The development server watches your files, and refreshes when it sees changes.
This means that your edits will be reflected instantly.

Now everything should be set up for local development of the core systems.

## Developing material

You can develop material by editing the `.material` folder.
Changes will be instantly reflected in the browser if you are running the development server.

All of the content is standard markdown, with the addition of special callouts you can use to present exercises, etc. in a consistent manner.

When you're happy with your changes, you can issue a pull request for your changes to the repository you originally cloned in [Getting Started](#getting-started).

## Developing the renderer

The renderer code is written in TypeScript, and consists of a React frontend and NextJS backend, 
both located within this repository. 

The backend's interaction with the database is performed using `prisma`.

### Prisma Studio

Prisma Studio is a GUI for viewing and editing the database. It can be started with:

```bash
npx prisma studio
```

The `prisma` command only reads from `.env` and not `.env.local`, so you will need to either copy the values from `.env.local` to `.env`, or use a command like `dotenv` to populate the environment variables. For example:

```bash
npm install dotenv-cli -g
dotenv -e .env.local npx prisma studio
```

### Deployment

Gutenberg is automatically deployed to fly.io by a [GitHub action](https://github.com/OxfordRSE/gutenberg/actions/workflows/deploy.yml) whenever a new commit is pushed to the `main` branch.

To see how to deploy the application, see our [deployment guide](https://blog.oxrse.uk/gutenberg/deployment).
