#!/bin/bash

# ExtraWorks Backend - CURL Testing Examples
# Run these commands to test the API

BASE_URL="http://127.0.0.1:3000/api"

echo "==================================="
echo "1. Health Check"
echo "==================================="
curl -X GET http://127.0.0.1:3000/health
echo -e "\n\n"

echo "==================================="
echo "2. Get All Intentions"
echo "==================================="
curl -X GET $BASE_URL/intentions
echo -e "\n\n"

echo "==================================="
echo "3. Create ExtraWork 1"
echo "==================================="
EXTRAWORK_1=$(curl -s -X POST $BASE_URL/extraworks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Website Redesign Project",
    "description": "Complete redesign of the company website with new UX/UI",
    "priority": "high",
    "startDate": "2026-02-01",
    "endDate": "2026-04-30"
  }' | jq -r '.data.id')
echo "Created ExtraWork with ID: $EXTRAWORK_1"
echo -e "\n"

echo "==================================="
echo "4. Create ExtraWork 2"
echo "==================================="
EXTRAWORK_2=$(curl -s -X POST $BASE_URL/extraworks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Mobile App Development",
    "description": "Develop native mobile apps for iOS and Android",
    "priority": "critical",
    "startDate": "2026-03-01",
    "endDate": "2026-08-31"
  }' | jq -r '.data.id')
echo "Created ExtraWork with ID: $EXTRAWORK_2"
echo -e "\n"

echo "==================================="
echo "5. Get All ExtraWorks"
echo "==================================="
curl -s -X GET $BASE_URL/extraworks | jq '.'
echo -e "\n\n"

echo "==================================="
echo "6. Get ExtraWork by ID"
echo "==================================="
curl -s -X GET $BASE_URL/extraworks/$EXTRAWORK_1 | jq '.'
echo -e "\n\n"

echo "==================================="
echo "7. Create Resource for ExtraWork 1"
echo "==================================="
RESOURCE_1=$(curl -s -X POST $BASE_URL/resources \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Frontend Team\",
    \"type\": \"personnel\",
    \"url\": \"https://example.com/frontend-team\",
    \"metadata\": \"{\\\"size\\\": 5, \\\"department\\\": \\\"engineering\\\"}\",
    \"extraWorkId\": \"$EXTRAWORK_1\"
  }" | jq -r '.data.id')
echo "Created Resource with ID: $RESOURCE_1"
echo -e "\n"

echo "==================================="
echo "8. Create Resource for ExtraWork 1 (Backend Team)"
echo "==================================="
RESOURCE_2=$(curl -s -X POST $BASE_URL/resources \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Backend Team\",
    \"type\": \"personnel\",
    \"url\": \"https://example.com/backend-team\",
    \"metadata\": \"{\\\"size\\\": 4, \\\"department\\\": \\\"engineering\\\"}\",
    \"extraWorkId\": \"$EXTRAWORK_1\"
  }" | jq -r '.data.id')
echo "Created Resource with ID: $RESOURCE_2"
echo -e "\n"

echo "==================================="
echo "9. Create Resource for ExtraWork 2 (Development Tools)"
echo "==================================="
RESOURCE_3=$(curl -s -X POST $BASE_URL/resources \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"CI/CD Infrastructure\",
    \"type\": \"infrastructure\",
    \"url\": \"https://example.com/ci-cd\",
    \"metadata\": \"{\\\"provider\\\": \\\"AWS\\\", \\\"cost_monthly\\\": 5000}\",
    \"extraWorkId\": \"$EXTRAWORK_2\"
  }" | jq -r '.data.id')
echo "Created Resource with ID: $RESOURCE_3"
echo -e "\n"

echo "==================================="
echo "10. Get All Resources"
echo "==================================="
curl -s -X GET $BASE_URL/resources | jq '.'
echo -e "\n\n"

echo "==================================="
echo "11. Get Resources for ExtraWork 1"
echo "==================================="
curl -s -X GET $BASE_URL/resources/extrawork/$EXTRAWORK_1 | jq '.'
echo -e "\n\n"

echo "==================================="
echo "12. Update ExtraWork (title)"
echo "==================================="
curl -s -X PUT $BASE_URL/extraworks/$EXTRAWORK_1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Website Redesign Project - Updated"
  }' | jq '.'
echo -e "\n"

echo "==================================="
echo "13. Change ExtraWork Status to in_progress"
echo "==================================="
curl -s -X PATCH $BASE_URL/extraworks/$EXTRAWORK_1/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_progress"
  }' | jq '.'
echo -e "\n"

echo "==================================="
echo "14. Get ExtraWorks by Status (in_progress)"
echo "==================================="
curl -s -X GET $BASE_URL/extraworks/status/in_progress | jq '.'
echo -e "\n\n"

echo "==================================="
echo "15. Update Resource (name)"
echo "==================================="
curl -s -X PUT $BASE_URL/resources/$RESOURCE_1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Frontend Team - Senior Developers"
  }' | jq '.'
echo -e "\n"

echo "==================================="
echo "16. Search Actions by Query"
echo "==================================="
curl -s -X POST $BASE_URL/actions/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "change status to completed",
    "threshold": 0.3
  }' | jq '.'
echo -e "\n"

echo "==================================="
echo "17. Execute Action by Intent (change_extrawork_status)"
echo "==================================="
curl -s -X POST $BASE_URL/actions/execute/change_extrawork_status \
  -H "Content-Type: application/json" \
  -d "{
    \"params\": {
      \"id\": \"$EXTRAWORK_2\",
      \"status\": \"pending\"
    }
  }" | jq '.'
echo -e "\n"

echo "==================================="
echo "18. Create Resource via Natural Language"
echo "==================================="
curl -s -X POST $BASE_URL/actions/execute \
  -H "Content-Type: application/json" \
  -d "{
    \"query\": \"create new resource\",
    \"params\": {
      \"name\": \"QA Team\",
      \"type\": \"personnel\",
      \"extraWorkId\": \"$EXTRAWORK_1\"
    }
  }" | jq '.'
echo -e "\n"

echo "==================================="
echo "19. Change ExtraWork Status to completed"
echo "==================================="
curl -s -X PATCH $BASE_URL/extraworks/$EXTRAWORK_1/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed"
  }' | jq '.'
echo -e "\n"

echo "==================================="
echo "20. Get All ExtraWorks (Final State)"
echo "==================================="
curl -s -X GET $BASE_URL/extraworks | jq '.'
echo -e "\n\n"

echo "==================================="
echo "21. Delete Resource"
echo "==================================="
curl -s -X DELETE $BASE_URL/resources/$RESOURCE_3 | jq '.'
echo -e "\n"

echo "==================================="
echo "22. Get ExtraWorks by Status (completed)"
echo "==================================="
curl -s -X GET $BASE_URL/extraworks/status/completed | jq '.'
echo -e "\n\n"

echo "✅ All tests completed!"
echo "Variables stored:"
echo "  EXTRAWORK_1: $EXTRAWORK_1"
echo "  EXTRAWORK_2: $EXTRAWORK_2"
echo "  RESOURCE_1: $RESOURCE_1"
echo "  RESOURCE_2: $RESOURCE_2"
echo "  RESOURCE_3: $RESOURCE_3"
