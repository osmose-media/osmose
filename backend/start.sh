#!/bin/sh

# On arrête le script si une commande échoue
set -e

echo "Checking dependencies..."
# On s'assure que tout est installé au cas où le volume est désynchronisé
npm install --silent

echo "Waiting for database to be ready..."
until printf "." && nc -z db 5432; do
  sleep 1
done
echo "Database is up!"

# Utilisation du binaire local pour forcer la version 6 installée
PRISMA="./node_modules/.bin/prisma"

echo "Generating Prisma Client..."
$PRISMA generate

echo "Applying migrations..."
# --accept-data-loss est nécessaire en mode non-interactif pour migrate dev
$PRISMA migrate dev --name init --skip-seed

echo "Seeding database..."
$PRISMA db seed

echo "Starting application..."
npm start
