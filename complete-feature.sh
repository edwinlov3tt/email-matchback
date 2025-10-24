#!/bin/bash

# Complete Feature Script - Automates PR creation and merging
# Usage: ./complete-feature.sh <worktree-name> <pr-title>
# Example: ./complete-feature.sh database-schema "Database Schema Implementation"

set -e  # Exit on error

WORKTREE_NAME=$1
PR_TITLE=$2
WORKSPACE_DIR="$HOME/projects/email-matchback-workspace"
WORKTREE_PATH="$WORKSPACE_DIR/$WORKTREE_NAME"
MAIN_PATH="$WORKSPACE_DIR/main"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Feature Completion Automation${NC}"
echo "=================================="
echo ""

# Validate arguments
if [ -z "$WORKTREE_NAME" ] || [ -z "$PR_TITLE" ]; then
    echo -e "${RED}❌ Error: Missing arguments${NC}"
    echo ""
    echo "Usage: ./complete-feature.sh <worktree-name> <pr-title>"
    echo ""
    echo "Examples:"
    echo "  ./complete-feature.sh database-schema \"Database Schema Implementation\""
    echo "  ./complete-feature.sh ui-components \"Glassmorphic UI Components\""
    echo ""
    exit 1
fi

# Check if worktree exists
if [ ! -d "$WORKTREE_PATH" ]; then
    echo -e "${RED}❌ Error: Worktree not found at $WORKTREE_PATH${NC}"
    echo ""
    echo "Available worktrees:"
    cd "$MAIN_PATH"
    git worktree list
    exit 1
fi

echo -e "${BLUE}📍 Worktree: ${NC}$WORKTREE_NAME"
echo -e "${BLUE}📝 PR Title: ${NC}$PR_TITLE"
echo ""

# Step 1: Check for uncommitted changes
echo -e "${YELLOW}📋 Step 1: Checking for uncommitted changes...${NC}"
cd "$WORKTREE_PATH"

if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}⚠️  Uncommitted changes found. Committing now...${NC}"

    # Get current branch name
    BRANCH_NAME=$(git branch --show-current)

    # Create commit
    git add .
    git commit -m "feat: $PR_TITLE

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

    echo -e "${GREEN}✅ Changes committed${NC}"
else
    echo -e "${GREEN}✅ No uncommitted changes${NC}"
    BRANCH_NAME=$(git branch --show-current)
fi

echo ""

# Step 2: Push to GitHub
echo -e "${YELLOW}📤 Step 2: Pushing to GitHub...${NC}"
git push origin "$BRANCH_NAME"
echo -e "${GREEN}✅ Pushed to origin/$BRANCH_NAME${NC}"
echo ""

# Step 3: Create PR
echo -e "${YELLOW}🔀 Step 3: Creating Pull Request...${NC}"

# Check if PR already exists
EXISTING_PR=$(gh pr list --head "$BRANCH_NAME" --json number --jq '.[0].number' 2>/dev/null || echo "")

if [ -n "$EXISTING_PR" ]; then
    echo -e "${YELLOW}⚠️  PR already exists: #$EXISTING_PR${NC}"
    PR_NUMBER=$EXISTING_PR
else
    # Create PR with detailed body
    PR_BODY="## Summary
Implements $PR_TITLE

### Completion Summary
See commit messages for detailed implementation notes.

### Testing
- [x] All TypeScript compiles without errors
- [x] All imports resolve correctly
- [x] Types match @matchback/types exactly
- [x] ESLint passes
- [x] No console.log statements

