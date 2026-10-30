// The retired mode name (PORTING.md, Naming): cube-mode is the only name.
// The upstream baseline keeps the old one; no installed file may mention it,
// as a trigger, an alias or anywhere else.

export const LEGACY_MODE = /poteto[\s_-]*mode/i;
export const legacyModeIn = (text) => LEGACY_MODE.test(text);
