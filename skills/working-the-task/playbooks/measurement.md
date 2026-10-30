# Measure

Tie every claim about speed or size to a measurement, not to reading
source.

1. Take a baseline on the real path, with a run count and spread. Name
   what limits it (CPU, a lock, the disk, the network, the load
   generator) from a profile or counters, not from a guess.
2. Rule out that the number measured something else: errors, cached or
   skipped work, an untuned side, noise, a piece too small to matter end
   to end.
3. If the task includes a fix, try the cheapest idea first: do not do
   the work, do it once, do less, do it later, do it concurrently, do it
   cheaper. Stop when one meets the target.
4. Measure after each attempt the same way as the baseline. Keep only
   the attempts the numbers support.

Report: baseline, after, delta, run count and spread, the limiter, the
commands and where the raw results are.
