#!/bin/bash

# Meals4All Frontend Startup Script

echo "🚀 Starting Meals4All Frontend..."
echo ""

# Check if node_modules exists
if [ ! -d "frontend/node_modules" ]; then
    echo "❌ Frontend dependencies not installed!"
    echo "Installing dependencies..."
    cd frontend && npm install && cd ..
    echo "✅ Dependencies installed"
fi

echo "✅ Dependencies found"

# Kill any process on port 3000
if lsof -ti:3000 > /dev/null 2>&1; then
    echo "⚠️  Port 3000 is in use, clearing..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    sleep 1
fi

echo "✅ Port 3000 is available"
echo ""
echo "Starting Vite dev server..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd frontend && npx vite

