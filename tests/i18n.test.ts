import { expect, it } from "vitest";
import { runExperiment, validateInput } from "../src/domain/engine";
import { policies } from "../src/data/policies";
import { baseInput, scenarios } from "../src/data/scenarios";
import { lessons, neighbors, sources } from "../src/data/methods";
import { fieldNames, stateNames, val, valueNames } from "../src/i18n";
import type { DecisionState, ScenarioInput, Text } from "../src/domain/types";

/* src/i18n/index.ts owns the Turkish and English surface of the decision plane,
   and nothing tested it. The existing guard in engine.test.ts walks scenario
   copy, rule text and condition text, but the label dictionaries are read
   with a plain index and a silent fallback:

     Comparison.tsx:137  fieldNames[k][locale]     - no optional chaining
     Comparison.tsx:247  fieldNames[k]?.[locale] ?? k
     Comparison.tsx:138  val(v, locale)            - ?? String(v)

   So a field key missing from fieldNames crashes the comparison surface, and
   a value missing from valueNames renders the raw key - "sufficient" instead
   of a translated label - with every other test still green.

   AGENTS.md also names "policy names and explanations", and the policy copy,
   the evidence records, the scenario summaries and the method lessons are
   rendered from the same Text shape without a gate of their own.

   Everything below is derived from the engine and the data rather than from a
   hand-maintained list, so adding a state, a field or a scenario cannot
   quietly drop a label out of the surface. */

const locales = ["tr", "en"] as const;

/** The published decision states, keyed so that a missing one is a compile
 * error here until the labels and the reachability check follow it. */
const everyState: Record<DecisionState, true> = {
  intake: true,
  checks: true,
  route: true,
  fast: true,
  evaluate: true,
  request_evidence: true,
  clarify: true,
  approval: true,
  abstain: true,
  blocked: true,
  verify: true,
  complete: true,
};

/** The values each input field accepts, checked against the engine itself. */
const legalValues: Record<string, string[]> = {
  ambiguity: ["clear", "ambiguous"],
  evidence: ["sufficient", "missing", "stale", "conflicting"],
  impact: ["low", "high"],
  authorization: ["granted", "pending", "denied"],
  checkResult: ["resolves", "inconclusive", "contradicts"],
  verification: ["pass", "fail"],
  untrustedInstruction: ["true", "false"],
};

const runs = scenarios.flatMap((scenario) =>
  policies.map((policy) => runExperiment(scenario, scenario.input, policy)),
);

const isText = (value: unknown): value is Text =>
  value !== null &&
  typeof value === "object" &&
  locales.every((locale) => typeof (value as Record<string, unknown>)[locale] === "string");

const collectText = (value: unknown, path = "$", found: [string, Text][] = []) => {
  if (isText(value)) found.push([path, value]);
  else if (Array.isArray(value))
    value.forEach((item, index) => collectText(item, `${path}[${index}]`, found));
  else if (value && typeof value === "object")
    for (const [key, child] of Object.entries(value))
      collectText(child, `${path}.${key}`, found);
  return found;
};

const assertBilingual = (value: Text, label: string) => {
  for (const locale of locales)
    expect(value[locale].trim(), `${label} ${locale}`).not.toBe("");
  // A label that ships its English text as its own Turkish translation is
  // untranslated copy, whatever its length.
  expect(value.tr.trim(), `${label} shipped as its own translation`).not.toBe(
    value.en.trim(),
  );
};

it("labels every state the engine can actually reach", () => {
  const reached = new Set<DecisionState>();
  for (const run of runs) {
    for (const event of run.events) reached.add(event.state);
    reached.add(run.outcome.state);
  }
  // A walker that stopped reaching content would pass by finding nothing.
  expect(reached.size).toBeGreaterThanOrEqual(10);
  for (const state of reached) {
    const label = stateNames[state];
    expect(label, `no label for state ${state}`).toBeDefined();
    assertBilingual(label, `state ${state}`);
  }
  // Every published state is reachable, and every label names a real state.
  expect([...reached].sort()).toEqual(Object.keys(everyState).sort());
  expect(Object.keys(stateNames).sort()).toEqual(Object.keys(everyState).sort());
});

