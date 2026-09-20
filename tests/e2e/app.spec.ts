import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";
async function finish(page: Page, locale = "tr") {
  const step = page.getByRole("button", {
    name: locale === "tr" ? "Adımla" : "Step",
    exact: true,
  });
  for (let count = 0; count < 12; count++) {
    if (!(await step.isEnabled())) break;
    await step.click();
  }
  await expect(
    page.getByRole("button", {
      name: locale === "tr" ? "JSON indir" : "Download JSON",
      exact: true,
    }),
  ).toBeEnabled();
}
test("play, pause, step, locale persistence, complete, export, reset", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.getByRole("button", { name: "İlk deneyi başlat" }).click();
  await page.getByRole("button", { name: "Duraklat" }).click();
  const before = await page.locator(".run-bottom .mono").textContent();
  await page.waitForTimeout(1100);
  expect(await page.locator(".run-bottom .mono").textContent()).toBe(before);
  await page.getByRole("button", { name: "Adımla", exact: true }).click();
  const stepped = await page.locator(".run-bottom .mono").textContent();
  expect(stepped).not.toBe(before);
  await page.getByRole("button", { name: "English", exact: true }).click();
  expect(
    (await page.locator(".run-bottom .mono").textContent())?.replace(
      "STEP",
      "ADIM",
    ),
  ).toBe(stepped);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await finish(page, "en");
  await expect(page.locator(".trace .state-tag")).toHaveText(
    "Result completed",
  );
  const downloadEvent = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download JSON", exact: true })
    .click();
  const download = await downloadEvent;
  const record = JSON.parse(await readFile((await download.path())!, "utf8"));
  expect(record.schemaVersion).toBe("1.0.0");
  expect(record.scenario.id).toBe("clear-task");
  expect(record.policy.id).toBe("adaptive");
  expect(record.outcome.state).toBe("complete");
  expect(record.events.at(-1).state).toBe(record.outcome.state);
  expect(record.input.budget).toBe(8);
  expect(record.outcome.workUnits).toBe(2);
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(page.locator(".trace-empty")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Download JSON", exact: true }),
  ).toBeDisabled();
  expect(errors).toEqual([]);
});
test("changed inputs freeze old run and new run uses new authority", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Adımla", exact: true }).click();
  await page.getByText("Koşulları değiştir", { exact: true }).click();
  await page.getByLabel("Mevcut yetki", { exact: true }).selectOption("denied");
  await expect(page.locator(".change-notice")).toBeVisible();
  await expect(page.locator(".trace .facts")).toContainText("Verilmiş");
  await page.getByRole("button", { name: "Adımla", exact: true }).click();
  await finish(page);
  await expect(page.locator(".trace .state-tag")).toHaveText(
    "İşlem engellendi",
  );
  await page.getByRole("button", { name: "Sıfırla", exact: true }).click();
  await page.getByRole("button", { name: /01 Açık/ }).click();
  await finish(page);
  await expect(page.locator(".trace .state-tag")).toHaveText(
    "Sonuç tamamlandı",
  );
});
const defaults = [
  ["02 Eksik", "Açıklama istendi"],
  ["03 Güncellik", "Karardan kaçınıldı"],
  ["04 Yetki", "İnsan onayı bekleniyor"],
  ["05 Kısıtlı", "Sonuç tamamlandı"],
  ["06 Güvenilmeyen", "İşlem engellendi"],
];
for (const [name, outcome] of defaults)
  test(`scenario ${name}`, async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: new RegExp(name) }).click();
    await finish(page);
    await expect(page.locator(".trace .state-tag")).toHaveText(outcome);
    if (name.startsWith("06")) {
      await page
        .getByText("Adım adım metinsel karar izi", { exact: false })
        .click();
      await expect(page.locator(".full-trace")).toContainText(
        "DATA.QUARANTINE",
      );
    }
  });
