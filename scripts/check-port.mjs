#!/usr/bin/env node
// Checks the pstack port (PORTING.md): the baseline is upstream byte for
// byte, every upstream file has a home in skills/, installed files carry no
// port commentary, and skills/ obeys cube's rules.
//
//   node scripts/check-port.mjs            check, exit 1 on any failure
//   node scripts/check-port.mjs --matrix   also print the file coverage table
//   node scripts/check-port.mjs --diff ID  print skills/ID against its baseline
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { DELEGATES, substitutesIn } from "./handoff-patterns.mjs";
import { retiredConfigIn } from "./model-patterns.mjs";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const baseline = path.join(root, "upstream/pstack");
const skillsDir = path.join(root, "skills");
const args = process.argv.slice(2);

// Upstream files that live somewhere else in skills/ (cube has no agent
// definitions: an agent becomes a brief template inside the skill that
// starts it). Every other upstream skill file keeps its path.
// Skills whose folder (id) the port renames; every file keeps its path
// below the folder. The user chose to give the router a cube name
// (PORTING.md, Naming), and its help the matching one; the leaves keep
// upstream's ids.
const RENAMED = { "poteto-mode": "cube-mode", "poteto-help": "cube-help" };
// Upstream skills the port retires on purpose (PORTING.md, Retired): their
// files stay in the baseline only, and the folder must not come back.
const RETIRED = {
  "setup-pstack": "retired: cube needs no model setup; OptChat reads the user's model preference from the chat (cube-mode references/cube.md, Models)",
};
const renamed = (rel) => { const [id, ...rest] = rel.split("/"); return [RENAMED[id] ?? id, ...rest].join("/"); };
const RELOCATED = {
  "agents/poteto-agent.md": "cube-mode/agents/poteto-agent.md",
  "agents/comment-sicko.md": "no-comments/agents/comment-sicko.md",
};
// cube's own skills, not ported from pstack.
const CUBE_OWN = new Set(["briefing-a-thread", "opening-a-pull-request", "prove-it-works"]);
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
    else if (entry.isDirectory()) { if (entry.name !== "node_modules") out.push(...walk(full, base)); } // a script's local install is not part of the skill
    else out.push({ rel: path.relative(base, full) });
  }
  return out.sort((a, b) => (a.rel < b.rel ? -1 : 1));
}
const sha256 = (file) => createHash("sha256").update(fs.readFileSync(file)).digest("hex");

// 1. The baseline is what upstream published.
const manifest = new Map(fs.readFileSync(path.join(root, "upstream/pstack.sha256"), "utf8").trim().split("\n")
  .map((line) => { const [hash, ...rest] = line.split("  "); return [rest.join("  "), hash]; }));
const baselineFiles = walk(baseline).map((f) => f.rel);
for (const rel of baselineFiles) if (manifest.get(rel) !== sha256(path.join(baseline, rel))) fail(`baseline ${rel}: sha256 differs from upstream/pstack.sha256`);
for (const rel of manifest.keys()) if (!baselineFiles.includes(rel)) fail(`baseline ${rel}: listed in the manifest but missing`);
const tree = spawnSync("git", ["-C", root, "rev-parse", "HEAD:upstream/pstack"], { encoding: "utf8" });
const EXPECTED_TREE = "4719e1c4b4c43bac85d4206a8b41dd2899769c1c";
if (tree.status === 0 && tree.stdout.trim() !== EXPECTED_TREE) fail(`baseline git tree ${tree.stdout.trim()} is not upstream's ${EXPECTED_TREE}`);

