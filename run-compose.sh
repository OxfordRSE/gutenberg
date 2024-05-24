#!/bin/bash
export CACHE_BUST=$(date +%s)
docker-compose build --build-arg CACHE_BUST=$CACHE_BUST