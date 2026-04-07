#!/bin/bash

# Test script for Parent Linking API endpoints

BASE_URL="http://localhost:5000/api/v1"

echo "=========================================="
echo "Testing Parent-Linking Endpoints"
echo "=========================================="

# Test 1: Parent Portal Dashboard (should require auth)
echo -e "\n1. Testing GET /parent/dashboard (no auth - should return 401):"
curl -s -X GET "$BASE_URL/parent/dashboard" | jq '.' 2>/dev/null || echo "Response received"

# Test 2: Parent Portal Students (should require auth)
echo -e "\n2. Testing GET /parent/students (no auth - should return 401):"
curl -s -X GET "$BASE_URL/parent/students" | jq '.' 2>/dev/null || echo "Response received"

# Test 3: Parent-Linking Routes mounted check
echo -e "\n3. Testing GET /parent-linking/parent/test/students (no auth - should return 401):"
curl -s -X GET "$BASE_URL/parent-linking/parent/test/students" | jq '.' 2>/dev/null || echo "Response received"

# Test 4: Check if routes are definitely mounted
echo -e "\n4. Testing POST /parent-linking/:studentId/link/:parentId (no auth - should return 401):"
curl -s -X POST "$BASE_URL/parent-linking/test/link/test" | jq '.' 2>/dev/null || echo "Response received"

# Test 5: Child-specific endpoint
echo -e "\n5. Testing GET /parent/children/:studentId/attendance (no auth - should return 401):"
curl -s -X GET "$BASE_URL/parent/children/test/attendance" | jq '.' 2>/dev/null || echo "Response received"

echo -e "\n=========================================="
echo "If all endpoints return 401, routes are properly mounted!"
echo "=========================================="
