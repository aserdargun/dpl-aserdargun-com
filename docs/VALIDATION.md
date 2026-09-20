# DPL local validation — 2026-09-20

Final command: `npm run validate:codex` → exit 0. No production deployment, Git push, cloud/DNS change, or neighboring repository modification was performed.

## Executed checks

| Check                                              | Result                                                                                        |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Clean locked install: `npm ci`                     | Passed; 104 packages added, 0 reported vulnerabilities                                        |
| Browser install: `npx playwright install chromium` | Passed                                                                                        |
| Domain and lifecycle tests: `npm run test`         | **44 passed**, 2 test files                                                                   |
| Strict TypeScript and Vite production build        | Passed; self-contained `dist/` output                                                         |
| Production-browser tests: `npm run test:e2e`       | **19 passed**, Chromium, 4 workers, 4.1 seconds in final run                                  |
| Axe WCAG 2 A/AA + 2.1 AA checks                    | 0 violations on the tested laboratory state                                                   |
| Responsive checks                                  | 320, 390, 768, 1440 pixels; both TR and EN; all three surfaces                                |
| Horizontal page overflow                           | None in those tested views, including expanded conditions and completed runs                  |
| Browser console/page errors                        | None in responsive surface runs and primary flow                                              |
| Diagram geometry                                   | No overlapping node rectangles in eight width/language combinations                           |
| Early-stop diagram                                 | Approval outcome bypasses unused routing and verification nodes at 320 and 1440               |
| Native concept-size check                          | 1505×1045 viewport; full-page render captured and inspected                                   |
| Git whitespace                                     | `git diff --check` passed                                                                     |
| Codex environment                                  | TOML parsed; setup and Run/Validate/Stop mappings checked                                     |
| Local Run/Stop                                     | Run served 8031; exact Stop action stopped it; port verified free; Run restarted for delivery |
| Foreign listener protection                        | Tested with a separate temporary working directory; Stop refused, listener remained alive     |
| Dependency audit                                   | Clean install reported 0 vulnerabilities; production dependency audit also reported 0         |

Runtime: Node.js 22.23.1, npm 10.9.8. Final dependencies are recorded exactly in `package-lock.json`.

## User flows actually exercised

The first scenario was implemented and run through the Codex in-app browser before the remaining scenarios and comparison/methods were added. The visible sequence completed: request → shared gates → fast path → final verification → completed result, using 2 of 8 work units. After expansion, the in-app browser also ran the three-policy comparison and displayed 2/3/2 work units with equal starting conditions.

The repeatable Playwright suite then tested the **production build**, including:

- Play, pause (no steps advance while paused), manual step, reset, and language switching without run loss.
- All six scenario defaults, including clarification, evidence conflict, approval waiting, limited budget, and untrusted content.
- Editing authority while a run exists, seeing the stale-input warning, preserving the old snapshot, starting a fresh blocked run, and resetting without state leakage.
- Individual JSON download parsed from the browser's real downloaded file; schema, scenario, policy, inputs, events, budget, and final outcome assertions.
- Comparison execution, extra-check trace, language preservation, downloaded comparison JSON and identical input records, stale result detection, and limited-budget rerun.
- Both methods languages, six example links, two source anchors, the historical source update, and navigation from a lesson to its associated scenario.
- Keyboard skip link, visible focus, native select type-ahead selection, Tab navigation to budget, and ArrowLeft adjustment under reduced-motion emulation.
- Responsive rendering, no horizontal page overflow, no node rectangle overlap, and no browser errors at all requested widths in both languages.

The native macOS Chromium `<select>` did not change selection using the initial arrow-key test sequence. Investigation confirmed keyboard type-ahead works; the final test uses `d` to select “Derin değerlendirme”, then Tab/ArrowLeft to adjust the budget. This was a test interaction correction; no custom key handler overrides native select semantics.

## Domain coverage

Determinism including serialized output; authority denial and approval in every policy; ambiguity and missing mandatory evidence; budget bounds and finite termination over 0–16 units; final verification failure; isolation of untrusted text and trust metadata; conflict resolution versus inconclusive checks; extra evaluation refuting a claim; fast-policy evidence requests; same-quality extra-work example; equal-input comparison; snapshot isolation; export consistency; invalid budget/config rejection; every scenario's three-policy expected outcomes; scenario-level approval even with low impact; bilingual scenario/rule/prerequisite completeness.

## Visual verification

Built-in Image Gen created `docs/design-concept.png`. Both the concept and final rendered screenshots were opened with `view_image` in the same review. IAB was used first for the interactive primary flow. Playwright is the required reproducible production-browser test suite and screenshot harness, not a replacement for the IAB primary-flow check.

| Comparison point   | Evidence and final decision                                                                                                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Copy and hierarchy | Same DPL identity, three navigation items, opening question, simulation label and primary first-run action. Scenario wording follows the real brief; no invented health source retained.          |
| Layout             | Three responsibility regions on desktop; controls, diagram and trace remain visible together. Reduced scenario-row density so primary CTA appears earlier.                                        |
| Typography         | System sans-serif, monospace rule IDs; increased diagram/control/trace sizes in the final readability pass.                                                                                       |
| Palette            | Neutral dark background, lime fast/active emphasis and cyan extra-evaluation/data emphasis; no gradients or raster UI.                                                                            |
| Assets and icons   | Code-native diagram and Lucide SVG icons; source mockup is never substituted for functional UI.                                                                                                   |
| Diagram            | Fork and merge connectors run in dedicated whitespace between bounded nodes. Terminal early-stop views remove steps that did not run. Textual trace provides the complete accessible alternative. |
| Responsive order   | Single-column mobile sequence: scenario → conditions → diagram → trace → evidence. No page-level horizontal overflow.                                                                             |
| Motion             | No decorative animation. User-controlled timed event reveal; CSS reduced-motion override. Timer is explicitly not model latency.                                                                  |

Above-the-fold copy audit: retained the brief/concept's identity, navigation, introductory action and simulation disclosure. Necessary additions are scenario request, policy explanation, real rule IDs, budget controls, versioned JSON export and stale-run notice. The generated WHO evidence, arbitrary active route and decorative rule labels were intentionally replaced with real synthetic scenario data and live engine state. Other required surfaces extend the same tokens as editorial lessons and a three-column comparison.

Faithfulness was checked against the generated reference with these documented functional/content adjustments. There are no known clipped primary controls or node overlaps in tested views. This is not a claim of pixel identity, manual screen-reader certification, or testing on every browser/device.

Retained delivery screenshots:

- `docs/screenshots/laboratory-desktop.png`
- `docs/screenshots/laboratory-mobile.png`
- `docs/screenshots/comparison-desktop.png`
- `docs/screenshots/methods-desktop.png`

Additional reproducible screenshots and HTML reports remain in ignored `test-results/` and `playwright-report/`; regenerate them with `npm run validate`.

## Known boundaries

No real-model/runtime, backend, external sending, cloud deployment, DNS, mobile hardware, Safari/Firefox, comprehensive manual assistive-technology, or real-world decision-calibration test was run. Extra-check findings and final verification are synthetic user-selected inputs, not independently verified external results. No local persistence exists. The planned domain is not asserted to be live. Source links were read directly as primary web sources on 2026-09-20; portfolio neighbor links are intentionally not invented.