test("comparison starts equally, changes correctly, exports frozen results", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Karşılaştırma", exact: true })
    .click();
  await page.getByRole("button", { name: "Üç politikayı karşılaştır" }).click();
  await expect(page.locator(".comparison-column")).toHaveCount(3);
  await expect(page.locator(".units>strong")).toHaveText(["2", "3", "2"]);
  await expect(page.locator(".comparison-column .state-tag")).toHaveText([
    "Sonuç tamamlandı",
    "Sonuç tamamlandı",
    "Sonuç tamamlandı",
  ]);
  await page.getByRole("button", { name: "Karar izini incele" }).nth(1).click();
  await expect(page.locator(".comparison-trace")).toContainText("CHECK.EXTRA");
  await page.getByRole("button", { name: "English", exact: true }).click();
  await expect(page.locator(".units>strong")).toHaveText(["2", "3", "2"]);
  const d = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download comparison" }).click();
  const record = JSON.parse(await readFile((await (await d).path())!, "utf8"));
  expect(record.runs).toHaveLength(3);
  for (const run of record.runs) expect(run.input).toEqual(record.input);
  await page.getByRole("button", { name: "Edit conditions" }).click();
  await page.getByRole("button", { name: /05 Limited/ }).click();
  await page.getByRole("button", { name: "Comparison", exact: true }).click();
  await expect(page.locator(".change-notice")).toBeVisible();
  await page
    .getByRole("button", { name: "Compare all three policies" })
    .click();
  await expect(page.locator(".comparison-column .state-tag")).toHaveText([
    "Result completed",
    "Abstained",
    "Result completed",
  ]);
});
test("methods are bilingual, source links real and lesson opens intended scenario", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Kavramlar ve yöntem" }).click();
  await expect(page.locator(".lesson-list article")).toHaveCount(6);
  await expect(page.locator(".source-record a")).toHaveCount(2);
  await expect(page.locator(".methods")).toContainText("15 Aralık 2025");
  await page.getByRole("button", { name: "English", exact: true }).click();
  await expect(page.locator(".methods")).toContainText("December 15, 2025");
  await page.getByRole("button", { name: "Open example" }).nth(3).click();
  await expect(
    page.getByRole("button", { name: /04 An action/ }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".trace-empty")).toBeVisible();
});
test("keyboard navigation, visible focus, reduced motion and accessibility", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.locator(".skip-link")).toBeFocused();
  await page.keyboard.press("Enter");
  await page.getByLabel("Karar politikası", { exact: true }).focus();
  await page.keyboard.press("d");
  await expect(
    page.getByLabel("Karar politikası", { exact: true }),
  ).toHaveValue("deep");
  const focus = await page
    .getByLabel("Karar politikası", { exact: true })
    .evaluate((el) => getComputedStyle(el).outlineStyle);
  expect(focus).not.toBe("none");
  await page.keyboard.press("Tab");
  await expect(
    page.getByLabel("Başlangıç bütçesi", { exact: true }),
  ).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(
    page.getByLabel("Başlangıç bütçesi", { exact: true }),
  ).toHaveValue("7");
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(result.violations).toEqual([]);
});
for (const width of [320, 390, 768, 1440])
  for (const language of ["tr", "en"])
    test(`responsive ${width} ${language}: all surfaces and diagram geometry`, async ({
      page,
    }) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      page.on("console", (m) => {
        if (m.type() === "error") errors.push(m.text());
      });
      await page.setViewportSize({ width, height: 1000 });
      await page.goto("/");
      if (language === "en")
        await page
          .getByRole("button", { name: "English", exact: true })
          .click();
      const check = async () =>
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth,
          ),
        ).toBe(true);
      await check();
      const geometry = await page.locator(".diagram").evaluate((el) => {
        const boxes = [...el.querySelectorAll("[data-node]")].map((n) => {
          const r = n.getBoundingClientRect();
          return {
            id: n.getAttribute("data-node"),
            x: r.x,
            y: r.y,
            width: r.width,
            height: r.height,
            right: r.right,
            bottom: r.bottom,
          };
        });
        return boxes;
      });
      for (const a of geometry)
        for (const b of geometry) {
          if (a.id === b.id) continue;
          expect(
            a.right <= b.x ||
              b.right <= a.x ||
              a.bottom <= b.y ||
              b.bottom <= a.y,
          ).toBe(true);
        }
      await page.screenshot({
        path: `test-results/lab-${width}-${language}.png`,
        fullPage: true,
      });
      await page
        .getByText(
          language === "tr" ? "Koşulları değiştir" : "Change conditions",
          { exact: true },
        )
        .click();
      await check();
      await finish(page, language);
      await check();
      for (const name of language === "tr"
        ? ["Karşılaştırma", "Kavramlar ve yöntem"]
        : ["Comparison", "Concepts & method"]) {
        await page.getByRole("button", { name, exact: true }).click();
        if (name === "Karşılaştırma" || name === "Comparison")
          await page
            .getByRole("button", {
              name:
                language === "tr"
                  ? "Üç politikayı karşılaştır"
                  : "Compare all three policies",
            })
            .click();
        await check();
        await page.screenshot({
          path: `test-results/${name.startsWith("Kavram") || name.startsWith("Concept") ? "methods" : "compare"}-${width}-${language}.png`,
          fullPage: true,
        });
      }
      expect(errors).toEqual([]);
    });
test("native concept viewport and early terminal route remain readable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1505, height: 1045 });
  await page.goto("/");
  await page.screenshot({
    path: "test-results/lab-native-1505.png",
    fullPage: true,
  });
  for (const width of [320, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.getByRole("button", { name: /04 Yetki/ }).click();
    await finish(page);
    await expect(page.locator(".trace .state-tag")).toHaveText(
      "İnsan onayı bekleniyor",
    );
    await expect(page.locator('[data-node="verify"]')).toHaveCount(0);
    await expect(page.locator('[data-node="route"]')).toHaveCount(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `test-results/approval-${width}.png`,
      fullPage: true,
    });
    await page.getByRole("button", { name: "Sıfırla", exact: true }).click();
  }
});
