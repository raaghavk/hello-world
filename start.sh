#!/bin/bash

# Simple startup script for Uptime Monitor SaaS

echo "🚀 Starting Uptime Monitor..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Copying from .env.example..."
    cp .env.example .env
    echo ""
    echo "⚠️  IMPORTANT: Edit the .env file with your configuration before continuing!"
    echo "   Required settings:"
    echo "   - SESSION_SECRET (use a random 32+ character string)"
    echo "   - EMAIL_* settings (for sending notifications)"
    echo "   - STRIPE_* keys (for payments)"
    echo ""
    echo "Press Enter when you've configured .env, or Ctrl+C to exit..."
    read
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Run setup
echo "🔧 Running database setup..."
node setup.js
echo ""

# Start the application
echo "✅ Starting services..."
echo ""
echo "   Server: http://localhost:3000"
echo "   Monitor: Running in background"
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Start both server and monitor
node server.js & node monitor.js &

# Wait for any process to exit
wait -n

# Exit with status of process that exited first
exit $?
