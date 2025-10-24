# Worktree Completion Workflow

This guide explains what to do when you finish implementing a feature in a worktree.

## Table of Contents

- [Single Feature Completion](#single-feature-completion)
- [Phase Completion](#phase-completion)
- [Common Issues](#common-issues)
- [Quick Reference](#quick-reference)

## Single Feature Completion

When you've finished implementing a feature in a worktree:

### 1. Commit Your Changes

```bash
# From the completed worktree
cd ~/projects/email-matchback-workspace/database-schema

# Check what changed
git status
git diff

# Stage all changes
git add .

# Commit with descriptive message
git commit -m "$(cat <<'EOF'
feat(database): implement complete database schema

- Created Campaign entity with 15 fields matching @matchback/types
- Created MatchRecord entity with 19 fields
- Created User entity with authentication fields
- Added TypeORM migrations
- Added seed data for development
- Created indexes on dcmId, customerId, emailAddress

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

### 2. Push to GitHub

```bash
git push origin feature/database-schema
```

### 3. Create Pull Request

Using GitHub CLI:

```bash
gh pr create \
  --title "feat: Database Schema Implementation" \
  --body "$(cat <<'EOF'
## Summary
Implements complete TypeORM database schema for the matchback platform.

### Files Created
- Campaign entity with 15 fields
- MatchRecord entity with 19 fields
- User entity for authentication
- TypeORM migrations
- Seed data for development

### Type Safety ✓
All entities match @matchback/types interfaces exactly.

### Features Unlocked
- ✓ campaign-management
- ✓ file-processing
- ✓ authentication
- ✓ pattern-analysis

### Testing
- [x] All TypeScript compiles
- [x] Migrations run successfully
- [x] Seed data works
- [x] Indexes created
- [x] Foreign keys working

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Or create PR on GitHub website:
1. Go to https://github.com/edwinlov3tt/email-matchback
2. Click "Compare & pull request"
3. Fill in title and description
4. Click "Create pull request"

### 4. Review and Merge

1. Review the PR on GitHub
2. Run any CI/CD checks
3. Get approval if needed
4. **Merge to main**

### 5. Update Main Worktree

```bash
# Switch to main worktree
cd ~/projects/email-matchback-workspace/main

# Pull the merged changes
git pull origin main
```

### 6. Update Other Active Worktrees

```bash
# Update other worktrees to get the merged changes
cd ~/projects/email-matchback-workspace/ui-components
git fetch origin
git merge origin/main
```

This is important because:
- UI components might need types from the database schema
- Ensures all worktrees have the latest code
- Prevents merge conflicts later

### 7. Remove Completed Worktree

```bash
# From main worktree
cd ~/projects/email-matchback-workspace/main

# Remove the completed worktree
git worktree remove ../database-schema

# Verify it's removed
git worktree list
```

### 8. Clean Up (Optional)

```bash
# Delete the feature branch on GitHub (optional, after merge)
gh api repos/edwinlov3tt/email-matchback/git/refs/heads/feature/database-schema -X DELETE

# Or keep it for reference
```

---

## Phase Completion

When ALL features in a phase are complete and merged:

### Phase 1 Complete → Start Phase 2

**After both `database-schema` AND `ui-components` are merged:**

```bash
# 1. Update main
cd ~/projects/email-matchback-workspace/main
git pull origin main

# 2. Remove both Phase 1 worktrees
git worktree remove ../database-schema
git worktree remove ../ui-components

# 3. Verify cleanup
git worktree list
# Should only show: main/

# 4. Create Phase 2 worktrees (4 parallel features)
git worktree add ../campaign-mgmt feature/campaign-management
git worktree add ../file-processing feature/file-processing
git worktree add ../authentication feature/authentication
git worktree add ../pattern-analysis feature/pattern-analysis

# 5. Verify Phase 2 worktrees
git worktree list
```

**Install dependencies in each:**

```bash
# Terminal 1
cd ~/projects/email-matchback-workspace/campaign-mgmt
npm install

# Terminal 2
cd ~/projects/email-matchback-workspace/file-processing
npm install

# Terminal 3
cd ~/projects/email-matchback-workspace/authentication
npm install

# Terminal 4
cd ~/projects/email-matchback-workspace/pattern-analysis
npm install
```

**Start Phase 2 development with 4 Claude Code instances:**

- Instance 1: `campaign-mgmt/` → Read `tasks/campaign-management.md`
- Instance 2: `file-processing/` → Read `tasks/file-processing.md`
- Instance 3: `authentication/` → Read `tasks/authentication.md`
- Instance 4: `pattern-analysis/` → Read `tasks/pattern-analysis.md`

### Phase 2 Complete → Start Phase 3

**After all 4 Phase 2 features are merged:**

```bash
# 1. Update main
cd ~/projects/email-matchback-workspace/main
git pull origin main

# 2. Remove all Phase 2 worktrees
git worktree remove ../campaign-mgmt
git worktree remove ../file-processing
git worktree remove ../authentication
git worktree remove ../pattern-analysis

# 3. Create Phase 3 worktrees (4 parallel features)
git worktree add ../email-integration feature/email-integration
git worktree add ../report-generation feature/report-generation
git worktree add ../dashboard-pages feature/dashboard-pages
git worktree add ../data-sanitization feature/data-sanitization

# 4. Install dependencies in each
cd ../email-integration && npm install
cd ../report-generation && npm install
cd ../dashboard-pages && npm install
cd ../data-sanitization && npm install
```

---

## Common Issues

### Problem: Merge Conflicts When Updating Worktree

**Scenario:** You run `git merge origin/main` in a worktree and get conflicts.

**Solution:**

```bash
# See what files have conflicts
git status

# Option 1: Resolve conflicts manually
# Edit the files, remove conflict markers
git add <resolved-files>
git commit

# Option 2: Abort and discuss approach
git merge --abort
# Then coordinate with other developers
```

### Problem: Can't Remove Worktree

**Error:** `fatal: '/path/to/worktree' contains modified or untracked files`

**Solution:**

```bash
# Option 1: Commit or stash changes first
cd ~/projects/email-matchback-workspace/database-schema
git add .
git commit -m "feat: final changes"

# Then remove
cd ~/projects/email-matchback-workspace/main
git worktree remove ../database-schema

# Option 2: Force remove (loses uncommitted changes!)
git worktree remove --force ../database-schema
```

### Problem: Worktree Directory Already Exists

**Error:** `fatal: '/path' already exists`

**Solution:**

```bash
# Option 1: Remove the directory first
rm -rf ~/projects/email-matchback-workspace/database-schema
git worktree prune
git worktree add ../database-schema feature/database-schema

# Option 2: Use a different directory name
git worktree add ../database-schema-v2 feature/database-schema
```

### Problem: Branch Already Checked Out in Another Worktree

**Error:** `fatal: 'feature/database-schema' is already checked out at '/path'`

**Solution:**

```bash
# List where it's checked out
git worktree list

# Remove the old worktree first
git worktree remove /path/to/old/worktree

# Then create new one
git worktree add ../database-schema feature/database-schema
```

### Problem: Lost Track of Which Worktrees Are Active

**Solution:**

```bash
# List all worktrees with their branches
git worktree list

# Example output:
# /path/main             [main]
# /path/database-schema  [feature/database-schema]
# /path/ui-components    [feature/glassmorphic-ui]

# Check status of each
cd ~/projects/email-matchback-workspace/database-schema
git status
git log -1  # See last commit
```

---

## Quick Reference

### Completion Checklist

When a feature is complete:

- [ ] Commit all changes: `git add . && git commit`
- [ ] Push to GitHub: `git push origin feature/branch-name`
- [ ] Create PR: `gh pr create` or via GitHub UI
- [ ] Get PR approved and merged
- [ ] Update main: `cd main/ && git pull origin main`
- [ ] Update other worktrees: `cd other-worktree/ && git merge origin/main`
- [ ] Remove completed worktree: `git worktree remove ../worktree-name`
- [ ] Verify: `git worktree list`

### Phase Transition Checklist

When all features in a phase are complete:

- [ ] All PRs merged to main
- [ ] Main updated: `cd main/ && git pull origin main`
- [ ] All phase worktrees removed
- [ ] Create next phase worktrees
- [ ] Install dependencies in each: `npm install`
- [ ] Verify setup: `git worktree list`
- [ ] Start next phase development

### Essential Commands

```bash
# Commit and push
git add .
git commit -m "feat: description"
git push origin feature/branch-name

# Create PR
gh pr create --title "Title" --body "Description"

# Update main
cd ~/projects/email-matchback-workspace/main
git pull origin main

# Update worktree
cd ~/projects/email-matchback-workspace/worktree-name
git merge origin/main

# Remove worktree
cd ~/projects/email-matchback-workspace/main
git worktree remove ../worktree-name

# Create new worktree
git worktree add ../worktree-name feature/branch-name

# List worktrees
git worktree list
```

---

## Workflow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Feature Complete in Worktree                                │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. Commit Changes                                           │
│    git add . && git commit -m "feat: description"           │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Push to GitHub                                           │
│    git push origin feature/branch-name                      │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Create Pull Request                                      │
│    gh pr create (or via GitHub UI)                          │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Review & Merge PR                                        │
│    (on GitHub)                                              │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Update Main Worktree                                     │
│    cd main/ && git pull origin main                         │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Update Other Active Worktrees                            │
│    cd other-worktree/ && git merge origin/main              │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. Remove Completed Worktree                                │
│    cd main/ && git worktree remove ../worktree-name         │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ Phase Complete? ──No──> Continue with other features        │
│       │                                                      │
│      Yes                                                     │
│       ▼                                                      │
│ Create Next Phase Worktrees                                 │
│ Start Next Phase Development                                │
└─────────────────────────────────────────────────────────────┘
```

---

## Related Documentation

- [WORKTREE-SETUP.md](./WORKTREE-SETUP.md) - Initial setup guide
- [WORKTREE-QUICK-START.md](../WORKTREE-QUICK-START.md) - Quick reference
- [FEATURE-BRANCHES.md](./FEATURE-BRANCHES.md) - Parallel development strategy
- [tasks/](../tasks/) - Task implementation instructions

## Summary

The key workflow is:

1. **Complete feature** → Commit → Push → Create PR
2. **Merge PR** → Update main → Update other worktrees
3. **Remove worktree** when done
4. **Repeat** for other features
5. **Phase complete** → Remove all phase worktrees → Create next phase worktrees

This keeps your workspace clean and organized while enabling efficient parallel development!
