---
title: Environment Variables
permalink: /config/vars
---

This document describes the environment variables used in the project, please set theses as either an env file or as secrets on fly.io.

## Essential

- `DATABASE_URL`: This is the connection string for the PostgreSQL database.
- `MATERIAL_DIR`: This is the directory where the material files are stored.
- `YAML_TEMPLATE`: This is the path to the YAML template file.
- `NEXT_PUBLIC_MATERIAL_URL`: This is the URL where the course material is hosted.
- `NEXT_PUBLIC_BASEPATH`: This is the base path for the application.
- `NEXTAUTH_URL`: This is the URL for the NextAuth authentication API, e.g. localhost:3000/api/auth for development deployments
- `NEXTAUTH_SECRET`: This is the secret key used by NextAuth for encryption and signing.
- `GITHUB_ID`: This is the ID for the GitHub application.
- `GITHUB_SECRET`: This is the secret key for GitHub authentication.


## Search

The following variables are used for the search functionality:

- `OPENAI_API_KEY`: This is your API key for OpenAI.
- `QDRANT_DB_URL`: This is the database URL for the Qdrant database.
- `QDRANT_COLLECTION_NAME`: This is the name of the Qdrant vector collection.
- `QDRANT_API_KEY`: This is the API key for Qdrant, if you have set one in the Qdrant container.

Please replace the placeholder values with your actual values when setting up the environment variables.
