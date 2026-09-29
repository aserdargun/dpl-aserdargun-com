# DPL working contract

- Build the bilingual decision-plane laboratory that shows when an agent should take a short path, evaluate further, ask for evidence, wait for approval, abstain, or block. This is a deterministic local simulation, not an LLM runtime: no API key, model, account, backend, external store, real sending action, or persistent browser storage.
- Keep decision truth in `src/domain` and its scenarios in `src/data`; `src/i18n` owns the Turkish and English surface. Policy order and the routes it can produce are explicit data, never inferred from the UI.
- A policy receives only the observations the run exposes at that step. A rejected or missing input must not silently fall through to a different policy, and approval is an explicit state a run has to reach, never an implicit default.
- Keep Turkish and English controls, policy names and explanations equivalent. Label scenario assumptions; do not invent provider behaviour, model capability, or approval semantics that the simulation does not model.
- Verify `npm run validate` and review `git diff --check` before handoff.
- Local work only unless the user authorizes external publication. Preserve unrelated work and processes.
