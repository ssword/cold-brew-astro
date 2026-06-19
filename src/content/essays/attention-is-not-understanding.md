---
title: Attention is not understanding
excerpt: A weighted average is a powerful thing, but it is not the same as knowing what matters.
pubDate: 2026-05-05
status: brewed
tags:
  - attention
  - language models
---

The word does a lot of quiet work. We say a model "attends to" a token the way
we say a reader attends to a sentence, and the borrowed word carries a borrowed
promise: that somewhere in there, something is paying attention in the sense we
mean when we say it about ourselves.

What the mechanism actually computes is humbler than the word. Each position
asks a question — a query — and compares it against a key at every other
position. The comparisons become weights, the weights are normalized to sum to
one, and the output is the weighted average of the values:

$\text{out} = \sum_j \text{softmax}\!\left(\frac{q \cdot k_j}{\sqrt{d}}\right) v_j$

That is the whole device. A similarity, a normalization, a blend. It is a
beautiful piece of engineering and it is, in the end, a soft lookup table — a
way of letting each position pull in a mixture of the others, with the mixing
proportions decided by a dot product.

```python
import torch.nn.functional as F

def attention(q, k, v):
    scores = (q @ k.transpose(-2, -1)) / q.shape[-1] ** 0.5
    weights = F.softmax(scores, dim=-1)   # how much each value contributes
    return weights @ v                    # a weighted average, nothing more
```

I labor the plainness of it because the attention map is so seductive. You can
draw it. You get a grid, bright where the weights are large, and the brightness
lands on tokens that look meaningful — the pronoun lights up the noun it refers
to, the verb lights up its subject. It is hard not to read those bright squares
as the model *deciding* what is relevant, the way you would.

> A bright square tells you what got averaged in. It does not tell you why, or
> whether the model would have been any worse without it.

But the weights are a description of the computation, not an explanation of it.
A high weight means a value contributed a lot to a blend. It does not certify
that the contribution was the reason for the answer, and the same output can
often be produced by very different maps. Reading understanding off the bright
squares is like reading intent off where someone's eyes happen to land — a real
signal, sometimes, and a story we are far too eager to tell.

None of this is a complaint about attention. The mechanism earns its place many
times over; the averaging-with-learned-weights idea is genuinely one of the good
ones. The complaint, if it is one, is about the word. "Attention" smuggles in a
mind. What is there is a similarity and a sum — extraordinary at scale, and
silent on the question of whether anyone is home.
