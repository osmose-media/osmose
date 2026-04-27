#!/bin/sh
set -e
echo "Checking frontend dependencies..."
npm install --silent
echo "Starting frontend..."
npm run dev
