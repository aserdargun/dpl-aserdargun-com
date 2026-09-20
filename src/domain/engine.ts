import type {
  ComparisonResult,
  DecisionEvent,
  DecisionPolicy,
  DecisionState,
  ExperimentRun,
  Scenario,
  ScenarioInput,
  TerminalState,
} from "./types";
import { policies } from "../data/policies";

export function validateInput(input: ScenarioInput): void {
  const options: Record<string, readonly unknown[]> = {
    ambiguity: ["clear", "ambiguous"],
    evidence: ["sufficient", "missing", "stale", "conflicting"],
    impact: ["low", "high"],
    authorization: ["granted", "pending", "denied"],
    checkResult: ["resolves", "inconclusive", "contradicts"],
    verification: ["pass", "fail"],
    untrustedInstruction: [true, false],
  };
  for (const [key, values] of Object.entries(options)) {
    if (!values.includes(input[key as keyof ScenarioInput]))
      throw new Error("INVALID_INPUT");
  }
  if (!Number.isInteger(input.budget) || input.budget < 0 || input.budget > 16)
    throw new Error("INVALID_BUDGET");
}
function hash(value: string): string {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++)
    h = Math.imul(h ^ value.charCodeAt(i), 16777619);
  return (h >>> 0).toString(16).padStart(8, "0");
}
export function runExperiment(
  scenario: Scenario,
  input: ScenarioInput,
  policy: DecisionPolicy,
): ExperimentRun {
  validateInput(input);
  const canonical = policies.find((p) => p.id === policy.id);
  if (!canonical || JSON.stringify(canonical) !== JSON.stringify(policy))
    throw new Error("INVALID_POLICY");
  const snapshot = structuredClone({ scenario, input, policy });
  const s = snapshot.scenario,
    i = snapshot.input,
    p = snapshot.policy;
  let budget = i.budget,
    effectiveEvidence = i.evidence;
  const events: DecisionEvent[] = [];
  const add = (
    state: DecisionState,
    ruleId: string,
    observed: DecisionEvent["observed"],
    condition: string,
    passed: boolean,
    cost = 0,
  ) => {
    if (cost > budget) throw new Error("BUDGET_INVARIANT");
    const before = budget;
    budget -= cost;
    events.push({
      index: events.length + 1,
      state,
      ruleId,
      observed,
      prerequisites: [{ condition, passed }],
      budgetBefore: before,
      budgetAfter: budget,
    });
  };
  const finish = (
    state: TerminalState,
    ruleId: string,
    observed: DecisionEvent["observed"],
    condition: string,
    passed: boolean,
  ): ExperimentRun => {
    add(state, ruleId, observed, condition, passed);
    return {
      schemaVersion: "1.0.0",
      engineVersion: "1.0.0",
      id: `dpl-${hash(JSON.stringify(snapshot))}`,
      ...snapshot,
      events,
      outcome: {
        state,
        ruleId,
        verified: state === "complete",
        workUnits: i.budget - budget,
        remainingBudget: budget,
        effectiveEvidence,
        externalActionPerformed: false,
      },
      dataKind: "deterministic-simulation",
    };
  };
  const stop = () =>
    finish("abstain", "BUDGET.STOP", { budget }, "budget", false);
  add("intake", "INPUT.SNAPSHOT", { ...i }, "snapshot", true);
  add(
    "checks",
    "GATE.SHARED",
    {
      authorization: i.authorization,
      ambiguity: i.ambiguity,
      evidence: i.evidence,
      impact: i.impact,
      requiresApproval: s.requiresApproval,
    },
    "snapshot",
    true,
  );
  if (i.untrustedInstruction || s.evidence.some((e) => e.trust === "untrusted"))
    add(
      "checks",
      "DATA.QUARANTINE",
      { untrustedInstruction: true },
      "trusted",
      false,
    );
  if (i.authorization === "denied")
    return finish(
      "blocked",
      "AUTH.DENIED",
      { authorization: i.authorization },
      "authority",
      false,
    );
  if (
    (s.requiresApproval || i.impact === "high") &&
    i.authorization !== "granted"
  )
    return finish(
      "approval",
      "AUTH.APPROVAL",
      {
        authorization: i.authorization,
        impact: i.impact,
        requiresApproval: s.requiresApproval,
      },
      "authority",
      false,
    );
  if (i.ambiguity === "ambiguous")
    return finish(
      "clarify",
      "INPUT.CLARIFY",
      { ambiguity: i.ambiguity },
      "clear",
      false,
    );
  if (i.evidence === "missing")
    return finish(
      "request_evidence",
      "EVIDENCE.MISSING",
      { evidence: i.evidence },
      "evidence",
      false,
    );
  add(
    "route",
    "ROUTE.SELECT",
    { evidence: i.evidence, impact: i.impact },
    "evidence",
    true,
  );
  const problem = i.evidence === "stale" || i.evidence === "conflicting";
  const evaluate =
    p.checks === "always" ||
    (p.checks === "when-needed" && (problem || i.impact === "high"));
  if (!evaluate && problem)
    return finish(
      "request_evidence",
      "EVIDENCE.REQUEST",
      { evidence: i.evidence },
      "current",
      false,
    );
  if (evaluate) {
    if (budget < p.evaluationCost) return stop();
    add(
      "evaluate",
      "CHECK.EXTRA",
      { checkResult: i.checkResult, evidence: i.evidence },
      "budget",
      true,
      p.evaluationCost,
    );
    if (i.checkResult === "contradicts")
      return finish(
        "abstain",
        "CHECK.CONTRADICTION",
        { checkResult: i.checkResult },
        "resolved",
        false,
      );
    if (problem && i.checkResult !== "resolves")
      return finish(
        "abstain",
        "CHECK.UNRESOLVED",
        { checkResult: i.checkResult, evidence: i.evidence },
        "resolved",
        false,
      );
    if (problem) effectiveEvidence = "sufficient";
  } else {
    if (budget < 1) return stop();
    add(
      "fast",
      "PATH.FAST",
      { evidence: i.evidence, ambiguity: i.ambiguity },
      "current",
      true,
      1,
    );
  }
  if (budget < 1) return stop();
  add(
    "verify",
    "OUTPUT.VERIFY",
    {
      verification: i.verification,
      effectiveEvidence,
      authorization: i.authorization,
    },
    "budget",
    true,
    1,
  );
  if (i.verification === "fail")
    return finish(
      "abstain",
      "OUTPUT.REJECT",
      { verification: i.verification },
      "verified",
      false,
    );
  return finish(
    "complete",
    "OUTPUT.COMPLETE",
    { verification: i.verification, effectiveEvidence },
    "verified",
    true,
  );
}
export function comparePolicies(
  scenario: Scenario,
  input: ScenarioInput,
): ComparisonResult {
  const snapshot = structuredClone(input);
  return {
    schemaVersion: "1.0.0",
    scenarioId: scenario.id,
    scenarioVersion: scenario.version,
    input: snapshot,
    runs: policies.map((p) => runExperiment(scenario, snapshot, p)),
    equalStartingConditions: true,
  };
}
export function serializeRun(run: ExperimentRun): string {
  return JSON.stringify(run, null, 2);
}
