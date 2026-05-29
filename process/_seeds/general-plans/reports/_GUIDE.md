# Reports

This folder holds operational reports for general and cross-cutting work. Feature-specific reports live in `process/features/{feature}/reports/`.

## What Goes Here

- Post-implementation reports (what was built, what deviated from plan, lessons learned)
- Debugging reports (root cause analysis, investigation findings)
- Performance or quality audit reports
- Phase completion reports in multi-phase programs
- Blocker documentation and resolution records
- Any operational document that captures WHAT HAPPENED (not what to do -- that is a plan)

## Naming Convention

Use descriptive date-stamped names: `[topic]-[agent]-[ddmmyy]-[hhmm]-[slug].md`

Examples:
- `execute-agent-260527-1430-auth-migration.md`
- `phase-01-validation-report_26-05-27.md`

## What Triggers a Report

- Phase completion in a multi-phase program
- Significant debugging sessions
- Validation results (pass or fail)
- Blocker documentation
- Post-mortem analysis
- UPDATE PROCESS mode producing actionable insights

## What Does Not Go Here

- Implementation plans (use `active/`)
- Research or reference material (use `references/`)
- Durable project knowledge (use `process/context/`)
- Feature-specific reports (use `process/features/{feature}/reports/`)
