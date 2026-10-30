// Regression fixtures for the port checks (node --test scripts/check-port.test.mjs).
import assert from "node:assert/strict";
import { test } from "node:test";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { substitutesIn } from "./handoff-patterns.mjs";
import { retiredConfigIn } from "./model-patterns.mjs";
import { BRANDS, REVIEW_BOT, STACK, brandingIn } from "./branding-patterns.mjs";

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
  "A thread plays all three arena candidates in turn.",
  "Give one thread the whole arena: it writes the candidates, judges them and grafts the winner.",
  "The implementer acts as the judge too.",
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
  "Never give one thread a whole multi-thread workflow, and never let one thread play several of its roles in turn.",
  "Spawn all N candidate threads in one `spawn` call.",
  "Never play those agents yourself, in parallel or in turn, and never label your own pass as one.",
  "Do the part the skill gives a thread, such as framing or a rubric, then report a handoff with ready briefs.",
];

test("every known substitute wording is caught", () => {
  for (const line of BAD) assert.ok(substitutesIn(line).length > 0, `not caught: ${line}`);
});
test("the port's own wordings are not caught", () => {
  for (const line of GOOD) assert.deepEqual(substitutesIn(line), [], `caught: ${line}`);
});

// The model rule (references/cube.md, Models): the model setup skill is
// retired (its name is a retired name, below) and an omitted model is the
// host default, not the user's choice.
const RETIRED_BAD = [
  "Use the `arena runners` role line in OptChat's instructions.",
  "An `auto` or `inherit-parent` entry means the host's preferred model.",
  "If that line is missing, omit `model` so the workers run on the host's preferred model.",
  "A role with no line omits model, so the thread runs on the host's preferred model.",
];
const RETIRED_GOOD = [
  "A user who asks for a model setup command gets this answer.",
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

// The retired names, in any casing or spelling. Fixtures are built from
// the name list so that this file passes the check itself.
const [P, C] = BRANDS;
const S = STACK;
const B = REVIEW_BOT;
const cap = (w) => w[0].toUpperCase() + w.slice(1);
const spread = (w, sep) => [...w].join(sep);
const BRAND_BAD = [
  `A user who asks for \`/${P}-mode\` means this skill.`,
  `Use for /${cap(P)}-Mode (its ${S} name).`,
  `work in ${P} mode`,
  `${P.toUpperCase()}_MODE`,
  `"name": "@${C}-skill/cube-mode-tools"`,
  `Use for cube-mode, /cube-mode, ${P}.`,
  `${P}'s agent style`,
  `Brief it from agents/${P}-agent.md.`,
  `ported from ${cap(C)} to cube`,
  `~/.${C}/projects/<slug>/agent-transcripts`,
  `https://github.com/${C}/plugins/tree/main/`,
  `Use for cube-mode, /cube-mode, ${S}.`,
  `Run [\`/setup-${S}\`](../setup-${S}/SKILL.md) in OptChat.`,
  `No \`${S} models\` block in OptChat's instructions means setup hasn't run.`,
  `${S.toUpperCase()}_HOME`,
  `# ${cap(S)} in cube`,
  spread(S, "."),
  `readonly is${cap(B)}: boolean;`,
  `\`${B}ReviewPasses=\${thread.${B}ReviewPasses}\``,
  `per \`../references/${B}-triage.md\`.`,
  `8. **${cap(B)} is triaged skeptically, always.**`,
  `address the ${B.toUpperCase()} comments`,
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
  "cube-mode, Comment Sicko",
  `an u${S} conflict outranks frontier CI`,
  `pending${cap("u" + S)} and u${S}-build`,
  "a cube-mode thread brief",
  `${C.slice(0, 4)} ${C.slice(4)}`,
  `${P.slice(0, 3)} ${P.slice(3)}`,
  "after = page.nextAfter;",
];
const github = "skills/cube-mode/scripts/watch-pr/github.ts";

test("every spelling of a retired name is caught", () => {
  for (const line of BRAND_BAD) assert.ok(brandingIn(line).length > 0, `not caught: ${JSON.stringify(line)}`);
});
test("text without a retired name is not caught", () => {
  for (const line of BRAND_GOOD) assert.deepEqual(brandingIn(line), [], `caught: ${line}`);
});
test("an outside identifier is allowed only in its own file, and nothing else there", () => {
  const field = `pageInfo { hasNextPage end${cap(C)} }`;
  assert.deepEqual(brandingIn(field, github), []);
  assert.equal(brandingIn(field, "skills/cube-mode/SKILL.md").length, 1);
  assert.equal(brandingIn(`author === "${C}"`, github).length, 1, "the review app's login is no longer exempt");
  assert.equal(brandingIn(`${cap(C)} built this`, github).length, 1);
  assert.equal(brandingIn(`author === "${P}"`, github).length, 1);
});
test("matches report their line", () => {
  assert.deepEqual(brandingIn(`one\ntwo ${P}\nthree`).map((m) => m.line), [2]);
});

// The whole checker on a scratch copy: a retired skill that comes back,
// installed text that sends the user to it, a missing or changed MIT notice,
// or a retired name anywhere in the repository fails the check.
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
function scratch(change) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "check-port-"));
  for (const name of ["scripts", "skills", "README.md", "THIRD_PARTY_NOTICES.md"]) fs.cpSync(path.join(root, name), path.join(dir, name), { recursive: true });
  change(dir);
  const run = spawnSync(process.execPath, [path.join(dir, "scripts/check-port.mjs")], { encoding: "utf8" });
  fs.rmSync(dir, { recursive: true, force: true });
  return run;
}

