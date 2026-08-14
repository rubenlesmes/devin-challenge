# Devin PR Template

## Objective

<!-- What this PR delivers and why. -->

## Business Hypothesis Tested

<!-- Which decision or hypothesis this work provides evidence for. -->

## Implementation Summary

<!-- Key changes, modules, and services. -->

## Architecture and Reuse

<!-- Which shared primitives (permissions, transitions, audit writer, UI components) were reused; any new abstractions and why. -->

## Parallel Workstreams

<!-- Workstreams used, file ownership, or "None — sequential". Do not claim parallelism that did not occur. -->

## Integration Approach

<!-- How work was integrated and conflicts resolved. -->

## Screenshots

<!-- Reference images under docs/screenshots/. -->

## Automated Test Evidence

<!-- Commands run and results (lint, typecheck, tests, build). -->

## Manual Test Evidence

<!-- Browser scenarios executed and results. -->

## Authorization and Audit Review

<!-- Confirmation that mutations enforce permissions/transitions and write audit events atomically. -->

## Implemented vs Simulated Capabilities

<!-- What actually works vs. what is simulated (e.g. demo identity, local shadow database). -->

## Known Limitations

## Production Gaps

## Human-Review Checklist

- [ ] No production data or secrets are present.
- [ ] All mutations have server-side authorization.
- [ ] State transitions are validated server-side.
- [ ] Business changes and audit events are atomic (same transaction).
- [ ] Unauthorized operations create no mutations and no audit events.
- [ ] `npm run check` passes (lint, typecheck, tests, build).
- [ ] Parallel work did not introduce duplicate platform abstractions.
- [ ] Integrated code uses the central permission, validation, transition, and audit services.
- [ ] The README does not overstate production readiness.
