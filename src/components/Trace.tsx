import { Braces, CheckCircle2 } from "lucide-react";
import type { ExperimentRun, Locale } from "../domain/types";
import { conditions, rules } from "../data/rules";
import { fieldNames, stateNames, val } from "../i18n";
export function Trace({
  run,
  cursor,
  locale,
}: {
  run: ExperimentRun | null;
  cursor: number;
  locale: Locale;
}) {
  const t = (tr: string, en: string) => (locale === "tr" ? tr : en);
  const event = run?.events[cursor - 1];
  return (
    <section className="trace" aria-live="polite">
      <div className="section-title">
        <h2>{t("Karar izi", "Decision trace")}</h2>
        <Braces size={18} />
      </div>
      {!event ? (
        <div className="trace-empty">
          <span className="trace-symbol">↳</span>
          <p>
            {t(
              "Her kararın bir gerekçesi var.",
              "Every decision has a reason.",
            )}
          </p>
          <span>
            {t(
              "Deneyi başlatın. Etkili girdiyi, uygulanan kuralı ve sonucu burada izleyin.",
              "Start the experiment. Follow the observed input, applied rule, and outcome here.",
            )}
          </span>
        </div>
      ) : (
        <>
          <div className={`state-tag state-${event.state}`}>
            {stateNames[event.state][locale]}
          </div>
          <code>{event.ruleId}</code>
          <p>{rules[event.ruleId][locale]}</p>
          <dl className="facts">
            {Object.entries(event.observed).map(([k, v]) => (
              <div key={k}>
                <dt>{fieldNames[k]?.[locale] ?? k}</dt>
                <dd>{val(v, locale)}</dd>
              </div>
            ))}
          </dl>
          <div className="prerequisites">
            {event.prerequisites.map((c) => (
              <p key={c.condition}>
                {c.passed ? "✓" : "!"} {conditions[c.condition][locale]}:{" "}
                <strong>
                  {c.passed ? t("sağlandı", "met") : t("sağlanmadı", "not met")}
                </strong>
              </p>
            ))}
          </div>
          <div className="budget-change">
            <span>{t("Kalan bütçe", "Remaining budget")}</span>
            <strong>
              {event.budgetBefore} → {event.budgetAfter}
            </strong>
          </div>
          {cursor === run!.events.length && (
            <p className="outcome-note">
              <CheckCircle2 size={16} />
              {t(
                "Koşu sona erdi. Dış işlem yapılmadı.",
                "Run ended. No external action occurred.",
              )}
            </p>
          )}
        </>
      )}
    </section>
  );
}
