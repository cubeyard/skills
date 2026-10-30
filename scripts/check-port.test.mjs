// Regression fixtures for the handoff patterns (node --test scripts/check-port.test.mjs).
import assert from "node:assert/strict";
import { test } from "node:test";
import { substitutesIn } from "./handoff-patterns.mjs";

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
