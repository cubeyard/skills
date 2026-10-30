// Named section references in installed Markdown, for check-port.mjs:
// "(`references/cube.md`, Handoff)", "(briefing-a-thread, Models)" and
// "the Models section of `<path>`" or "of the **<id>** skill".
import fs from "node:fs";
import path from "node:path";

const unfenced = (text) => text.replace(/```[\s\S]*?```/g, "");

export const normalizeSection = (name) => name.trim().toLowerCase().replace(/^the\s+/, "").replace(/[.:]+$/, "").trim();

export function sectionRefsIn(text) {
  const refs = [];
  const body = unfenced(text);
  for (const m of body.matchAll(/\(`?([~\w./-]+\.md|[a-z0-9]+(?:-[a-z0-9]+)*)`?, ((?:the )?[A-Za-z][^(),\n]*?)\)/g)) refs.push({ target: m[1], section: m[2] });
  for (const m of body.matchAll(/the ([A-Z][\w' -]*?) section of (?:the \*\*([a-z0-9-]+)\*\* skill|\[?`([^`]+\.md)`)/g)) refs.push({ target: m[2] ?? m[3], section: m[1] });
  return refs;
}

// The file a reference points at, or null when it names no skill file: a
// skill id, a path relative to the referring file or to its skill's
// folder, or an installed path under ~/.cube/skills/.
export function resolveSectionTarget(target, fromFile, skillsDir, ids) {
  if (!target.endsWith(".md")) return ids.includes(target) ? path.join(skillsDir, target, "SKILL.md") : null;
  if (target.startsWith("~/.cube/skills/")) return path.join(skillsDir, target.slice("~/.cube/skills/".length));
  const skillRoot = path.join(skillsDir, path.relative(skillsDir, fromFile).split(path.sep)[0]);
  const candidates = [path.resolve(path.dirname(fromFile), target), path.resolve(skillRoot, target)];
  return candidates.find((c) => fs.existsSync(c)) ?? candidates[0];
}

// Headings, and unless headingsOnly, bold paragraph labels ("**The review
// handoff.**"), normalized.
export function sectionsOf(text, { headingsOnly = false } = {}) {
  const out = new Set();
  for (const line of unfenced(text).split("\n")) {
    const heading = /^#{1,6}\s+(.+?)\s*$/.exec(line);
    if (heading) out.add(normalizeSection(heading[1]));
    const label = !headingsOnly && /^(?:[-*]\s+|\d+\.\s+)?\*\*([^*]+?)\*\*/.exec(line);
    if (label) out.add(normalizeSection(label[1]));
  }
  return out;
}