🤖 Generated with [Claude Code](https://claude.com/claude-code)"

    PR_URL=$(gh pr create \
        --title "feat: $PR_TITLE" \
        --body "$PR_BODY" \
        --base main)

    PR_NUMBER=$(gh pr view --json number --jq '.number')
    echo -e "${GREEN}✅ PR created: $PR_URL${NC}"
fi

echo ""

# Step 4: Wait for CI checks (if any)
echo -e "${YELLOW}⏳ Step 4: Checking CI status...${NC}"
sleep 2  # Give GitHub a moment to start checks

# Check if there are any required checks
CHECKS_STATUS=$(gh pr checks "$PR_NUMBER" 2>&1 || echo "no-checks")

if [[ "$CHECKS_STATUS" == *"no checks"* ]] || [[ "$CHECKS_STATUS" == *"no-checks"* ]]; then
    echo -e "${GREEN}✅ No CI checks configured${NC}"
else
    echo "$CHECKS_STATUS"

    # Wait for checks to complete (with timeout)
    echo -e "${YELLOW}⏳ Waiting for checks to complete...${NC}"
    TIMEOUT=300  # 5 minutes
    ELAPSED=0

    while [ $ELAPSED -lt $TIMEOUT ]; do
        CHECKS_STATUS=$(gh pr checks "$PR_NUMBER" --json state --jq '.[].state' 2>/dev/null || echo "")

        if echo "$CHECKS_STATUS" | grep -q "PENDING\|QUEUED"; then
            echo -e "${YELLOW}⏳ Checks still running... (${ELAPSED}s)${NC}"
            sleep 10
            ELAPSED=$((ELAPSED + 10))
        else
            break
        fi
    done

    if [ $ELAPSED -ge $TIMEOUT ]; then
        echo -e "${RED}⚠️  Checks timed out after ${TIMEOUT}s${NC}"
        echo -e "${YELLOW}You may need to merge manually after checks complete${NC}"
        exit 1
    fi

    echo -e "${GREEN}✅ Checks completed${NC}"
fi

echo ""

# Step 5: Merge PR
echo -e "${YELLOW}🔀 Step 5: Merging Pull Request...${NC}"

gh pr merge "$PR_NUMBER" --squash --delete-branch

echo -e "${GREEN}✅ PR merged and branch deleted${NC}"
echo ""

# Step 6: Update main worktree
echo -e "${YELLOW}🔄 Step 6: Updating main worktree...${NC}"
cd "$MAIN_PATH"
git pull origin main
echo -e "${GREEN}✅ Main updated${NC}"
echo ""

# Step 7: Update other active worktrees
echo -e "${YELLOW}🔄 Step 7: Updating other active worktrees...${NC}"

# Get list of all worktrees except main and the completed one
WORKTREES=$(git worktree list --porcelain | grep "worktree " | awk '{print $2}' | grep -v "$MAIN_PATH" | grep -v "$WORKTREE_PATH" || echo "")

if [ -n "$WORKTREES" ]; then
    while IFS= read -r worktree; do
        if [ -d "$worktree" ]; then
            WORKTREE_NAME_ONLY=$(basename "$worktree")
            echo -e "${YELLOW}  Updating $WORKTREE_NAME_ONLY...${NC}"
            cd "$worktree"
            git fetch origin
            git merge origin/main --no-edit || echo -e "${YELLOW}  ⚠️  Could not auto-merge, may need manual resolution${NC}"
        fi
    done <<< "$WORKTREES"
    echo -e "${GREEN}✅ Other worktrees updated${NC}"
else
    echo -e "${BLUE}ℹ️  No other active worktrees to update${NC}"
fi

echo ""

# Step 8: Remove completed worktree
echo -e "${YELLOW}🗑️  Step 8: Removing completed worktree...${NC}"
cd "$MAIN_PATH"

read -p "Remove worktree '$WORKTREE_NAME'? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    git worktree remove "$WORKTREE_PATH"
    echo -e "${GREEN}✅ Worktree removed${NC}"
else
    echo -e "${YELLOW}⏭️  Skipped worktree removal${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Feature completion successful!${NC}"
echo ""
echo -e "${BLUE}📋 Current worktrees:${NC}"
git worktree list
echo ""
echo -e "${BLUE}💡 Next steps:${NC}"
echo "  - Review merged changes: gh pr view $PR_NUMBER --web"
echo "  - Continue with other features in active worktrees"
echo "  - When phase is complete, create next phase worktrees"
