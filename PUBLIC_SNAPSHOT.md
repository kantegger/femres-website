# Public snapshot policy

This repository is a reviewed public snapshot of FemRes. Production operations
and private development use a separate source repository. Public snapshots are
generated from an explicit allowlist, audited, tested, and then published as
ordinary commits and dated tags.

The public snapshot intentionally excludes:

- users, comments, interactions, subscriber records, and database exports;
- credentials, private environment files, production logs, and analytics;
- internal maintenance notes, temporary audits, and media drop folders; and
- third-party media files that FemRes is not entitled to redistribute.

Database schemas and migrations may be included, but production data must
never be included. `sql/import-data.sql` and similar data exports are expressly
forbidden by the snapshot policy.

Issues and pull requests are welcome in this public repository. Accepted
changes may be integrated into the private source repository and will appear in
a later public snapshot, so commit topology and release timing may differ from
a conventional public-first project.
