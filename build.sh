#!/bin/bash

echo "🚀 Building Text-to-Speech App for Production..."

# Check if we're in the right directory
if [ ! -f "vercel.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client && npm install && cd ..

# Install API dependencies
echo "📦 Installing API dependencies..."
cd api && npm install && cd ..

# Build client
echo "🔨 Building client..."
cd client && npm run build && cd ..

# Check if build was successful
if [ ! -d "client/dist" ]; then
    echo "❌ Error: Client build failed"
    exit 1
fi

echo "✅ Build completed successfully!"
echo "📁 Build output: client/dist/"
echo "🚀 Ready for Vercel deployment!"

# Optional: Test the build locally
read -p "Would you like to test the build locally? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌐 Starting local preview..."
    cd client && npm run preview
fi 