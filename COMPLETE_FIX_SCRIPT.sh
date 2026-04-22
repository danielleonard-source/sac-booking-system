#!/bin/bash

# ============================================
# SAC BOOKING SYSTEM - COMPLETE FIX SCRIPT
# ============================================

echo "🚀 Starting SAC Booking System Complete Fix..."
echo ""

# 1. Fix all import statements (named exports)
echo "Step 1: Fixing import statements..."
find src -name "*.js" -o -name "*.jsx" | while read file; do
  sed -i '' 's/import useAuthStore from/import { useAuthStore } from/g' "$file" 2>/dev/null
  sed -i '' 's/import useDataStore from/import { useDataStore } from/g' "$file" 2>/dev/null
  sed -i '' 's/import useUIStore from/import { useUIStore } from/g' "$file" 2>/dev/null
done

# 2. Fix authStore export
echo "Step 2: Fixing authStore export..."
sed -i '' 's/export default useAuthStore;/export { useAuthStore };/g' src/store/authStore.js 2>/dev/null

# 3. Fix CONFIG imports
echo "Step 3: Fixing CONFIG imports..."
find src/components -name "*.jsx" | while read file; do
  sed -i '' 's/import { CONFIG } from/import { SCHEDULE, DAYS_OF_WEEK, SAC_DECLINE_REASONS } from/g' "$file" 2>/dev/null
  sed -i '' 's/CONFIG\.SCHEDULE/SCHEDULE/g' "$file" 2>/dev/null
  sed -i '' 's/CONFIG\.CONSTANTS\.SAC_DECLINE_REASONS/SAC_DECLINE_REASONS/g' "$file" 2>/dev/null
  sed -i '' 's/CONFIG\.DAYS_OF_WEEK/DAYS_OF_WEEK/g' "$file" 2>/dev/null
done

# 4. Clean build caches
echo "Step 4: Cleaning build caches..."
rm -rf node_modules/.vite 2>/dev/null
rm -rf .vite 2>/dev/null
rm -rf dist 2>/dev/null

echo ""
echo "✅ Fix script complete!"
echo ""
echo "Next steps:"
echo "1. Run: npm run dev"
echo "2. Open browser to http://localhost:3000"
echo "3. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)"
echo ""
