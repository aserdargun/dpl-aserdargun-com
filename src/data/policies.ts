import type { DecisionPolicy } from "../domain/types";
export const policies: DecisionPolicy[] = [
  {
    id: "fast",
    version: "1.0.0",
    name: { tr: "Hızlı yol ağırlıklı", en: "Fast-first" },
    description: {
      tr: "Ortak kontrollerden sonra en kısa yolu dener. Sorunlu kanıtta ek kanıt ister.",
      en: "Takes the shortest path after shared checks. Requests evidence when sources are problematic.",
    },
    checks: "minimal",
    evaluationCost: 2,
  },
  {
    id: "deep",
    version: "1.0.0",
    name: { tr: "Derin değerlendirme", en: "Deep-first" },
    description: {
      tr: "Ortak kontrollerden sonra her zaman ek kontrol yapar. Yeni kanıt veya yetki üretmek zorunda değildir.",
      en: "Always performs an extra check after shared gates. This does not necessarily add evidence or authority.",
    },
    checks: "always",
    evaluationCost: 2,
  },
  {
    id: "adaptive",
    version: "1.0.0",
    name: { tr: "Uyarlamalı", en: "Adaptive" },
    description: {
      tr: "Güncellik, çelişki ve etkiye göre yol seçer. Açık koşullarda hızlı ilerler.",
      en: "Routes by freshness, conflict, and impact. Uses the fast path for clear conditions.",
    },
    checks: "when-needed",
    evaluationCost: 2,
  },
];
