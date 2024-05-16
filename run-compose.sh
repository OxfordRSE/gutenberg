#!/bin/bash
export CACHE_BUST=$(date +%s)
docker-compose -f docker-compose.yml up --build