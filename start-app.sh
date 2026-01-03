#!/bin/bash

# Liq Finance - Start Development Server
echo "🚀 Starting Liq Finance Development Server..."
echo ""

cd /home/engine/project

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    pnpm install
fi

# Start the development server
echo "✨ Launching app..."
echo ""
pnpm dev
