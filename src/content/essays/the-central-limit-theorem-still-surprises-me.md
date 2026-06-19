---
title: The central limit theorem still surprises me
excerpt: Add up enough small messes and you get a bell. I know why, and it still feels like a trick.
pubDate: 2026-02-26
status: brewed
tags:
  - statistics
  - probability
---

I have known the central limit theorem for twenty years and it has not lost its
strangeness. Take almost any distribution you like — skewed, lumpy, nothing like
a bell — draw samples from it, average them, and the averages arrange themselves
into a normal distribution. The mess does not matter. The shape you started with
washes out, and the same smooth curve appears every time, as if summoned.

The statement is precise about this. If you average $n$ independent draws from a
distribution with mean $\mu$ and variance $\sigma^2$, then as $n$ grows the
distribution of that average approaches a normal:

$$
\bar{X}_n \;\xrightarrow{\;d\;}\; \mathcal{N}\!\left(\mu, \frac{\sigma^2}{n}\right)
$$

I can prove it. I can talk about characteristic functions and how the higher
moments fall away. And none of that touches the part that surprises me, which is
that the *input shape is forgotten*. The theorem does not care whether you
started with a coin, a dice roll, or some grotesque bimodal thing. Averaging is a
kind of amnesia. It remembers the mean and the spread and throws the rest away.

You can refuse to believe it and check in ten lines. Start with something
deliberately ugly and watch the bell assemble itself anyway.

```python
import numpy as np

rng = np.random.default_rng(0)
# a lopsided, nothing-like-normal source distribution
draws = rng.exponential(scale=1.0, size=(100_000, 40))
means = draws.mean(axis=1)        # average 40 of them, 100k times

print(means.mean(), means.std())  # centers on 1.0; spread shrinks like 1/sqrt(40)
# a histogram of `means` is a clean bell, from an input that was anything but
```

The spread shrinking like $1/\sqrt{n}$ is its own quiet lesson — the reason more
data helps, and the reason it helps so slowly. To halve your uncertainty you do
not gather twice as much; you gather four times as much. The bell narrows, but it
charges a steepening toll for every additional digit of confidence[^sqrtn].

> Averaging is a kind of amnesia. It keeps the mean and the spread and forgets
> everything else you fed it.

What stays with me is less the mathematics than the disposition it rewards. So
much of the world's noise is the sum of many small independent nudges, and the
theorem says those sums are knowable even when the nudges are not. You do not
have to understand each little mess to say something exact about the pile of
them. I find that both useful and faintly miraculous, and I have given up
expecting it to stop feeling that way.

[^sqrtn]: This is also why the standard error carries a $\sqrt{n}$ in the
    denominator rather than an $n$. Precision is real, and it is rationed.
