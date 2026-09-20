import {
  ArrowDown,
  Check,
  Circle,
  ShieldCheck,
  Split,
  Zap,
  ScanSearch,
  FileInput,
  Flag,
} from "lucide-react";
import type { DecisionEvent, DecisionState, Locale } from "../domain/types";
import { stateNames } from "../i18n";
const terminal = [
  "complete",
  "blocked",
  "approval",
  "abstain",
  "clarify",
  "request_evidence",
];
export function Diagram({
  events,
  locale,
}: {
  events: DecisionEvent[];
  locale: Locale;
}) {
  const current = events.at(-1)?.state;
  const t = (tr: string, en: string) => (locale === "tr" ? tr : en);
  const seen = (states: DecisionState[]) =>
    events.some((e) => states.includes(e.state));
  function Node({
    state,
    sub,
    icon: Icon,
    states = [state],
  }: {
    state: DecisionState;
    sub: string;
    icon: typeof Circle;
    states?: DecisionState[];
  }) {
    const active = current && states.includes(current),
      visited = seen(states);
    const label =
      state === "complete" && current && terminal.includes(current)
        ? stateNames[current][locale]
        : state === "complete"
          ? t("Sonuç", "Outcome")
          : stateNames[state][locale];
    return (
      <div
        data-node={state}
        className={`flow-node ${active ? "active" : ""} ${visited ? "visited" : ""} ${state === "evaluate" ? "deep-node" : ""} ${active && current === "blocked" ? "blocked" : ""}`}
        aria-current={active ? "step" : undefined}
      >
        <Icon size={18} />
        <div>
          <strong>{label}</strong>
          <span>{sub}</span>
        </div>
        <span className="node-mark">
          {active ? t("Aktif", "Active") : visited ? <Check size={14} /> : null}
        </span>
      </div>
    );
  }
  const stoppedEarly =
    !!current && terminal.includes(current) && !seen(["verify"]);
  const Arrow = () => (
    <div className="flow-arrow" aria-hidden="true">
      <ArrowDown size={20} />
    </div>
  );
  return (
    <div
      className="diagram"
      role="img"
      aria-label={
        t(
          "Karar diyagramı. İzlenen adımlar: ",
          "Decision diagram. Steps taken: ",
        ) +
        (events.length
          ? events.map((e) => stateNames[e.state][locale]).join(" → ")
          : t("Henüz başlamadı.", "Not started."))
      }
    >
      <Node
        state="intake"
        sub={t("Sabitlenmiş başlangıç girdileri", "Frozen starting inputs")}
        icon={FileInput}
      />
      <Arrow />
      <Node
        state="checks"
        sub={t(
          "Yetki · açıklık · zorunlu kanıt",
          "Authority · clarity · required evidence",
        )}
        icon={ShieldCheck}
      />
      <Arrow />
      {stoppedEarly ? (
        <>
          {seen(["route"]) && (
            <>
              <Node
                state="route"
                sub={t(
                  "Politikanın seçtiği yol",
                  "The path selected by policy",
                )}
                icon={Split}
              />
              <Arrow />
            </>
          )}
          {seen(["evaluate"]) && (
            <>
              <Node
                state="evaluate"
                sub={t("Sınırlı ek kontrol", "Bounded extra check")}
                icon={ScanSearch}
              />
              <Arrow />
            </>
          )}
          {seen(["fast"]) && (
            <>
              <Node
                state="fast"
                sub={t("Kısa karar adımı", "Short decision step")}
                icon={Zap}
              />
              <Arrow />
            </>
          )}
        </>
      ) : (
        <>
          <Node
            state="route"
            sub={t("Politikanın seçtiği yol", "The path selected by policy")}
            icon={Split}
          />
          <div className="flow-fork" aria-hidden="true">
            <svg viewBox="0 0 400 32" preserveAspectRatio="none">
              <path d="M200 0V12H96V27M200 12H304V27" />
              <path d="m92 23 4 5 4-5m200 0 4 5 4-5" />
            </svg>
          </div>
          <div className="branches">
            <Node
              state="fast"
              sub={t("Kısa karar adımı", "Short decision step")}
              icon={Zap}
            />
            <Node
              state="evaluate"
              sub={t("Sınırlı ek kontrol", "Bounded extra check")}
              icon={ScanSearch}
            />
          </div>
          <div className="flow-merge" aria-hidden="true">
            <svg viewBox="0 0 400 32" preserveAspectRatio="none">
              <path d="M96 0V12H304V0M200 12V27m-4-4 4 5 4-5" />
            </svg>
          </div>
          <Node
            state="verify"
            sub={t(
              "Kanıt ve sonuç doğrulaması",
              "Evidence and result verification",
            )}
            icon={ShieldCheck}
          />
          <Arrow />
        </>
      )}
      <Node
        state="complete"
        states={terminal as DecisionState[]}
        sub={t(
          "Tamamla · bilgi iste · dur",
          "Complete · request information · stop",
        )}
        icon={Flag}
      />
      {current && terminal.includes(current) && !seen(["verify"]) && (
        <p className="early-stop">
          {t(
            "↳ Ön koşul sağlanmadı; sonraki adımlar çalışmadı.",
            "↳ A prerequisite was not met; subsequent steps did not run.",
          )}
        </p>
      )}
    </div>
  );
}
