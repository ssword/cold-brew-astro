---
title: Embeddings are opinions about similarity
excerpt: Before a model can compare two things, someone has to decide what comparison means.
pubDate: 2026-03-11
status: brewed
tags:
  - embeddings
  - representation
---

An embedding looks like a neutral thing — a list of numbers, a point in space,
the kind of object that seems to have no point of view. But the moment you place
two words near each other in that space, you have made a claim: that these two
things are alike. And "alike" is never neutral. It is always alike *in some
respect*, and the respect was chosen long before you ran the query.

The geometry makes the claim concrete. Similarity is usually the cosine of the
angle between vectors, $\cos(u, v) = \frac{u \cdot v}{\|u\|\,\|v\|}$, which is to
say: two things are similar when they point the same way, regardless of how long
their arrows are. That is already an opinion. It says direction carries meaning
and magnitude does not — that *king* and *kings* should count as close even if
one shows up far more often and lands farther from the origin.

```python
import numpy as np

def cosine(u, v):
    return u @ v / (np.linalg.norm(u) * np.linalg.norm(v))

# "close" here means small angle — a choice, not a law of the data
print(cosine(embed["river"], embed["bank"]))
print(cosine(embed["money"], embed["bank"]))
```

Run those two lines and whichever number comes back larger tells you what the
training data thought *bank* mostly meant. If the corpus was financial news,
*money* wins; if it was hydrology, *river* does. The embedding is not reporting
the meaning of the word. It is reporting the company the word kept, in the text
someone chose to train on[^distributional].

This is why I have stopped calling embeddings a representation of meaning and
started calling them a representation of *one theory* of meaning — the
distributional one, where you are known by the words you appear beside. It is a
good theory, and a partial one. It will tell you that *doctor* and *nurse* are
similar, and it will also faithfully reproduce whatever the corpus believed about
who tends to be which, because to the geometry those are the same fact.

> The space does not store what things mean. It stores what the data treated as
> close, which is a smaller and more opinionated thing.

So I try to read an embedding the way I would read any other strong opinion:
usefully, and with a question about where it came from. The similarities it
offers are real and they are earned from data, which means they inherit the
data's emphases and its blind spots. Before a model can compare two things, some
corpus had to decide what comparison means — and that decision is sitting,
quietly, inside every dot product.

[^distributional]: The old slogan, from Firth: "you shall know a word by the
    company it keeps." Embeddings are that slogan made numerical — which is also
    why they are only ever as catholic as the company in the training set.
