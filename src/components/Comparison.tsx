import { useState } from "react";
import { ArrowRight, Download, Scale } from "lucide-react";
import type {
  ComparisonResult,
  Locale,
  Scenario,
  ScenarioInput,
} from "../domain/types";
import { comparePolicies } from "../domain/engine";
import { fieldNames, stateNames, val } from "../i18n";
import { conditions, rules } from "../data/rules";
export function Comparison({
  locale,
  scenario,
  input,
  result,
  onResult,
  onLab,
}: {
  locale: Locale;
  scenario: Scenario;
  input: ScenarioInput;
  result: ComparisonResult | null;
  onResult: (c: ComparisonResult) => void;
  onLab: () => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const t = (tr: string, en: string) => (locale === "tr" ? tr : en);
  const dirty =
    !!result &&
    (result.scenarioId !== scenario.id ||
      JSON.stringify(result.input) !== JSON.stringify(input));
  function download() {
    if (!result) return;
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(result, null, 2)], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `dpl-comparison-${result.scenarioId}.json`;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <section className="comparison">
      <div className="comparison-top">
        <div>
          <span className="overline">
            {t("ÜÇ POLİTİKA · AYNI BAŞLANGIÇ", "THREE POLICIES · ONE START")}
          </span>
          <h2>{t("Farkı yaratan ne?", "What makes the difference?")}</h2>
          <p>
            {t(
              "Aynı senaryo. Aynı kanıt. Aynı bütçe. Farklı karar yolları.",
              "Same scenario. Same evidence. Same budget. Different decision paths.",
            )}
          </p>
        </div>
        <button
          className="primary"
          onClick={() => {
            onResult(comparePolicies(scenario, input));
            setExpanded(null);
          }}
        >
          <Scale size={17} />
          {t("Üç politikayı karşılaştır", "Compare all three policies")}
        </button>
      </div>
      <div className="comparison-context">
        <div>
          <span className="overline">
            {t(
              "YENİ KARŞILAŞTIRMANIN GİRDİLERİ",
              "INPUTS FOR THE NEXT COMPARISON",
            )}
          </span>
          <h3>
            {scenario.title[locale]}{" "}
            <span className="muted">/ v{scenario.version}</span>
          </h3>
          <p>
            {input.budget}{" "}
            {t("başlangıç çalışma birimi", "starting work units")} ·{" "}
            {val(input.evidence, locale)} · {val(input.authorization, locale)}
          </p>
        </div>
        <button onClick={onLab}>
          {t("Koşulları düzenle", "Edit conditions")}
          <ArrowRight size={15} />
        </button>
      </div>
      {dirty && (
        <p className="change-notice">
          {t(
            "Girdiler değişti. Aşağıdaki sonuçlar önceki sabitlenmiş karşılaştırmaya aittir. Yeniden karşılaştırarak güncelleyin.",
            "Inputs changed. Results below belong to the previous frozen comparison. Compare again to update.",
          )}
        </p>
      )}
      {!result ? (
        <div className="comparison-empty">
          <Scale size={36} />
          <h3>
            {t(
              "Bir başlangıç, üç olası yol.",
              "One starting point, three possible paths.",
            )}
          </h3>
          <p>
            {t(
              "Karşılaştırmayı çalıştırın. Tamamlama, bekleme ve durma sonuçlarını; gerekçeleri ve tüketilen çalışma birimlerini birlikte görün.",
              "Run a comparison to see completion, waiting, and stopping outcomes alongside their reasons and work units.",
            )}
          </p>
        </div>
      ) : (
        <>
          <div className="comparison-snapshot">
            <span>
              ✓ {t("Eşit başlangıç koşulları", "Equal starting conditions")}
            </span>
            <span>
              {result.runs[0].scenario.title[locale]} · v
              {result.scenarioVersion}
            </span>
            <details>
              <summary>
                {t(
                  "Sabitlenmiş tüm girdileri göster",
                  "Show all frozen inputs",
                )}
              </summary>
              <dl className="facts">
                {Object.entries(result.input).map(([k, v]) => (
                  <div key={k}>
                    <dt>{fieldNames[k][locale]}</dt>
                    <dd>{val(v, locale)}</dd>
                  </div>
                ))}
              </dl>
            </details>
          </div>
          <div className="comparison-grid">
            {result.runs.map((r) => (
              <article
                key={r.policy.id}
                className={`comparison-column policy-${r.policy.id}`}
              >
                <div className="policy-heading">
                  <span className="overline">
                    {r.policy.id === "fast"
                      ? "A"
                      : r.policy.id === "deep"
                        ? "B"
                        : "C"}
                  </span>
                  <h3>{r.policy.name[locale]}</h3>
                </div>
                <p className="small policy-description">
                  {r.policy.description[locale]}
                </p>
                <div className={`state-tag state-${r.outcome.state}`}>
                  {stateNames[r.outcome.state][locale]}
                </div>
                <div className="units">
                  <strong>{r.outcome.workUnits}</strong>
                  <span>
                    / {r.input.budget}
                    <small>
                      {t("çalışma birimi kullanıldı", "work units used")}
                    </small>
                  </span>
                </div>
                <div
                  className="unit-meter"
                  aria-label={`${r.outcome.workUnits} / ${r.input.budget}`}
                >
                  <span
                    style={{
                      width: `${r.input.budget ? (r.outcome.workUnits / r.input.budget) * 100 : 0}%`,
                    }}
                  />
                </div>
                <p className="result-reason">
                  {rules[r.outcome.ruleId][locale]}
                </p>
                <dl className="comparison-facts">
                  <div>
                    <dt>{t("Kalan bütçe", "Remaining budget")}</dt>
                    <dd>{r.outcome.remainingBudget}</dd>
                  </div>
                  <div>
                    <dt>{t("Doğrulama", "Verification")}</dt>
                    <dd>
                      {r.outcome.verified
                        ? t("Geçti (simülasyon)", "Passed (simulation)")
                        : r.outcome.ruleId === "OUTPUT.REJECT"
                          ? t("Başarısız (simülasyon)", "Failed (simulation)")
                          : t("Çalıştırılmadı", "Not run")}
                    </dd>
                  </div>
                  <div>
                    <dt>{t("Dış işlem", "External action")}</dt>
                    <dd>{t("Yapılmadı", "None")}</dd>
                  </div>
                </dl>
                <button
                  className="trace-toggle"
                  aria-expanded={expanded === r.policy.id}
                  onClick={() =>
                    setExpanded(expanded === r.policy.id ? null : r.policy.id)
                  }
                >
                  {t("Karar izini incele", "Inspect decision trace")}
                  <ArrowRight size={14} />
                </button>
                {expanded === r.policy.id && (
                  <ol className="comparison-trace">
                    {r.events.map((e) => (
                      <li key={e.index}>
                        <strong>{stateNames[e.state][locale]}</strong>
                        <code>{e.ruleId}</code>
                        <p>{rules[e.ruleId][locale]}</p>
                        <span>
                          {t("Bütçe", "Budget")}: {e.budgetBefore} →{" "}
                          {e.budgetAfter}
                        </span>
                        <details className="event-details">
                          <summary>
                            {t(
                              "Girdiler ve ön koşullar",
                              "Inputs and prerequisites",
                            )}
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
                              {c.passed ? "✓" : "!"}{" "}
                              {conditions[c.condition][locale]} —{" "}
                              {c.passed
                                ? t("sağlandı", "met")
                                : t("sağlanmadı", "not met")}
                            </p>
                          ))}
                        </details>
                      </li>
                    ))}
                  </ol>
                )}
              </article>
            ))}
          </div>
          <div className="comparison-footer">
            <p>
              {t(
                "Bu farklar DPL senaryo kurallarından doğar. Gerçek model başarısı, token tüketimi veya gecikme ölçümü değildir.",
                "These differences arise from DPL scenario rules. They do not measure real-model success, tokens, or latency.",
              )}
            </p>
            <button onClick={download}>
              <Download size={15} />
              {t("Karşılaştırmayı indir", "Download comparison")}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
