#!/bin/bash

if [ ! -f ".env" ]; then
  cp .env.example .env
fi

until nc -z ${POSTGRES_HOST} ${POSTGRES_PORT}; do
  echo "$(date) - waiting for postgres..."
  sleep 2
done

npm install
npm run typeorm migration:run
npm run start:dev