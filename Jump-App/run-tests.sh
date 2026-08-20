#!/bin/bash

# Exit immediately if a command exits with a non-zero status
# but we wrap the test command to ensure reports upload anyway.
set -u

# Optional: full GCS URI for Allure history sync and upload (e.g. gs://your-bucket-name).
# Leave unset to skip gsutil steps (local runs without GCP).
ALLURE_GCS_BUCKET_URI="${ALLURE_GCS_BUCKET_URI:-}"

# AUTHENTICATION BRIDGE (Required for gsutil + WIF)
if [ -f "$GOOGLE_APPLICATION_CREDENTIALS" ]; then
    echo "Authenticating gcloud CLI with WIF..."
    gcloud auth login --cred-file="$GOOGLE_APPLICATION_CREDENTIALS" --quiet
    gcloud config set project "$GOOGLE_CLOUD_PROJECT"
fi

echo "--- 1. Cleaning Allure Results ---"
npm run clean:allure

echo "--- 2. Syncing History from GCS ---"
mkdir -p allure-results/history
if [ -n "$ALLURE_GCS_BUCKET_URI" ]; then
  gsutil -m cp -r "${ALLURE_GCS_BUCKET_URI}/history/*" allure-results/history/ || echo "No existing history found."
else
  echo "ALLURE_GCS_BUCKET_URI not set; skipping GCS history download."
fi

echo "--- 3. Running Playwright Tests ---"
xvfb-run --auto-servernum --server-args="-screen 0 1280x1024x24" npm run test:staging:smoke
TEST_EXIT_CODE=$?

echo "--- 4. Generating Allure Report ---"
npm run allure:generate

echo "--- 5. Uploading report to GCS ---"
if [ -n "$ALLURE_GCS_BUCKET_URI" ]; then
  gsutil -m cp -r allure-report/* "${ALLURE_GCS_BUCKET_URI}/"
else
  echo "ALLURE_GCS_BUCKET_URI not set; skipping GCS upload."
fi

echo "--- Workflow Complete ---"
exit $TEST_EXIT_CODE
