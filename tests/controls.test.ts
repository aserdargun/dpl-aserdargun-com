import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  BOOLEAN_OPTIONS,
  INPUT_OPTIONS,
  validateInput,
} from "../src/domain/engine";
import { baseInput } from "../src/data/scenarios";
import { fieldNames, val } from "../src/i18n";
import type { ScenarioInput } from "../src/domain/types";

/* The control offered six hand-written option lists, the engine kept the same
   six lists inline, and the i18n guard kept a third copy by hand. Nothing held
   them together, and a run is not wrapped in a try/catch: one stale option
   would have thrown INVALID_INPUT the moment a reader picked it and blanked
   the page, with every other check still green.

   The engine now owns the lists, the control reads them from there and the
   i18n guard reads them from there too, so a value the engine gains is
   labelled and offered automatically. These tests keep it that way: the
   control offers exactly what the engine accepts, the engine validates every
   field the app can set, and a hand-written list cannot creep back into the
   control. */

const control = readFileSync(
  join(import.meta.dirname, "..", "src", "components", "Controls.tsx"),
  "utf8",
);

/** The fields the engine validates with a list, plus the one boolean. */
const engineFields = [...Object.keys(INPUT_OPTIONS), "untrustedInstruction"];

describe("the control offers only values a run accepts", () => {
  it("reads its options from the engine", () => {
    expect(control).toContain("INPUT_OPTIONS");
    // A hand-written option list in the control is the drift this removes.
    // The derived mapping spreads the engine's list, so only a literal list
    // of quoted values is a hand-written one.
    expect(control).not.toMatch(/options:\s*\[\s*"/);
    expect(control).not.toMatch(/\[("clear"|"sufficient"|"granted")/);
  });

  it("validates every field the app can set", () => {
    const fields = Object.keys(baseInput).filter((key) => key !== "budget");
    expect([...engineFields].sort()).toEqual([...fields].sort());
  });

  it("accepts every value it publishes and refuses every other one", () => {
    for (const [field, values] of Object.entries(INPUT_OPTIONS)) {
      for (const value of values) {
        const input = { ...baseInput, [field]: value } as ScenarioInput;
        expect(() => validateInput(input), `${field}=${value}`).not.toThrow();
      }
      expect(
        () =>
          validateInput({
            ...baseInput,
            [field]: "not-a-legal-value",
          } as ScenarioInput),
        `${field} accepts an unknown value`,
      ).toThrow("INVALID_INPUT");
    }
  });

  it("treats the boolean as a boolean, in both spellings", () => {
    for (const value of BOOLEAN_OPTIONS) {
      const input = {
        ...baseInput,
        untrustedInstruction: value === "true",
      } as ScenarioInput;
      expect(() => validateInput(input)).not.toThrow();
    }
    expect(() =>
      validateInput({
        ...baseInput,
        untrustedInstruction: "true",
      } as unknown as ScenarioInput),
    ).toThrow("INVALID_INPUT");
  });

  it("labels every field it offers, in both locales", () => {
    for (const field of engineFields) {
      const label = fieldNames[field];
      expect(label, `no label for field ${field}`).toBeDefined();
      expect(label.tr.trim()).not.toBe("");
      expect(label.en.trim()).not.toBe("");
    }
  });

  it("labels every value it offers, so no option renders a raw key", () => {
    for (const values of Object.values(INPUT_OPTIONS)) {
      for (const value of values) {
        expect(val(value, "tr"), `${value} in Turkish`).not.toBe(value);
        expect(val(value, "en"), `${value} in English`).not.toBe(value);
      }
    }
  });
});