// 2. Every upstream skill file and agent maps to one file under skills/,
// except a retired skill's.
const pairs = [];
const matrix = [];
for (const rel of baselineFiles) {
  let target;
  const retired = rel.startsWith("skills/") && RETIRED[rel.split("/")[1]];
  if (retired) { matrix.push({ from: rel, to: "(none)", state: retired }); continue; }
  if (rel.startsWith("skills/")) target = renamed(rel.slice("skills/".length));
  else if (RELOCATED[rel]) target = RELOCATED[rel];
  else continue; // README, guide, automations, assets: baseline only (PORTING.md)
  pairs.push({ from: rel, to: target });
}
// pstack's MIT notice travels with every ported skill folder, since cube
// installs each folder on its own.
for (const id of fs.readdirSync(path.join(baseline, "skills")).sort()) if (!RETIRED[id]) pairs.push({ from: "LICENSE", to: `${RENAMED[id] ?? id}/LICENSE` });
for (const [from, to] of Object.entries(RENAMED)) if (!fs.existsSync(path.join(baseline, "skills", from)) || fs.existsSync(path.join(skillsDir, from))) fail(`RENAMED ${from} -> ${to}: the upstream folder must exist and the old id must be gone from skills/`);
for (const [id, reason] of Object.entries(RETIRED)) if (!reason || !fs.existsSync(path.join(baseline, "skills", id)) || fs.existsSync(path.join(skillsDir, id)) || Object.values(RENAMED).includes(id)) fail(`RETIRED ${id}: needs a reason, an upstream folder, and no folder in skills/`);
const mappedTargets = new Set(pairs.map((p) => p.to));
const skillFiles = walk(skillsDir);

// 3. Each changed file is counted; each installed file is free of port commentary.
function hunks(from, to) {
  const result = spawnSync("git", ["diff", "--no-index", "--no-color", "-U0", "--", from, to], { encoding: "utf8", maxBuffer: 64 * 2 ** 20 });
  return result.stdout.split("\n").filter((line) => line.startsWith("@@ ")).length;
}
for (const { from, to } of pairs) {
  const source = path.join(baseline, from);
  const target = path.join(skillsDir, to);
  if (!fs.existsSync(target)) { fail(`${from}: no adapted file at skills/${to}`); matrix.push({ from, to, state: "MISSING" }); continue; }
  if (sha256(source) === sha256(target)) { matrix.push({ from, to, state: "unchanged" }); continue; }
  matrix.push({ from, to, state: `adapted (${hunks(source, target)} hunks)` });
}
for (const f of skillFiles) {
  if (f.symlink) { fail(`skills/${f.rel}: a symlink; cube installs plain files only`); continue; }
  if (!mappedTargets.has(f.rel) && !CUBE_OWN.has(f.rel.split("/")[0])) matrix.push({ from: "(new)", to: f.rel, state: "added" });
  const text = fs.readFileSync(path.join(skillsDir, f.rel), "utf8");
  const rules = f.rel.endsWith(".md") ? COMMENTARY : COMMENTARY.slice(0, 1);
  text.split("\n").forEach((line, index) => {
    const hit = rules.find((re) => re.test(line));
    if (hit) fail(`skills/${f.rel}:${index + 1}: port commentary (${hit}); put the reason in PORTING.md, not in an installed file`);
  });
}

// 4. cube's rules for a skill folder, as skills.ts reads them.
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

// 6. The handoff rule (references/cube.md, Handoff and Independent review): a thread never
// stands in for an agent pstack requires, and OptChat never reads a diff.
// Every installed Markdown file is scanned for known substitute wordings
// (scripts/handoff-patterns.mjs, with fixtures in check-port.test.mjs), and
// every one whose upstream hands work to another agent must say where it
// goes. Keyword checks cannot prove the rule; they keep known regressions out.
for (const f of skillFiles) {
  if (!f.rel.endsWith(".md") || CUBE_OWN.has(f.rel.split("/")[0])) continue;
  for (const re of substitutesIn(fs.readFileSync(path.join(skillsDir, f.rel), "utf8"))) fail(`skills/${f.rel}: offers a substitute for another agent or a diff OptChat cannot read (${re}); hand off instead (cube.md, Handoff)`);
}
// 7. The model rule (references/cube.md, Models): no installed file points
// at the retired setup or falls back to the host's default model
// (scripts/model-patterns.mjs, fixtures in check-port.test.mjs).
for (const f of skillFiles) {
  if (!f.rel.endsWith(".md")) continue;
  for (const re of retiredConfigIn(fs.readFileSync(path.join(skillsDir, f.rel), "utf8"))) fail(`skills/${f.rel}: points at the retired model setup or the host default (${re}); follow cube.md, Models`);
}
for (const { from, to } of pairs) {
  if (!to.endsWith(".md")) continue;
  const full = path.join(skillsDir, to);
  if (!fs.existsSync(full)) continue;
  if (DELEGATES.test(fs.readFileSync(path.join(baseline, from), "utf8")) && !/handoff|OptChat/i.test(fs.readFileSync(full, "utf8"))) fail(`skills/${to}: upstream hands work to another agent here, but the port never says where it goes (handoff or OptChat; cube.md, Handoff)`);
}

