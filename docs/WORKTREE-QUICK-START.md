# Git Worktree Quick Start

## Your Current Setup

```
~/projects/email-matchback-workspace/
├── main/                    # Main branch (this directory)
├── database-schema/         # Phase 1 - Backend entities
└── ui-components/           # Phase 1 - Frontend UI components
```

## Open Phase 1 Features in Claude Code

### Instance 1: Database Schema

```bash
cd ~/projects/email-matchback-workspace/database-schema
npm install
code .  # Or open in your editor

# In Claude Code:
cat tasks/database-schema.md
# "Read tasks/database-schema.md and implement the database schema"
```

### Instance 2: UI Components

```bash
cd ~/projects/email-matchback-workspace/ui-components
npm install
code .

# In Claude Code:
cat tasks/glassmorphic-ui.md
# "Read tasks/glassmorphic-ui.md and implement the glassmorphic UI components"
```

## Common Commands

```bash
# List all worktrees
git worktree list

# Create new worktree (from main/)
cd ~/projects/email-matchback-workspace/main
git worktree add ../campaign-mgmt feature/campaign-management

# Remove completed worktree
git worktree remove ../database-schema

# View current branch
git branch --show-current

# Commit and push
git add .
git commit -m "feat: your message"
git push origin feature/branch-name
```

## After Merging a PR

```bash
# Update main
cd ~/projects/email-matchback-workspace/main
git pull origin main

# Update other active worktrees
cd ~/projects/email-matchback-workspace/ui-components
git merge origin/main

# Remove completed worktree
cd ~/projects/email-matchback-workspace/main
git worktree remove ../database-schema
```

## Create Phase 2 Worktrees (After Phase 1 Complete)

```bash
cd ~/projects/email-matchback-workspace/main
git worktree add ../campaign-mgmt feature/campaign-management
git worktree add ../file-processing feature/file-processing
git worktree add ../authentication feature/authentication
git worktree add ../pattern-analysis feature/pattern-analysis
```

## Full Documentation

📚 See [docs/WORKTREE-SETUP.md](docs/WORKTREE-SETUP.md) for comprehensive guide

## Parallel Development Matrix

**Phase 1** (2 parallel instances):
- database-schema + ui-components

**Phase 2** (4 parallel instances):
- campaign-mgmt + file-processing + authentication + pattern-analysis

**Phase 3** (4 parallel instances):
- email-integration + report-generation + dashboard-pages + data-sanitization
