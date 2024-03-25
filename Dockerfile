# Install dependencies only when needed
FROM node:20.9-alpine AS builder
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN echo node --version
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
RUN npx prisma migrate deploy

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

USER nextjs

CMD ["sh", "/app/entrypoint.sh"]
# we use a shell script so we can start the cron job as well as the nextjs server
