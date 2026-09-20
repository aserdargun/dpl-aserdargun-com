# Architecture and scope

## Layers

- `src/domain/types.ts`: Scenario, ScenarioInput, EvidenceItem, DecisionPolicy, DecisionState, DecisionEvent, DecisionOutcome, ExperimentRun, ComparisonResult.
- `src/domain/engine.ts`: pure synchronous deterministic state-transition engine, runtime input/policy validation, budget accounting, comparison, JSON serialization. No browser/network calls.
- `src/data/scenarios.ts`: six versioned scenarios, bilingual example records, default conditions, conditional appropriate outcomes.
- `src/data/policies.ts`: three canonical policy configurations with shared gates and explicit extra-check costs.
- `src/data/rules.ts`: readable rule IDs, bilingual rationale, prerequisite definitions.
- `src/data/methods.ts`: source records, learning lessons, provenance and conceptual ecosystem relationships.
- `src/i18n`: state, field and value dictionaries. Scenario/rule/method content is bilingual at source.
- `src/components`: independently owned diagram, condition controls, trace, evidence, comparison, and methods surfaces.
- `src/App.tsx`: view composition and transient experiment state; language switching does not reset state.
- `tests`: domain invariants, safe lifecycle and actual Chromium production-build user flows.

## Decision contract

Every run snapshots the entire scenario, evidence, policy and inputs using structuredClone. All gates are deterministic and zero-cost. Gate order is: input snapshot → shared checks → untrusted-data isolation → denied authority → required approval → ambiguous request → missing mandatory evidence → routing. Higher priority gates short-circuit; downstream checks are not falsely claimed to have passed. `GATE.SHARED` indicates the entry to that ordered gate phase, not that every prerequisite succeeded.

Authority denial always blocks. Pending authority waits for human approval for high-impact or scenario-mandated approval actions. Scenario-level approval cannot be removed by lowering the impact input. Ambiguity requests clarification. Missing evidence requests additional evidence under every policy.

Routing:

| Policy     | Clear, current, low impact | Stale/conflicting evidence | High impact, authorized |
| ---------- | -------------------------- | -------------------------- | ----------------------- |
| Fast-first | Fast step                  | Request evidence           | Fast step               |
| Deep-first | Extra check                | Extra check                | Extra check             |
| Adaptive   | Fast step                  | Extra check                | Extra check             |

Fast step costs 1 unit, extra check costs 2, final verification costs 1. Every step checks its budget before consuming it. Insufficient budget leads to abstention. There is no loop, retry, random seed, token estimate, latency estimate, scalar confidence score, or correctness probability.

The extra check consumes a user-selected **synthetic finding**. Resolution may make stale/conflicting evidence sufficient for this simulation. Inconclusive findings leave problematic evidence unresolved and trigger abstention; clean evidence may remain usable. Refutation always triggers abstention. Final verification is also a synthetic input; failure never completes a run. Completed outcome requires passed gates and final verification. No scenario action is actually executed.

Source content is never interpreted as executable policy. Untrusted record trust metadata or an injected-instruction input produces a quarantine event; it cannot override canonical policy or authority. This is a demonstrator, not a general prompt-injection detector.

## Run identity and export

Schema and engine versions: `1.0.0`. The JSON export includes dataKind, deterministic content ID, complete scenario/version/evidence, canonical policy/version/cost, inputs, all events and final outcome. Each event records observed fields, prerequisite result, rule ID, and before/after budget. IDs are non-cryptographic content labels, not secure or guaranteed globally unique identifiers. There is no randomness, so no seed field is necessary. Comparison export stores a shared input snapshot and three independent complete run records.

The complete engine trace is calculated immediately; playback reveals steps in order. JSON export is enabled only after all steps have been revealed. Changing inputs pauses playback and leaves the prior snapshot visible with an explicit notice. Starting or stepping the new run creates a fresh snapshot. Reset discards the run and keeps draft conditions; selecting a scenario restores its default inputs. Comparison is also snapshotted and marked stale if draft inputs change. Language and page switches preserve runs. No persistence, import parser, or personal-data entry exists.

## Scientific boundaries

DPL's policy definitions, gate priorities, costs and scenarios are educational design choices. Primary publications provide conceptual context only. The UI separately labels source-based explanations, DPL choices, synthetic records, and computed simulation results. There is no real model evaluation, inference call, external action, or validated cognitive mechanism. Adjacent portfolio apps have conceptual descriptions only and no invented links.

## Static release

Vite bundles React + TypeScript to `dist/`. Navigation is local view state at `/`. Hosting requires only static assets; no backend, database, key, telemetry, or accounts. The subsequent authorized Azure deployment is described in `DEPLOYMENT.md`; no custom domain or DNS configuration is changed. Local lifecycle is loopback-only and strict-port; Stop inspects listener cwd before SIGTERM. Development port 8031, isolated production browser-test port 18032.
