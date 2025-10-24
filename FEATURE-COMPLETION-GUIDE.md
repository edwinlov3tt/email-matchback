# Feature Completion Quick Guide

## When a Feature is Done - Use Automation! 🤖

Simply run this command from the main worktree:

```bash
cd ~/projects/email-matchback-workspace/main
./complete-feature.sh <worktree-name> "<PR Title>"
```

## Examples

### Phase 1 Completions

```bash
# Database Schema complete
./complete-feature.sh database-schema "Database Schema Implementation"

# UI Components complete
./complete-feature.sh ui-components "Glassmorphic UI Components"
```

### Phase 2 Completions

```bash
# Campaign Management complete
./complete-feature.sh campaign-mgmt "Campaign Management API"

# File Processing complete
./complete-feature.sh file-processing "Excel File Processing & Storage"

# Authentication complete
./complete-feature.sh authentication "NextAuth.js Authentication"

# Pattern Analysis complete
./complete-feature.sh pattern-analysis "Pattern Analysis & Correction"
```

### Phase 3 Completions

```bash
# Email Integration complete
./complete-feature.sh email-integration "Email Integration with Resend"

# Report Generation complete
./complete-feature.sh report-generation "Report Generation & Pivot Tables"

# Dashboard Pages complete
./complete-feature.sh dashboard-pages "Dashboard & Frontend Pages"

# Data Sanitization complete
./complete-feature.sh data-sanitization "Data Sanitization & DCM_ID Generation"
```

## What the Script Does Automatically

1. ✅ Commits any uncommitted changes
2. ✅ Pushes to GitHub
3. ✅ Creates Pull Request with proper formatting
4. ✅ Waits for CI checks (if configured)
5. ✅ **Merges PR automatically** with squash merge
6. ✅ Deletes feature branch on GitHub
7. ✅ Updates main worktree
8. ✅ Updates all other active worktrees
9. ✅ Prompts you to remove completed worktree

**You don't need to do anything else!** The script handles the entire workflow.

## Claude Code Workflow

When Claude Code tells you "Feature complete":

```bash
# Just run this from another terminal
cd ~/projects/email-matchback-workspace/main
./complete-feature.sh <worktree-name> "<Feature Name>"

# That's it! Everything else is automated.
```

## Transitioning Between Phases

### When All Phase 1 Features Complete

```bash
# Remove all Phase 1 worktrees (if not already removed)
cd ~/projects/email-matchback-workspace/main
git worktree remove ../database-schema  # If still exists
git worktree remove ../ui-components    # If still exists

# Create Phase 2 worktrees (4 parallel features)
git worktree add ../campaign-mgmt feature/campaign-management
git worktree add ../file-processing feature/file-processing
git worktree add ../authentication feature/authentication
git worktree add ../pattern-analysis feature/pattern-analysis

# Install dependencies
cd ../campaign-mgmt && npm install
cd ../file-processing && npm install
cd ../authentication && npm install
cd ../pattern-analysis && npm install
```

### When All Phase 2 Features Complete

```bash
# Remove all Phase 2 worktrees
cd ~/projects/email-matchback-workspace/main
git worktree remove ../campaign-mgmt
git worktree remove ../file-processing
git worktree remove ../authentication
git worktree remove ../pattern-analysis

# Create Phase 3 worktrees (4 parallel features)
git worktree add ../email-integration feature/email-integration
git worktree add ../report-generation feature/report-generation
git worktree add ../dashboard-pages feature/dashboard-pages
git worktree add ../data-sanitization feature/data-sanitization

# Install dependencies
cd ../email-integration && npm install
cd ../report-generation && npm install
cd ../dashboard-pages && npm install
cd ../data-sanitization && npm install
```

## Troubleshooting

### Script Says "Worktree not found"

```bash
# Check available worktrees
cd ~/projects/email-matchback-workspace/main
git worktree list

# Use the exact worktree name shown
./complete-feature.sh <exact-name> "Title"
```

### Merge Conflicts in Other Worktrees

```bash
# Go to the conflicting worktree
cd ~/projects/email-matchback-workspace/<worktree-name>

# Resolve conflicts manually
git status  # See conflicting files
# Edit files to resolve conflicts
git add <resolved-files>
git commit
```

### Want to Keep Worktree After Completion

```bash
# When prompted "Remove worktree?", answer: n

# You can manually remove it later:
cd ~/projects/email-matchback-workspace/main
git worktree remove ../<worktree-name>
```

## Manual Commands (If Script Fails)

If you need to do it manually:

```bash
cd ~/projects/email-matchback-workspace/<worktree-name>

# 1. Commit and push
git add .
git commit -m "feat: description"
git push origin feature/branch-name

# 2. Create and merge PR
gh pr create --title "Title" --body "Description"
gh pr merge --squash --delete-branch

# 3. Update main
cd ~/projects/email-matchback-workspace/main
git pull origin main

# 4. Update other worktrees
cd ~/projects/email-matchback-workspace/<other-worktree>
git merge origin/main

# 5. Remove completed worktree
cd ~/projects/email-matchback-workspace/main
git worktree remove ../<completed-worktree>
```

## Full Documentation

📚 See [docs/WORKTREE-COMPLETION-WORKFLOW.md](docs/WORKTREE-COMPLETION-WORKFLOW.md) for comprehensive guide

## Summary

**The simple workflow:**

1. Work on feature in worktree until complete
2. Run: `./complete-feature.sh <worktree-name> "Title"`
3. Answer "y" when prompted to remove worktree
4. Done! PR is merged, everything updated, worktree cleaned up.

**That's it!** The automation handles everything else. 🎉
