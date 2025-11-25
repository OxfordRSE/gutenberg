#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Run database migrations using globally installed @prisma/migrate
prisma migrate deploy

# Run different commands based on NODE_ENV
if [ "$NODE_ENV" = "development" ]; then
    echo "Running in development mode..."
    exec yarn dev
else
    echo "Running in production mode..."
    # Run cron with globally installed tsx and dotenv-cli (from app root)
    dotenv -e .env.local -e .env -- tsx scripts/cronScripts.ts &
    # The standalone build expects to be run from where the .next dir is
    cd /app && exec node server.js
fi