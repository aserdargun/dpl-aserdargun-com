export type Locale = "tr" | "en";
export type Text = Record<Locale, string>;
export type PolicyId = "fast" | "deep" | "adaptive";
export type EvidenceStatus = "sufficient" | "missing" | "stale" | "conflicting";
export interface ScenarioInput {
  ambiguity: "clear" | "ambiguous";
  evidence: EvidenceStatus;
  impact: "low" | "high";
  authorization: "granted" | "pending" | "denied";
  budget: number;
  checkResult: "resolves" | "inconclusive" | "contradicts";
  verification: "pass" | "fail";
  untrustedInstruction: boolean;
}
export interface EvidenceItem {
  id: string;
  title: Text;
  content: Text;
  date: string;
  trust: "synthetic" | "untrusted";
}
export interface Scenario {
  id: string;
  version: string;
  title: Text;
  short: Text;
  request: Text;
  description: Text;
  expectations: Text;
  input: ScenarioInput;
  evidence: EvidenceItem[];
  requiresApproval: boolean;
}
export interface DecisionPolicy {
  id: PolicyId;
  version: string;
  name: Text;
  description: Text;
  checks: "minimal" | "always" | "when-needed";
  evaluationCost: number;
}
export type DecisionState =
  | "intake"
  | "checks"
  | "route"
  | "fast"
  | "evaluate"
  | "request_evidence"
  | "clarify"
  | "approval"
  | "abstain"
  | "blocked"
  | "verify"
  | "complete";
export type TerminalState = Extract<
  DecisionState,
  | "request_evidence"
  | "clarify"
  | "approval"
  | "abstain"
  | "blocked"
  | "complete"
>;
export interface DecisionEvent {
  index: number;
  state: DecisionState;
  ruleId: string;
  observed: Partial<ScenarioInput> & {
    requiresApproval?: boolean;
    effectiveEvidence?: EvidenceStatus;
  };
  prerequisites: { condition: string; passed: boolean }[];
  budgetBefore: number;
  budgetAfter: number;
}
export interface DecisionOutcome {
  state: TerminalState;
  ruleId: string;
  verified: boolean;
  workUnits: number;
  remainingBudget: number;
  effectiveEvidence: EvidenceStatus;
  externalActionPerformed: false;
}
export interface ExperimentRun {
  schemaVersion: "1.0.0";
  engineVersion: "1.0.0";
  id: string;
  scenario: Scenario;
  policy: DecisionPolicy;
  input: ScenarioInput;
  events: DecisionEvent[];
  outcome: DecisionOutcome;
  dataKind: "deterministic-simulation";
}
export interface ComparisonResult {
  schemaVersion: "1.0.0";
  scenarioId: string;
  scenarioVersion: string;
  input: ScenarioInput;
  runs: ExperimentRun[];
  equalStartingConditions: true;
}
