// Regression fixtures for the port checks (node --test scripts/check-port.test.mjs).
import assert from "node:assert/strict";
import { test } from "node:test";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { substitutesIn } from "./handoff-patterns.mjs";
import { retiredConfigIn } from "./model-patterns.mjs";
import { BRANDS, brandingIn } from "./branding-patterns.mjs";

// Wordings earlier revisions or reviews found; each must be caught.
const BAD = [
  "Run Comment Sicko as a labeled self pass yourself.",
  "Get a Comment Sicko pass (a fresh thread, or a labelled self-pass).",
  "Do the single-agent version and label it `self-review, not independent`.",
  "In a thread, use arena's in-thread form.",
  "A thread runs them one pass at a time.",
  "Run the three lenses yourself, one pass each.",
  "Review your own diff. Capture a post-fix trace.",
  "Supervise and review your own attempts.",
  "Make the change, and review the diff as a reviewer would.",
  "Keep the lead's discipline over your own work.",
  "A thread: you own your diff; review it yourself before reporting.",
  "A thread asked to interrogate plays the adversaries itself.",
  "OptChat: read the thread's report and its diff or artifact.",
];
// Wordings the port uses on purpose; none may be caught.
const GOOD = [
  "Check your own diff before pushing (an author check).",
  "Your own check never stands in for it.",
  "OptChat cannot open a diff: you own it through the verdict of a fresh review thread.",
  "You cannot open a diff; the verifier thread does.",
  "Self-review is not a substitute.",
  "Get a Comment Sicko pass from a fresh thread (by handoff, never your own pass).",
  "Report a handoff with one brief per worker and end your turn.",
  "Migrate one component at a time.",
  "A thread frames it and reports a handoff; it does not run the slices itself.",
];

test("every known substitute wording is caught", () => {
  for (const line of BAD) assert.ok(substitutesIn(line).length > 0, `not caught: ${line}`);
});
test("the port's own wordings are not caught", () => {
  for (const line of GOOD) assert.deepEqual(substitutesIn(line), [], `caught: ${line}`);
});

// The model rule (references/cube.md, Models): setup-pstack is retired and an
// omitted model is the host default, not the user's choice.
const RETIRED_BAD = [
  "No `pstack models` block in OptChat's instructions means setup hasn't run.",
  "Run [`/setup-pstack`](../setup-pstack/SKILL.md) in OptChat.",
  "Use the `arena runners` role line in OptChat's instructions.",
  "An `auto` or `inherit-parent` entry means the host's preferred model.",
  "If that line is missing, omit `model` so the workers run on the host's preferred model.",
  "A role with no line omits model, so the thread runs on the host's preferred model.",
];
const RETIRED_GOOD = [
  "`/setup-pstack` is retired in cube; a user who types it gets this answer.",
  "Never omit `model` to dodge the question: the host default can be any model.",
  "When none covers a spawn, ask (Models); never omit `model` in its place.",
  "Pick the worker model from the user's preference that covers `swarm workers`.",
];

test("every retired model-setup wording is caught", () => {
  for (const line of RETIRED_BAD) assert.ok(retiredConfigIn(line).length > 0, `not caught: ${line}`);
});
test("the port's own model wordings are not caught", () => {
  for (const line of RETIRED_GOOD) assert.deepEqual(retiredConfigIn(line), [], `caught: ${line}`);
});

// The retired branding, in any casing or spelling. Fixtures are built from
// the brand list so that this file passes the check itself.
const [P, C] = BRANDS;
const cap = (w) => w[0].toUpperCase() + w.slice(1);
const spread = (w, sep) => [...w].join(sep);
const BRAND_BAD = [
  `A user who asks for \`/${P}-mode\` means this skill.`,
  `Use for /${cap(P)}-Mode (its pstack name).`,
  `work in ${P} mode`,
  `${P.toUpperCase()}_MODE`,
  `"name": "@${C}-skill/cube-mode-tools"`,
  `Use for cube-mode, /cube-mode, ${P}, pstack.`,
  `${P}'s agent style`,
  `Brief it from agents/${P}-agent.md.`,
  `ported from ${cap(C)} to cube`,
  `~/.${C}/projects/<slug>/agent-transcripts`,
  `https://github.com/${C}/plugins/tree/main/pstack`,
  spread(P, "."),
  spread(C, "-"),
  spread(P, "\u2011"),
  spread(C, "\u00ad"),
  spread(P, "\u200b"),
  P.replace("o", "\u043e"),
  C.replace("c", "\u0441"),
  [...C.toUpperCase()].map((ch) => String.fromCharCode(ch.charCodeAt(0) + 0xfee0)).join(""),
  `${P.slice(0, 3)}-\n${P.slice(3)}`,
  `pre${C}`,
];
const BRAND_GOOD = [
  "cube-mode, pstack, Comment Sicko",
  "a cube-mode thread brief",
  `${C.slice(0, 4)} ${C.slice(4)}`,
  `${P.slice(0, 3)} ${P.slice(3)}`,
  "after = page.nextAfter;",
];
const github = "skills/cube-mode/scripts/watch-pr/github.ts";

