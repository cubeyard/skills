### Runtime forensics

**You own the diagnosis. Instrument the live process, don't theorize from source.** The deliverable is a cited diagnosis, not a fix.

<!-- cube-adapt M12. Intent: drive the real surface the user sees. Cube: cursor-team-kit's control skills are not installed. Kept: the real-surface rule. Now: the project's verify-* skill, else Playwright's Chromium for web UIs or the shell for CLIs, in the thread's machine. Cost: native desktop and mobile surfaces are out of a thread's reach; say so rather than pass on a proxy. -->
1. Capture the live signal on the matching surface via the control surface: a CPU profile for a spinning process, a heap snapshot for a leak, a CDP trace for a visual glitch. A real artifact, not a guess.
2. Reduce the artifact to the smoking gun: the function on the hot path, the retainer chain from the leaked object to a GC root, the loop firing without input.
   <!-- cube-adapt M2. Intent: keep the raw artifact out of the deciding context. Cube: a thread cannot hand it to a subagent. Kept: only the reduced finding enters your context. Now: reduce the artifact with a script (jq, sqlite, a parser) and read the script's output. Cost: none; the script is also a lever a reviewer reruns. -->
   Parse large artifacts with a script that reduces them (the **guard-the-context-window** principle skill), and read only the reduced finding.
3. Prove the mechanism before believing it. Inject instrumentation via CDP eval on the running process, or hotfix the live code without reloading, to confirm the hypothesis cheaply.
4. Map the finding back to source: file, symbol, the line that allocates or schedules.
5. Throughput checkpoint stays one line: `throughput checkpoint: n/a, read-only forensics`.

**Reply:** the signal captured, the reduced finding, how you proved the mechanism, the source location, artifact paths. No fix unless asked. Hand back to Bug fix or Perf once the cause is known.
