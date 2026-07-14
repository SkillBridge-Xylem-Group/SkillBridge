#!/bin/bash
set -e

# Always operate from the directory this script lives in (the repo root,
# e.g. /var/www/skillbridge-sandbox/app or /var/www/skillbridge-production/app)
# instead of a hardcoded path, so the same script works unmodified on both
# servers once it's pulled from either branch.
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

REF="$1"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

if [ -z "$REF" ]; then
  echo "Usage: ./deploy.sh <main|develop>"
  echo "Error: branch/ref argument is required (got empty string)."
  exit 1
fi

# Environment (sandbox vs production) is derived from the ref being
# deployed, not the folder path — GitHub Actions passes "develop" for
# sandbox deploys and "main" for production deploys.
if [ "$REF" = "main" ]; then
  ENV_NAME="production"
  PM2_NAME="skillbridge-production"
  HEALTH_URL="https://skillbridge-tech.my.id/login"
else
  ENV_NAME="sandbox"
  PM2_NAME="skillbridge-sandbox"
  HEALTH_URL="https://sandbox.skillbridge-tech.my.id/login"
fi

LOG_DIR="/var/log/deploys"
LOG_FILE="$LOG_DIR/skillbridge-$ENV_NAME.log"
sudo mkdir -p "$LOG_DIR"
sudo chown "$(whoami):$(whoami)" "$LOG_DIR"

# Redirect all output (stdout+stderr) to both the terminal/CI log AND the file
exec > >(tee -a "$LOG_FILE") 2>&1

echo ""
echo "===================================================="
echo "[$TIMESTAMP] Deploy started — ref: $REF (env: $ENV_NAME)"
echo "===================================================="

# Trap: log failure with a clear marker if anything below fails
trap 'echo "[$(date "+%Y-%m-%d %H:%M:%S")] DEPLOY FAILED — ref: $REF"; exit 1' ERR

echo "Checking out ref: $REF"
git fetch origin
git checkout "$REF"
git pull origin "$REF"

echo "Installing dependencies..."
npm ci

echo "Building..."
npm run build

echo "Restarting $PM2_NAME..."
pm2 restart "$PM2_NAME" --update-env

echo "Verifying health..."
sleep 2
if curl -sf -o /dev/null "$HEALTH_URL"; then
  echo "Health check passed."
else
  echo "WARNING: health check failed after deploy — check pm2 logs manually."
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Deploy SUCCEEDED — ref: $REF"
