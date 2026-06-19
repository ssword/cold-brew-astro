---
title: Scaling laws taught me patience
excerpt: The curve is straight on a log–log plot, which means the gains are real and the waiting is the price.
pubDate: 2026-04-22
status: steeping
tags:
  - scaling
  - language models
---

For a long time I treated model quality as a thing you earned through cleverness:
a better architecture, a sharper trick, an insight that bent the curve. Scaling
laws have been slowly arguing me out of that, and I am leaving this one steeping
because I am still not sure how much of it I want to be true.

The empirical claim is almost rude in its simplicity. Across many orders of
magnitude, the loss falls as a power of the resources you spend — parameters,
data, compute — so that on a log–log plot the relationship is a straight line:

$$
L(N) \approx \left(\frac{N_c}{N}\right)^{\alpha}
$$

A power law is a strange kind of promise. It says progress will continue, and it
says exactly how grudgingly. To halve the loss you do not add a fixed amount;
you multiply by a fixed factor. The next increment of quality costs as much as
everything that came before it. The line is straight, which is encouraging, and
straight on a log scale, which is the catch.

What unsettles me is what the straight line implies about cleverness. If the
dominant variable is scale, then much of what felt like insight may have been
borrowing against a curve that was going to deliver anyway — arriving a little
early at a destination the resources were always going to reach[^early]. I do
not fully believe that. But I believe it more than I used to, and I cannot yet
draw the line between the gains that were ideas and the gains that were just the
exponent doing its work.

The patience is the part I have actually internalized. You cannot argue with a
power law; you can only feed it and wait. There is no sentence you can write that
substitutes for the next order of magnitude. The work is to set up the
conditions and let something slow and lawful happen — which is, I notice, the
only kind of patience I have ever been any good at.

[^early]: This is the open question I keep circling: whether a method "works" or
    merely *arrives sooner* on a trajectory scale would have reached regardless.
    Telling those apart honestly requires holding compute fixed, which almost no
    exciting result does.
