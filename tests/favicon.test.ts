import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(__dirname, '..');

function load(rel: string): string {
  return readFileSync(resolve(ROOT, rel), 'utf8');
}

function isPng(buf: Buffer): boolean {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (buf.length < 24) return false;
  if (!buf.subarray(0, 8).equals(sig)) return false;
  const w = buf.readUInt32BE(16);
  const h = buf.readUInt32BE(20);
  return w === 32 || w === 180 ? h === w : false;
}

describe('favicon family', () => {
  it('SVG: family geometry, accent and decision-plane mark', () => {
    const svg = load('public/favicon.svg');
    expect(svg).toContain('viewBox="0 0 320 320"');
    expect(svg).toMatch(/<rect[^>]*width="320"[^>]*height="320"[^>]*rx="64"[^>]*fill="#121310"/);
    expect(svg).toMatch(/<circle[^>]*cx="160"[^>]*cy="142"[^>]*r="108"[^>]*fill="#c4f277"/);
    // Glyph group with the family dark stroke styling
    expect(svg).toMatch(/<g[^>]*fill="none"[^>]*stroke="#0c0d0a"[^>]*stroke-width="10"[^>]*stroke-linecap="round"[^>]*stroke-linejoin="round"/);
    // Two decision rails
    expect(svg).toContain('M66 37H45V131H66M134 37H155V131H134');
    // Decision node
    expect(svg).toContain('M84 61H103Q129 84 103 107H84Z');
    // Text label in the app accent
    expect(svg).toMatch(/<text[^>]*x="160"[^>]*y="296"[^>]*text-anchor="middle"[^>]*fill="#c4f277"/);
    expect(svg).toContain('>DPL</text>');
    // Accessible name
    expect(svg).toContain('aria-label="DPL — Decision Plane Laboratory"');
  });

  it('index.html declares svg, 32px png and apple-touch icons', () => {
    const html = load('index.html');
    expect(html).toMatch(/<link rel="icon" type="image\/svg\+xml" href="\/favicon\.svg" \/>/);
    expect(html).toMatch(/<link rel="icon" type="image\/png" sizes="32x32" href="\/favicon-32\.png" \/>/);
    expect(html).toMatch(/<link rel="apple-touch-icon" sizes="180x180" href="\/apple-touch-icon\.png" \/>/);
  });

  it('PNG 32 + apple-touch 180 are valid PNGs with correct dimensions', () => {
    const p32 = readFileSync(resolve(ROOT, 'public/favicon-32.png'));
    const p180 = readFileSync(resolve(ROOT, 'public/apple-touch-icon.png'));
    expect(isPng(p32)).toBe(true);
    expect(isPng(p180)).toBe(true);
    expect(p32.readUInt32BE(16)).toBe(32);
    expect(p32.readUInt32BE(20)).toBe(32);
    expect(p180.readUInt32BE(16)).toBe(180);
    expect(p180.readUInt32BE(20)).toBe(180);
  });

  it('rejects the legacy icon, a foreign label and a foreign accent', () => {
    const validator = (svg: string): boolean => {
      if (!svg.includes('viewBox="0 0 320 320"')) return false;
      if (!/rx="64"[^>]*fill="#121310"/.test(svg)) return false;
      if (!/cx="160"[^>]*cy="142"[^>]*r="108"/.test(svg)) return false;
      if (!/fill="#c4f277"/.test(svg)) return false;
      if (!/stroke="#0c0d0a"/.test(svg)) return false;
      if (!/>DPL</.test(svg)) return false;
      if (!/aria-label="DPL —/.test(svg)) return false;
      return true;
    };
    // Legacy 64x64 icon
    expect(
      validator(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-label="DPL — Decision Plane Laboratory"><rect width="64" height="64" rx="10" fill="#111416"/><path d="M19 14H11V50H19" fill="none" stroke="#c4f277" stroke-width="4"/><text x="32" y="36" text-anchor="middle" fill="#c4f277">DPL</text></svg>',
      ),
    ).toBe(false);
    // Family geometry but a foreign label
    expect(
      validator(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" aria-label="CUL — Computer Use Laboratory"><rect width="320" height="320" rx="64" fill="#121310"/><circle cx="160" cy="142" r="108" fill="#c4f277"/><g stroke="#0c0d0a"><path d="M1 1"/></g><text x="160" y="296" text-anchor="middle" fill="#c4f277">DPL</text></svg>',
      ),
    ).toBe(false);
    // Family geometry but a foreign accent
    expect(
      validator(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" aria-label="DPL — Decision Plane Laboratory"><rect width="320" height="320" rx="64" fill="#121310"/><circle cx="160" cy="142" r="108" fill="#c8ff36"/><g stroke="#0c0d0a"><path d="M1 1"/></g><text x="160" y="296" text-anchor="middle" fill="#c8ff36">DPL</text></svg>',
      ),
    ).toBe(false);
    // The shipped icon passes
    expect(validator(load('public/favicon.svg'))).toBe(true);
  });
});
