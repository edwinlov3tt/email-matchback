# Git Worktree Setup Guide for Parallel Development

This guide explains how to set up and use Git worktrees for parallel development with multiple Claude Code instances.

## Table of Contents

- [What Are Worktrees?](#what-are-worktrees)
- [Initial Setup](#initial-setup)
- [Creating Worktrees](#creating-worktrees)
- [Development Workflow](#development-workflow)
- [Managing Worktrees](#managing-worktrees)
- [Troubleshooting](#troubleshooting)
- [Quick Reference](#quick-reference)

## What Are Worktrees?

Git worktrees allow you to have multiple branches checked out simultaneously in separate directories, all sharing the same Git history. This is ideal for:

- Working on multiple features in parallel
- Running multiple dev servers simultaneously
- Keeping features isolated while sharing Git history
- Saving disk space compared to multiple clones

## Initial Setup

### Step 1: Create Workspace Directory

```bash
# Navigate to your projects folder
cd ~/projects  # or wherever you keep projects

# Create a workspace directory to hold all worktrees
mkdir email-matchback-workspace
cd email-matchback-workspace
```

### Step 2: Move Existing Repository

```bash
# Move your current repository into the workspace as "main"
mv /Users/edwinlovettiii/email-matchback ./main

# Navigate into it
cd main
```

Your structure now looks like:
```
~/projects/email-matchback-workspace/
└── main/                    # Your original repo (on main branch)
```

## Creating Worktrees

### Phase 1: Foundation (2 parallel features)

From the `main` directory, create worktrees for Phase 1:

```bash
cd ~/projects/email-matchback-workspace/main

# Create worktree for database schema
git worktree add ../database-schema feature/database-schema

# Create worktree for UI components
git worktree add ../ui-components feature/glassmorphic-ui
```

Your structure now looks like:
```
~/projects/email-matchback-workspace/
├── main/                    # Original repo on 'main' branch
├── database-schema/         # Worktree on 'feature/database-schema'
└── ui-components/           # Worktree on 'feature/glassmorphic-ui'
```

### Phase 2: Core Services (4 parallel features)

After Phase 1 features are merged to main:

```bash
cd ~/projects/email-matchback-workspace/main

# Create worktrees for Phase 2
git worktree add ../campaign-mgmt feature/campaign-management
git worktree add ../file-processing feature/file-processing
git worktree add ../authentication feature/authentication
git worktree add ../pattern-analysis feature/pattern-analysis
```

### Phase 3: Integration (4 parallel features)

After Phase 2 features are merged to main:

```bash
cd ~/projects/email-matchback-workspace/main

# Create worktrees for Phase 3
git worktree add ../email-integration feature/email-integration
git worktree add ../report-generation feature/report-generation
git worktree add ../dashboard-pages feature/dashboard-pages
git worktree add ../data-sanitization feature/data-sanitization
```

## Development Workflow

### Opening Features in Claude Code

**Instance 1 - Database Schema:**
```bash
cd ~/projects/email-matchback-workspace/database-schema
code .  # Or open in your preferred editor

# In Claude Code, say:
# "Read tasks/database-schema.md and implement the database schema"
```

**Instance 2 - UI Components:**
```bash
cd ~/projects/email-matchback-workspace/ui-components
code .

# In Claude Code, say:
# "Read tasks/glassmorphic-ui.md and implement the glassmorphic UI components"
```

### Installing Dependencies

Each worktree needs its own `node_modules`:

```bash
# In each worktree
cd ~/projects/email-matchback-workspace/database-schema
npm install

cd ~/projects/email-matchback-workspace/ui-components
npm install
```

### Running Dev Servers

You can run servers in multiple worktrees simultaneously:

```bash
# Terminal 1 - Backend in database-schema worktree
cd ~/projects/email-matchback-workspace/database-schema
npm run dev:api

# Terminal 2 - Frontend in ui-components worktree
cd ~/projects/email-matchback-workspace/ui-components
npm run dev:web

# Terminal 3 - Another feature
cd ~/projects/email-matchback-workspace/campaign-mgmt
npm run dev:api
```

### Committing and Pushing Changes

```bash
# From any worktree
cd ~/projects/email-matchback-workspace/database-schema

# Stage and commit changes
git add .
git commit -m "feat(database): implement Campaign and MatchRecord entities"

# Push to remote
git push origin feature/database-schema

# Create pull request
gh pr create --title "feat: Database Schema" \
  --body "Implements all TypeORM entities, migrations, and seed data"
```

### After PR is Merged

```bash
# Update main worktree
cd ~/projects/email-matchback-workspace/main
git pull origin main

# Update other active worktrees to include merged changes
cd ~/projects/email-matchback-workspace/ui-components
git fetch origin
git merge origin/main

# Remove completed worktree
cd ~/projects/email-matchback-workspace/main
git worktree remove ../database-schema

# Optional: Cleanup the directory
rm -rf ../database-schema
```

## Managing Worktrees

### List All Worktrees

```bash
# From any worktree or the main repo
git worktree list

# Example output:
# /Users/you/projects/email-matchback-workspace/main           abc123 [main]
# /Users/you/projects/email-matchback-workspace/database-schema def456 [feature/database-schema]
# /Users/you/projects/email-matchback-workspace/ui-components   ghi789 [feature/glassmorphic-ui]
```

### Remove a Worktree

```bash
# Method 1: Git removes the directory
git worktree remove ../database-schema

# Method 2: Manually delete, then prune
rm -rf ../database-schema
git worktree prune
```

### Move a Worktree

```bash
# You can move worktree directories freely
mv ~/projects/email-matchback-workspace/database-schema ~/Desktop/

# Git will still track it
git worktree list  # Shows new path automatically
```

### Lock a Worktree (Prevent Deletion)

```bash
# Lock to prevent accidental removal
git worktree lock ../database-schema

# Unlock when ready
git worktree unlock ../database-schema
```

## Troubleshooting

### Problem: "fatal: 'feature/database-schema' is already checked out"

**Cause:** A worktree already exists for this branch.

**Solution:**
```bash
# List existing worktrees
git worktree list

# Remove the old worktree first
git worktree remove <path-to-old-worktree>

# Or if the directory is already deleted
git worktree prune
```

### Problem: "node_modules" conflicts between worktrees

**Cause:** Trying to share node_modules between worktrees.

**Solution:** Each worktree needs its own node_modules:
```bash
# In each worktree
cd ~/projects/email-matchback-workspace/database-schema
npm install
```

### Problem: Changes in one worktree affect another

**Expected Behavior:** This is normal! All worktrees share the same Git repository.

**If you commit in one worktree:**
- Other worktrees can see the commit with `git log`
- Use `git pull` or `git merge` to bring changes into other worktrees

### Problem: Disk space concerns

**Solution:** Worktrees share the `.git` folder, so they use less space than multiple clones:

```bash
# Check disk usage
du -sh ~/projects/email-matchback-workspace/*

# .git folder is only in main/
ls -la ~/projects/email-matchback-workspace/main/.git
```

### Problem: Lost track of which worktree is which

**Solution:** Use descriptive directory names and list regularly:

```bash
# List with branch info
git worktree list

# Add to your shell prompt (optional)
# Shows current branch in your terminal prompt
```

## Quick Reference

### Essential Commands

```bash
# Create worktree
git worktree add <path> <branch>
git worktree add ../database-schema feature/database-schema

# List worktrees
git worktree list

# Remove worktree
git worktree remove <path>

# Cleanup deleted worktrees
git worktree prune

# Lock/unlock worktree
git worktree lock <path>
git worktree unlock <path>

# Move worktree (just move the directory)
mv <old-path> <new-path>
```

### Directory Structure Template

```
~/projects/email-matchback-workspace/
├── main/                    # Main branch (original repo)
│
├── database-schema/         # Phase 1, Instance 1
├── ui-components/           # Phase 1, Instance 2
│
├── campaign-mgmt/           # Phase 2, Instance 1
├── file-processing/         # Phase 2, Instance 2
├── authentication/          # Phase 2, Instance 3
├── pattern-analysis/        # Phase 2, Instance 4
│
├── email-integration/       # Phase 3, Instance 1
├── report-generation/       # Phase 3, Instance 2
├── dashboard-pages/         # Phase 3, Instance 3
└── data-sanitization/       # Phase 3, Instance 4
```

### Workflow Checklist

**Starting a new feature:**
- [ ] `cd ~/projects/email-matchback-workspace/main`
- [ ] `git worktree add ../<feature-name> feature/<branch-name>`
- [ ] `cd ../<feature-name>`
- [ ] `npm install`
- [ ] Open in editor and start Claude Code
- [ ] Read task file: `cat tasks/<feature-name>.md`

**Completing a feature:**
- [ ] `git add .`
- [ ] `git commit -m "feat: description"`
- [ ] `git push origin feature/<branch-name>`
- [ ] `gh pr create`
- [ ] Wait for PR approval and merge
- [ ] `cd ../main && git pull origin main`
- [ ] `git worktree remove ../<feature-name>`

**Updating active worktrees with merged changes:**
- [ ] `cd <active-worktree>`
- [ ] `git fetch origin`
- [ ] `git merge origin/main`
- [ ] Resolve any conflicts if needed

## Best Practices

### 1. Use Descriptive Directory Names

```bash
# Good
git worktree add ../database-schema feature/database-schema
git worktree add ../ui-components feature/glassmorphic-ui

# Less clear
git worktree add ../db feature/database-schema
git worktree add ../ui feature/glassmorphic-ui
```

### 2. Keep Main Worktree Clean

```bash
# Use main/ only for:
# - Pulling latest changes
# - Creating new worktrees
# - Managing repository-wide operations

# Don't develop directly in main/
```

### 3. Install Dependencies Per Worktree

```bash
# Always run in each worktree
npm install

# Don't try to symlink or share node_modules
```

### 4. Regular Cleanup

```bash
# After merging features, remove their worktrees
git worktree remove ../database-schema

# Periodically check for stale references
git worktree prune
```

### 5. Update Worktrees Regularly

```bash
# Keep worktrees in sync with main
cd ~/projects/email-matchback-workspace/ui-components
git fetch origin
git merge origin/main  # Brings in merged features
```

## Advantages Over Multiple Clones

| Feature | Worktrees | Multiple Clones |
|---------|-----------|-----------------|
| Disk space | Shared `.git` (efficient) | Separate `.git` each (wasteful) |
| Git history | Shared, instant updates | Must push/pull between clones |
| Branch checkout | One branch per worktree | One branch per clone |
| Setup complexity | Single `git worktree add` | Full `git clone` each time |
| Cleanup | `git worktree remove` | Delete entire directory |

## Related Documentation

- [FEATURE-BRANCHES.md](./FEATURE-BRANCHES.md) - Parallel development strategy
- [tasks/README.md](../tasks/README.md) - Task instructions overview
- [CLAUDE.md](../CLAUDE.md) - Architecture and development guide

## Summary

Git worktrees are the recommended approach for parallel development on this project because:

- ✅ Efficient disk usage (shared `.git` folder)
- ✅ Isolated work environments per feature
- ✅ Easy to manage multiple Claude Code instances
- ✅ No branch switching conflicts
- ✅ Clean, organized workspace structure

Follow the workflow above to maximize productivity with parallel development!
