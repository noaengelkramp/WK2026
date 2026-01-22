#!/bin/bash

# World Cup 2026 - API Endpoint Testing Script
# Tests backend functionality and marks passing features

BASE_URL="http://localhost:3001"
FRONTEND_URL="http://localhost:5173"

echo "=================================="
echo "WK2026 API Endpoint Testing"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0

# Test function
test_endpoint() {
  local name="$1"
  local command="$2"
  local expected="$3"
  
  echo -n "Testing: $name... "
  result=$(eval "$command" 2>&1)
  
  if echo "$result" | grep -q "$expected"; then
    echo -e "${GREEN}✅ PASS${NC}"
    ((PASSED++))
    return 0
  else
    echo -e "${RED}❌ FAIL${NC}"
    echo "  Expected: $expected"
    echo "  Got: $result"
    ((FAILED++))
    return 1
  fi
}

echo "=== Phase 1: Health & Basic Connectivity ==="
echo ""

test_endpoint "Backend Health" \
  "curl -s $BASE_URL/health | jq -r '.status'" \
  "ok"

test_endpoint "Frontend Loading" \
  "curl -s $FRONTEND_URL | grep -q 'root' && echo 'ok'" \
  "ok"

echo ""
echo "=== Phase 2: Authentication ==="
echo ""

# Test login with valid credentials
test_endpoint "Login with valid credentials" \
  "curl -s -X POST $BASE_URL/api/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"john.doe@wk2026.com\",\"password\":\"password123\"}' | jq -r '.message'" \
  "Login successful"

# Get auth token for subsequent requests
TOKEN=$(curl -s -X POST $BASE_URL/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"john.doe@wk2026.com","password":"password123"}' | jq -r '.accessToken')

# Test login with invalid credentials
test_endpoint "Login with invalid credentials (should fail)" \
  "curl -s -X POST $BASE_URL/api/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"fake@test.com\",\"password\":\"wrong\"}' | jq -r '.error'" \
  "Invalid credentials"

# Test registration with new email
RANDOM_EMAIL="newuser$(date +%s)@wk2026.com"
test_endpoint "Register new user" \
  "curl -s -X POST $BASE_URL/api/auth/register -H 'Content-Type: application/json' -d '{\"email\":\"$RANDOM_EMAIL\",\"password\":\"Pass123!\",\"firstName\":\"New\",\"lastName\":\"User\",\"departmentId\":\"bdc09e37-cc7e-4017-bd06-e69213adea02\"}' | jq -r '.message'" \
  "Registration successful"

# Test duplicate email
test_endpoint "Duplicate email registration (should fail)" \
  "curl -s -X POST $BASE_URL/api/auth/register -H 'Content-Type: application/json' -d '{\"email\":\"john.doe@wk2026.com\",\"password\":\"Pass123!\",\"firstName\":\"Duplicate\",\"lastName\":\"User\",\"departmentId\":\"bdc09e37-cc7e-4017-bd06-e69213adea02\"}' | jq -r '.error'" \
  "Email already registered"

echo ""
echo "=== Phase 3: Data Endpoints (Authenticated) ==="
echo ""

test_endpoint "Get all teams (48)" \
  "curl -s $BASE_URL/api/teams -H 'Authorization: Bearer $TOKEN' | jq '.teams | length'" \
  "48"

test_endpoint "Get all matches (134)" \
  "curl -s $BASE_URL/api/matches -H 'Authorization: Bearer $TOKEN' | jq '.matches | length'" \
  "134"

test_endpoint "Get group stage matches (72)" \
  "curl -s $BASE_URL/api/matches -H 'Authorization: Bearer $TOKEN' | jq '[.matches[] | select(.stage == \"group\")] | length'" \
  "72"

test_endpoint "Get knockout matches (62)" \
  "curl -s $BASE_URL/api/matches -H 'Authorization: Bearer $TOKEN' | jq '[.matches[] | select(.stage != \"group\")] | length'" \
  "62"

test_endpoint "Get departments (5)" \
  "curl -s $BASE_URL/api/departments -H 'Authorization: Bearer $TOKEN' | jq '.departments | length'" \
  "5"

echo ""
echo "=== Phase 4: Standings ==="
echo ""

test_endpoint "Get individual standings" \
  "curl -s $BASE_URL/api/standings/individual -H 'Authorization: Bearer $TOKEN' | jq '.standings | length'" \
  "[0-9]+"

test_endpoint "Get department standings" \
  "curl -s $BASE_URL/api/standings/departments -H 'Authorization: Bearer $TOKEN' | jq '.standings | length'" \
  "[0-9]+"

echo ""
echo "=== Phase 5: Scoring Rules & Bonus Questions ==="
echo ""

test_endpoint "Get scoring rules (7)" \
  "curl -s $BASE_URL/api/scoring-rules -H 'Authorization: Bearer $TOKEN' | jq '.rules | length'" \
  "7"

test_endpoint "Get bonus questions (5)" \
  "curl -s $BASE_URL/api/bonus-questions -H 'Authorization: Bearer $TOKEN' | jq '.questions | length'" \
  "5"

echo ""
echo "=== Phase 6: Admin Authentication ==="
echo ""

# Login as admin
ADMIN_TOKEN=$(curl -s -X POST $BASE_URL/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@wk2026.com","password":"password123"}' | jq -r '.accessToken')

test_endpoint "Admin login" \
  "curl -s -X POST $BASE_URL/api/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"admin@wk2026.com\",\"password\":\"password123\"}' | jq -r '.user.isAdmin'" \
  "true"

echo ""
echo "=================================="
echo "Test Summary"
echo "=================================="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo "Total: $((PASSED + FAILED))"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}🎉 All API tests passed!${NC}"
  exit 0
else
  echo -e "${YELLOW}⚠️  Some tests failed. Review above for details.${NC}"
  exit 1
fi
