# upstream: pstack as published

`pstack/` is an unmodified copy of the `pstack/` directory of
[cursor/plugins](https://github.com/cursor/plugins), the agent workflow
stack by Lauren Tan (poteto), that cube's skills under `../skills/` are
ported from. Nothing here is installed: cube installs only folders under
`skills/` (the default source's `path`), so these originals, written for
Cursor's harness, never reach a thread or OptChat.

| | |
| --- | --- |
| repository | `https://github.com/cursor/plugins` |
| commit | `4dd1d05818d19792e7cd6e818f1667f95f7e1dbe` (default branch tip, 2026-10-29) |
| last commit touching `pstack/` | `c742dd61706fbacc1b95f1a20b7b988cf096ce6c` (2026-10-27, #1043) |
| `pstack/` git tree | `4719e1c4b4c43bac85d4206a8b41dd2899769c1c` (same at both commits) |
| plugin version | `0.15.36` (`pstack/plugin.json`) |
| files | 573, each with its sha256 in [`pstack.sha256`](pstack.sha256) |
| license | MIT, Copyright (c) 2026 Lauren Tan, [`pstack/LICENSE`](pstack/LICENSE) |

## Checking fidelity

The copy is byte for byte: git computes the same tree for it as for
upstream's `pstack/`.

```sh
git rev-parse HEAD:upstream/pstack            # 4719e1c4b4c43bac85d4206a8b41dd2899769c1c
git -C <cursor/plugins clone> rev-parse 4dd1d05818d19792e7cd6e818f1667f95f7e1dbe:pstack
(cd upstream/pstack && sha256sum -c ../pstack.sha256)
node scripts/check-port.mjs                    # also checks both
```

## Why this commit, not the one a cube had configured

A cube that had added cursor/plugins as a skills source pinned
`df581122cde17e6e27686b5a448bde23e4ad4318` (2026-10-05, 51 skills).
The tip has 58: it adds `create-formal-verification-skill`,
`in-your-own-words`, `ketchup`, `ketchup-video`,
`maintain-formal-verification-skill`, `sharpen` and `statechart`, and
updates the rest. The port takes the newest published stack so that
nothing the author ships is missing; `PORTING.md` lists every skill.

## Updating

To port a newer pstack: replace `pstack/` with the new commit's
`pstack/` (`git archive <commit> pstack | tar -x`), regenerate
`pstack.sha256`, update the table above, then run
`node scripts/check-port.mjs --diff` to see every upstream change beside
the adapted skill it lands in.
