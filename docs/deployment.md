---
title: Deployment
permalink: /deployment/
---


On this page we will cover how to deploy the application to a production environment.

If you wish to see how to deploy the application to a development environment, please refer to the [development guide](/development/).

- TOC
{:toc}

## Prerequisites

The deployment uses Docker and the Dockerfile is included in the repository, you can use this to deploy the application to any environment that supports Docker, e.g.:

- A server with a public IP address to which you can deploy.
- A space to host the application, such as Fly.io or [Heroku](https://www.heroku.com/).

In addition, you will need to supply a database for the application to use, this can be any database that supports the prisma ORM, e.g. MySQL, Postgres, SQLite, etc.

## Deploying via Fly.io

You will need to set up an account with Fly.io and to install manually you will need the Flyctl [CLI tool](https://fly.io/docs/getting-started/installing-flyctl/).
With an account created, go to your dashboard and create an "API key", this will be used to deploy the application.
After you have deployed your application for the first time, you can set the necessary [configuration variables](/config/vars) as secrets via the dashboard.

### Automatic Deployment

The reccomended way to deploy is via a GitHub action. This action is already set up in the repository and can be run at any timne to deply the current `main` branch to fly.io.

To enable this action, simply set the "FLY_API_TOKEN" secret in the repository settings to your API key.
You can now run the action manually on the default branch.

### Manual Deployment

If you instead wish to manually deploy, retrieve your API key as above and run the following:

```bash
export FLY_API_TOKEN=<your-api-token> 
fly deploy
```

This will build and deploy the app to fly.
N.B. you can, of course, set the API key in your env permanently via the .env file.

#### Staging

In addition, the repository contains a workflow that will automatically deploy the application to a staging server, also hostred on, fly.io whenever a new commit is pushed to the `main` branch.
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
You must set the environment variables as described in the [configuration documentation](/configuration/) for the application to work properly.

It is reccomended that you use reverse proxy, such as [nginx](https://www.nginx.com/), to expose the application to the internet.

## Connecting to a Database

Regardless of how you wish to deploy, the application will need to connect to a database. 
This can be done by setting the `DATABASE_URL` environment variable to the connection string for your database.

The Oxford deployment uses a PostgreSQL database hosted on Fly.io, but you can use any database that supports the prisma ORM. If you are deploying to docker it is recommended to use a dockerised database on the same virtual network. As such, your docker network will consist of the application container, the database container and the reverse proxy container.

TODO: write a compose file for application, database, reverse proxy and qdrant.

## Enabling Search

The material in gutenberg is searchable via a semantic search on a vector database, we use [qdrant](https://qdrant.tech/) for this and the vector embeddings are provided by openAI's [embedding API endpoint](https://platform.openai.com/docs/api-reference/embeddings).

To enable search, you will need an openAI account, with credits available, then set the `OPENAI_API_KEY` environment variable to your openAI API key,the `QDRANT__API_KEY` environment variable to your qdrant API key, and the `QDRANT_DB_URL` environment variable to the URL of your qdrant database.
We host a qdrant database on fly.io, but you can use any qdrant database that is accessible to the application.
The vector database can be also be deployed via docker, see the [qdrant documentation](https://qdrant.tech/docs/deployment/docker.html) for more details.
The existence of the `COLLECTION_NAME` environment variable allows one vector database to be shared by any number of applications.

## Configuration

The application can be configured via environment variables, while we have touched on some key ones here, namely the database connection string and the search related variables, a full list of the environment variables can be found in the [configuration documentation](/configuration/).