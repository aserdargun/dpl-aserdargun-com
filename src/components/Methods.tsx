import { ArrowUpRight, BookOpen } from "lucide-react";
import type { Locale } from "../domain/types";
import { lessons, neighbors, portfolioUrl, sources } from "../data/methods";
export function Methods({
  locale,
  onScenario,
}: {
  locale: Locale;
  onScenario: (id: string) => void;
}) {
  const t = (tr: string, en: string) => (locale === "tr" ? tr : en);
  return (
    <div className="methods">
      <section className="method-intro">
        <div>
          <span className="overline">
            {t("KAVRAMLAR VE YÖNTEM", "CONCEPTS & METHOD")}
          </span>
          <h2>
            {t(
              "Daha fazla değerlendirme,\nher zaman daha iyi karar değildir.",
              "More evaluation is not\nalways a better decision.",
            )}
          </h2>
        </div>
        <div>
          <p>
            {t(
              "System One ve System Two, hızlı yol ile derin değerlendirmeyi anlatan bir tasarım benzetmesidir. Modellerin doğrulanmış iç bilişsel mekanizmaları değildir.",
              "System One and System Two are a design metaphor for fast paths and deeper evaluation. They are not verified internal cognitive mechanisms of models.",
            )}
          </p>
          <p>
            {t(
              "Karar izi; gözlenen girdileri, kuralları, yolu ve sonucu gösterir. Gizli düşünce zincirine erişim sağlamaz.",
              "The trace shows observed inputs, rules, paths, and outcomes. It does not expose hidden chain of thought.",
            )}
          </p>
        </div>
      </section>
      <div className="lesson-list">
        <p className="section-lead">
          {t(
            "Örnekler, senaryonun başlangıç koşulları ve uyarlamalı politikayla açılır. Ardından üç politikayı Karşılaştırma sayfasında deneyin.",
            "Examples open with the scenario’s default conditions and adaptive policy. Then try all three policies on the Comparison page.",
          )}
        </p>
        {lessons.map((l, n) => (
          <article key={l.scenario}>
            <span className="lesson-number">0{n + 1}</span>
            <div>
              <h3>{l.title[locale]}</h3>
              <p>{l.body[locale]}</p>
            </div>
            <button onClick={() => onScenario(l.scenario)}>
              {t("Örneği aç", "Open example")}
              <ArrowUpRight size={15} />
            </button>
          </article>
        ))}
      </div>
      <section className="method-section">
        <h2>{t("Neye bakıyorsunuz?", "What are you looking at?")}</h2>
        <div className="provenance-list">
          {[
            [
              t("Kaynağa dayalı açıklama", "Source-based explanation"),
              t(
                "Aşağıdaki birincil yayınlara dayanan iş akışı ve ara değerlendirme kavramları.",
                "Workflow and intermediate-evaluation concepts supported by the primary publications below.",
              ),
            ],
            [
              t("DPL tasarım tercihi", "DPL design choice"),
              t(
                "Ortak kapılar, kural sırası, üç politika, 0/1/2 birim maliyetler ve durma eşikleri bu laboratuvar için tanımlandı.",
                "Shared gates, rule ordering, three policies, 0/1/2 unit costs, and stopping thresholds were defined for this lab.",
              ),
            ],
            [
              t("Sentetik senaryo verisi", "Synthetic scenario data"),
              t(
                "İstekler, kayıtlar, tarihli örnekler, kontrol bulguları ve doğrulama girdisi eğitim amacıyla oluşturuldu.",
                "Requests, records, dated examples, check findings, and the verification input were created for education.",
              ),
            ],
            [
              t("Simülasyonda hesaplanan sonuç", "Computed simulation result"),
              t(
                "Yol, bütçe ve son durum deterministik motor tarafından hesaplanır. Birim ve sonuç farkları gerçek modellere genellenemez.",
                "The deterministic engine computes the path, budget, and terminal state. Unit and outcome differences do not generalize to real models.",
              ),
            ],
          ].map(([title, body]) => (
            <div key={title}>
              <h3>{title}</h3>
              <p>{body}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="method-section">
        <h2>
          {t("Kaynaklar ve araştırma notları", "Sources and research notes")}
        </h2>
        <p className="section-lead">
          {t(
            "Birincil yayınlar doğrulandı. DPL herhangi bir sağlayıcının resmî mimarisi veya performans deneyi değildir.",
            "Primary publications were checked. DPL is not an official provider architecture or performance experiment.",
          )}
        </p>
        {sources.map((s) => (
          <article className="source-record" key={s.url}>
            <BookOpen size={20} />
            <div>
              <a href={s.url} target="_blank" rel="noreferrer">
                {s.title}
                <ArrowUpRight size={13} />
              </a>
              <p className="source-dates">
                {s.publisher} · {t("Yayın", "Published")}:{" "}
                <time dateTime={s.published}>{s.published}</time> · {t("Erişim", "Accessed")}:{" "}
                <time dateTime={s.accessed}>{s.accessed}</time>
              </p>
              <p>{s.note[locale]}</p>
            </div>
          </article>
        ))}
      </section>
      <section className="method-section">
        <h2>{t("Ekosistemdeki yeri", "Place in the ecosystem")}</h2>
        <p className="section-lead">
          {t(
            "DPL, aserdargun.com öğrenme sisteminin Ajan sistemi katmanında, HNS altında yer alır. Aşağıdaki bağlantılar bağımsız uygulamalara giden öğrenme yollarıdır. Servis entegrasyonu veya deney verisi aktarımı yoktur; yeni sekmede açılırlar.",
            "DPL belongs to the Agent system layer of the aserdargun.com learning system, under HNS. These links are learning paths to independent applications. There is no service integration or experiment data transfer; links open in a new tab.",
          )}
        </p>
        <a href={portfolioUrl(locale)} target="_blank" rel="noreferrer">
          {t("Tüm öğrenme sistemini keşfet ↗", "Explore the full learning system ↗")}
        </a>
        <dl className="neighbor-list">
          {neighbors.map((n) => (
            <div key={n.code}>
              <dt>{n.code}</dt>
              <dd>
                <a href={n.url} target="_blank" rel="noreferrer">
                  {typeof n.name === "string" ? n.name : n.name[locale]}
                  {" "}<ArrowUpRight size={13} aria-hidden="true" />
                </a>
                <p>{n.role[locale]}</p>
              </dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="method-section limitations">
        <h2>{t("Kapsam ve sınırlar", "Scope and limitations")}</h2>
        <p>
          {t(
            "DPL tarayıcıda bağımsız çalışır. Hesap, API anahtarı, backend, harici veri deposu veya model çağrısı gerekmez. Bir simülasyonun “doğrulandı” sonucu, kullanıcı tarafından seçilen sentetik doğrulama girdisinin geçtiğini gösterir; gerçek çıktının doğruluğunu ölçmez.",
            "DPL runs independently in the browser. It requires no account, API key, backend, external database, or model call. A “verified” simulation result means the user-selected synthetic verification input passed; it does not measure the correctness of a real output.",
          )}
        </p>
        <p>
          {t(
            "Yerel kalıcılık kullanılmaz; sayfa yenilenince deney sıfırlanır. Tamamlanmış koşuyu korumak için sürümlü JSON kaydını indirin. Yayın adresi: dpl.aserdargun.com.",
            "There is no local persistence; reloading resets the experiment. Download the versioned JSON record to retain a completed run. Publication address: dpl.aserdargun.com.",
          )}
        </p>
      </section>
    </div>
  );
}
