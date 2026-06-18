---
title: A map of the hedge
excerpt: Putting a number on the thing the last essay only gestured at.
pubDate: 2026-06-19
status: brewed
tags:
  - uncertainty
  - language models
---

In an earlier piece I left a claim steeping: that the uncertainty a model
reports about its own answer is not noise to be calibrated away but a signal
about the shape of what it was trained on. I want to come back and make one
small part of it precise, because a claim you can measure is a claim you can
be wrong about.

Start with the thing the model actually produces. At each step it emits a
probability distribution over the next token, and the quantity that summarizes
how spread out that distribution is — how much the model is hedging — is its
entropy[^entropy]. For a distribution $p$ over $n$ choices it is

$$ H(p) = -\sum_{i} p_i \log p_i $$

When the model is confident, almost all the mass sits on one token and $H(p)$
falls close to zero. When it hedges, the mass spreads and $H(p)$ climbs toward
$\log n$, its largest possible value. So a single number, read token by token,
traces the texture of the doubt. In code it is almost nothing:

```python
import torch

def entropy(logits):
    """mean token-level uncertainty, in nats"""
    p = torch.softmax(logits, dim=-1)
    return -(p * p.log()).sum(-1).mean()

# higher score = the model is hedging
score = entropy(model(batch))
note = "watch where the data was thin"
```

> The hedge has a texture, and the texture is a map.

Plotted across a generated paragraph, the entropy is not flat. It spikes at the
places where the model had to choose — a name, a date, a claim it half
remembers — and falls back to near zero through the connective tissue of
grammar, where there was never any real choice to make[^grammar].

<figure>
<svg viewBox="0 0 640 200" role="img" aria-label="Per-token entropy across a generated paragraph" xmlns="http://www.w3.org/2000/svg">
<polyline fill="none" stroke="#D9914A" stroke-width="2" points="0,170 40,165 80,58 120,150 160,158 200,38 240,150 280,118 320,168 360,28 400,150 440,160 480,88 520,150 560,162 600,52 640,150" />
<line x1="0" y1="186" x2="640" y2="186" stroke="#94846F" stroke-width="1" />
</svg>
<figcaption>Per-token entropy across one generated paragraph. The peaks are the decisions.</figcaption>
</figure>

That is all this essay claims: that the curve is legible, and that its peaks
line up with the moments where the training data was thin or contradictory.
Whether the map is *accurate* — whether the hedge tracks the data and not some
artifact of the decoding — is the harder question, and the one I am still
leaving in the dark to settle.

[^entropy]: Measured in nats here, since the code uses the natural logarithm.
    Switch to base two and you get bits, and the same shape.

[^grammar]: Which is itself a kind of finding: most of what a language model
    emits costs it almost no uncertainty at all.
