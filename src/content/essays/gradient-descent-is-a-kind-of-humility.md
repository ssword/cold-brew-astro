---
title: Gradient descent is a kind of humility
excerpt: You do not need to know where the bottom is. You only need to know which way is down, right here.
pubDate: 2026-03-25
status: brewed
tags:
  - optimization
---

There is a modesty built into the oldest trick we have. Gradient descent does
not know where the minimum is. It does not survey the landscape or plan a route.
It asks one small, local question — which way is downhill from exactly here? —
and takes a short step that way:

$\theta \leftarrow \theta - \eta\, \nabla L(\theta)$

That is all. No map, no destination, no claim to understand the terrain beyond
the patch under its feet. The gradient is a purely local fact, true only at the
point where you stand, and the step is deliberately small because the method does
not trust its own knowledge any further than that.

> It never asks where the bottom is. It only asks which way is down, and trusts
> that enough honest small steps add up.

I have come to think the small step is the wisdom, not the limitation. The
temptation in any hard problem is to leap — to reason out the whole path and
commit to it. Gradient descent declines. It commits only to the direction it can
actually verify, moves a little, and asks again from the new place, where the
answer may have changed. The learning rate $\eta$ is just a formal name for how
much you are willing to act on a local truth before checking it again.

What makes it work is not vision but iteration: a willingness to be wrong about
the destination as long as you are roughly right about the next step, repeated
until the gradient goes quiet. Most of what I have actually finished in my life
was done that way — not by seeing the end, but by being honest about which way
was down, and going there, and asking again.
