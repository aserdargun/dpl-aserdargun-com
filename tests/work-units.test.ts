import { expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  MAX_BUDGET,
  MIN_BUDGET,
  runExperiment,
  validateInput,
} from "../src/domain/engine";
import { policies } from "../src/data/policies";
import { baseInput, scenarios } from "../src/data/scenarios";
import { lessons } from "../src/data/methods";
import type { ExperimentRun } from "../src/domain/types";

/* DPL teaches one thing: work units are explicitly chosen simulation costs.
   The site therefore publishes those costs in prose - gates cost 0, a fast step
   1, an extra check 2, final verification 1, a budget from 0 to 16 - in two
   lessons, one scenario description and one set of expectations, in both
   locales.

   None of those numbers was tied to the engine. Changing a cost in
   `src/data/policies.ts` or the bounds in `validateInput` would have left the
   prose stating the old numbers, and no gate would have noticed: the routing
   table test only covers which path a policy takes and how many units a run
   spends, not what the text claims those units are worth.

   Every value below is read out of the run the engine itself produced - the
   cost of a step is the difference its own trace records, and the budget
   bounds are found by asking `validateInput` where it stops accepting. The
   prose keeps its wording; the gate holds the numbers. */

const scenarioById = (id: string) => {
  const scenario = scenarios.find((item) => item.id === id);
  expect(scenario, `no scenario ${id}`).toBeDefined();
  return scenario!;
};

const policyById = (id: string) => {
  const policy = policies.find((item) => item.id === id);
  expect(policy, `no policy ${id}`).toBeDefined();
  return policy!;
};

/** What the engine charged for one step, read from the trace it wrote. */
const costOf = (run: ExperimentRun, ruleId: string) => {
  const event = run.events.find((item) => item.ruleId === ruleId);
  expect(event, `the run recorded no ${ruleId} step`).toBeDefined();
  return event!.budgetBefore - event!.budgetAfter;
};

const accepts = (budget: number) => {
  try {
    validateInput({ ...baseInput, budget });
    return true;
  } catch {
    return false;
  }
};

/** The bounds `validateInput` actually enforces, found by probing it. */
const lowestBudget = (() => {
  let budget = 0;
  while (budget > -1000 && !accepts(budget)) budget--;
  return budget;
})();
const highestBudget = (() => {
  let budget = 0;
  while (budget <= 1000 && accepts(budget)) budget++;
  return budget - 1;
})();

const clearTask = scenarioById("clear-task");
const limitedBudget = scenarioById("limited-budget");

const fastRun = runExperiment(clearTask, baseInput, policyById("fast"));
const deepRun = runExperiment(clearTask, baseInput, policyById("deep"));

const gateCost = costOf(deepRun, "GATE.SHARED");
const fastStepCost = costOf(fastRun, "PATH.FAST");
const checkCost = costOf(deepRun, "CHECK.EXTRA");
const verificationCost = costOf(deepRun, "OUTPUT.VERIFY");

const unitsOf = (
  scenarioId: string,
  policyId: string,
  budget = baseInput.budget,
) => {
  const scenario = scenarioById(scenarioId);
  const run = runExperiment(scenario, { ...baseInput, budget }, policyById(policyId));
  return run.outcome.workUnits;
};

/** Every number the sentence publishes, in the order it publishes them. */
const numbers = (text: string) => (text.match(/\d+(?:\.\d+)?/g) ?? []).map(Number);

const lessonBody = (scenarioId: string) => {
  const lesson = lessons.find((item) => item.scenario === scenarioId);
  expect(lesson, `no lesson for ${scenarioId}`).toBeDefined();
  return lesson!;
};

