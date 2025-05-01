#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Run database migrations
npx prisma migrate deploy

# Run different commands based on NODE_ENV
if [ "$NODE_ENV" = "development" ]; then
    echo "Running in development mode..."
    exec yarn dev
else
    echo "Running in production mode..."
    exec yarn cron &
    exec yarn start
fi