---
name: prove-it-works
description: Check finished work against the real thing before reporting it done, and say which results are real and which are mocked. Use before claiming a change works, a test passes or a bug is fixed.
---

# Prove it works

Before you report a change as done, check the real thing, not a stand-in.

- Run the code path you changed, the way its users run it. A clean typecheck
  or build is not proof that it works.
- Read the actual value: the file on disk, the command's output, the
  response body. Do not infer it from a log line, a timestamp or your own
  earlier message.
- A test that would still pass if your change returned nothing proves
  nothing. Assert a literal expected value.
- When a check fails, suspect the check first, then the system.

## Report

For every claim in your report, say how you know it:

- **ran**: you ran it here and saw the result (name the command);
- **mocked**: it ran against a fake, a fixture or a stub (name which);
- **not run**: you could not run it (say why, and what would run it).

Never turn "not run" into "should work". If a test failed, quote the failure.
