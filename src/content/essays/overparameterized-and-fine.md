---
title: Overparameterized and fine
excerpt: The old rule said too many parameters would ruin you. The curve had a second descent we had not looked for.
pubDate: 2026-01-28
status: brewed
tags:
  - generalization
  - deep learning
---

Everyone learning statistics meets the same warning early: do not use more
parameters than you can justify, or you will overfit. Memorize the training set,
fail on everything else. The picture is the U-shaped curve — error falls as the
model grows, bottoms out at some sweet spot, then climbs again as the model
becomes complex enough to chase noise. For decades that curve was simply the
truth, and it told you to stop while you were ahead.

Then people kept going past the warning, mostly because the hardware let them,
and found that the curve does not end where the textbook stops drawing it. Push
the model past the point where it can fit the training data *exactly* — zero
training error, the supposed disaster zone — and test error, having risen, turns
around and falls again. The single U is actually the front half of something with
a second slope:

$$
\underbrace{\text{error} \downarrow \;\uparrow}_{\text{classical}}
\quad\Big|\quad
\underbrace{\text{interpolation} \;\rightarrow\; \text{error} \downarrow}_{\text{modern}}
$$

The spot where it peaks, right at the edge of perfect fitting, is the
interpolation threshold, and the renewed decline past it is double descent. The
old advice was not wrong; it was describing one half of the road and assuming the
road ended at the cliff.

What seems to be going on is that once a model has more than enough capacity to
fit the data, there are *many* ways to do it, and the training process does not
pick one at random — it drifts toward the smooth, low-magnitude solutions and
leaves the contorted ones alone[^implicit]. Capacity stops being the thing that
hurts you. The thing that matters is which of the many perfect fits you land on,
and the dynamics quietly prefer the gentle ones.

> Too many parameters was never the danger. Choosing badly among them was, and it
> turns out the optimizer chooses with better taste than we expected.

I keep this nearby as a caution against rules that have only ever been tested on
one stretch of the curve. The U-shape was real, repeatedly confirmed, and
genuinely incomplete — true in the regime anyone had bothered to look at, and
silent about the regime no one could afford to reach. Being overparameterized, it
turns out, is fine. We just had to walk far enough past the warning sign to see
the ground rise back up.

[^implicit]: This is usually called the implicit bias of gradient descent: among
    all the weights that fit the data, the optimizer tends to find ones of small
    norm, which is the same kind of smoothness an explicit penalty would have
    asked for.
