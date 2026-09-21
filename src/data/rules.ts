import type { Text } from "../domain/types";
export const rules: Record<string, Text> = {
  "INPUT.SNAPSHOT": {
    tr: "Senaryo ve girdiler bu koşu için sabitlendi.",
    en: "Scenario and inputs were frozen for this run.",
  },
  "GATE.SHARED": {
    tr: "Güvenlik, yetki, istek açıklığı ve zorunlu kanıt tüm politikalarda kontrol edilir.",
    en: "Safety, authority, request clarity, and mandatory evidence are checked for every policy.",
  },
  "DATA.QUARANTINE": {
    tr: "Güvenilmeyen talimat veri olarak ayrıldı. Politika ve yetki kurallarını değiştiremez.",
    en: "Untrusted instructions were isolated as data. They cannot change policy or authority rules.",
  },
  "AUTH.DENIED": {
    tr: "Eylem yetkisi reddedildi. Ek değerlendirme bu engeli kaldıramaz.",
    en: "Action authority was denied. Extra evaluation cannot remove this block.",
  },
  "AUTH.APPROVAL": {
    tr: "Dışa dönük veya yüksek etkili eylem için insan onayı gerekiyor. İşlem yapılmadı.",
    en: "An external or high-impact action requires human approval. No action was taken.",
  },
  "INPUT.CLARIFY": {
    tr: "İstek belirsiz. Eksik tercih tahmin edilmeden kullanıcıdan açıklama istenir.",
    en: "The request is ambiguous. Ask the user to clarify rather than inventing a missing preference.",
  },
  "EVIDENCE.MISSING": {
    tr: "Zorunlu kanıt eksik. Sonuç üretmeden önce ek kanıt gerekir.",
    en: "Mandatory evidence is missing. Additional evidence is required before producing a result.",
  },
  "ROUTE.SELECT": {
    tr: "Politika, kanıt durumu ve etki üzerinden değerlendirme yolunu seçti.",
    en: "The policy selected a path using evidence status and action impact.",
  },
  "EVIDENCE.REQUEST": {
    tr: "Asgari yol güncel ve tutarlı kanıt olmadan tamamlayamaz. Ek kanıt istendi.",
    en: "The minimal path cannot complete without current, consistent evidence. More evidence was requested.",
  },
  "BUDGET.STOP": {
    tr: "Bir sonraki adım için yeterli çalışma birimi yok. Bütçe aşılmadan karardan kaçınıldı.",
    en: "There are not enough work units for the next step. The run abstained without exceeding its budget.",
  },
  "CHECK.EXTRA": {
    tr: "Sınırlandırılmış ek kontrol çalıştırıldı. Sonuç, seçilen sentetik kontrol bulgusundan gelir.",
    en: "A bounded extra check ran. Its result comes from the selected synthetic check finding.",
  },
  "CHECK.UNRESOLVED": {
    tr: "Ek kontrol çelişkiyi veya güncellik sorununu çözemedi. Desteklenmeyen sonuç üretilmedi.",
    en: "The extra check did not resolve conflicting or stale evidence. No unsupported result was produced.",
  },
  "CHECK.CONTRADICTION": {
    tr: "Ek kontrol önerilen iddiayı çürüttü. Karar vermekten kaçınıldı.",
    en: "The extra check refuted the proposed claim. The run abstained.",
  },
  "PATH.FAST": {
    tr: "İstek açık ve kanıt yeterli. Kısa karar adımı çalıştırıldı.",
    en: "The request is clear and evidence is sufficient. A short decision step ran.",
  },
  "OUTPUT.VERIFY": {
    tr: "Kullanıcının seçtiği sentetik doğrulama girdisi okundu. Kontrol sonrası kanıt ve başlangıçta sabitlenen yetki izde gösterilir; harici doğrulama yapılmaz.",
    en: "The user-selected synthetic verification input was read. The trace shows evidence after checking and authority frozen at the start; no external verification occurs.",
  },
  "OUTPUT.REJECT": {
    tr: "Sentetik sonuç doğrulaması başarısız. Sonuç tamamlanmadı.",
    en: "Synthetic result verification failed. The result was not completed.",
  },
  "OUTPUT.COMPLETE": {
    tr: "Zorunlu kontroller ve sonuç doğrulaması geçti. Simülasyon tamamlandı; dış işlem yapılmadı.",
    en: "Mandatory checks and result verification passed. The simulation completed; no external action occurred.",
  },
};
export const conditions: Record<string, Text> = {
  snapshot: { tr: "Başlangıç girdileri sabit", en: "Starting inputs frozen" },
  trusted: {
    tr: "Talimat kaynağı güvenilir",
    en: "Instruction source trusted",
  },
  authority: { tr: "Gerekli yetki mevcut", en: "Required authority present" },
  clear: { tr: "İstek açık", en: "Request clear" },
  evidence: { tr: "Kanıt mevcut", en: "Evidence available" },
  current: {
    tr: "Kanıt güncel ve tutarlı",
    en: "Evidence current and consistent",
  },
  budget: { tr: "Sonraki adım bütçeye sığıyor", en: "Next step fits budget" },
  resolved: { tr: "Kontrol sorunu çözdü", en: "Check resolved the issue" },
  verified: { tr: "Sonuç doğrulandı", en: "Result verified" },
};
