import type {
  ExperimentRun,
  Locale,
  Scenario,
  ScenarioInput,
} from "../domain/types";
import { conditions, rules } from "../data/rules";
import { fieldNames, val, stateNames } from "../i18n";
export function Evidence({
  scenario,
  input,
  locale,
  run,
  cursor,
}: {
  scenario: Scenario;
  input: ScenarioInput;
  locale: Locale;
  run: ExperimentRun | null;
  cursor: number;
}) {
  const t = (tr: string, en: string) => (locale === "tr" ? tr : en);
  return (
    <>
      <section className="evidence-panel">
        <div className="section-title">
          <div>
            <h2>{t("Kanıt defteri", "Evidence notebook")}</h2>
            <p className="small">
              {t(
                "Sentetik senaryo verisi · Gerçek kaynak iddiası değildir",
                "Synthetic scenario data · Not a claim about real sources",
              )}
            </p>
          </div>
          <span className="evidence-status">{val(input.evidence, locale)}</span>
        </div>
        <p className="small">
          {t(
            "Seçilen kanıt koşulu, aşağıdaki kayıtlar üzerinde deneysel bir varsayımdır; gerçek tarihleri değiştirmez.",
            "The selected evidence condition is an experimental assumption over the records below; it does not change their dates.",
          )}
        </p>
        <div className="evidence-list">
          {scenario.evidence.map((e) => (
            <article key={e.id}>
              <code>{e.id}</code>
              <div>
                <h3>{e.title[locale]}</h3>
                <p>{e.content[locale]}</p>
              </div>
              <div className="source-meta">
                <time dateTime={e.date}>{e.date}</time>
                <span>
                  {e.trust === "untrusted"
                    ? t("Güvenilmeyen içerik", "Untrusted content")
                    : t("Sentetik kayıt", "Synthetic record")}
                </span>
              </div>
            </article>
          ))}
        </div>
        <details>
          <summary>
            {t(
              "Hangi sonuç hangi koşulda uygundur?",
              "Which outcome is appropriate under which conditions?",
            )}
          </summary>
          <p>{scenario.expectations[locale]}</p>
        </details>
      </section>
      {run && cursor > 0 && (
        <details className="full-trace">
          <summary>
            {t(
              "Adım adım metinsel karar izi",
              "Step-by-step textual decision trace",
            )}{" "}
            ({cursor}/{run.events.length})
          </summary>
          <ol>
            {run.events.slice(0, cursor).map((e) => (
              <li key={e.index}>
                <div>
                  <strong>{stateNames[e.state][locale]}</strong>
                  <code>{e.ruleId}</code>
                  <span>
                    {e.budgetBefore} → {e.budgetAfter}
                  </span>
                </div>
                <p>{rules[e.ruleId][locale]}</p>
                <details className="event-details">
                  <summary>
                    {t("Girdiler ve ön koşullar", "Inputs and prerequisites")}
                  </summary>
                  <dl className="facts">
                    {Object.entries(e.observed).map(([k, v]) => (
                      <div key={k}>
                        <dt>{fieldNames[k]?.[locale] ?? k}</dt>
                        <dd>{val(v, locale)}</dd>
                      </div>
                    ))}
                  </dl>
                  {e.prerequisites.map((c) => (
                    <p key={c.condition}>
                      {c.passed ? "✓" : "!"} {conditions[c.condition][locale]} —{" "}
                      {c.passed
                        ? t("sağlandı", "met")
                        : t("sağlanmadı", "not met")}
                    </p>
                  ))}
                </details>
              </li>
            ))}
          </ol>
        </details>
      )}
    </>
  );
}