// 5. Links: a relative link must reach a file cube installs (inside skills/).
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

if (args[0] === "--diff") {
  const id = args[1];
  const upstreamId = Object.entries(RENAMED).find(([, to]) => to === id)?.[0] ?? id;
  const result = spawnSync("git", ["diff", "--no-index", "--color=always", "--", path.join(baseline, "skills", upstreamId), path.join(skillsDir, id)], { stdio: "inherit" });
  process.exit(result.status === 1 ? 0 : result.status);
}
// Upstream files that are not skills: why each stays in the baseline only.
const BASELINE_ONLY = [
  [/^README\.md$|^docs\/guide\//, "baseline only: Cursor user docs, not installed; skills link the pinned public copy (M13)"],
  [/^docs\/harness\//, "baseline only: upstream's Claude Code adapter; poteto-mode/references/cube.md is cube's (M1-M13)"],
  [/^automations\//, "baseline only: Cursor Automations (Slack-triggered agents); cube has no trigger that starts an agent (M12, PORTING.md gap G3)"],
  [/^plugin\.json$|^\.cursor-plugin\/|^assets\//, "baseline only: Cursor/agent-plugins packaging; cube installs skills from git folders (M5)"],
  [/^LICENSE$/, "copied unchanged into every ported skill folder (rows above), and named in THIRD_PARTY_NOTICES.md"],
  [/^\.gitignore$/, "baseline only: ignores node_modules and logs in the plugin tree"],
];
// Every upstream file outside skills/ and agents/ needs a stated reason
// (checked on every run, so CI catches a new upstream file).
for (const rel of baselineFiles) {
  if (rel.startsWith("skills/") || RELOCATED[rel]) continue;
  if (!BASELINE_ONLY.some(([re]) => re.test(rel))) fail(`baseline ${rel}: neither mapped into skills/ nor explained in BASELINE_ONLY`);
}
// COVERAGE.md is this table; it must not go stale.
const table = [];
const row = (line) => table.push(line);
row("| upstream `pstack/` file | `skills/` file | state |"); row("| --- | --- | --- |");
for (const r of matrix) row(`| ${r.from} | ${r.to} | ${r.state} |`);
const coverage = path.join(root, "COVERAGE.md");
if (fs.existsSync(coverage) && !args.includes("--matrix")) {
  const rows = fs.readFileSync(coverage, "utf8").split("\n").filter((l) => l.startsWith("| ") && !l.startsWith("| upstream `pstack/` file") && !l.startsWith("| ---") && !/^\| [^|]+ \| \| /.test(l));
  const want = table.slice(2);
  if (rows.join("\n") !== want.join("\n")) fail("COVERAGE.md is stale: regenerate it with --matrix");
}
if (args.includes("--matrix")) {
  console.log("| upstream `pstack/` file | `skills/` file | state |\n| --- | --- | --- |");
  for (const row of matrix) console.log(`| ${row.from} | ${row.to} | ${row.state} |`);
  for (const rel of baselineFiles) {
    if (rel.startsWith("skills/") || RELOCATED[rel]) continue;
    const reason = BASELINE_ONLY.find(([re]) => re.test(rel));
    console.log(`| ${rel} | | ${reason ? reason[1] : "UNEXPLAINED"} |`);
  }
}
const changed = matrix.filter((r) => r.state.startsWith("adapted")).length;
const same = matrix.filter((r) => r.state === "unchanged").length;
console.error(`baseline: ${baselineFiles.length} files checked against the manifest`);
console.error(`mapped: ${pairs.length} upstream files -> ${changed} adapted, ${same} unchanged, ${matrix.filter((r) => r.state === "added").length} added in the port`);
console.error(`skills: ${ids.length} (${files} files, ${bytes} bytes); listed to threads: ${listed.thread.join(", ") || "none"}; to OptChat: ${listed.optchat.join(", ") || "none"}`);
console.error(`links: ${links} relative links checked`);
if (failures.length) { console.error(`\n${failures.length} failures:`); for (const f of failures) console.error(`  ${f}`); process.exit(1); }
console.error("ok");
