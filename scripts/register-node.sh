#!/bin/bash

# Register and Authorize IRIS Desktop Node
# This script registers the IRIS desktop application as a research node in the backend
# and automatically approves it for development purposes.

set -e

BACKEND_URL="${1:-http://localhost:5000}"
NODE_ID="iris-desktop-node"
NODE_NAME="IRIS Desktop Application"
CERTIFICATE="MOCK_CERT_DATA"
INSTITUTION="Development Environment"
CONTACT="developer@iris.local"

echo "=================================================="
echo "  IRIS Node Registration & Authorization Script"
echo "=================================================="
echo ""
echo "Backend URL: $BACKEND_URL"
echo "Node ID: $NODE_ID"
echo "Node Name: $NODE_NAME"
echo ""

# Step 1: Register the node (will be in Pending status)
echo "Step 1: Registering node..."
echo "---------------------------------------------------"

REGISTER_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/node/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"nodeId\": \"$NODE_ID\",
    \"nodeName\": \"$NODE_NAME\",
    \"certificate\": \"$CERTIFICATE\",
    \"nodeUrl\": \"http://localhost:3000\",
    \"institutionDetails\": \"$INSTITUTION\",
    \"contactInfo\": \"$CONTACT\",
    \"requestedAccessLevel\": \"ReadWrite\"
  }")

echo "Response: $REGISTER_RESPONSE"
echo ""

# Extract registrationId from response
REGISTRATION_ID=$(echo $REGISTER_RESPONSE | grep -oP '"registrationId":"\K[^"]+' || echo "")

if [ -z "$REGISTRATION_ID" ]; then
  echo "❌ Failed to extract registrationId from response"
  echo "Response was: $REGISTER_RESPONSE"
  exit 1
fi

echo "✅ Node registered successfully!"
echo "Registration ID: $REGISTRATION_ID"
echo ""

# Step 2: Authorize the node (change status from Pending to Authorized)
echo "Step 2: Authorizing node..."
echo "---------------------------------------------------"

AUTHORIZE_RESPONSE=$(curl -s -X PUT "$BACKEND_URL/api/node/$REGISTRATION_ID/status" \
  -H "Content-Type: application/json" \
  -d "{
    \"status\": 1
  }")

echo "Response: $AUTHORIZE_RESPONSE"
echo ""

# Check if authorization was successful
if echo $AUTHORIZE_RESPONSE | grep -q "successfully"; then
  echo "✅ Node authorized successfully!"
  echo ""
  echo "=================================================="
  echo "  Setup Complete!"
  echo "=================================================="
  echo ""
  echo "The IRIS desktop app can now complete all 4 phases:"
  echo "  ✅ Phase 1: Encrypted Channel (ECDH + AES-256-GCM)"
  echo "  ✅ Phase 2: Node Identification (X.509 Certificate)"
  echo "  ✅ Phase 3: Mutual Authentication (Challenge-Response)"
  echo "  ✅ Phase 4: User Login"
  echo ""
  echo "You can now login with:"
  echo "  Username: admin@admin.com"
  echo "  Password: Admin@123"
  echo ""
else
  echo "❌ Failed to authorize node"
  echo "Response was: $AUTHORIZE_RESPONSE"
  exit 1
fi
