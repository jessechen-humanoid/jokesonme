# repo-data-hygiene Specification

## Purpose

TBD - created by archiving change 'remove-raw-data-from-git'. Update Purpose after archive.

## Requirements

### Requirement: Personal data files excluded from version control

The git repository SHALL NOT track any file under the "RAW DATA" directory, and the repository history (all branches and tags) SHALL NOT contain any file under that directory. The ".gitignore" file SHALL contain rules ignoring the entire "RAW DATA" directory and all ".DS_Store" files, so newly added raw-data files never appear as trackable changes. Local files in the "RAW DATA" directory SHALL be preserved on disk; only their version-control presence is removed.

#### Scenario: New raw data file is not trackable

- **WHEN** a new file is placed inside the "RAW DATA" directory and git status is run
- **THEN** the file does not appear as an untracked or modified file

#### Scenario: History contains no personal data files

- **WHEN** the full history file list is inspected (for example via git log --all --name-only)
- **THEN** no path under the "RAW DATA" directory and no ".DS_Store" path appears in any commit

#### Scenario: Local raw data files preserved

- **WHEN** the version-control cleanup is completed
- **THEN** every file previously present in the local "RAW DATA" directory still exists on disk with unchanged content


<!-- @trace
source: remove-raw-data-from-git
updated: 2026-07-03
code:
  - CLAUDE.md
  - OPTIMIZATION_PLAN.md
-->

---
### Requirement: History rewrite requires explicit owner approval

Any operation that rewrites published git history and force-pushes to the shared remote SHALL be performed only after explicit approval from the repository owner, and a full mirror backup of the repository SHALL be created before the rewrite. After the force push, collaborators holding old clones SHALL be instructed to re-clone instead of pulling.

#### Scenario: Backup exists before rewrite

- **WHEN** the history rewrite is about to run
- **THEN** a mirror clone of the repository, including all refs, exists outside the project directory

#### Scenario: Rewrite aborted on unexpected result

- **WHEN** the rewritten history still contains target files or is missing unrelated files
- **THEN** the force push is not performed and the repository is restored from the mirror backup

<!-- @trace
source: remove-raw-data-from-git
updated: 2026-07-03
code:
  - CLAUDE.md
  - OPTIMIZATION_PLAN.md
-->