---
title: "How to Quickly Generate Wordclouds in Python"
tags:
  - Python
  - Pandas
exerpt_separator: "<!--more-->"
github-link: https://github.com/zrottman/data-exploration/blob/main/blog/word-cloud.ipynb
---

I'm working on a machine learning project that will model auction prices for paintings. Based on some domain knowledge, I have a solid intuition that certain keywords included in the artwork `title` and `medium` features will be useful in predicting price outcomes. My eventual plan is to use `sklearn.feature_extraction.text.TfidfVectorizer` to create features from the words in each of these fields, but before doing that I thought it would be helpful to get a better sense of what the most frequently-occurring words even were.

<!--more-->

Hence, a wordcloud. Turns out it's super easy to generate these using the [wordcloud](https://github.com/amueller/word_cloud) module.

# Andy Warhol
Let's take the titles of Andy Warhol works as an example. As a reminder, we are not considering all Warhol works here, but only those works that appear in the auction data I collected, so any trends we notice should not be imputed to Warhol the artist.

Here's a sample of the data:

```python
warhol.head()
```

<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>artist_name</th>
      <th>title</th>
      <th>date</th>
      <th>medium</th>
      <th>dims</th>
      <th>auction_date</th>
      <th>auction_house</th>
      <th>auction_sale</th>
      <th>auction_lot</th>
      <th>price_realized</th>
      <th>...</th>
      <th>auction_year</th>
      <th>price_realized_USD_constant_2022</th>
      <th>area_cm_sq</th>
      <th>volume_cm_cu</th>
      <th>living</th>
      <th>years_after_death_of_auction</th>
      <th>artist_age_at_auction</th>
      <th>artist_age_at_artwork_completion</th>
      <th>artwork_age_at_auction</th>
      <th>years_ago_of_auction</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>2013</th>
      <td>Andy Warhol</td>
      <td>The Shadow</td>
      <td>1981</td>
      <td>unique screenprint on Lenox Museum Board</td>
      <td>96.5 x 96.5 cm</td>
      <td>Dec 14, 2022</td>
      <td>Christie's</td>
      <td>First Open | Post-War &amp; Contemporary Art</td>
      <td>Lot19</td>
      <td>US\$52,920</td>
      <td>...</td>
      <td>2022</td>
      <td>52920.0</td>
      <td>9312.25</td>
      <td>NaN</td>
      <td>0</td>
      <td>35.0</td>
      <td>NaN</td>
      <td>53.0</td>
      <td>41.0</td>
      <td>1</td>
    </tr>
    <tr>
      <th>2014</th>
      <td>Andy Warhol</td>
      <td>Nervous System</td>
      <td>1985</td>
      <td>synthetic polymer on canvas</td>
      <td>50.8 x 58.4 cm</td>
      <td>Dec 14, 2022</td>
      <td>Christie's</td>
      <td>First Open | Post-War &amp; Contemporary Art</td>
      <td>Lot39</td>
      <td>US\$40,320</td>
      <td>...</td>
      <td>2022</td>
      <td>40320.0</td>
      <td>2966.72</td>
      <td>NaN</td>
      <td>0</td>
      <td>35.0</td>
      <td>NaN</td>
      <td>57.0</td>
      <td>37.0</td>
      <td>1</td>
    </tr>
    <tr>
      <th>2015</th>
      <td>Andy Warhol</td>
      <td>Portrait of Anselmino</td>
      <td>1974</td>
      <td>Acrylic and silkscreen on canvas</td>
      <td>101.5 x 101.5 cm</td>
      <td>Dec 9, 2022</td>
      <td>Ketterer Kunst</td>
      <td>Evening Sale with Collection Hermann Gerlinger</td>
      <td>Lot60</td>
      <td>€375,000• US\$395,839</td>
      <td>...</td>
      <td>2022</td>
      <td>395839.0</td>
      <td>10302.25</td>
      <td>NaN</td>
      <td>0</td>
      <td>35.0</td>
      <td>NaN</td>
      <td>46.0</td>
      <td>48.0</td>
      <td>1</td>
    </tr>
    <tr>
      <th>2016</th>
      <td>Andy Warhol</td>
      <td>Vanishing Animals: Okapi</td>
      <td>1986</td>
      <td>synthetic polymer paint on paper</td>
      <td>59.2 x 80 cm (23 1/4 x 31 1/2 in.)</td>
      <td>Dec 8, 2022</td>
      <td>Phillips• London</td>
      <td>New Now</td>
      <td>Lot100</td>
      <td>£15,120• US\$18,498</td>
      <td>...</td>
      <td>2022</td>
      <td>18498.0</td>
      <td>4736.00</td>
      <td>NaN</td>
      <td>0</td>
      <td>35.0</td>
      <td>NaN</td>
      <td>58.0</td>
      <td>36.0</td>
      <td>1</td>
    </tr>
    <tr>
      <th>2017</th>
      <td>Andy Warhol</td>
      <td>Tie</td>
      <td>1979</td>
      <td>acrylic on cut canvas</td>
      <td>5.0 x 137.2 cm</td>
      <td>Dec 7, 2022</td>
      <td>Sotheby's</td>
      <td>Contemporary Discoveries</td>
      <td>Lot159</td>
      <td>NaN</td>
      <td>...</td>
      <td>2022</td>
      <td>NaN</td>
      <td>686.00</td>
      <td>NaN</td>
      <td>0</td>
      <td>35.0</td>
      <td>NaN</td>
      <td>51.0</td>
      <td>43.0</td>
      <td>1</td>
    </tr>
  </tbody>
