import type { Locale, PolicyId, ScenarioInput } from "../domain/types";
import { policies } from "../data/policies";
import { fieldNames, val } from "../i18n";
export function Controls({
  locale,
  input,
  policy,
  onInput,
  onPolicy,
}: {
  locale: Locale;
  input: ScenarioInput;
  policy: PolicyId;
  onInput: (input: ScenarioInput) => void;
  onPolicy: (id: PolicyId) => void;
}) {
  const t = (tr: string, en: string) => (locale === "tr" ? tr : en);
  const fields: { key: keyof ScenarioInput; options: string[] }[] = [
    { key: "ambiguity", options: ["clear", "ambiguous"] },
    {
      key: "evidence",
      options: ["sufficient", "missing", "stale", "conflicting"],
    },
    { key: "impact", options: ["low", "high"] },
    { key: "authorization", options: ["granted", "pending", "denied"] },
    {
      key: "checkResult",
      options: ["resolves", "inconclusive", "contradicts"],
    },
    { key: "verification", options: ["pass", "fail"] },
  ];
  return (
    <section className="conditions">
      <h2>{t("Deney koşulları", "Experiment conditions")}</h2>
      <label htmlFor="policy">{t("Karar politikası", "Decision policy")}</label>
      <select
        id="policy"
        value={policy}
        onChange={(e) => onPolicy(e.target.value as PolicyId)}
      >
        {policies.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name[locale]}
          </option>
        ))}
      </select>
      <p className="small">
        {policies.find((p) => p.id === policy)!.description[locale]}
      </p>
      <div className="budget-label">
        <label htmlFor="budget">{fieldNames.budget[locale]}</label>
        <output htmlFor="budget">
          {input.budget} <span>{t("birim", "units")}</span>
        </output>
      </div>
      <input
        id="budget"
        type="range"
        min="0"
        max="16"
        step="1"
        value={input.budget}
        onChange={(e) => onInput({ ...input, budget: Number(e.target.value) })}
      />
      <details className="advanced">
        <summary>{t("Koşulları değiştir", "Change conditions")}</summary>
        <p className="small">
          {t(
            "Bunlar sentetik deney girdileridir. Yeni koşu başında uygulanır.",
            "These are synthetic experiment inputs. They apply when a new run starts.",
          )}
        </p>
        {fields.map(({ key, options }) => (
          <div className="field" key={key}>
            <label htmlFor={key}>{fieldNames[key][locale]}</label>
            <select
              id={key}
              value={String(input[key])}
              onChange={(e) => onInput({ ...input, [key]: e.target.value })}
            >
              {options.map((v) => (
                <option key={v} value={v}>
                  {val(v, locale)}
                </option>
              ))}
            </select>
          </div>
        ))}
        <label className="checkbox">
          <input
            type="checkbox"
            checked={input.untrustedInstruction}
            onChange={(e) =>
              onInput({ ...input, untrustedInstruction: e.target.checked })
            }
          />
          {fieldNames.untrustedInstruction[locale]}
        </label>
      </details>
    </section>
  );
}