test("every spelling of the retired branding is caught", () => {
  for (const line of BRAND_BAD) assert.ok(brandingIn(line).length > 0, `not caught: ${JSON.stringify(line)}`);
});
test("text without the branding is not caught", () => {
  for (const line of BRAND_GOOD) assert.deepEqual(brandingIn(line), [], `caught: ${line}`);
});
test("an outside identifier is allowed only in its own file, and nothing else there", () => {
  const field = `pageInfo { hasNextPage end${cap(C)} }`;
  assert.deepEqual(brandingIn(field, github), []);
  assert.equal(brandingIn(field, "skills/cube-mode/SKILL.md").length, 1);
  assert.deepEqual(brandingIn(`author === "${C}"`, github), []);
  assert.equal(brandingIn(`${cap(C)} built this`, github).length, 1);
  assert.equal(brandingIn(`author === "${P}"`, github).length, 1);
});
test("matches report their line", () => {
  assert.deepEqual(brandingIn(`one\ntwo ${P}\nthree`).map((m) => m.line), [2]);
});

// The whole checker on a scratch copy: a retired skill that comes back,
// installed text that sends the user to it, or retired branding anywhere in
// the repository fails the check.
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
function scratch(change) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "check-port-"));
  for (const name of ["scripts", "skills", "README.md"]) fs.cpSync(path.join(root, name), path.join(dir, name), { recursive: true });
  change(dir);
  const run = spawnSync(process.execPath, [path.join(dir, "scripts/check-port.mjs")], { encoding: "utf8" });
  fs.rmSync(dir, { recursive: true, force: true });
  return run;
}

test("the unchanged port passes the checker", () => {
  const run = scratch(() => {});
  assert.equal(run.status, 0, run.stderr);
});
test("a retired skill folder that comes back fails the checker", () => {
  const run = scratch((dir) => { fs.mkdirSync(path.join(dir, "skills/setup-pstack")); fs.writeFileSync(path.join(dir, "skills/setup-pstack/SKILL.md"), "---\nname: setup-pstack\ndescription: x\n---\n"); });
  assert.equal(run.status, 1);
  assert.match(run.stderr, /RETIRED setup-pstack/);
});
test("installed text that sends the user to the retired setup fails the checker", () => {
  const run = scratch((dir) => fs.appendFileSync(path.join(dir, "skills/cube-mode/references/cube.md"), "\nRun `/setup-pstack` to pick models.\n"));
  assert.equal(run.status, 1);
  assert.match(run.stderr, /cube-mode\/references\/cube\.md: points at the retired model setup/);
});
test("port commentary in an installed file fails the checker", () => {
  const run = scratch((dir) => fs.appendFileSync(path.join(dir, "skills/cube-help/SKILL.md"), "\n<!-- cube-adapt M4. Intent: x. -->\n"));
  assert.equal(run.status, 1);
  assert.match(run.stderr, /cube-help\/SKILL\.md:\d+: port commentary/);
});
test("retired branding in an installed file fails the checker", () => {
  const run = scratch((dir) => fs.appendFileSync(path.join(dir, "skills/cube-help/SKILL.md"), `\nA user who asks for \`/${P}-help\` means cube-help.\n`));
  assert.equal(run.status, 1);
  assert.match(run.stderr, /skills\/cube-help\/SKILL\.md:\d+: retired branding/);
});
test("retired branding in an installed script fails the checker", () => {
  const file = (dir) => path.join(dir, "skills/cube-mode/scripts/bootstrap.ts");
  const run = scratch((dir) => fs.writeFileSync(file(dir), fs.readFileSync(file(dir), "utf8").replace("cube-mode-tools", `${C}-tools`)));
  assert.equal(run.status, 1);
  assert.match(run.stderr, /skills\/cube-mode\/scripts\/bootstrap\.ts:\d+: retired branding/);
});
test("retired branding outside skills/ fails the checker", () => {
  const run = scratch((dir) => fs.appendFileSync(path.join(dir, "README.md"), `\nPorted from ${cap(C)}.\n`));
  assert.equal(run.status, 1);
  assert.match(run.stderr, /README\.md:\d+: retired branding/);
});
test("a path with retired branding fails the checker", () => {
  const run = scratch((dir) => fs.renameSync(path.join(dir, "skills/cube-mode/agents/cube-mode-agent.md"), path.join(dir, `skills/cube-mode/agents/${P}-agent.md`)));
  assert.equal(run.status, 1);
  assert.match(run.stderr, /agents\/[^:]+-agent\.md: the path carries retired branding/);
});
test("retired branding beside an allowed identifier fails the checker", () => {
  const file = (dir) => path.join(dir, "skills/cube-mode/scripts/watch-pr/github.ts");
  const run = scratch((dir) => fs.appendFileSync(file(dir), `\n// ${cap(C)} review app\n`));
  assert.equal(run.status, 1);
  assert.match(run.stderr, /watch-pr\/github\.ts:\d+: retired branding/);
});