it("derives the cost model from the engine it charges", () => {
  // The walk must reach the engine, or every assertion below would compare
  // the published numbers with nothing.
  expect(fastRun.events.length).toBeGreaterThan(0);
  expect(deepRun.events.length).toBeGreaterThan(0);
  expect(gateCost).toBe(0);
  expect(fastStepCost).toBeGreaterThan(0);
  expect(checkCost).toBeGreaterThan(0);
  expect(verificationCost).toBeGreaterThan(0);
  expect(lowestBudget).toBe(0);
  expect(highestBudget).toBeGreaterThan(0);
  // A gate is free; a paid step is not. If the engine ever charged a gate,
  // the published "gates cost 0" would be the least of the problems.
  expect(gateCost).toBeLessThan(fastStepCost);
  // Every policy publishes its own extra-check cost, so the published number
  // only holds while they agree.
  const costs = policies.map((policy) => policy.evaluationCost);
  expect(new Set(costs).size).toBe(1);
  expect(costs[0]).toBe(checkCost);
});

it("enforces exactly the bounds it publishes, and offers no other", () => {
  // The constant and the enforcement are two statements of one fact, so they
  // are checked against each other: a bound that moved in only one of them
  // would let the control offer a budget the engine refuses.
  expect(lowestBudget).toBe(MIN_BUDGET);
  expect(highestBudget).toBe(MAX_BUDGET);
  expect(accepts(MIN_BUDGET)).toBe(true);
  expect(accepts(MAX_BUDGET)).toBe(true);
  expect(accepts(MIN_BUDGET - 1)).toBe(false);
  expect(accepts(MAX_BUDGET + 1)).toBe(false);

  // The budget control must not be able to offer a budget a run rejects.
  // A run is not wrapped in a try/catch, so an out-of-range choice would
  // break the page rather than refuse the input.
  const control = readFileSync(
    join(import.meta.dirname, "..", "src", "components", "Controls.tsx"),
    "utf8",
  );
  expect(control).toContain("max={MAX_BUDGET}");
  expect(control).toContain("min={MIN_BUDGET}");
  // A literal bound written into the control is the drift this removes.
  expect(control).not.toMatch(/max="\d+"/);
  expect(control).not.toMatch(/min="\d+"/);
});

it("publishes the cost model the engine charges", () => {
  const body = lessonBody("limited-budget").body;
  const published = [gateCost, fastStepCost, checkCost, verificationCost, lowestBudget, highestBudget];
  expect(numbers(body.en)).toEqual(published);
  expect(numbers(body.tr)).toEqual(published);
});

it("publishes the scenario description the engine charges", () => {
  const published = [fastStepCost, checkCost, verificationCost, gateCost];
  expect(numbers(limitedBudget.description.en)).toEqual(published);
  expect(numbers(limitedBudget.description.tr)).toEqual(published);
});

it("publishes the units each policy spends on the first scenario", () => {
  const body = lessonBody("clear-task").body;
  const fast = unitsOf("clear-task", "fast");
  const adaptive = unitsOf("clear-task", "adaptive");
  const deep = unitsOf("clear-task", "deep");
  // The sentence says "fast and adaptive use N units", so the two have to
  // agree before that phrasing is true.
  expect(fast).toBe(adaptive);
  expect(body.en).toMatch(new RegExp(`\\b${fast}\\s+units\\b`));
  expect(body.en).toMatch(new RegExp(`\\b${deep}\\b`));
  expect(body.tr).toMatch(new RegExp(`\\b${fast}\\s+birim\\b`));
  expect(body.tr).toMatch(new RegExp(`\\b${deep}\\s+birim\\b`));
  expect(numbers(body.en).sort((a, b) => a - b)).toEqual(
    [fast, deep].sort((a, b) => a - b),
  );
  expect(numbers(body.tr).sort((a, b) => a - b)).toEqual(
    [fast, deep].sort((a, b) => a - b),
  );
});

it("publishes what the limited budget does to each policy", () => {
  const budget = limitedBudget.input.budget;
  const fast = unitsOf("limited-budget", "fast", budget);
  const adaptive = unitsOf("limited-budget", "adaptive", budget);
  const deep = unitsOf("limited-budget", "deep", budget);
  // The published sentence names the budget that lets the deep path finish.
  const completing = unitsOf("limited-budget", "deep", budget + 1);
  const published = [fast, deep, completing];
  expect(fast).toBe(adaptive);
  expect(numbers(limitedBudget.expectations.en)).toEqual(published);
  expect(numbers(limitedBudget.expectations.tr)).toEqual(published);
});
