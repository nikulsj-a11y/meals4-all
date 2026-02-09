#!/bin/bash

# Meals4All Backend Startup Script

echo "🚀 Starting Meals4All Backend..."
echo ""

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "❌ MongoDB is not running!"
    echo "Please start MongoDB first:"
    echo "  macOS: brew services start mongodb-community"
    echo "  Linux: sudo systemctl start mongodb"
    exit 1
fi

echo "✅ MongoDB is running"

# Check if .env file exists
if [ ! -f "backend/.env" ]; then
    echo "❌ .env file not found!"
    echo "Copying from .env.example..."
    cp backend/.env.example backend/.env
    echo "✅ .env file created"
    echo "⚠️  Please edit backend/.env with your configuration"
    exit 1
fi

echo "✅ .env file found"

# Kill any process on port 5000
if lsof -ti:5000 > /dev/null 2>&1; then
    echo "⚠️  Port 5000 is in use, clearing..."
    lsof -ti:5000 | xargs kill -9 2>/dev/null
    sleep 1
fi

echo "✅ Port 5000 is available"
echo ""
echo "Starting server..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd backend && node server.js

