// The handoff rule (skills/cube-mode/references/cube.md, Handoff and
// Independent review) as
// keyword patterns. These catch wordings that offer a thread's own pass in
// place of another agent, or ask OptChat to read a diff it cannot open.
// They are a regression net, not a proof: a substitute worded some other
// way passes them, so the rule still needs a semantic review.
export const SUBSTITUTES = [
  /self-review, not independent/i,
  /in-thread form/i,
  /single-agent (form|version)/i,
  /passes in a thread/i,
  /as its own pass/i,
  /one pass at a time/i,
  /run the (same roles|three lenses) yourself/i,
  /runs the pass itself/i,
  /label+ed self[- ]?pass/i,
  /review (it|them) yourself/i,
  /review your own (diff|attempts?|work|change|code)/i,
  /as a reviewer would/i,
  /lead'?s discipline over your own/i,
  /you own your diff/i,
  /(?<!\b(?:not|never) )\b(run|play|do)s? (the )?(roles|lenses|explorers|investigators|adversar\w+|candidates|workers|slices)\b[^.]{0,30}\b(yourself|itself)\b/i,
  /OptChat(?![^.]*\bcannot\b)[^.]{0,60}\b(reads?|opens?|inspects?)\b[^.]{0,30}\bdiffs?\b/i,
  /(?<!\b(?:not|never) )\b(run|play|write|do)s? (all|each|every one|both) (of )?(the )?(\w+ ){0,2}(roles|lenses|explorers|investigators|adversar\w+|candidates|workers|slices|reviewers|runners)\b(?![^.]*\bhandoff\b)/i,
  /(?<!\b(?:not|never) )\b(give|hand)s? one thread (a |the )?(whole|entire)\b/i,
  /(?<!\b(?:not|never) )\bacts? as (the |its own )?(judge|verifier|reviewer|synthesizer|explainer|adversary)\b/i,
];
export const DELEGATES = /subagent|\bspawn|fan (them )?out|comment-sicko|in parallel|\b(Task) (call|tool|prompt)|`Task`/i;
export const substitutesIn = (text) => SUBSTITUTES.filter((re) => re.test(text));
