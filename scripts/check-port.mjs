#!/usr/bin/env node
// Checks the pstack port (PORTING.md): installed files carry no port
// commentary, skills/ obeys cube's rules, the handoff and model rules hold,
// and no path or file in the repository carries the retired branding.
//
//   node scripts/check-port.mjs            check, exit 1 on any failure
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { substitutesIn } from "./handoff-patterns.mjs";
import { retiredConfigIn } from "./model-patterns.mjs";
import { brandingIn } from "./branding-patterns.mjs";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const skillsDir = path.join(root, "skills");

// Upstream skills the port retires on purpose (PORTING.md, Retired): the
// folder must not come back.
const RETIRED = {
  "setup-pstack": "retired: cube needs no model setup; OptChat reads the user's model preference from the chat (cube-mode references/cube.md, Models)",
};
// cube's own skills, not ported from pstack.
const CUBE_OWN = new Set(["briefing-a-thread", "opening-a-pull-request", "prove-it-works"]);
// Installed files whose pstack original hands work to another agent
// (handoff-patterns.mjs DELEGATES on the original, PORTING.md, Baseline):
// each must say where the work goes.
const HANDS_OFF = [
  "arena/SKILL.md", "automate-me/SKILL.md", "cube-help/SKILL.md", "cube-mode/SKILL.md",
  "cube-mode/agents/cube-mode-agent.md", "cube-mode/playbooks/autonomous-run.md",
  "cube-mode/playbooks/autopilot-full.md", "cube-mode/playbooks/bug-fix.md", "cube-mode/playbooks/eval.md",
  "cube-mode/playbooks/feature.md", "cube-mode/playbooks/hillclimb.md", "cube-mode/playbooks/multi-phase-plan.md",
  "cube-mode/playbooks/opening-a-pr.md", "cube-mode/playbooks/orchestrate.md", "cube-mode/playbooks/pause-safely.md",
  "cube-mode/playbooks/perf-issue.md", "cube-mode/playbooks/refactoring.md", "cube-mode/playbooks/runtime-forensics.md",
  "cube-mode/playbooks/session-pickup.md", "cube-mode/playbooks/trace-forensics.md",
  "cube-mode/playbooks/worktree-cleanup.md", "figure-it-out/SKILL.md", "how/SKILL.md",
  "how/references/explainer-prompt.md", "how/references/explorer-prompt.md", "interrogate/SKILL.md",
  "ketchup/SKILL.md", "maintain-verification-skill/SKILL.md", "no-comments/SKILL.md",
  "no-comments/agents/comment-sicko.md", "principle-build-the-lever/SKILL.md",
  "principle-guard-the-context-window/SKILL.md", "recall/SKILL.md", "reflect/SKILL.md",
  "reflect/references/divergent-reviewer.md", "reflect/references/judgment-reviewer.md",
  "reflect/references/tooling-reviewer.md", "show-me-your-work/SKILL.md", "swarm/SKILL.md", "teach/SKILL.md",
  "why/SKILL.md", "why/references/investigator-prompt.md", "why/references/source-playbook.md",
];
// Port commentary that must not reach an installed file (PORTING.md,
// "No notes in installed files"): an adaptation note, or a mapping-rule
// label (M1-M13) in Markdown. The reasons live in PORTING.md and git history.
const COMMENTARY = [/cube-adapt/, /\bM(?:1[0-3]|[1-9])\b/];
// cube's limits (cubeyard/cube packages/server/src/skills.ts).
const LIMITS = { skills: 64, files: 2000, bytes: 8 * 2 ** 20, description: 1024, name: 64 };
const ID = /^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/;

const failures = [];
const fail = (message) => failures.push(message);

function walk(dir, base = dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isSymbolicLink()) out.push({ rel: path.relative(base, full), symlink: true });
    else if (entry.isDirectory()) { if (entry.name !== "node_modules" && entry.name !== ".git") out.push(...walk(full, base)); } // a script's local install is not part of the skill
    else out.push({ rel: path.relative(base, full) });
  }
  return out.sort((a, b) => (a.rel < b.rel ? -1 : 1));
}

for (const [id, reason] of Object.entries(RETIRED)) if (!reason || fs.existsSync(path.join(skillsDir, id))) fail(`RETIRED ${id}: needs a reason, and no folder in skills/`);
const skillFiles = walk(skillsDir);

