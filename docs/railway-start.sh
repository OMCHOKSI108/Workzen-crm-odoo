#!/bin/sh

# Use Railway's PORT or default to 8080
export PORT=${PORT:-8080}

# Update nginx config with correct port
sed -i "s/listen 8080;/listen $PORT;/" /etc/nginx/http.d/default.conf

# Start nginx in background
nginx &

# Start the backend server
cd /app/backend && npm start