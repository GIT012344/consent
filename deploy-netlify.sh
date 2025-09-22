#!/bin/bash

echo "🚀 Preparing to deploy to Netlify..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building production bundle..."
npm run build

echo "✅ Build completed successfully!"
echo ""
echo "📌 Next steps:"
echo "1. Login to Netlify: https://app.netlify.com"
echo "2. Drag and drop the 'build' folder to deploy"
echo "3. Or use Netlify CLI:"
echo "   npm install -g netlify-cli"
echo "   netlify deploy --dir=build --prod"
echo ""
echo "⚙️ Environment Variables to set in Netlify:"
echo "   REACT_APP_API_URL=https://consent-backend-0wmk.onrender.com"
