---
title: "Art Auction Data: Exploratory Data Analysis"
excerpt_separator: "<!--more-->"
category: Art Auction Price Model
tags:
  - EDA
tech:
  - Python
  - Pandas
  - Matplotlib
  - Seaborn
  - NumPy
series-intro: >
  A series of posts related to an art auction price model project. 
github-link: https://github.com/zrottman/art_auction/blob/main/03-01_EDA.ipynb
---

# Art Auction Data: Exploratory Data Analysis
I'm working towards an ML project that models painting prices in the secondary art market based on a variety of artwork features.

<!--more-->

<figure>
<img src="/assets/images/art-auction_DALLE-2.png" alt="Robo-auctioneer">
<figcaption align='center'>A robot art auctioneer, created by DALL-E 2</figcaption>
</figure>

 I've finished some of the heavy (and not-so-heavy) lifting on the front end--[writing a script to scrape the data](https://github.com/zrottman/art_auction/blob/main/scraper.py), and [pre-processing](https://github.com/zrottman/art_auction/blob/main/01_data-preprocessing.ipynb) and [cleaning](https://github.com/zrottman/art_auction/blob/main/02_data-cleaning.ipynb) the scraped data, which contains 53,034 auction result records for some 141 artists.

Now it's time to embark on some good, old-fashioned EDA so I can get a better sense of what we're working with here and gain a little intuition about how realized auction price may or may not correlate with some of the features that I've either scraped or engineered.


# The Dataset and its Features
Here's a sample of what the dataset looks like:

```python
data.sample(10, random_state=123)
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
      <th>31937</th>
      <td>Salvador Dali</td>
      <td>The persistence of memory ,\nThe persistence o...</td>
      <td>NaN</td>
      <td>tapestry</td>
      <td>162.56 x 140.97 cm</td>
      <td>Aug 12, 2017</td>
      <td>Michaan's Auctions • Alameda</td>
      <td>August Estate Auction</td>
      <td>Lot420</td>
      <td>US\$750</td>
      <td>...</td>
      <td>2017</td>
      <td>8.954441e+02</td>
      <td>22916.083200</td>
      <td>NaN</td>
      <td>0</td>
      <td>28.0</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>6</td>
    </tr>
    <tr>
      <th>7514</th>
      <td>Gerhard Richter</td>
      <td>ABSTRAKTES BILD 802-3</td>
      <td>NaN</td>
      <td>oil on canvas</td>
      <td>112 by 102 cm</td>
      <td>Sep 30, 2018</td>
      <td>Sotheby's</td>
      <td>NaN</td>
      <td>Lot1079</td>
      <td>HK\$27,720,000 • US\$3,540,939</td>
      <td>...</td>
      <td>2018</td>
      <td>4.126820e+06</td>
      <td>11424.000000</td>
      <td>NaN</td>
      <td>1</td>
      <td>NaN</td>
      <td>86.0</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>5</td>
    </tr>
    <tr>
      <th>18591</th>
      <td>Ed Ruscha</td>
      <td>Regal</td>
      <td>2001</td>
      <td>dry pigment and acrylic on museum board</td>
      <td>101.9 x 152.4 cm</td>
      <td>May 16, 2019</td>
      <td>Christie's • New York</td>
      <td>Post-War and Contemporary Art Morning Session</td>
      <td>Lot635</td>
      <td>US\$927,000</td>
      <td>...</td>
      <td>2019</td>
      <td>1.061153e+06</td>
      <td>15529.560000</td>
      <td>NaN</td>
      <td>1</td>
      <td>NaN</td>
      <td>82.0</td>
      <td>64.0</td>
      <td>18.0</td>
      <td>4</td>
    </tr>
    <tr>
      <th>39383</th>
      <td>Takashi Murakami</td>
      <td>Superflat Monogram</td>
      <td>2003</td>
      <td>acrylic on canvas mounted on board</td>
      <td>178.31 x 178.31 in</td>
      <td>May 15, 2008</td>
      <td>Phillips de Pury &amp; Company• New York</td>
      <td>Contemporary Art Part I</td>
      <td>Lot110</td>
      <td>US\$724,200</td>
      <td>...</td>
      <td>2008</td>
      <td>9.843836e+05</td>
      <td>205125.112975</td>
      <td>NaN</td>
      <td>1</td>
      <td>NaN</td>
      <td>46.0</td>
      <td>41.0</td>
      <td>5.0</td>
      <td>15</td>
    </tr>
    <tr>
      <th>35906</th>
      <td>Bernard Buffet</td>
      <td>L'atelier</td>
      <td>1949</td>
      <td>oil on canvas</td>
      <td>66.04 x 91.44 in</td>
      <td>May 1, 1996</td>
      <td>Christie's • New York</td>
      <td>Impressionist &amp; Modern Paintings, Drawings &amp; S...</td>
      <td>Lot246</td>
      <td>US\$38,000</td>
      <td>...</td>
      <td>1996</td>
      <td>7.087884e+04</td>
      <td>38959.261436</td>
      <td>NaN</td>
      <td>1</td>
      <td>NaN</td>
      <td>68.0</td>
      <td>21.0</td>
      <td>47.0</td>
      <td>27</td>
    </tr>
    <tr>
      <th>21611</th>
      <td>Chu Teh-Chun</td>
      <td>Mirage èa l'aube (Mirage at Dawn)</td>
      <td>1920-2014</td>
      <td>oil on canvas</td>
      <td>130 x 195 cm</td>
      <td>May 30, 2015</td>
      <td>Christie's • Hong Kong, HKCEC Grand Hall</td>
      <td>Asian 20th Century &amp; Contemporary Art (Evening...</td>
      <td>Lot60</td>
      <td>HK\$15,640,000 • US\$2,026,991</td>
      <td>...</td>
      <td>2015</td>
      <td>2.502812e+06</td>
      <td>25350.000000</td>
      <td>NaN</td>
      <td>0</td>
      <td>1.0</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>8</td>
    </tr>
    <tr>
      <th>25757</th>
      <td>Keith Haring</td>
      <td>Untitled</td>
      <td>1983</td>
      <td>Oil on panel</td>
      <td>88.9 x 200.03 in</td>
      <td>Dec 8, 1998</td>
      <td>Binoche • Paris</td>
      <td>Binoche</td>
      <td>Lot42</td>
      <td>NaN</td>
      <td>...</td>
      <td>1998</td>
      <td>NaN</td>
      <td>114726.654417</td>
      <td>NaN</td>
      <td>0</td>
      <td>8.0</td>
      <td>NaN</td>
      <td>25.0</td>
      <td>15.0</td>
      <td>25</td>
    </tr>
    <tr>
      <th>3388</th>
      <td>Andy Warhol</td>
      <td>Key Service (Positive)</td>
      <td>1986</td>
      <td>synthetic polymer and silkscreen ink on canvas</td>
      <td>50.8 x 40.6 cm</td>
      <td>Nov 12, 2012</td>
      <td>Christie's</td>
      <td>Andy Warhol at Christie's Sold to Benefit the ...</td>
      <td>Lot292</td>
      <td>US\$62,500</td>
      <td>...</td>
      <td>2012</td>
      <td>7.966644e+04</td>
      <td>2062.480000</td>
      <td>NaN</td>
      <td>0</td>
      <td>25.0</td>
      <td>NaN</td>
      <td>58.0</td>
      <td>26.0</td>
      <td>11</td>
    </tr>
    <tr>
      <th>20841</th>
      <td>Pierre-Auguste Renoir</td>
      <td>Paysage aux collettes</td>
      <td>NaN</td>
      <td>oil on canvas</td>
      <td>45.72 x 30.48 in</td>
      <td>May 28, 1997</td>
      <td>Bukowskis• Stockholm</td>
      <td>International Auction</td>
      <td>Lot303</td>
      <td>SEK695,000 • US\$90,541</td>
      <td>...</td>
      <td>1997</td>
      <td>1.650921e+05</td>
      <td>8990.598793</td>
      <td>NaN</td>
      <td>0</td>
      <td>78.0</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>26</td>
    </tr>
    <tr>
      <th>48705</th>
      <td>Julian Schnabel</td>
      <td>Untitled</td>
      <td>1981</td>
      <td>ink, sand and gesso on torn paper</td>
      <td>96.52 x 124.46 in</td>
      <td>Oct 14, 1998</td>
      <td>Christie's • Los Angeles</td>
      <td>20th Century &amp; Contemporary Art</td>
      <td>Lot100</td>
      <td>US\$17,000</td>
      <td>...</td>
      <td>1998</td>
      <td>3.052230e+04</td>
      <td>77502.291447</td>
      <td>NaN</td>
      <td>1</td>
      <td>NaN</td>
      <td>47.0</td>
      <td>30.0</td>
      <td>17.0</td>
      <td>25</td>
    </tr>
  </tbody>
</table>
<p>10 rows × 45 columns</p>
</div>



And here's some background on the features it includes:

### Scraped Features
#### Artwork Information
-`artist_name`: The artist's name, as it appears in the original list of artist names input into the scraping script
- `title`: The artwork's title
- `medium`: The artwork's medium
- `date`: The artwork's attributed date, which in some cases is a span (e.g., 1956-1958) or an estimate (e.g., 1920s, circa 1940s-1950s, 16th century, etc.)
- `dims`: Artwork's attributed dimensions. Because these are paintings, in most cases there are two measurements for width and height, but in some cases objects include a depth measurement or a radius measurment (for circular works).

#### Auction Information
- `auction_date`: Date of auction, in `Month DD, YYYY` format
- `auction_house`: Name of auction house (e.g., Sotheby's)
- `auction_sale`: Name of sale (e.g., Contemporary Evening Sale)
- `auction_lot`: Number of auction lot
- `price_realized`: Realized price in nominal currency. Includes transaction currency and, if not USD, conversion to USD
- `estimate`: Range of auction house estimate for the work.
- `bought_in`: Whether or not work was bought in (i.e., artwork goes unsold)


### Merged Features
The following features are merged from the [Museum of Modern Art's collection dataset](https://github.com/MuseumofModernArt/collection):
- `Nationality`: The artist's nationality
- `Gender`: The artist's gender
- `birth_year`: Year of the artist's birth
- `death_year`: Year of the artist's death (when applicable)


### Parsed Features
#### Dates
- `auction_date_parsed`: Conversion of `date` field to DateTime object
- `start_date`: Year in which artwork was begun (identical to `end_date` in cases where `date` is a single year)
- `end_date`: Year in which artwork was completed (identical to `start_date` in cases where `date` is a single year)

#### Dimensions
- `dims_cm`: Extraction from `dims` of measurements denominated in cm
- `dims_mm`: Extraction from `dims` of measurements denominated in mm
- `dims_in`: Extraction from `dims` of measurements denominated in in
- `is_diameter`: Boolean for whether a given measurement is indicated to be a diameter
- `width_cm`: Width measurement extracted from `dims_cm` or computed from `dims_mm` or `dims_in`
- `height_cm`: Height measurement extracted from `dims_cm` or computed from `dims_mm` or `dims_in`
- `depth_cm`: Depth measurement extracted from `dims_cm` or computed from `dims_mm` or `dims_in`
- `width_mm`: Width measurement extracted from `dims_mm`
- `height_mm`: Height measurement extracted from `dims_mm`
- `depth_mm`: Depth measurement extracted from `dims_mm`
- `width_in`: Width measurement extracted from `dims_in`
- `height_in`: Height measurement extracted from `dims_in`
- `depth_in`: Depth measurement extracted from `dims_in`

#### Auction Information
- `auction_house_loc`: Location of auction (when applicable), as extracted from `auction_house`
- `auction_house_name`: Name of auction house, extracted from `auction_house`
- `price_realized_USD`: Nominal USD realized price, extracted from `price_realized`
- `auction_year`: Year, reformatted from `auction_date`


### Engineered Features
#### Auction Information
- `price_realized_USD_constant_2022`: Conversion of `price_realized_USD` to constant 2022 dollars using `cpi` library

#### Artwork
- `area_cm_sq`: Artwork size as surface area, computed from `width_cm` and `height_cm` (or `width_cm` if a diamter measurement)
- `volume_cm_cu`: Artwork size as volume for three-dimensional works, computer from `width_cm`, `height_cm`, and `depth_cm`

#### Artist
- `living`: Boolean for whether an artist was living at the time of auction
- `years_after_death_of_auction`: Number of years after artist's death that the auction occurred (in cases when the artist was no longer alive at the time of auction)
- `artist_age_at_auction`: Artist's age at the time of auction (in cases where artist was living at the time of auction)
- `artist_age_at_artwork_completion`: Artist's age at the time of artwork's completion. Proxy for stage of artist's career.
- `artwork_age_at_auction`: Age of artwork in years at time of auction
- `years_ago_of_auction`: Years elapsed from auction to present

Note that I won't be working with most of the raw, scraped features.


# A Note on Methodology: Constant vs. Nominal Dollars
In most of what follows, I've decided to do preliminary data analysis for patterns and trends using constant 2022 dollars rather than nominal dollars from each observation's given auction year. My reason for doing this is to eliminate the inflation variable as much as possible so that we can attempt to measure realized price accoring to a single standard. Otherwise, any attempt to look for correlations between a certain variable and price realized would be confounded by auction date. For instance, consider an artwork sold in 1989 for a relatively high price and an artwork solid in 2020 for a relatively low price: due to inflaction, these two prices might be the same, and we will have lost the ability to see their difference. We want to eliminate this possibility to the extent that we can.

Not always, though. Ultimately I do want my model to predict prices in nominal amounts--that is, I want the model to predict the price for a work sold in 1990 in nominal 1990 dollars. But again, my sense is that I'll have an easier time understanding general trends and patterns in the data if I adjust for inflation. As a result, I'll use the `price_realized_USD_constant_2022` feature that I engineered so that I'm dealing with constant 2022 USD amounts.


# Takeaways

## 1. Price Correlates Strongly with Artist Name

Based on some limited domain experience, my first intuition is that artist name will be the single most important factor in determining price. Which makes sense: Warhol will fall into one price bracket, while new MFAs will fall into another price bracket.

Let's take a look at the artists most represented in this dataset by auction count, and then compare their realized price distributions (using constant 2022 dollars):

![Price correlation with artist name](/assets/images/art-auction-eda_01.png)

The first thing to note here is that evidently auction results are *not* distributed normally--not be a long shot. The realized price distribution for all the artists here, Warhol and Picasso in particular, have an aggressive positive skew, with a huge number of outliers--including (I was shocked to discover) a Warhol work that sold for close to $200M.

Let's check again without the fliers.

![Price correlation with artist name, no fliers](/assets/images/art-auction-eda_02.png)

Once we get rid of the outliers, we can see more clearly just how much variance there is from one artist market to the next.


## 2. Individual Artist Markets Vary

Another way we can examine this question of individual artist markets is to look at whether the correlations between realized price and certain features--painting size, for instance, or painting age at the time of auction--behave differently according to artist. In other words, perhaps for some artists size correlates strongly with realized price while for others it may not. Again, in order to resolve the inflation issue (since we're looking at auction results from a nearly 40-year period), I'll use constant 2022 dollars as the target variable.

![Heatmap of price correlation with artist name](/assets/images/art-auction-eda_03.png)

Interestingly, we can see that, for an artist like Damien Hirst, size (width in particular) correlates relatively strongly with realized price, while for an artist like Bernard Buffet or Sam Francis, the correlation is much less pronounced. We can also see that for an artist like Zao Wou-Ki, realized price increases with the artist's age, whereas for Francis or Buffet, the opposite is true.

While the artist's name can of course be included in the model as a feature, to keep things simple for starters my approach will be to try to model an individual artist first. Intuitively this feels especially important since some features are correlated positively for certain artists and negatively for others.


## 3. Prices are Logarithmic
Because the realized price for artworks has such an aggressively positive skew, it turns out looking at the log of realized price effectively normalizes the distribution.

![Prices on a log scale](/assets/images/art-auction-eda_04.png)


# 4. Artwork Size is Logarithmic, Too
Artwork size (width, height, and area) has a similar positive skew which can be remedied with a logarithmic scale.

![Artwork Size](/assets/images/art-auction-eda_05.png)

Compare that with the same distributions on logarithmic scales.

![Artwork Size on log scale](/assets/images/art-auction-eda_06.png)


## 5. Artwork Size and Price Have a Moderate Posive Correlation
Knowing that artwork dimensions and price need to be plotted on logarithmic scales, let's see if there's any meaningful correlation between the two.

![Artwork size vs price](/assets/images/art-auction-eda_07.png)

Generally, yes, it appears there is some positive correlation between size and price realized.


## 6. Realized Price Varies by Artist Nationality
How does realized price vary with artist nationality?

![Price vs nationality](/assets/images/art-auction-eda_08.png)

There do seem to be some differences here, but because I intend to create models for each artist, this feature won't really matter in the end. But still interesting to see!


## 7. Realized Price Doesn't Vary Much by Gender
How does realized price vary by gender? First let's check to see how many women artists this dataset contains:

```python
# Count number of artists for each nationality
cols=['Gender', 'artist_name']
data.loc[~data.duplicated(subset=cols), cols]['Gender'].value_counts()
```

    Male      129
    Female     12
    Name: Gender, dtype: int64

Not a huge sample, unfortunately, but let's see.

![Price vs gender](/assets/images/art-auction-eda_09.png)

There is some difference here, but the median realized price is quite close for men and women. Prices for male artists, however, have much more variability as the lower chart shows.

Like `Nationality`, this feature won't really come into play since I'll be making artist-specific models.


## 8. Realized Price Varies by Artist's Generation
How does realized price vary by artist generation? To do this, I'll divide artists into decades by their birth year. For artists born prior to 1800, of which there are a couple in this dataset, I'll lump them into a 'pre-1800' category.

![Price vs artist generation](/assets/images/art-auction-eda_10.png)

I'm not sure how useful this information is, since the differences we see can easily be attributed to the artists and the specifics of their markets. For instance, it turns out that, in this dataset, there's only one artist who was born in the 1850s, and that's Van Gogh, who evidently fetches consistently high prices. But as with `Gender` and `Nationality`, this feature won't be a concern of mine when building artist-specific models.


## 9. Realized Price and Artwork Date are Negatively Correlated (Older Works Sell for More)
How does price correlate with an artwork's completion date? Are certain periods of art production more valuable than others? There are a few works in this dataset from prior to 1800--I'll do without those so we can focus on work made from ~1850 to present, which is where the bulk of our data is.

![Price vs date](/assets/images/art-auction-eda_11.png)

Here we see a slight negative correlation between artwork year and price, indicating a value premium put on older works vs. newer ones--makes sense.


## 10. Realized Price and Auction Year are Positively Correlated (Artist Markets Accrue in Value)
How does price correlate with auction year? Because we're using constant 2022 dollars, any changes we see should be a function not of inflation but of value increasing over time.

![Price vs Auction year](/assets/images/art-auction-eda_12.png)

As expected, here we can see a slight positive correlation between auction year and realized price, suggesting, again, that artist values are increasing over time in aggregate.


## 11. Realized Price Varies by Auction House
Do different auction houses correlate with different price ranges? To look into this, I'll reduce the cardinality of the `auction_house_name` feature so that we're looking at the main players and a catch-all category for everyone else.

![Price vs auction house](/assets/images/art-auction-eda_13.png)

There are clear differences here, it seems, so the auction house seems like it will be a valuable predictor of price. But I'll want to reduce the cardinality, as I have above, for each individual artist market, since not all artists will have this same proportion of auction house representation.


## 12. Realized Price Varies by Auction Location
We have some data for auction location in this dataset. Let's see if that has any bearing on price.

![Price vs Location](/assets/images/art-auction-eda_14.png)

Here, too, we can see important trends, since certain locations correlate with higher or lower prices.


## 13. Dead Artists Fetch Higher Prices than Living Artists (but it's complicated)
How does whether or not an artist is living at the time of auction affect its price? It feels rather obvious to me that prices will go up after an artist is no longer living--not only because there is no more work being created, but also because this implies that the artwork itself is older, which we've seen correlates positively with price.

![Price vs Living/Deceased](/assets/images/art-auction-eda_15.png)

No surprises here.

I am curious, though, if there are trends when we examine prices as a function of how many years before or after an artist's death the auction took place:

![Price vs Living/Deceased, Line chart](/assets/images/art-auction-eda_16.png)

This is interesting, since it helps us see that median price does rise during an artist's lifetime. For some unexpected reason, there is a precipitous drop in realized price immediately following an artist's death--my suspicion is that collectors aren't selling so much and, if they are, not major works. And within about 25 years, median prices have recovered and continue to rise.

Here's another way of considering this:

![Price vs Living/Deceased, Scatter](/assets/images/art-auction-eda_17.png)

What's interesting to note here is that prices generally seem to rise more quickly over the course of an artist's lifetime than they do after his/her death.


## 14. Artist Age at Auction and Price Realized are Positively Correlated

![Price vs artist age](/assets/images/art-auction-eda_18.png)

No surprises here. As an artist ages, auction prices go up, which makes sense since the artist's legacy is that much more secure in addition to the fact that his/her oeuvre is accruing value over time, independent of inflation, which we've already seen.


## 15. Realized Price and Artist Age at Artwork Completion are Mostly Uncorrelated
What about how an artist's age at the time a given artwork was completed correlates with realized price?

![Price vs Artist Age at Artwork Completion](/assets/images/art-auction-eda_19.png)

I don't see any meaningful correlation here really, but my intuition is that this may be correlated, negatively or positively, for different artists where the market favors, for instance, early career work or late career work, etc.


## 16. Realized Price and Artwork Age at Auction are Postively Correlated

![Price vs artwork age](/assets/images/art-auction-eda_20.png)

And this, too, looks like what we'd expect: Older artworks fetch higher prices.
