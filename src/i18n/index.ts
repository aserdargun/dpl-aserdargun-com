import type { DecisionState, Locale, Text } from "../domain/types";
export const stateNames: Record<DecisionState, Text> = {
  intake: { tr: "İstek", en: "Request" },
  checks: { tr: "İlk kontroller", en: "Initial checks" },
  route: { tr: "Yol seçimi", en: "Path selection" },
  fast: { tr: "Hızlı yol", en: "Fast path" },
  evaluate: { tr: "Ek değerlendirme", en: "Extra evaluation" },
  request_evidence: { tr: "Ek kanıt istendi", en: "Evidence requested" },
  clarify: { tr: "Açıklama istendi", en: "Clarification requested" },
  approval: { tr: "İnsan onayı bekleniyor", en: "Awaiting human approval" },
  abstain: { tr: "Karardan kaçınıldı", en: "Abstained" },
  blocked: { tr: "İşlem engellendi", en: "Action blocked" },
  verify: { tr: "Son kontrol", en: "Final check" },
  complete: { tr: "Sonuç tamamlandı", en: "Result completed" },
};
export const fieldNames: Record<string, Text> = {
  ambiguity: { tr: "İstek açıklığı", en: "Request clarity" },
  evidence: { tr: "Kanıt durumu", en: "Evidence status" },
  impact: { tr: "Olası etki", en: "Potential impact" },
  authorization: { tr: "Mevcut yetki", en: "Authority" },
  budget: { tr: "Başlangıç bütçesi", en: "Starting budget" },
  checkResult: { tr: "Ek kontrol bulgusu", en: "Extra-check finding" },
  verification: { tr: "Sonuç doğrulaması", en: "Result verification" },
  untrustedInstruction: {
    tr: "Güvenilmeyen talimat",
    en: "Untrusted instruction",
  },
  requiresApproval: {
    tr: "Senaryo onay gerektiriyor",
    en: "Scenario requires approval",
  },
  effectiveEvidence: {
    tr: "Kontrol sonrası kanıt",
    en: "Evidence after check",
  },
};
export const valueNames: Record<string, Text> = {
  clear: { tr: "Açık", en: "Clear" },
  ambiguous: { tr: "Belirsiz", en: "Ambiguous" },
  sufficient: { tr: "Yeterli ve güncel", en: "Sufficient and current" },
  missing: { tr: "Eksik", en: "Missing" },
  stale: { tr: "Güncelliğini yitirmiş", en: "Stale" },
  conflicting: { tr: "Çelişkili", en: "Conflicting" },
  low: { tr: "Düşük", en: "Low" },
  high: { tr: "Yüksek", en: "High" },
  granted: { tr: "Verilmiş", en: "Granted" },
  pending: { tr: "Henüz verilmemiş", en: "Not yet granted" },
  denied: { tr: "Reddedilmiş", en: "Denied" },
  resolves: { tr: "Sorunu çözer", en: "Resolves the issue" },
  inconclusive: { tr: "Yeni bilgi sağlamaz", en: "Adds no new information" },
  contradicts: { tr: "İddiayı çürütür", en: "Refutes the claim" },
  pass: { tr: "Geçer", en: "Pass" },
  fail: { tr: "Başarısız", en: "Fail" },
  true: { tr: "Evet", en: "Yes" },
  false: { tr: "Hayır", en: "No" },
};
export const val = (v: unknown, l: Locale) =>
  valueNames[String(v)]?.[l] ?? String(v);
