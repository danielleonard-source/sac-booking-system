#!/bin/bash

echo "=== SAC BOOKING SYSTEM DIAGNOSTIC ==="
echo ""

echo "1. Checking store exports..."
echo "--- authStore.js ---"
grep "export" src/store/authStore.js 2>/dev/null || echo "File not found"
echo ""

echo "--- dataStore.js ---"
grep "export const useDataStore" src/store/dataStore.js 2>/dev/null || echo "Not found"
echo ""

echo "--- uiStore.js ---"
grep "export const useUIStore" src/store/uiStore.js 2>/dev/null || echo "Not found"
echo ""

echo "2. Checking App.jsx imports (first 15 lines)..."
head -15 src/App.jsx 2>/dev/null || echo "File not found"
echo ""

echo "3. Checking Calendar.jsx (first 20 lines)..."
head -20 src/components/Calendar.jsx 2>/dev/null || echo "File not found"
echo ""

echo "4. Checking Calendar.jsx line count..."
wc -l src/components/Calendar.jsx 2>/dev/null || echo "File not found"
echo ""

echo "5. Available Calendar versions..."
find . -name "*Calendar*" -type f 2>/dev/null | grep -v node_modules
echo ""

echo "=== END DIAGNOSTIC ==="
