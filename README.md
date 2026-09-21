# DPL — Decision Plane Laboratory

**Karar Düzlemi Laboratuvarı · System One ↔ System Two**

An independent, deterministic, bilingual TR/EN laboratory for exploring when an agent should take a short path, evaluate further, ask for evidence or clarification, await approval, abstain, or block an action.

This is a working local simulation, not an LLM runtime. No API key, model, account, backend, external data store, real sending action, or persistent browser storage is used. Publication address: [dpl.aserdargun.com](https://dpl.aserdargun.com). DPL belongs to the **Agent system** layer of the [aserdargun.com learning system](https://aserdargun.com/), under [HNS — Harness Engineering Observatory](https://hns.aserdargun.com/). Portfolio links open independent applications; no neighboring application is integrated.

## Local use / Yerelde çalıştırma

Requires Node.js >=22.12 and npm. The safe Stop helper requires `lsof` (tested on macOS).

```sh
npm ci
npx playwright install chromium
npm run dev
```

Open **http://127.0.0.1:8031**. Choose a scenario, select a policy, play or step, inspect the rules, change conditions, compare policies, and download completed runs as JSON. Changing language preserves the run. Refreshing the page resets it.

```sh
npm run test          # Domain and safe lifecycle tests
npm run build         # Strict TypeScript + production output in dist/
npm run test:e2e      # Chromium user flows against production build (build first)
npm run validate     # Tests + build + browser tests + whitespace validation
npm run preview      # Serve dist/ at http://127.0.0.1:8031 (stop dev first)
npm run stop         # Stop this checkout's listener on port 8031 only
```

`npm run validate:codex`, `npm run dev:codex`, and `npm run stop:codex` are aliases for the same lifecycle. Local Codex Run/Validate/Stop actions are configured in the checkout-local `.codex/environments/environment.toml` (excluded from Git). Browser tests start their own production preview at port **18032**, refuse occupied ports, and shut it down themselves. They do not stop a running development preview on 8031. The dev server does not write build output.

Stop verifies **every listener's real working directory** before issuing SIGTERM. A foreign process causes refusal, and no listener is touched. Ownership is rechecked before termination. Stop never broadly matches process names, and never uses SIGKILL. Already-stopped is a successful no-op. `DPL_PORT` can explicitly select another port for the same ownership check; this is used by isolated lifecycle tests. On systems without `lsof`, Stop refuses rather than guessing.

## What works

- Six complete bilingual scenarios with synthetic records, dates, explicit claim conflicts, and conditional expected outcomes.
- Three fixed policies: fast-first, deep-first, adaptive. Shared authority, clarity, and mandatory-evidence gates cannot be skipped.
- Pure typed decision engine, finite work-unit budgets, immutable run snapshots, readable rules and prerequisites.
- Live diagram, play/pause/step/reset, editable conditions, full textual trace and outcome.
- Frozen equal-input comparison, individual and comparison JSON downloads.
- Source and method page distinguishing primary-source explanations, DPL design choices, synthetic inputs, and computed simulation outcomes.
- Locale-aware portfolio return links and eight related learning destinations: HNS, ARL, CTX, SEC, EVL, CUL, AOS, and MEM. No run data is transferred. Method examples reset to their default inputs and the adaptive policy.
- Keyboard focus, skip link, labeled controls, reduced-motion support, responsive reflow.

## Boundaries / Sınırlar

“System One” and “System Two” are a **design metaphor**, not claims about model cognition. Extra evaluation does not grant authority. Work units are explicitly chosen simulation costs, not tokens, money, accuracy probabilities, or measured latency. Playback timing is presentation only. Verification and extra-check findings are user-controlled synthetic inputs, not real checks against an external system. Completed runs do not execute the scenario's external action. Decision traces are rule logs, not hidden chain of thought.

No model runs in DPL. Related application names and URLs follow the root portfolio's `data/living-system.json` and `data/system-focus.json`; HTTP availability was checked on 2026-09-21. These are learning relationships, not runtime integrations. AOS links to its public overview and documentation; DPL does not execute an AOS runtime. The final-check trace reads a synthetic verification input and displays the frozen authority; it does not revalidate external permissions. Comparison results distinguish failed verification from verification that never ran.

## Release preparation

`npm run build` produces a self-contained static `dist/` directory. Host only that directory on a static HTTPS host. All three surfaces are client-side views under `/`, so no server routing is required. Assets use local paths; fonts are system fonts; no CDN is needed. External research links open only when the user clicks them.

The authorized Azure publication uses `rg-dpl-aserdargun-com` / `swa-dpl-aserdargun-com` in `aserdargun subscription 3`, West Europe, Free SKU. The single production workflow validates and deploys prebuilt `dist/` from `main`; it then verifies the live commit and asset hashes and runs the browser suite against production. The separately authorized custom domain is `dpl.aserdargun.com`, with DNS managed at IHS. Other portfolio repositories remain outside this deployment. See [architecture](docs/ARCHITECTURE.md), [validation evidence](docs/VALIDATION.md), and [visual specification](docs/DESIGN.md).

## Research

Source records, publication/access dates, qualifications, and bilingual paraphrases are maintained in `src/data/methods.ts`. Rechecked on 2026-09-21:

- [Anthropic — Building effective agents](https://www.anthropic.com/engineering/building-effective-agents), 2024-12-19. Workflow/agent distinction and routing patterns.
- [Anthropic — The “think” tool](https://www.anthropic.com/engineering/claude-think-tool), 2025-03-20. Includes the 2025-12-15 update recommending extended thinking instead in most cases. Historical conceptual context; its benchmark results are not DPL results.

Azure-generated endpoint: [DPL](https://orange-desert-036a46e03.5.azurestaticapps.net). See [deployment contract](docs/DEPLOYMENT.md); each release is verified by its successful Actions run and `/release.json` commit.

## Deployment verification

The build stamps `dist/release.json` with the full source commit and static asset SHA-256 hashes. `npm run verify:artifact` checks the deployable files and references. Run `DPL_BASE_URL=https://<azure-generated-host> npm run verify:live` for release, HTTP, MIME, hashes and cache verification. `DPL_BASE_URL=https://<azure-generated-host> npm run test:e2e` exercises the complete browser suite on production without starting a local test server. Production has no write endpoints; those tests use browser-local simulation state and downloads only.

HTML revalidates, release metadata is not cached, and content-hashed assets are immutable. The deployment secret is stored only in GitHub Actions, never in source or browser code. Official action commit pins were verified from their owning GitHub repositories on 2026-09-20.