it("labels every field the comparison surface reads", () => {
  // Comparison.tsx:137 indexes fieldNames without a fallback, so a missing
  // key is a crash rather than an untranslated label.
  const keys = new Set<string>();
  for (const scenario of scenarios)
    for (const key of Object.keys(scenario.input)) keys.add(key);
  expect(keys.size).toBeGreaterThanOrEqual(8);
  for (const key of keys) {
    const label = fieldNames[key];
    expect(label, `no label for field ${key}`).toBeDefined();
    assertBilingual(label, `field ${key}`);
  }
  // Every key the engine records as observed reaches the trace surface too.
  const observed = new Set<string>();
  for (const run of runs)
    for (const event of run.events)
      for (const key of Object.keys(event.observed)) observed.add(key);
  expect(observed.size).toBeGreaterThanOrEqual(10);
  for (const key of observed) {
    const label = fieldNames[key];
    expect(label, `no label for observed field ${key}`).toBeDefined();
    assertBilingual(label, `observed field ${key}`);
  }
});

it("labels every value the engine accepts, so no label ever falls back to a raw key", () => {
  for (const [field, values] of Object.entries(legalValues)) {
    for (const value of values) {
      const input = {
        ...baseInput,
        [field]: field === "untrustedInstruction" ? value === "true" : value,
      } as ScenarioInput;
      // The list is checked against the engine, so it cannot drift from the
      // rules the engine actually enforces.
      expect(() => validateInput(input), `${field}=${value}`).not.toThrow();
      const label = valueNames[value];
      expect(label, `no label for value ${value}`).toBeDefined();
      assertBilingual(label, `value ${value}`);
      // val() falls back to String(v); a labelled value must never reach it.
      expect(val(value, "tr"), `${field}=${value}`).not.toBe(value);
      expect(val(value, "en"), `${field}=${value}`).not.toBe(value);
    }
    expect(
      () =>
        validateInput({
          ...baseInput,
          [field]: "not-a-legal-value",
        } as ScenarioInput),
      `${field} accepts an unknown value`,
    ).toThrow("INVALID_INPUT");
  }
  // The budget is a number, not a labelled string.
  expect(valueNames[String(baseInput.budget)]).toBeUndefined();
});

it("keeps the policy, evidence, scenario and method copy bilingual", () => {
  const surfaces: [string, unknown][] = [
    ["policies", policies],
    ["scenarios", scenarios],
    ["lessons", lessons],
    ["neighbors", neighbors],
    ["sources", sources],
  ];
  const found = surfaces.flatMap(([name, value]) =>
    collectText(value, `$.${name}`),
  );
  // Floors measured from the current data, so a surface cannot be dropped
  // out of the walk without the count changing.
  expect(found.length).toBeGreaterThanOrEqual(79);
  for (const [path, value] of found) assertBilingual(value, path);

  // AGENTS.md names the policy names and explanations explicitly.
  expect(policies.length).toBeGreaterThanOrEqual(3);
  for (const policy of policies) {
    expect(policy.name.tr.trim(), `${policy.id}.name`).not.toBe("");
    expect(policy.description.tr.trim(), `${policy.id}.description`).not.toBe("");
    expect(policy.name.tr.trim(), `${policy.id}.name`).not.toBe(
      policy.name.en.trim(),
    );
    expect(policy.description.tr.trim(), `${policy.id}.description`).not.toBe(
      policy.description.en.trim(),
    );
  }
  // The scenario summary and the evidence records are rendered too.
  for (const scenario of scenarios) {
    expect(scenario.short.tr.trim(), `${scenario.id}.short`).not.toBe("");
    expect(scenario.short.tr.trim(), `${scenario.id}.short`).not.toBe(
      scenario.short.en.trim(),
    );
    expect(scenario.evidence.length).toBeGreaterThanOrEqual(1);
    for (const item of scenario.evidence) {
      expect(item.title.tr.trim(), `${scenario.id}/${item.id}.title`).not.toBe(
        "",
      );
      expect(
        item.content.tr.trim(),
        `${scenario.id}/${item.id}.content`,
      ).not.toBe("");
    }
  }
});

it("does not leave a label dictionary entry untranslated", () => {
  const dictionaries: [string, Record<string, Text>][] = [
    ["stateNames", stateNames],
    ["fieldNames", fieldNames],
    ["valueNames", valueNames],
  ];
  for (const [name, dictionary] of dictionaries) {
    const found = collectText(dictionary, `$.${name}`);
    expect(found.length, `${name} has no entries`).toBeGreaterThan(0);
    for (const [path, value] of found) assertBilingual(value, path);
  }
});
