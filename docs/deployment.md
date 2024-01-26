---
title: Deployment
permalink: /deployment/
---

On this page we will cover how to deploy the application to a production environment.

If you wish to see how to deploy the application to a development environment, please refer to the [development guide]({{ "/development/" | relative_url }}).

<!-- prettier-ignore -->
- TOC
{:toc}

## Prerequisites

The deployment uses Docker and the Dockerfile is included in the repository, you can use this to deploy the application to any environment that supports Docker, e.g.:

- A server with a public IP address to which you can deploy.
- A space to host the application, such as [Fly.io](https://fly.io) or [Heroku](https://www.heroku.com/).

In addition, you will need to supply a [Postgres](https://www.postgresql.org/) database, which we interact with via the [Prisma](https://www.prisma.io/) ORM.
This can be hosted on the same server as the application, or on a different server, as long as the application can connect to it.

## Deploying via Fly.io

You will need to set up an account with Fly.io and to install manually you will need the Flyctl [CLI tool](https://fly.io/docs/getting-started/installing-flyctl/).
With an account created, go to your dashboard and create an "API key", this will be used to deploy the application.
After you have deployed your application for the first time, you can set the necessary [configuration variables]({{ "/config/vars/" | relative_url }}) as secrets via the dashboard.

### Automatic Deployment

The recommended way to deploy is via a GitHub action.
This action is already set up in the repository to run anytime `main` is updated or can be run at any time to deploy the current `main` branch to fly.io.
It may also be appropriate to tie the action to run automatically by e.g. tying it to running on tags or releases.

To enable use of this action, simply set the "FLY_API_TOKEN" secret in the repository settings to your API key.
You can now successfully run the action manually on the default branch.

### Manual Deployment

If you instead wish to manually deploy, retrieve your API key as above and run the following:

```bash
export FLY_API_TOKEN=<your-api-token>
fly deploy
```

This will build and deploy the app to fly.
N.B. you can, of course, set the API key in your env permanently via an env file (e.g. .env.local), see the [env configuration documentation]({{ "/config/" | relative_url }}) for more details.

#### Staging

In addition, the repository contains a workflow that will automatically deploy the application to a staging server, also hosted on, fly.io whenever a new commit is pushed to the `main` branch.
If you wish to use the staging application then please set the `DATABASE_URL_TEST` environment variable to the connection string for your staging database.

## Deploying via Docker

If you wish to deploy the application to a different environment, you can use the Dockerfile to build and run the application.

### Building the Docker image

We can use the same Dockerfile as for the fly deployment for Docker.
To build the image, run the following:

```bash
docker build -t gutenberg .
```

You can then deploy this docker image and set up appropriate forwarding to your machine.
You must set the environment variables as described in the [configuration documentation]({{ "/config/" | relative_url }}) for the application to work properly.

It is recommended that you use reverse proxy, such as [nginx](https://www.nginx.com/), to expose the application to the internet.

## Connecting to a Database

Regardless of how you wish to deploy, the application will need to connect to a database.
This can be done by setting the `DATABASE_URL` environment variable to the connection string for your database.

The Oxford deployment uses a PostgreSQL database hosted on Fly.io, but the database can also be hosted elsewhere.
If you are deploying via Docker it is best to use a dockerised database on the same virtual network.
As such, your docker network will consist of the application container, the database container, the reverse proxy container and, optionally, the Qdrant database.

## Enabling Search

The material in gutenberg is searchable via a semantic search on a vector database, we use [Qdrant](https://Qdrant.tech/) for this and the vector embeddings are provided by openAI's [embedding API endpoint](https://platform.openai.com/docs/api-reference/embeddings).

To enable search, you will need an openAI account, with credits available, then set the `OPENAI_API_KEY` environment variable to your openAI API key, the `QDRANT_API_KEY` environment variable to your Qdrant API key, and the `QDRANT_DB_URL` environment variable to the URL of your Qdrant database.
We host our Qdrant database on fly.io, but you can use any Qdrant database that can be accessed by the application.
The vector database can be also be deployed via docker, see the [Qdrant documentation](https://qdrant.tech/docs/deployment/docker.html) for more details.
The existence of the `COLLECTION_NAME` environment variable allows one vector database to be shared by any number of applications.

Once you have configured these environment variables, you should enable the search functionality in the frontend by setting the `NEXT_PUBLIC_ENABLE_SEARCH` environment variable to `true`.
If you do not wish to use the search functionality then you can leave this variable unset or set it to `false`.

## Customisation

You should customise your deployment by creating a configuration yaml file, see the [configuration documentation]({{ "/config/template" | relative_url }}) for more details.

## Configuration

The application can be further configured via environment variables.
While we have touched on some key ones here, namely the database connection string and the search related variables, a full list of the environment variables and their purpose can be found in the [env vars config section]({{ "/config/vars" | relative_url }}).

## Using the site

Once you are deployed, you can visit our [guide](/guide) for an overview of how to set up and manage a course event.
