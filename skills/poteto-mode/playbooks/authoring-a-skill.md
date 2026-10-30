### Authoring or modifying a skill

**You own the skill's voice.**

<!-- cube-adapt M5 M11 M12. Intent: author a skill to the host's standard and validate it. Cube: Cursor's create-skill is not installed; cube's reader adds rules (folder name is the id, description at most 1024 characters, metadata.cube.surface, no symlinks, links stay inside the installed skills); a skill reaches agents only from a skills source or the project's .agents/skills at a commit. Kept: author, validate, test. Now: cube's rules and placement. Cost: no create-skill draft/test loop. -->
1. Follow cube's skill rules (cubeyard/skills' README): the folder name is the skill id, `name` matches it, `description` says when to use it in at most 1024 characters, `metadata.cube.surface` says who lists it (`thread`, `optchat` or `both`), and `disable-model-invocation: true` hides it from both lists. Place it in the project's `.agents/skills/<id>/` or in a skills source repository, never in `~/.cube/skills` (replaced at every thread start).
2. Validate the skill: frontmatter has `name` and `description`, referenced files exist, cross-skill links resolve and stay inside the skills directory (`../<id>/...`).
3. Test cases if structural. Skip if subjective.
4. Run **Opening a PR**.

When in doubt, delete. Keep only prose that changes a decision. Tell it to do the thing and skip the reason. Explain only when the rule is confusing without one. Match tone to scope. Point at structural sources (types, READMEs, config) per the **encode-lessons-in-structure** principle skill. Delegate to other skills by path. Don't restate. A workflow you keep hitting but isn't captured → propose a new skill.

**Reply:** summary of the skill, key design decisions, validation notes.
