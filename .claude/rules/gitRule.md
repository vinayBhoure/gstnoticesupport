# CLAUDE.md — Git Push Rule

## Branch Model
feature/<phase>/<name> → development → staging → main

---

## Auto Git Sync

Run this automatically after every completed task.

### 1. Sync Docs
- Append entry to `docs/tracking/CHANGELOG.md`
- Mark task done in `docs/tracking/tasks.md` if applicable
- Log new decision in `docs/tracking/decisions.md` if applicable
- Append Encountered error and solution in `docs/tracking/errors.md` if applicable

### 2. Pull Current Branch
git pull origin <current-branch> --rebase


### 3. Stage & Commit

git add -A
git commit -m "<type>(<scope>): <summary>"

Follow Conventional Commits — `feat`, `fix`, `chore`, `docs`, `refactor`

### 4. Push Current Branch

git push origin <current-branch>


### 5. Merge into Development

git checkout development
git pull origin development --rebase
git merge <current-branch> --no-ff -m "merge: <current-branch> into development"
git push origin development


### 6. Return to Current Branch

git checkout <current-branch>


---

## Hard Rules
- Never push directly to `staging` or `main`
- Never force push any branch
- Never auto-resolve merge conflicts — stop and report
- Never commit `.env` or `.env.local` files
- Skip this rule if current branch is `development`, `staging`, or `main`