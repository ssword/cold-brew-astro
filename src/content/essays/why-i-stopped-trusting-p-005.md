---
title: Why I stopped trusting p < 0.05
excerpt: The threshold was never a verdict. It was a convention we agreed to forget was a convention.
pubDate: 2026-04-08
status: brewed
tags:
  - statistics
---

I was taught the ritual before I was taught the meaning. Run the test, read off
the p-value, and if it falls under $0.05$ you have a result; if it does not, you
have nothing. The number felt like a verdict handed down by the data itself. It
took me an embarrassingly long time to see that the line was drawn by people, in
the 1920s, as a rough convenience, and that we had quietly promoted a convenience
into a law of nature.

Start with what the number actually says. A p-value is the probability of seeing
data at least this extreme *if the null hypothesis were true*. It is a statement
about the data given a hypothesis. It is emphatically not the thing we want,
which is the probability of the hypothesis given the data. We read $p < 0.05$ and
hear "95% chance the effect is real," and that sentence is not just imprecise, it
is a different conditional pointed the other way.

The threshold does its real damage downstream, where it turns a continuous
measure of surprise into a binary stamp. A study at $p = 0.049$ and a study at
$p = 0.051$ are describing nearly identical evidence, and we send one to
publication and the other to a drawer. The drawer is the problem. If only the
lucky side of the line gets reported, the published record is a biased sample of
reality — every honest null result that never saw daylight is missing from the
average.

> The line does not separate true from false. It separates published from
> forgotten, and we have been reading the second distinction as the first.

You can watch the trouble appear with nothing but a coin's worth of randomness.
Run enough tests on pure noise and, by construction, one in twenty clears the
bar. Test twenty dead ideas and you should *expect* a "discovery," with no
discovery anywhere in sight.

```python
import numpy as np
from scipy import stats

rng = np.random.default_rng(0)
hits = 0
for _ in range(20):                       # twenty effects that don't exist
    a, b = rng.normal(size=30), rng.normal(size=30)
    if stats.ttest_ind(a, b).pvalue < 0.05:
        hits += 1
print(hits)                               # usually about 1 — pure luck, dressed as signal
```

That little loop is the file drawer in miniature, and it is also the engine of a
great deal of published noise. Search hard enough across enough comparisons and
$0.05$ is not a high wall. It is a turnstile.

I have not stopped using p-values; they are a fine measure of how surprised to be
under a clean null, and surprise is worth quantifying. What I stopped trusting is
the threshold — the idea that $0.05$ converts evidence into truth, that one side
of it is knowledge and the other is silence. I report the number now, and the
effect size, and the interval, and I try to remember that the data never agreed
to the cutoff. We did, once, for convenience, and then we forgot we had a choice.