test("the unchanged port passes the checker", () => {
  const run = scratch(() => {});
  assert.equal(run.status, 0, run.stderr);
});
test("the retired model setup skill that comes back fails the checker", () => {
  const id = `setup-${S}`;
  const run = scratch((dir) => { fs.mkdirSync(path.join(dir, "skills", id)); fs.writeFileSync(path.join(dir, "skills", id, "SKILL.md"), `---\nname: ${id}\ndescription: x\n---\n`); });
  assert.equal(run.status, 1);
  assert.match(run.stderr, /skills\/[^:]+\/SKILL\.md: the path carries a retired name/);
});
test("installed text that sends the user to the retired setup fails the checker", () => {
  const run = scratch((dir) => fs.appendFileSync(path.join(dir, "skills/cube-mode/references/cube.md"), `\nRun \`/setup-${S}\` to pick models.\n`));
  assert.equal(run.status, 1);
  assert.match(run.stderr, /cube-mode\/references\/cube\.md:\d+: retired name/);
});
test("installed text that falls back to the host's model fails the checker", () => {
  const run = scratch((dir) => fs.appendFileSync(path.join(dir, "skills/cube-mode/references/cube.md"), "\nIf no preference covers it, omit `model`.\n"));
  assert.equal(run.status, 1);
  assert.match(run.stderr, /cube-mode\/references\/cube\.md: points at the retired model setup or the host default/);
});
test("a removed review-bot contract that comes back fails the checker", () => {
  const file = (dir) => path.join(dir, "skills/cube-mode/scripts/watch-pr/types.ts");
  const run = scratch((dir) => fs.writeFileSync(file(dir), fs.readFileSync(file(dir), "utf8").replace("  readonly firstComment: ReviewComment | null;\n}", `  readonly firstComment: ReviewComment | null;\n  readonly is${cap(B)}: boolean;\n}`)));
  assert.equal(run.status, 1);
  assert.match(run.stderr, /watch-pr\/types\.ts:\d+: retired name/);
});
test("the removed review-bot rubric that comes back fails the checker", () => {
  const run = scratch((dir) => fs.writeFileSync(path.join(dir, `skills/cube-mode/references/${B}-triage.md`), "# Triage\n"));
  assert.equal(run.status, 1);
  assert.match(run.stderr, /references\/[^:]+-triage\.md: the path carries a retired name/);
});
test("a ported skill without its LICENSE fails the checker", () => {
  const run = scratch((dir) => fs.rmSync(path.join(dir, "skills/how/LICENSE")));
  assert.equal(run.status, 1);
  assert.match(run.stderr, /skills\/how\/LICENSE: missing/);
});
test("a changed MIT notice fails the checker", () => {
  const run = scratch((dir) => fs.writeFileSync(path.join(dir, "skills/how/LICENSE"), fs.readFileSync(path.join(dir, "skills/how/LICENSE"), "utf8").replace("Lauren Tan", "Someone Else")));
  assert.equal(run.status, 1);
  assert.match(run.stderr, /skills\/how\/LICENSE: not the MIT notice byte for byte/);
});
test("THIRD_PARTY_NOTICES.md without the full MIT notice fails the checker", () => {
  const file = (dir) => path.join(dir, "THIRD_PARTY_NOTICES.md");
  const run = scratch((dir) => fs.writeFileSync(file(dir), fs.readFileSync(file(dir), "utf8").replace("Copyright (c) 2026 Lauren Tan", "Copyright (c) 2026")));
  assert.equal(run.status, 1);
  assert.match(run.stderr, /THIRD_PARTY_NOTICES\.md: must quote the MIT notice in full/);
});
test("cube's own skills need no LICENSE", () => {
  const run = scratch((dir) => assert.equal(fs.existsSync(path.join(dir, "skills/prove-it-works/LICENSE")), false));
  assert.equal(run.status, 0, run.stderr);
});
test("port commentary in an installed file fails the checker", () => {
  const run = scratch((dir) => fs.appendFileSync(path.join(dir, "skills/cube-help/SKILL.md"), "\n<!-- cube-adapt M4. Intent: x. -->\n"));
  assert.equal(run.status, 1);
  assert.match(run.stderr, /cube-help\/SKILL\.md:\d+: port commentary/);
});
test("a retired name in an installed file fails the checker", () => {
  const run = scratch((dir) => fs.appendFileSync(path.join(dir, "skills/cube-help/SKILL.md"), `\nA user who asks for \`/${P}-help\` means cube-help.\n`));
  assert.equal(run.status, 1);
  assert.match(run.stderr, /skills\/cube-help\/SKILL\.md:\d+: retired name/);
});
test("a retired name in an installed script fails the checker", () => {
  const file = (dir) => path.join(dir, "skills/cube-mode/scripts/bootstrap.ts");
  const run = scratch((dir) => fs.writeFileSync(file(dir), fs.readFileSync(file(dir), "utf8").replace("cube-mode-tools", `${C}-tools`)));
  assert.equal(run.status, 1);
  assert.match(run.stderr, /skills\/cube-mode\/scripts\/bootstrap\.ts:\d+: retired name/);
});
test("a retired name outside skills/ fails the checker", () => {
  const run = scratch((dir) => fs.appendFileSync(path.join(dir, "README.md"), `\nPorted from ${cap(C)}.\n`));
  assert.equal(run.status, 1);
  assert.match(run.stderr, /README\.md:\d+: retired name/);
});
test("a path with a retired name fails the checker", () => {
  const run = scratch((dir) => fs.renameSync(path.join(dir, "skills/cube-mode/agents/cube-mode-agent.md"), path.join(dir, `skills/cube-mode/agents/${P}-agent.md`)));
  assert.equal(run.status, 1);
  assert.match(run.stderr, /agents\/[^:]+-agent\.md: the path carries a retired name/);
});
test("a retired name beside an allowed identifier fails the checker", () => {
  const file = (dir) => path.join(dir, "skills/cube-mode/scripts/watch-pr/github.ts");
  const run = scratch((dir) => fs.appendFileSync(file(dir), `\n// ${cap(C)} review app\n`));
  assert.equal(run.status, 1);
  assert.match(run.stderr, /watch-pr\/github\.ts:\d+: retired name/);
});

