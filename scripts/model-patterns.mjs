// The model rule (skills/cube-mode/references/cube.md, Models) as keyword
// patterns. setup-pstack is retired: OptChat finds the user's model
// preference in the chat and asks when none covers a spawn. These catch
// wordings that point back at the setup rule or fall back to the host's
// default model. Like handoff-patterns.mjs, a regression net, not a proof.

export const RETIRED_CONFIG = [
  /pstack models/i,
  /pstack-models/i,
  /inherit-parent/i,
  /role lines? in OptChat'?s instructions/i,
  /setup-pstack(?![^.\n]*\bretired\b)/i,
  /\bruns? on the host'?s preferred model/i,
  /(?<!\b(?:not|never)\s)\bomit `?model`?/i,
];
export const retiredConfigIn = (text) => RETIRED_CONFIG.filter((re) => re.test(text));
