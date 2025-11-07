---
title: Environment Variables
permalink: /config/vars
---

This document describes the environment variables used in the project, please set theses as either an env file or as secrets on fly.io.

Note that only `NEXT_PUBLIC_` variables are available in the frontend, while other variables are used in the backend.
Since these "public" variables are available in the frontend, they should not contain sensitive information, they are also set at build time and cannot be changed at runtime.

## Essential

`DATABASE_URL`
: This is the connection string for the PostgreSQL database.

`MATERIAL_DIR`
: Default `.material`
: This is the directory where the material files should be stored.

`YAML_TEMPLATE`
: This is the path to the YAML template file. This should be laid out as described [in the template configuration page]({{ "/config/template" | relative_url }}).

`NEXT_PUBLIC_BASEPATH`
: Default: `""`
: This is the base path for the application.

`NEXTAUTH_URL`
: This is the URL for the Gutenberg NextAuth authentication API, this will be your baseurl followed by "/api/auth" e.g. `localhost:3000/api/auth` for local development deployments.
This must also match your settings on the github OAuth pages.

`NEXTAUTH_SECRET`
: This is the secret key used by NextAuth for encryption and signing.

`GITHUB_ID`
: This is the ID for the GitHub application, set this up in the GitHub developer settings.

`GITHUB_SECRET`
: This is the secret key for GitHub authentication, set this up in the GitHub developer settings.

## Search

The following variables are used for the search functionality, you need both an OpenAI API key and QDRANT fully configured to use the semantic search functionality.

`NEXT_PUBLIC_ENABLE_SEARCH`
: When set to `true`, this enables in the frontend the search functionality, this is not required for the application to run. If you do not wish to use the search functionality, you can unset this env var.

`OPENAI_API_KEY`
: This is your API key for OpenAI.

`QDRANT_DB_URL`
: This is the database URL for the Qdrant database.

`QDRANT_COLLECTION_NAME`
: Default: `gutenberg`
: This is the name of the Qdrant vector collection.

`QDRANT_API_KEY`
: This is the API key for Qdrant, if you have set one in the Qdrant container.

## Analytics

`NEXT_PUBLIC_PLAUSIBLE_DOMAIN`
: Default: None
: This is the domain name necessary to use analytics with plausible e.g "train.rse.ox.ac.uk". This might produce build errors due to the way the environment variables are set up, if this happens please set this variable in the github secrets.

`NEXT_PUBLIC_PLAUSIBLE_HOST`
: Default: "<https://plausible.io>"
: This is the host for the plausible analytics service. This needs set to your custom domain if you are using a self-hosted version of plausible.
