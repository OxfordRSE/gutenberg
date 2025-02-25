#!/bin/bash

# Run migrations on the database
npx prisma migrate deploy

yarn dev
