const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Vercel build process...');

try {
  // Install dependencies
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  // Build the application
  console.log('🔨 Building application...');
  execSync('npm run build', { stdio: 'inherit' });

  // Verify build output
  const distPath = path.join(__dirname, 'dist');
  if (!fs.existsSync(distPath)) {
    throw new Error('Build failed: dist directory not found');
  }

  console.log('✅ Build completed successfully!');
  console.log(`📁 Build output: ${distPath}`);
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
} 