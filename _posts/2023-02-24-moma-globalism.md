---
title: "Is the Museum of Modern Art Trending Global?"
excerpt_separator: "<!--more-->"
tags:
  - EDA
  - MoMA
tech:
  - Python
  - Pandas
  - Matplotlib
  - Seaborn
  - NumPy
customlinks:
  - label: GitHub Repo
    url: https://github.com/zrottman/data-exploration/blob/main/artmuseums/02_moma-globalism.ipynb
---

# MoMA's Acquisition Practices, Part II: Progressive or Conservative?
So MoMA's acquisition practices are trending towards older artworks by older, deader artists. However, the Dept. of Painting & Sculpture is also clearly making an effort to deepen its holdings of work by women artists, more that doubling female representation in its collection over the past few decades (even though, it must be said, the department still has a long ways to go with women representing only about 14% of its collection).

<!--more-->

<figure>
<img src="/assets/images/art-stats_hockney-4.png" alt="David Hockney painting of a stats lecture, according to DALL-E">
<figcaption align='center'>David Hockney painting of a stats lecture, by DALL-E 2</figcaption>
</figure>

Are there other metrics for tracking the museum's progressive or conservative orientation? What about trying to assess other ways in which the collection is becoming more inclusive and diverse?


# How does MoMA's collection break down by artist nationality?

![Pie chart of collection breakdown by nationality](/assets/images/moma-global-01.png)

This is more or less what I would expect: predominantly American and European.


# How has the composition of its collection changed over time?
Using artist nationality as a metric, has it MoMA become more globally-oriented over time?

![Proportion of collection over time by nationality](/assets/images/moma-global-02.png)

This is quite interesting to me--not what I expected at first, but in retrospect makes sense.

The first obvious thing to notice is that American artists make up an ever-growing proportion of the collection, from about 30% around the time of the museum's founding to a high of around 50% somewhere around 2010. In more recent years, that number is starting to fall.

Meanwhile, European artists--French in particular but also Swiss, German, and Spanish--who were relatively well-represented in the collection early on have become an ever-smaller proportion of the collection over time.

Why does this make sense? Well, at the museum's founding, the major developments in modernism had been (and were still) occurring in France. We'd have to dig in more to see what works in particular the department was acquiring, but if it was collecting Impressionism, Post-Impressionism, Cubism, Fauvism, Dada, Surrealism, etc., that's French stuff right there. Mostly. I think we can safely assume that the Spanish influence is exclusively Picasso, perhaps Dalí and Miró as well. Swiss would have to be Giacometti.

But, in a dramatic change, American art suddenly begins to account for a huge portion of the overall collection starting in the early- and mid-1940s and at precisely the same moment that European representation drops off.

Why? Well, this is the moment that America assumes the mantle, so to speak, and becomes a major epicenter for advanced cultural practice. During the rise of Fascism in Europe during the 1930s and with the outbreak of war, artists were fleeing Europe, often to the U.S. And thanks in part to the influence of European emigres, the 1940s saw the birth of what would become Abstract Expressionism, a form that would be hegemonic in global art discourse for really the next 20 years.

What's really cool about this chart is that we can see that shift happen in real time as the museum responds rapidly to equally rapid developments in the cultural sector.

The flipside, of course, is that the museum appears not to have continued this response. For the past few decades at least, art discourse is more global that is has ever been before, but arguably American artists remain disproportionately represented in MoMA's collection.

But before committing too quickly to this narrative, let's see if we can complicate it a bit:


# MoMA's collection is more geographically inclusive than ever before

![Nationalities represented over time](/assets/images/moma-global-03.png)

This chart certainly paints a rosier picture, but a picture that is misleading, since we already know that one nationality (i.e., Americans) comprise half of the collection today.


# But it remains disproportionately weighted toward American and European artists
To get a more macroscopic view, I reduced the cardinality of the nationalities feature so that we're considering continents rather than countries. Because American artists represent such a huge segment of the collection, though, I'm separating North America into U.S. and Non-U.S. artists. The result, though, is that the collection remains disproportionately weighted toward American and European artists.

![Proportion of collection over time by continent](/assets/images/moma-global-04.png)


# Nevertheless, in the past 20 years, the collection is trending global
The above chart more or less confirms what we already knew. But it also shows us that more recently, since 2000 or so, there are noticeable upticks in representation for Asian and South American artists. Let's extrapolate these trends using a simple regression model.

![Proportion of collection over time by continent, forecast](/assets/images/moma-global-05.png)

If acquisition trends since 2000 continue, we would reasonably expect American and European artists to comprise a smaller proportion of the collection in the future. Likewise, we should expect more representation from other continents--the acquisition of artists from South America has the steepest regression slope by far.