</table>
<p>5 rows × 45 columns</p>
</div>

At this point, we're ready to create a wordcloud. The only slightly tricky bit is that the `WordCloud.generate` method takes a string, but the `title` feature of this DataFrame is a series, so i've used the `str.join` method to join the list items into one very long string.

```python
# Import wordcloud module
from wordcloud import WordCloud

plt.subplots(figsize=(10, 8))

# Instantiate WordCloud object
wordcloud = (
    WordCloud(max_words=100, background_color='white', colormap='magma', width=800, height=800)
    .generate(' '.join(warhol['title'].dropna()))
)

# Show image
plt.imshow(wordcloud, interpolation='bilinear', )
plt.axis('off');
```
   
![Warhol Titles Wordcloud](/assets/images/warhol_title-wordcloud.png)

This is helpful to get a sense of how frequently various words (and pairs of words, too) appear in the dataset.

Out of curiosity, let's see if there are noticeable auction price differences (in constant 2022 dollars) for some of these key words.

```python
# Create DataFrame slices based on title keyword matches
dollar = warhol[warhol['title'].str.lower().str.contains('dollar sign').fillna(False)]
flower = warhol[warhol['title'].str.lower().str.contains('flower').fillna(False)]
selfportrait = warhol[warhol['title'].str.lower().str.contains('self portrait').fillna(False)]
soup = warhol[warhol['title'].str.lower().str.contains('soup').fillna(False)]
jackie = warhol[warhol['title'].str.lower().str.contains('jackie').fillna(False)]

fig, axs = plt.subplots(5, 1, figsize=(10, 8), sharex=True)

# Titles containing "Dollar"
sns.boxplot(
    data=dollar, x='price_realized_USD_constant_2022',
    ax=axs[0], showfliers=False
)
axs[0].set_title('Title contains "Dollar"')
axs[0].set_xlabel('')

# Titles containing "Flower"
sns.boxplot(
    data=flower, x='price_realized_USD_constant_2022',
    ax=axs[1], showfliers=False
)
axs[1].set_title('Title contains "Flower"')
axs[1].set_xlabel('')

# Titles containing "Self Portrait"
sns.boxplot(
    data=selfportrait, x='price_realized_USD_constant_2022',
    ax=axs[2], showfliers=False
)
axs[2].set_title('Title contains "Self Portrait"')
axs[2].set_xlabel('')

# Titles containing "Soup"
sns.boxplot(
    data=soup, x='price_realized_USD_constant_2022',
    ax=axs[3], showfliers=False
)
axs[3].set_title('Title contains "Soup"')
axs[3].set_xlabel('')

# Titles containing "Jackie"
sns.boxplot(
    data=jackie, x='price_realized_USD_constant_2022',
    ax=axs[4], showfliers=False
)
axs[4].set_title('Title contains "Jackie"')
axs[4].set_xlabel('Realized Price (Constant 2022 USD)')


# Set ticks and layout
fig.tight_layout()
axs[3].get_xaxis().set_major_formatter(mpl.ticker.StrMethodFormatter('${x:,.0f}'))
axs[3].tick_params(axis='x', rotation=-45)
```
    
![Warhol Title Keywods Price Correlation](/assets/images/warhol_title-keywords-price.png)

Looks like Jackie O works fetch a higher median price than, for instance, Campbell's Soup works.

I'm also curious to generate a wordcloud for the `medium` feature.


```python
plt.subplots(figsize=(10, 8))

wordcloud = (
    WordCloud(max_words=100, background_color='white', colormap='magma', width=800, height=800)
    .generate(' '.join(warhol['medium'].dropna()))
)

plt.imshow(wordcloud, interpolation='bilinear', )
plt.axis('off');
```

![Warhol Medium Wordcloud](/assets/images/warhol_medium-wordcloud.png)

For fun, let's look at how realized price varies based on media.

```python
# Create DataFrame slices based on medium keywork matches
canvas = warhol[warhol['medium'].str.lower().str.contains('canvas').fillna(False)]
paper = warhol[warhol['medium'].str.lower().str.contains('paper').fillna(False)]

fig, axs = plt.subplots(2, 1, figsize=(10, 4), sharex=True)

# Medium contains "paper"
sns.boxplot(
    data=paper, x='price_realized_USD_constant_2022',
    ax=axs[0], showfliers=False
)
axs[0].set_title('Medium contains "paper"')
axs[0].set_xlabel('')

# Medium contains "canvas"
sns.boxplot(
    data=canvas, x='price_realized_USD_constant_2022',
    ax=axs[1], showfliers=False
)
axs[1].set_title('Medium contains "canvas"')
axs[1].set_xlabel('Realized Price (Constant 2022 USD)')


# Set ticks and layout
fig.tight_layout()
axs[1].get_xaxis().set_major_formatter(mpl.ticker.StrMethodFormatter('${x:,.0f}'))
axs[1].tick_params(axis='x', rotation=-45);
```

![Warhol Medium Keyword Price Correlation](/assets/images/warhol_medium-keywords-price.png)
    
That's a striking difference and suggests that doing some Natural Language Processing on the `medium` feature could really be beneficial.