// 1. Each installed file is a plain file free of port commentary.
for (const f of skillFiles) {
  if (f.symlink) { fail(`skills/${f.rel}: a symlink; cube installs plain files only`); continue; }
  const text = fs.readFileSync(path.join(skillsDir, f.rel), "utf8");
  const rules = f.rel.endsWith(".md") ? COMMENTARY : COMMENTARY.slice(0, 1);
  text.split("\n").forEach((line, index) => {
    const hit = rules.find((re) => re.test(line));
    if (hit) fail(`skills/${f.rel}:${index + 1}: port commentary (${hit}); put the reason in PORTING.md, not in an installed file`);
  });
}

// 2. cube's rules for a skill folder, as skills.ts reads them.
function frontmatter(text) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  if (!m) return null;
  const out = {};
  let key = null;
  for (const raw of m[1].split("\n")) {
    if (/^\s*#/.test(raw) || !raw.trim()) continue;
    const kv = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(raw);
    if (kv) { key = kv[1]; out[key] = kv[2]; continue; }
    if (key) out[key] += ` ${raw.trim()}`;
  }
  for (const [k, v] of Object.entries(out)) {
    let value = v.trim();
    if (value === ">-" || value === ">" || value === "|") value = "";
    if (/^".*"$/.test(value)) value = JSON.parse(value);
    out[k] = value.replace(/^>-\s*/, "").trim();
  }
  return out;
}
// metadata.cube.surface as YAML nests it, ignoring comment lines.
function surfaceOf(text) {
  const block = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text)?.[1] ?? "";
  const lines = block.split("\n").filter((l) => l.trim() && !/^\s*#/.test(l));
  let path = [];
  for (const line of lines) {
    const m = /^(\s*)([A-Za-z0-9_-]+):\s*(.*?)\s*$/.exec(line);
    if (!m) continue;
    const depth = m[1].length;
    path = [...path.filter((p) => p.depth < depth), { depth, key: m[2] }];
    if (path.map((p) => p.key).join(".") === "metadata.cube.surface") return m[3].replace(/^["']|["']$/g, "");
  }
  return "thread";
}
const ids = fs.readdirSync(skillsDir).filter((name) => fs.statSync(path.join(skillsDir, name)).isDirectory()).sort();
const listed = { thread: [], optchat: [] };
let files = 0, bytes = 0;
for (const id of ids) {
  if (!ID.test(id)) fail(`skills/${id}: not a skill id`);
  const file = path.join(skillsDir, id, "SKILL.md");
  if (!fs.existsSync(file)) { fail(`skills/${id}: no SKILL.md`); continue; }
  const text = fs.readFileSync(file, "utf8");
  const fm = frontmatter(text);
  if (!fm) { fail(`skills/${id}/SKILL.md: no frontmatter`); continue; }
  if (!fm.name || fm.name.length > LIMITS.name) fail(`skills/${id}: name must be 1 to ${LIMITS.name} characters`);
  if (fm.name && fm.name !== id) fail(`skills/${id}: name ${fm.name} is not the folder name`);
  if (!fm.description || fm.description.length > LIMITS.description) fail(`skills/${id}: description must be 1 to ${LIMITS.description} characters (${fm.description?.length})`);
  const surface = surfaceOf(text);
  if (!["thread", "optchat", "both"].includes(surface)) fail(`skills/${id}: surface ${surface}`);
  const hidden = fm["disable-model-invocation"] === "true";
  if (!hidden && surface !== "optchat") listed.thread.push(id);
  if (!hidden && surface !== "thread") listed.optchat.push(id);
  for (const f of walk(path.join(skillsDir, id))) { files++; bytes += fs.statSync(path.join(skillsDir, id, f.rel)).size; }
}
// OptChat's skill() answers 30,000 characters at once (SKILL_PAGE); a
// listed SKILL.md that fits is read in one call.
for (const id of listed.optchat) {
  const chars = [...fs.readFileSync(path.join(skillsDir, id, "SKILL.md"), "utf8")].length;
  if (chars > 30000) fail(`skills/${id}/SKILL.md: ${chars} characters; OptChat reads 30,000 at a time`);
}
if (ids.length > LIMITS.skills) fail(`${ids.length} skills; a thread installs at most ${LIMITS.skills}`);
if (files > LIMITS.files || bytes > LIMITS.bytes) fail(`${files} files and ${bytes} bytes; a thread installs at most ${LIMITS.files} and ${LIMITS.bytes}`);

// 4. The handoff rule (references/cube.md, Handoff and Independent review): a thread never
// stands in for an agent pstack requires, and OptChat never reads a diff.
// Every installed Markdown file is scanned for known substitute wordings
// (scripts/handoff-patterns.mjs, with fixtures in check-port.test.mjs), and
// every one whose pstack original hands work to another agent (HANDS_OFF)
// must say where it goes. Keyword checks cannot prove the rule; they keep known regressions out.
for (const f of skillFiles) {
  if (!f.rel.endsWith(".md") || CUBE_OWN.has(f.rel.split("/")[0])) continue;
  for (const re of substitutesIn(fs.readFileSync(path.join(skillsDir, f.rel), "utf8"))) fail(`skills/${f.rel}: offers a substitute for another agent or a diff OptChat cannot read (${re}); hand off instead (cube.md, Handoff)`);
}
// 5. The model rule (references/cube.md, Models): no installed file points
// at the retired setup or falls back to the host's default model
// (scripts/model-patterns.mjs, fixtures in check-port.test.mjs).
for (const f of skillFiles) {
  if (!f.rel.endsWith(".md")) continue;
  for (const re of retiredConfigIn(fs.readFileSync(path.join(skillsDir, f.rel), "utf8"))) fail(`skills/${f.rel}: points at the retired model setup or the host default (${re}); follow cube.md, Models`);
}
for (const rel of HANDS_OFF) {
  const full = path.join(skillsDir, rel);
  if (!fs.existsSync(full)) fail(`skills/${rel}: listed in HANDS_OFF but missing`);
  else if (!/handoff|OptChat/i.test(fs.readFileSync(full, "utf8"))) fail(`skills/${rel}: pstack hands work to another agent here, but the port never says where it goes (handoff or OptChat; cube.md, Handoff)`);
}
// 6. The retired branding (PORTING.md, Naming): no path and no file in the
// repository names either retired brand, in any casing or spelling, except
// an identifier an outside system defines (scripts/branding-patterns.mjs,
// fixtures in check-port.test.mjs). The repository root is walked, not only
// skills/, so docs, scripts, CI and notices are covered too.
const repoFiles = walk(root);
for (const f of repoFiles) {
  for (const { match } of brandingIn(f.rel)) fail(`${f.rel}: the path carries retired branding (${JSON.stringify(match)}); rename it`);
  if (f.symlink) continue;
  for (const { line, match } of brandingIn(fs.readFileSync(path.join(root, f.rel), "utf8"), f.rel)) fail(`${f.rel}:${line}: retired branding (${JSON.stringify(match)}); remove it, or list an outside identifier in branding-patterns.mjs`);
}

// 7. Links: a relative link must reach a file cube installs (inside skills/).
const LINK = /\]\(([^)\s]+)\)/g;
let links = 0;
for (const f of skillFiles) {
  if (!f.rel.endsWith(".md")) continue;
  const full = path.join(skillsDir, f.rel);
  const text = fs.readFileSync(full, "utf8").replace(/```[\s\S]*?```/g, "");
  for (const m of text.matchAll(LINK)) {
    const target = m[1].split("#")[0];
    // A bare word (`url` in a template) is a placeholder, not a path.
    if (!target || /^[a-z]+:/.test(target) || target.startsWith("#") || !/[./]/.test(target)) continue;
    links++;
    const resolved = path.resolve(path.dirname(full), target);
    if (!resolved.startsWith(skillsDir + path.sep)) fail(`skills/${f.rel}: link ${m[1]} leaves the installed skills`);
    else if (!fs.existsSync(resolved)) fail(`skills/${f.rel}: link ${m[1]} does not resolve`);
  }
}

console.error(`skills: ${ids.length} (${files} files, ${bytes} bytes); listed to threads: ${listed.thread.join(", ") || "none"}; to OptChat: ${listed.optchat.join(", ") || "none"}`);
console.error(`links: ${links} relative links checked`);
console.error(`branding: ${repoFiles.length} paths and files checked`);
if (failures.length) { console.error(`\n${failures.length} failures:`); for (const f of failures) console.error(`  ${f}`); process.exit(1); }
console.error("ok");
