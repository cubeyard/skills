### Investigation

**You own the answer. Plan, route, write.**

Investigation requests are read-only. They produce a cited explanation or a recommendation, not a code change.

1. Route through the **how** skill. For motivation questions, also route through the **why** skill.
2. Throughput checkpoint stays one line: `throughput checkpoint: n/a, read-only investigation`.
3. Produce the `how`-shaped output (Overview / Key Concepts / How It Works / Where Things Live / Gotchas), or a recommendation with a tradeoffs table if the request is a decision between alternatives.
4. Apply the **unslop** skill to the reply.

<!-- cube-adapt M1 M9. Intent: an investigation never turns into a change by itself. Cube: a thread's task is its brief; a change is a new task OptChat starts. Kept: read-only, and the re-route. Now: the thread reports and recommends the next playbook; OptChat re-routes. Cost: none. -->
No PR, no babysit, no `architect` unless the investigation precedes a code change. If it does, hand back in your report (to OptChat, which asks the user) and recommend re-routing to Bug fix or Feature.

**Reply:** the investigation output. For "are we sure?" answers, include your real judgment with reasons. Push back if the premise is wrong (see Autonomy).
