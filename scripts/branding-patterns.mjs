// Retired branding (PORTING.md, Naming): no path or file in this repository
// names the two retired brands, in any casing or spelling. The words are
// spelled backwards here so that this file passes its own check.
const reverse = (s) => [...s].reverse().join("");
export const BRANDS = ["otetop", "rosruc"].map(reverse);
const [, editorBrand] = BRANDS;

// Look-alike letters that NFKC leaves alone (Cyrillic, Greek), folded to
// the ASCII letter they imitate.
const CONFUSABLES = {
  "а": "a", "с": "c", "е": "e", "о": "o", "р": "p", "г": "r", "ѕ": "s", "т": "t", "у": "y", "х": "x", "к": "k", "ս": "u",
  "ο": "o", "τ": "t", "ρ": "p", "υ": "u", "ε": "e",
};
const fold = (text) => [...text.normalize("NFKC").toLowerCase()].map((ch) => CONFUSABLES[ch] ?? ch).join("");

// Between two letters of a word: one punctuation or invisible character, or
// a hyphenated line break. Whitespace alone is not a separator, so "recurs
// or" is not a match.
const SEP = String.raw`(?:[-_.·'’­​-‏‐-―⁠−﻿]|-[ \t]*\r?\n[ \t]*)?`;
const wordPattern = (word) => [...word].join(SEP);
export const BRANDING = new RegExp(BRANDS.map(wordPattern).join("|"), "g");

// The one kind of match a file may keep: an identifier an outside system
// defines, which cannot be renamed without breaking it. Each entry names
// the file, the identifier and the reason; nothing else in the file is
// exempt.
const quoted = String.raw`(["'])${editorBrand}\1`;
const pageField = `end${editorBrand}`;
const automationMarker = `${editorBrand}_automation_id`;
export const EXTERNAL_IDENTIFIERS = {
  "skills/cube-mode/scripts/watch-pr/github.ts": [
    [pageField, "GitHub GraphQL PageInfo field, read to page review threads and checks"],
    [quoted, "GitHub login of the Bugbot review app, used to recognise its comments"],
    [automationMarker, "marker the Bugbot review app writes in a comment, used to count review passes"],
  ],
  "skills/cube-mode/scripts/watch-pr/github.test.ts": [
    [pageField, "GitHub GraphQL PageInfo field in a recorded API response"],
    [quoted, "GitHub login of the Bugbot review app in a recorded API response"],
    [automationMarker, "Bugbot comment marker in a recorded API response"],
  ],
};

// Every match in text, as { line, match }, after removing the identifiers
// allowed for file (a path relative to the repository root).
export function brandingIn(text, file = null) {
  let folded = fold(text);
  for (const [pattern] of EXTERNAL_IDENTIFIERS[file] ?? []) folded = folded.replace(new RegExp(pattern, "g"), (m) => " ".repeat(m.length));
  return [...folded.matchAll(BRANDING)].map((m) => ({ line: folded.slice(0, m.index).split("\n").length, match: m[0] }));
}
