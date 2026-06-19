---
title: Regularization is taste, formalized
excerpt: Every penalty term is a sentence about what a good answer should look like before you have seen the data.
pubDate: 2026-02-12
status: steeping
tags:
  - regularization
  - generalization
---

I am still turning this one over, so it stays steeping: the suspicion that
regularization is where a model's aesthetics live, written down as arithmetic.

On its face a penalty is a technicality. You add a term to the loss — say
$\lambda \|w\|^2$ — to keep the weights small, and you tune $\lambda$ until the
validation curve looks right. Routine. But read the term as a sentence and it is
making a real claim about the world: that smaller, smoother, simpler explanations
are *better*, and should be preferred even when a wilder one fits the training
data more snugly. Nothing in the data says that. You say that. The penalty is the
shape of your prior belief, expressed in a language the optimizer can act on.

Which is why I have started hearing different penalties as different
temperaments. An $L_2$ penalty distrusts extremes and likes everything a little
soft. An $L_1$ penalty is a minimalist — it would rather set a coefficient to
exactly zero than keep it small, and so it prefers explanations with fewer moving
parts. Early stopping is a kind of impatience elevated to a principle: good
enough, soon, beats perfect, late. Each is a taste about what a good answer
*looks like* before any data arrives to argue.

> A penalty is not a fact you discovered. It is a preference you imposed, and the
> only honest move is to admit whose preference it is.

If that is right, then choosing $\lambda$ is not really tuning. It is deciding
how strongly to hold your opinion against the evidence — how much you will let
the data talk you out of your sense of what a reasonable model should be. I do
not yet know how far to push this. But I no longer believe regularization is a
neutral technicality, and I am leaving the thought open until I can say more
precisely whose taste each penalty encodes.
