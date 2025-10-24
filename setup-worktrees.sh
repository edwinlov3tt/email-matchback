#!/bin/bash

# Git Worktree Setup Script for Email Matchback Project
# This script creates all necessary worktrees for parallel development

set -e  # Exit on error

WORKSPACE_DIR="$HOME/projects/email-matchback-workspace"
MAIN_DIR="$WORKSPACE_DIR/main"

echo "🔧 Email Matchback Worktree Setup"
echo "================================="
echo ""

# Check if we're in the right directory
if [ ! -d "$MAIN_DIR/.git" ]; then
    echo "❌ Error: Main repository not found at $MAIN_DIR"
    echo "Please ensure the main repository is at $MAIN_DIR"
    exit 1
fi

cd "$MAIN_DIR"

# Function to create worktree if it doesn't exist
create_worktree() {
    local dir_name=$1
    local branch_name=$2
    local worktree_path="$WORKSPACE_DIR/$dir_name"

    if [ -d "$worktree_path" ]; then
        echo "⏭️  Skipping $dir_name (already exists)"
    else
        echo "✨ Creating worktree: $dir_name → $branch_name"
        git worktree add "../$dir_name" "$branch_name"
    fi
}

echo "📦 Phase 1: Foundation (Week 1-2)"
echo "---------------------------------"
create_worktree "database-schema" "feature/database-schema"
create_worktree "ui-components" "feature/glassmorphic-ui"
echo ""

echo "📦 Phase 2: Core Services (Week 3-4)"
echo "------------------------------------"
echo "Run this section after Phase 1 is complete and merged."
read -p "Create Phase 2 worktrees now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    create_worktree "campaign-mgmt" "feature/campaign-management"
    create_worktree "file-processing" "feature/file-processing"
    create_worktree "authentication" "feature/authentication"
    create_worktree "pattern-analysis" "feature/pattern-analysis"
    echo ""
fi

echo "📦 Phase 3: Integration (Week 5-6)"
echo "----------------------------------"
echo "Run this section after Phase 2 is complete and merged."
read -p "Create Phase 3 worktrees now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    create_worktree "email-integration" "feature/email-integration"
    create_worktree "report-generation" "feature/report-generation"
    create_worktree "dashboard-pages" "feature/dashboard-pages"
    create_worktree "data-sanitization" "feature/data-sanitization"
    echo ""
fi

echo "✅ Worktree Setup Complete!"
echo ""
echo "📋 Current Worktrees:"
git worktree list
echo ""
echo "📖 Next Steps:"
echo "1. Install dependencies in each worktree:"
echo "   cd $WORKSPACE_DIR/database-schema && npm install"
echo "   cd $WORKSPACE_DIR/ui-components && npm install"
echo ""
echo "2. Open each worktree in a separate editor/terminal"
echo ""
echo "3. Read the task instructions:"
echo "   cat tasks/database-schema.md"
echo "   cat tasks/glassmorphic-ui.md"
echo ""
echo "4. Start development with Claude Code!"
echo ""
echo "📚 Full documentation: docs/WORKTREE-SETUP.md"
