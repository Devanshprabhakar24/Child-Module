#!/bin/bash

# Complete auto-setup script
# Usage: bash setup-all-users.sh

echo "🚀 WombTo18 - Complete Auto-Setup"
echo "=========================================="
echo ""

# Check if backend is running
echo "📡 Checking if backend server is running..."
if curl -s http://localhost:8000/registration/test-mode > /dev/null 2>&1; then
    echo "✅ Backend server is running"
    echo ""
    
    # Run complete auto-setup
    echo "🔧 Running complete auto-setup..."
    echo "This will:"
    echo "  1. Seed milestone templates"
    echo "  2. Set payment status to COMPLETED"
    echo "  3. Trigger email sequence (2 emails per user)"
    echo "  4. Activate all services"
    echo ""
    
    node complete-auto-setup.js
    
else
    echo "⚠️  Backend server is not running"
    echo ""
    echo "Please start the backend server first:"
    echo "  cd backend"
    echo "  npm run start:dev"
    echo ""
    echo "Then run this script again."
    exit 1
fi
