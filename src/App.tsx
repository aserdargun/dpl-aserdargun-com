import { useEffect, useState } from "react";
import {
  Play,
  Pause,
  StepForward,
  RotateCcw,
  Download,
  ArrowUpRight,
  FlaskConical,
} from "lucide-react";
import type {
  ComparisonResult,
  ExperimentRun,
  Locale,
  PolicyId,
  ScenarioInput,
} from "./domain/types";
import { runExperiment, serializeRun } from "./domain/engine";
import { scenarios } from "./data/scenarios";
import { policies } from "./data/policies";
import { Diagram } from "./components/Diagram";
import { Controls } from "./components/Controls";
import { Trace } from "./components/Trace";
import { Evidence } from "./components/Evidence";
import { Comparison } from "./components/Comparison";
import { Methods } from "./components/Methods";
export default function App() {
  const [locale, setLocale] = useState<Locale>("tr");
  const [page, setPage] = useState("lab");
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [scenarioId, setScenarioId] = useState(scenarios[0].id);
  const scenario = scenarios.find((s) => s.id === scenarioId)!;
  const [input, setInput] = useState<ScenarioInput>({ ...scenario.input });
  const [policy, setPolicy] = useState<PolicyId>("adaptive");
  const [run, setRun] = useState<ExperimentRun | null>(null);
  const [cursor, setCursor] = useState(0);
  const [playing, setPlaying] = useState(false);
  const t = (tr: string, en: string) => (locale === "tr" ? tr : en);
  const dirty =
    !!run &&
    (scenarioId !== run.scenario.id ||
      policy !== run.policy.id ||
      JSON.stringify(input) !== JSON.stringify(run.input));
  const complete = !!run && cursor === run.events.length;
  const activeScenario = run?.scenario ?? scenario;
  useEffect(() => {
    document.documentElement.lang = locale;
    document.title =
      locale === "tr"
        ? "DPL — Karar Düzlemi Laboratuvarı"
        : "DPL — Decision Plane Laboratory";
  }, [locale]);
  useEffect(() => {
    if (!playing || !run) return;
    if (cursor >= run.events.length) {
      setPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => setCursor((c) => c + 1), 900);
    return () => clearTimeout(timer);
  }, [playing, cursor, run]);
  function start(play: boolean) {
    const next = runExperiment(
      scenario,
      input,
      policies.find((p) => p.id === policy)!,
    );
    setRun(next);
    setCursor(1);
    setPlaying(play);
  }
  function step() {
    setPlaying(false);
    if (!run || dirty) start(false);
    else setCursor((c) => Math.min(c + 1, run.events.length));
  }
  function reset() {
    setPlaying(false);
    setRun(null);
    setCursor(0);
  }
  function selectScenario(id: string) {
    setPlaying(false);
    setScenarioId(id);
    setInput({ ...scenarios.find((s) => s.id === id)!.input });
  }
  function download() {
    if (!run || !complete) return;
    const url = URL.createObjectURL(
      new Blob([serializeRun(run)], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `${run.id}.json`;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <>
      <a className="skip-link" href="#main">
        {t("İçeriğe geç", "Skip to content")}
      </a>
      <header className="header">
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setPage("lab");
          }}
          aria-label="DPL"
        >
          <span className="brand-mark">
            <i>[</i> DPL <i>]</i>
          </span>
          <span className="brand-name">
            Decision Plane
            <br />
            Laboratory
          </span>
        </a>
        <nav aria-label={t("Ana menü", "Main navigation")}>
          {[
            ["lab", t("Laboratuvar", "Laboratory")],
            ["compare", t("Karşılaştırma", "Comparison")],
            ["methods", t("Kavramlar ve yöntem", "Concepts & method")],
          ].map(([id, label]) => (
            <button
              key={id}
              aria-current={page === id ? "page" : undefined}
              onClick={() => {
                setPage(id);
                setPlaying(false);
              }}
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="language" aria-label={t("Dil", "Language")}>
          {(["tr", "en"] as const).map((l) => (
            <button
              key={l}
              lang={l}
              aria-label={l === "tr" ? "Türkçe" : "English"}
              aria-pressed={locale === l}
              onClick={() => setLocale(l)}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </header>
      <main id="main">
        <div className="intro">
          <div>
            <h1>
              {t(
                "Bir karar. Birden fazla yol.",
                "One decision. More than one path.",
              )}
            </h1>
            <p>
              {t(
                "Koşulları değiştir. Karar yolunun neden değiştiğini keşfet.",
                "Change the conditions. Discover why the decision path changes.",
              )}
            </p>
          </div>
          <div className="simulation">
            <FlaskConical size={17} />
            <span>
              {t("Deterministik simülasyon", "Deterministic simulation")}
            </span>
          </div>
        </div>
        {page === "lab" ? (
          <>
            <div className="lab-grid">
              <aside className="scenario-panel panel">
                <div className="section-title">
                  <h2>{t("Senaryo seç", "Choose a scenario")}</h2>
                  <span className="mono">
                    {String(scenarios.length).padStart(2, "0")}
                  </span>
                </div>
                <p className="small">
                  {t(
                    "Aynı soruya farklı karar politikaları.",
                    "Different decision policies. The same question.",
                  )}
                </p>
                <div className="scenario-list">
                  {scenarios.map((s, index) => (
                    <button
                      key={s.id}
                      className={s.id === scenarioId ? "selected" : ""}
                      aria-pressed={s.id === scenarioId}
                      onClick={() => selectScenario(s.id)}
                    >
                      <span className="scenario-number">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span>
                        <strong>{s.title[locale]}</strong>
                        <small>{s.short[locale]}</small>
                      </span>
                      <ArrowUpRight size={15} />
                    </button>
                  ))}
                </div>
                <div className="scenario-note">
                  <span className="overline">
                    {t("DENEYİN SORUSU", "THE EXPERIMENT")}
                  </span>
                  <p>{scenario.request[locale]}</p>
                  <p className="small">{scenario.description[locale]}</p>
                </div>
              </aside>
              <section className="plane-panel panel">
                <div className="plane-header">
                  <div>
                    <h2>{t("Karar düzlemi", "Decision plane")}</h2>
                    <p className="small">
                      {run
                        ? activeScenario.title[locale]
                        : t(
                            "İlk deneyiniz hazır.",
                            "Your first experiment is ready.",
                          )}
                    </p>
                  </div>
                  <div className="legend">
                    <span>
                      <b>●</b> {t("Aktif", "Active")}
                    </span>
                    <span>○ {t("Bekleyen", "Pending")}</span>
                  </div>
                </div>
                {dirty && (
                  <div className="change-notice" role="status">
                    {t(
                      "Koşullar değişti. Görünen iz önceki koşuya ait; yeni koşuda güncellenir.",
                      "Conditions changed. The visible trace belongs to the previous run; start a new run to apply changes.",
                    )}
                  </div>
                )}
                <Diagram
                  events={run?.events.slice(0, cursor) ?? []}
                  locale={locale}
                />
                <div className="playback">
                  <button
                    className="primary"
                    onClick={() => {
                      if (playing) setPlaying(false);
                      else if (!run || dirty || complete) start(true);
                      else setPlaying(true);
                    }}
                  >
                    {playing ? <Pause size={16} /> : <Play size={16} />}{" "}
                    {playing
                      ? t("Duraklat", "Pause")
                      : dirty || complete
                        ? t("Yeni koşu", "New run")
                        : run
                          ? t("Oynat", "Play")
                          : t("İlk deneyi başlat", "Start first experiment")}
                  </button>
                  <button onClick={step} disabled={complete && !dirty}>
                    <StepForward size={16} />
                    {t("Adımla", "Step")}
                  </button>
                  <button onClick={reset} disabled={!run}>
                    <RotateCcw size={16} />
                    {t("Sıfırla", "Reset")}
                  </button>
                </div>
                <div className="run-bottom">
                  <span className="mono">
                    {t("ADIM", "STEP")} {String(cursor).padStart(2, "0")} /{" "}
                    {run ? String(run.events.length).padStart(2, "0") : "—"}
                  </span>
                  <button
                    className="text-button"
                    disabled={!complete}
                    onClick={download}
                  >
                    <Download size={14} />
                    {t("JSON indir", "Download JSON")}
                  </button>
                </div>
                <p className="timing-note">
                  {t(
                    "Oynatma yalnızca görselleştirmedir; model gecikmesi ölçülmez.",
                    "Playback is visualization only; it does not measure model latency.",
                  )}
                </p>
              </section>
              <aside className="inspector panel">
                <Controls
                  locale={locale}
                  input={input}
                  policy={policy}
                  onInput={(v) => {
                    setPlaying(false);
                    setInput(v);
                  }}
                  onPolicy={(p) => {
                    setPlaying(false);
                    setPolicy(p);
                  }}
                />
                <Trace run={run} cursor={cursor} locale={locale} />
              </aside>
            </div>
            <Evidence
              scenario={activeScenario}
              input={run?.input ?? input}
              locale={locale}
              run={run}
              cursor={cursor}
            />
          </>
        ) : page === "compare" ? (
          <Comparison
            locale={locale}
            scenario={scenario}
            input={input}
            result={comparison}
            onResult={setComparison}
            onLab={() => setPage("lab")}
          />
        ) : (
          <Methods
            locale={locale}
            onScenario={(id) => {
              selectScenario(id);
              reset();
              setPage("lab");
              window.scrollTo({ top: 0 });
            }}
          />
        )}
      </main>
      <footer>
        <span>
          System One ↔ System Two{" "}
          <span className="footer-metaphor">
            {t(
              "bir tasarım benzetmesidir. Gerçek model çalıştırılmaz.",
              "is a design metaphor. No real model runs here.",
            )}
          </span>
        </span>
        <span>
          DPL <span className="muted">/</span> 1.0
        </span>
      </footer>
    </>
  );
}
