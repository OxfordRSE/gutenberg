#!/bin/bash

# Run migrations on the database
RUN npx prisma migrate deploy

yarn cron &
yarn start