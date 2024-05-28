# This dictates the branch of the Dockerfile to use, i.e. to pull, copy or use a 
# placeholder for mounting the course material in. The appropriate values for 
# $MATERIAL_METHOD are therefore ["pull", "copy", "placeholder"]
ARG MATERIAL_METHOD=copy

# Define the Python version to use
ARG PYTHON_VERSION=3.12.3-slim
ARG NODE_VERSION=20.9-alpine

####
# MATERIAL OPTION: PULL
# Pull course material into the app directory from a defined repo. Default is
# the Oxford course material repo defined in the config/oxford.yaml file.
FROM python:${PYTHON_VERSION} AS pull_material

# Variables for the material pull script
ARG YAML_TEMPLATE=config/oxford.yaml
ARG MATERIAL_DIR=.material
ARG CACHE_BUST=20240514

# Copy the scripts and config files into the container
ONBUILD WORKDIR /app
ONBUILD COPY ../scripts/ /app/scripts/
ONBUILD COPY ../config/ /app/config/

# Install dependencies and clean caches afterwards 
ONBUILD RUN \
    apt-get update && \
    apt-get install -y git && \
    apt-get clean && \
    pip install --upgrade pip setuptools wheel && \
    pip install -r scripts/python_requirements.txt && \ 
    pip cache purge
# pull the material into the container with git
ONBUILD RUN \
    echo ${CACHE_BUST} && \
    python scripts/pull_material.py

####
# MATERIAL OPTION: COPY
# Copy existing course material into this container for the build
FROM node:${NODE_VERSION} AS copy_material

ARG MATERIAL_DIR=.material
# Material dir may not exist yet, so we pass COPY a file which we know will be 
# in context (i.e. the entrypoint script) to ensure the COPY command doesn't 
# fail 
ONBUILD COPY ../entrypoint.sh ../${MATERIAL_DIR}* /app/${MATERIAL_DIR}/


####
# MATERIAL OPTION: PLACEHOLDER
# Make a placeholder directory for the material so we can mount over it later on
FROM node:${NODE_VERSION} AS placeholder_material

ARG MATERIAL_DIR=.material
ONBUILD RUN \
    mkdir -p /app/${MATERIAL_DIR}/HPCu && \
    touch /app/${MATERIAL_DIR}/HPCu/index.md


# Here we use the MATERIAL_METHOD arg to determine which method we use to get 
# material into our container for build time.
FROM ${MATERIAL_METHOD}_material as material

#### 
# BUILDER
FROM node:${NODE_VERSION} AS builder
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN echo node --version
# Install dependencies only when needed
COPY package.json .
COPY yarn.lock .
COPY .yarnrc.yml .
COPY prisma ./prisma
RUN corepack enable && yarn install --immutable
COPY . .

# If using npm with a `package-lock.json` comment out above and use below instead
# RUN npm ci

ENV NEXT_TELEMETRY_DISABLED 1

# Add `ARG` instructions below if you need `NEXT_PUBLIC_` variables
# then put the value on your fly.toml
# Example:
# ARG NEXT_PUBLIC_EXAMPLE="value here"

# need to make sure database exists and tables are there before we build
# for some reason, this is not working with the .env.local file
# so we'll use dotenv to load the .env.local file
RUN npm install -g dotenv-cli
ARG DATABASE_URL
ENV DATABASE_URL ${DATABASE_URL}
ARG NEXT_PUBLIC_PLAUSIBLE_DOMAIN
ENV NEXT_PUBLIC_PLAUSIBLE_DOMAIN ${NEXT_PUBLIC_PLAUSIBLE_DOMAIN}

# Copy the course material into this container for the build
ARG MATERIAL_DIR=.material
COPY --from=material /app/${MATERIAL_DIR} /app/${MATERIAL_DIR}

RUN yarn build

# If using npm comment out above and use below instead
# RUN npm run build

# Production image, copy all the files and run next
FROM node:20.9-alpine AS runner
WORKDIR /app
RUN apk add --no-cache git
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nextjs /app ./
COPY ./prisma /app/prisma

USER nextjs

CMD ["sh", "/app/entrypoint.sh"]
# we use a shell script so we can start the cron job as well as the nextjs server
