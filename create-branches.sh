#!/bin/bash

# Create all feature branches from main
git checkout main

branches=(
  "feature/database-schema"
  "feature/campaign-management"
  "feature/file-processing"
  "feature/pattern-analysis"
  "feature/email-integration"
  "feature/report-generation"
  "feature/glassmorphic-ui"
  "feature/authentication"
  "feature/dashboard-pages"
  "feature/data-sanitization"
)

for branch in "${branches[@]}"; do
  echo "Creating $branch..."
  git checkout -b "$branch"
  git checkout main
done

echo "All feature branches created!"
git branch -a
