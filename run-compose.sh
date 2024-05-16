#!/bin/bash
export CACHE_BUST=$(date +%s)
docker-compose -f dev-compose.yml up --build