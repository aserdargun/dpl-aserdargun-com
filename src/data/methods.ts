import { bi } from "./scenarios";
export const lessons = [
  {
    scenario: "clear-task",
    title: bi(
      "Hızlı karar ne zaman yeterlidir?",
      "When is a fast decision enough?",
    ),
    body: bi(
      "İstek açık, kanıt güncel ve yeterli, yetki mevcutsa kısa yol uygundur. “Hızlı”, zorunlu kontrolleri atlamak anlamına gelmez. İlk senaryoda hızlı ve uyarlamalı yol 2 birim, derin yol 3 birim tüketir; üçü de aynı doğrulanmış simülasyon sonucuna ulaşır.",
      "A short path fits a clear request with current, sufficient evidence and the necessary authority. “Fast” never means skipping mandatory checks. In the first scenario, fast and adaptive use 2 units; deep uses 3. All reach the same verified simulation outcome.",
    ),
  },
  {
    scenario: "conflicting-evidence",
    title: bi(
      "Ek değerlendirme ne zaman fayda sağlar?",
      "When does extra evaluation help?",
    ),
    body: bi(
      "Güncellik sorunu, kaynak çelişkisi veya yüksek etki ek kontrolü tetikleyebilir. Burada kontrol bulgusunu kullanıcı belirler: sorun çözülür, yeni bilgi gelmez veya iddia çürütülür. Son iki durum aynı değildir. Yeni bilgi yoksa sorunlu kanıtla tamamlamak yerine durulur.",
      "Stale evidence, source conflict, or high impact may trigger an extra check. Here, the user sets its finding: resolution, no new information, or refutation. The latter two are different. If problematic evidence remains, the run stops instead of completing.",
    ),
  },
  {
    scenario: "ambiguous-request",
    title: bi(
      "Kanıt ile iddia arasındaki fark",
      "The difference between evidence and a claim",
    ),
    body: bi(
      "Bir iddia, desteklenmesi gereken önermedir; kanıt onu değerlendirmeye yarayan kayıttır. Çok sayıda kayıt tutarlı ya da güncel oldukları anlamına gelmez. Ayrıca kanıt mevcut olsa bile kullanıcının ne istediği belirsiz olabilir. DPL bunları ayrı girdilerle temsil eder.",
      "A claim is a proposition needing support; evidence is a record used to assess it. More records do not ensure consistency or freshness. Even with evidence, user intent can remain unclear. DPL represents these as separate inputs.",
    ),
  },
  {
    scenario: "approval-required",
    title: bi(
      "Karar ile yetki arasındaki fark",
      "The difference between a decision and authority",
    ),
    body: bi(
      "Bir sonucun yeterli görünmesi, onu dışarıya uygulama izni değildir. Onay bekleme geçici bir bekleme sonucudur; ret işlem engelidir. DPL’de yetkiyi “Verilmiş” seçmek gerçek insan onayı toplamaz; yalnızca bir deney varsayımını değiştirir.",
      "A sufficient-looking result does not grant permission to apply it externally. Pending approval is a waiting outcome; denial is a block. Selecting “Granted” in DPL does not collect real human consent; it changes an experimental assumption.",
    ),
  },
  {
    scenario: "limited-budget",
    title: bi("Bütçe ve durma koşulları", "Budgets and stopping conditions"),
    body: bi(
      "Kapılar 0, hızlı adım 1, ek kontrol 2, son doğrulama 1 çalışma birimidir. Bütçe 0–16 arasında tam sayıdır. Bir sonraki adım karşılanamıyorsa koşu durur; eksi bütçe veya yeniden deneme döngüsü yoktur. Birimler token, para veya süre değildir.",
      "Gates cost 0, a fast step 1, an extra check 2, and final verification 1 work unit. Budget is an integer from 0 to 16. The run stops if the next step is unaffordable; there is no negative budget or retry loop. Units are not tokens, money, or time.",
    ),
  },
  {
    scenario: "untrusted-content",
    title: bi("Politikaları adil karşılaştırma", "Comparing policies fairly"),
    body: bi(
      "Üç politika aynı senaryo sürümü, girdiler, kanıtlar ve bütçeyle başlar. Rastgelelik yoktur. Tamamlama tek başarı ölçütü değildir: uygun koşulda açıklama istemek, onay beklemek veya durmak doğrudur. Güvenilmeyen içerik tüm politikalarda veri olarak kalır.",
      "All three policies start with the same scenario version, inputs, evidence, and budget. There is no randomness. Completion is not the only good outcome: asking for clarification, awaiting approval, or stopping may be appropriate. Untrusted content remains data for every policy.",
    ),
  },
];
export const sources = [
  {
    title: "Building effective agents",
    publisher: "Anthropic",
    url: "https://www.anthropic.com/engineering/building-effective-agents",
    published: "2024-12-19",
    accessed: "2026-09-20",
    note: bi(
      "Önceden tanımlı iş akışları ile modelin yönettiği ajan süreçlerini ayırır; yönlendirmeyi bir iş akışı örüntüsü olarak ele alır. DPL’nin deterministik yönlendirmesine kavramsal bağlam sağlar. Kaynak kendi araç ekosisteminin sonradan değiştiğini belirtiyor.",
      "Distinguishes predefined workflows from model-directed agent processes and presents routing as a workflow pattern. Provides conceptual context for DPL’s deterministic routing. The source notes that its tooling landscape has since changed.",
    ),
  },
  {
    title:
      "The “think” tool: Enabling Claude to stop and think in complex tool use situations",
    publisher: "Anthropic",
    url: "https://www.anthropic.com/engineering/claude-think-tool",
    published: "2025-03-20",
    accessed: "2026-09-20",
    note: bi(
      "Araç kullanımının ara aşamalarında ek değerlendirmeyi inceler. 15 Aralık 2025 güncellemesi, çoğu durumda ayrı think aracı yerine extended thinking öneriyor. DPL bu aracı veya sağlayıcı sonuçlarını yeniden üretmez; yazı tarihsel tasarım bağlamıdır.",
      "Examines additional evaluation during intermediate tool-use steps. Its December 15, 2025 update recommends extended thinking instead of a separate think tool in most cases. DPL reproduces neither this tool nor provider results; the article is historical design context.",
    ),
  },
];
export const neighbors = [
  {
    code: "HNS",
    name: "Harness Engineering Observatory",
    role: bi(
      "Üst araştırma alanı: harness yaklaşımları ve mühendislik örüntüleri.",
      "Parent research area: harness approaches and engineering patterns.",
    ),
  },
  {
    code: "ARL",
    name: bi("Ajan çalışma zamanı", "Agent runtime"),
    role: bi(
      "Niyetten eyleme uzanan ajan çalışma zamanı; DPL yalnızca karar yoluna odaklanır.",
      "Agent runtime from intent to action; DPL focuses only on the decision path.",
    ),
  },
  {
    code: "CTX",
    name: bi("Bağlam ve bilgi düzenleme", "Context and knowledge organization"),
    role: bi(
      "Bağlamın hazırlanması ve bilginin düzenlenmesi. DPL’de kanıt koşulları sentetiktir.",
      "Context preparation and knowledge organization. DPL evidence conditions are synthetic.",
    ),
  },
  {
    code: "SEC",
    name: bi("Güvenlik sınırları", "Security boundaries"),
    role: bi(
      "Güvenlik sınırları. DPL’de ortak kapılar bir öğretim modelidir, gerçek güvenlik ürünü değildir.",
      "Security boundaries. DPL shared gates are a teaching model, not a real security product.",
    ),
  },
  {
    code: "EVL",
    name: bi("Değerlendirme ve güvenilirlik", "Evaluation and reliability"),
    role: bi(
      "Değerlendirme ve güvenilirlik alanı. DPL gerçek model doğruluğunu ölçmez.",
      "Evaluation and reliability. DPL does not measure real-model accuracy.",
    ),
  },
];