// The role split: briefing-a-thread owns orchestration, cube-mode is the
// thread's, and a section that moves takes its references along.
test("a reference to a section the target does not have fails the checker", () => {
  const run = scratch((dir) => fs.appendFileSync(path.join(dir, "skills/arena/SKILL.md"), "\nPick runners per the Models section of `../cube-mode/references/cube.md`.\n"));
  assert.equal(run.status, 1);
  assert.match(run.stderr, /skills\/arena\/SKILL\.md: refers to section "Models" of cube-mode\/references\/cube\.md/);
});
test("an OptChat section copied back into cube-mode fails the checker", () => {
  const run = scratch((dir) => fs.appendFileSync(path.join(dir, "skills/cube-mode/references/cube.md"), "\n## Models\n\nOnly OptChat chooses a model.\n"));
  assert.equal(run.status, 1);
  assert.match(run.stderr, /section "Models" must be a heading in briefing-a-thread\/SKILL\.md only/);
});
test("cube-mode listed to OptChat fails the checker", () => {
  const file = (dir) => path.join(dir, "skills/cube-mode/SKILL.md");
  const run = scratch((dir) => fs.writeFileSync(file(dir), fs.readFileSync(file(dir), "utf8").replace("surface: thread", "surface: both")));
  assert.equal(run.status, 1);
  assert.match(run.stderr, /skills\/cube-mode: surface must be thread/);
});
test("a multi-thread workflow briefing-a-thread does not list fails the checker", () => {
  const file = (dir) => path.join(dir, "skills/briefing-a-thread/SKILL.md");
  const run = scratch((dir) => fs.writeFileSync(file(dir), fs.readFileSync(file(dir), "utf8").replace(/^\| arena \|.*\n/m, "")));
  assert.equal(run.status, 1);
  assert.match(run.stderr, /the multi-thread workflow arena is not listed/);
});
test("a multi-thread workflow that lets one thread play its roles fails the checker", () => {
  const run = scratch((dir) => fs.appendFileSync(path.join(dir, "skills/arena/SKILL.md"), "\nIn a thread, write all the candidates on one branch and pick the best.\n"));
  assert.equal(run.status, 1);
  assert.match(run.stderr, /skills\/arena\/SKILL\.md: offers a substitute for another agent/);
});
test("a thread preamble that drops the role-only clause fails the checker", () => {
  const file = (dir) => path.join(dir, "skills/cube-mode/agents/cube-mode-agent.md");
  const run = scratch((dir) => fs.writeFileSync(file(dir), fs.readFileSync(file(dir), "utf8").replace("start no other agent and ", "")));
  assert.equal(run.status, 1);
  assert.match(run.stderr, /cube-mode-agent\.md: lost a clause the role split needs/);
});
test("a brief guide that copies history instead of pointing into the chat view fails the checker", () => {
  const file = (dir) => path.join(dir, "skills/briefing-a-thread/SKILL.md");
  const run = scratch((dir) => fs.writeFileSync(file(dir), fs.readFileSync(file(dir), "utf8").replaceAll("memory_zoom", "the chat")));
  assert.equal(run.status, 1);
  assert.match(run.stderr, /briefing-a-thread\/SKILL\.md: lost a clause the role split needs \(\/memory_zoom\/\)/);
});
