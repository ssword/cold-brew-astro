---
title: The loss landscape is mostly flat
excerpt: What high-dimensional minima actually look like, and why that turns out to be a kind of mercy.
pubDate: 2026-06-10
status: brewed
tags:
  - optimization
  - deep learning
---

The first picture anyone draws of training is a mountain range. A curve with
peaks and valleys, a ball rolling downhill, the optimizer as a patient hiker
looking for the lowest point. It is a good picture for teaching and a poor one
for thinking, because it has two dimensions and the thing it describes has a
hundred million.

I drew that picture for years before I noticed I had stopped believing it. What
changed was not a proof but a habit: I started measuring the landscape instead
of imagining it, and the landscape I measured was almost nothing like the one I
had been drawing on the board.

Near a place where training has settled, the loss is locally a bowl, and the
shape of the bowl is written in the second derivatives — the Hessian. Expand the
loss around the parameters $\theta$ and, because the gradient is near zero where
we stopped, the linear term drops out and the quadratic term is what remains:

$$
L(\theta + \delta) \approx L(\theta) + \tfrac{1}{2}\, \delta^\top H \delta
$$

Everything interesting about the local geometry is in $H$. Its eigenvalues are
the curvatures along the principal directions: large positive eigenvalues are
steep walls, and eigenvalues near zero are directions you can walk along without
the loss noticing. The textbook bowl assumes those curvatures are all healthy
and positive. They are not.

When you actually compute the spectrum of $H$ at the end of training, almost all
of it is piled up near zero, with a thin tail of a few large eigenvalues holding
the rest of the shape up[^hvp]. The bowl is not round. It is a long, shallow
trough — sharp in a handful of directions and flat in nearly all of them.

> The minimum is not a point. It is a country, and most of it is plain.

You do not need the full spectrum to feel this. You can poke the model. Take a
trained network, push the weights a little in a random direction, and watch how
much the loss moves. Then push them along the few sharp directions and watch it
move a lot. The asymmetry is the whole story.

```python
import torch

def loss_change(model, loss_fn, batch, direction, eps=1e-2):
    """how much the loss moves when we nudge the weights along `direction`"""
    flat = torch.nn.utils.parameters_to_vector(model.parameters())
    base = loss_fn(model(batch.x), batch.y)

    torch.nn.utils.vector_to_parameters(flat + eps * direction, model.parameters())
    moved = loss_fn(model(batch.x), batch.y)

    torch.nn.utils.vector_to_parameters(flat, model.parameters())  # put it back
    return (moved - base).item()

# a random direction barely registers; a sharp eigenvector lurches
random_dir = torch.randn_like(torch.nn.utils.parameters_to_vector(model.parameters()))
random_dir /= random_dir.norm()
print(loss_change(model, loss_fn, batch, random_dir))
```

Run that with a random direction a few dozen times and the numbers come back
small and boring. That boredom is the finding. In a space of a hundred million
directions, the overwhelming majority lead nowhere — they are flat, and the
model sits in the middle of a wide basin rather than at the tip of a needle.

This rearranges a few things I used to worry about. I used to worry about local
minima, the way the mountain picture taught me to: little valleys that are not
the lowest valley, traps the hiker falls into and cannot climb out of. In high
dimensions, a true local minimum requires *every* direction to curve upward at
once, and that unanimous agreement is rare. What you find instead are saddle
points — flat in most directions, gently downhill in a few — and a saddle is not
a trap. It is a pause. Given patience, the optimizer slides off the shoulder and
keeps going[^saddle].

It also reframes what it means to have found "the" solution. If the basin is
wide and flat, then there is no single bottom; there is a whole connected region
of weights that all fit the data about equally well. Two models trained from
different seeds do not land on the same point — they land somewhere in the same
country, and you can often draw a low-loss path between them without ever
climbing back up. The solution is plural. It was never a point to begin with.

I find this consoling in a way that has nothing to do with optimization. The
flatness is a kind of forgiveness. It means the exact final weights do not
matter very much; what matters is which basin you ended up in, and the basin is
large enough to be reached many different ways. You do not have to thread a
needle. You have to wander into the right wide valley and then stop worrying
about your precise coordinates.

The mountain picture sells precision — find the one lowest point, or fail. The
real landscape sells something closer to patience and tolerance. Most directions
are flat. Most of your fussing is along directions the loss cannot feel. The work
is to get into the right country and let the exact address go.

[^hvp]: You rarely form $H$ directly — at this size it would not fit in memory.
    You compute Hessian–vector products $Hv$ through a second pass of
    autodiff and recover the extreme eigenvalues by power iteration, which is
    enough to see the shape without ever writing the matrix down.

[^saddle]: This is the picture from Dauphin and colleagues' work on saddle
    points: in high dimensions the trouble is not bad minima but the long flat
    plateaus around saddles, where the gradient is small and progress feels like
    it has stopped even though it has not.
