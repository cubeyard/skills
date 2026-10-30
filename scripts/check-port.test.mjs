// Regression fixtures for the port checks (node --test scripts/check-port.test.mjs).
import assert from "node:assert/strict";
import { test } from "node:test";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { substitutesIn } from "./handoff-patterns.mjs";
import { retiredConfigIn } from "./model-patterns.mjs";
import { legacyModeIn } from "./legacy-patterns.mjs";

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

// The retired mode name, in any casing or spelling.
const LEGACY_BAD = [
  "A user who asks for `/poteto-mode` means this skill.",
  "Use for /Poteto-Mode (its pstack name).",
  "work in poteto mode",
  "POTETO_MODE",
  "\"name\": \"@cursor-skill/poteto-mode-tools\"",
];
const LEGACY_GOOD = [
  "Use for cube-mode, /cube-mode, poteto, pstack.",
  "poteto's agent style",
  "Brief it from agents/poteto-agent.md.",
];

test("every spelling of the retired mode name is caught", () => {
  for (const line of LEGACY_BAD) assert.ok(legacyModeIn(line), `not caught: ${line}`);
});
test("cube-mode and pstack's other names are not caught", () => {
  for (const line of LEGACY_GOOD) assert.equal(legacyModeIn(line), false, `caught: ${line}`);
});

// The whole checker on a scratch copy: a retired skill that comes back, or
// installed text that sends the user to it, fails the check.
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
function scratch(change) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "check-port-"));
  for (const name of ["scripts", "skills", "upstream", "COVERAGE.md"]) fs.cpSync(path.join(root, name), path.join(dir, name), { recursive: true });
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
  const run = scratch((dir) => fs.cpSync(path.join(dir, "upstream/pstack/skills/setup-pstack"), path.join(dir, "skills/setup-pstack"), { recursive: true }));
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
test("the retired mode name in an installed file fails the checker", () => {
  const run = scratch((dir) => fs.appendFileSync(path.join(dir, "skills/cube-help/SKILL.md"), "\nA user who asks for `/poteto-mode` means cube-mode.\n"));
  assert.equal(run.status, 1);
  assert.match(run.stderr, /cube-help\/SKILL\.md:\d+: mentions the retired mode name/);
});
test("the retired mode name in an installed script fails the checker", () => {
  const file = (dir) => path.join(dir, "skills/cube-mode/scripts/bootstrap.ts");
  const run = scratch((dir) => fs.writeFileSync(file(dir), fs.readFileSync(file(dir), "utf8").replace("cube-mode-tools", "poteto-mode-tools")));
  assert.equal(run.status, 1);
  assert.match(run.stderr, /cube-mode\/scripts\/bootstrap\.ts:\d+: mentions the retired mode name/);
});
