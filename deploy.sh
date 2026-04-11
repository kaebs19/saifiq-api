#!/bin/bash
set -e

APP_DIR="/var/www/saifiq-api"

echo "═══════════════════════════════════"
echo "  SaifIQ Deployment"
echo "═══════════════════════════════════"

cd $APP_DIR

echo "📦 Pulling latest code..."
git pull origin main

echo "📦 Installing API dependencies..."
npm ci --production

echo "🏗️  Building Dashboard..."
npm run build:client

echo "🗃️  Syncing database..."
node -e "
  require('dotenv').config({ override: true });
  const { connectDB } = require('./src/config/db');
  require('./src/models');
  connectDB().then(() => { console.log('✅ DB synced'); process.exit(0); });
"

echo "🔄 Restarting API..."
pm2 restart saifiq-api --env production || pm2 start ecosystem.config.js --env production

echo ""
echo "✅ Done!"
echo "   https://saifiq.halmanhaj.com"
echo ""
pm2 status
