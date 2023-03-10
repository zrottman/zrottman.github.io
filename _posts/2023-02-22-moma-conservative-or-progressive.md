---
title: "Is the Museum of Modern Art Trending Conservative or Progressive?"
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
    url: https://github.com/zrottman/data-exploration/blob/main/artmuseums/01_moma-trending-conservative-or-progressive.ipynb
---

# MoMA's Acquisition Practices: Progressive or Conservative?
There are a few proxies for assessing an acquisition program that tends towards progressive or conservative. For a progressive program, we might expect to see an emphasis on newer works by younger and more diverse artists. For a more conservative program, conversely, we'd exepct older works by older (or dead) and less diverse artists.

<!--more-->

<figure>
<img src="/assets/images/art-stats_rivera-3.png" alt="Diego Rivera painting about stats, according to DALL-E">
<figcaption align='center'>Diego Rivera painting of a stats lecture, by DALL-E 2</figcaption>
</figure>

Let's find out, with a narrow focus on the Department of Painting & Sculpture. 

*When I refer to MoMA moving forward, I'm actually looking specifically at this one department.*


# Does MoMA focus on acquiring work by living artists?
Yes!

![Pie chart of collection breakdown of acquistions by living vs non-living artists](/assets/images/moma-progressive-regressive_01.png)


# But has this focus changed over time?
Also yes.

To compute how this changes over time, I am creating two line charts:
- The first shows the annual ratio of acquisitions by living artists to total acquisitions. In a year where there were 8 acquisitions, 6 of which by living artists, this number would be .75.
- The second shows a 10-year moving average to smooth out the noise. Because some the number of acquisitions the department makes may vary significantly from one year to the next, I wanted to be sure not to simply take the 10-year rolling mean of the above statistic. In a scenario where the department acquired 1 work per year (always by a living artist) for 9 years, and then in the 10th year acquired 100 works all by non-living artists, the naive calculation would return .9 (9 years of 100% living artists and 1 year of 0% living). Instead, I needed to take the 10-year cumulative sum of acquisitions by living artists divided by the 10-year cumulative sum of total acquisitions.

![MoMA is acquiring fewer works by living artists](/assets/images/moma-progressive-regressive_02.png)

While we can see a more recent trend in reprioritizing acquisitions by living artists from the 1980s through 2010, today work by living artists is making up a smaller proportion of the department's overall acquisitions (about 64%) than at its height in the 1940s. This reflects a tendency towards conservatism on the part of the museum as its focus on new work by living artist weakens.


# MoMA is Trending Conservative
Not only is MoMA acquiring fewer works by living artists, but also:
- the average artwork age at the time of acquisition is increasing
- artists are increasingly older at the time of acquisition (when the artist is still living)
- more time has elapsed since an artist's death (for artists who are not)

All of these metrics are proxies for the museum's increasing emphasis on collecting older work by older artists with older and better-established legacies. All of which makes sense considering that there was no such thing as a museum for modern art when Alfred Barr, Jr. founded MoMA in 1929. The museum was, by definition, acquiring work of its present. However, what was once an imperative to historicize the present is now an imperative to preserve that history, at least in part.

![MoMA is acquiring older works by older or longer-dead artists](/assets/images/moma-progressive-regressive_03.png)

# But MoMA is Getting More Progressive, Too
At the same time as the collection is expanding in the direction of older work by older or longer-dead artists, it's also becoming more diverse (slowly, but still).

![Pie chart representing gender breakdown of MoMA collection](/assets/images/moma-progressive-regressive_04.png)

![Line chart showing collection breakdown by gender over time](/assets/images/moma-progressive-regressive_05.png)

![Line chart showing that gender represnetation is improving](/assets/images/moma-progressive-regressive_06.png)

It's bad, folks. But this last chart holds a glimmer of hope: It shows us that work by women is making up a greater and greater proportion of the Dept's overall collection as time goes on. 14.5% is not great. Piss poor, actually. But, by the looks of things, it's mover than double the representation women had at the museum until as recently as 1990.


# Sadly, Reaching Gender Parity is a Long Ways Off
On average, the Dept. of Painting & Sculpture acquires 43 works per year. Can the department reach gender parity any time soon? What if it commits to acquiring 70% of works each year by women? 80%? 90%? *95%*?

![Gender Parity is a long ways off](/assets/images/moma-progressive-regressive_07.png)


