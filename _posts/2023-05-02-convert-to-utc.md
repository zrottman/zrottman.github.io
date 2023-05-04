---
title: ".apply() need not apply"
excerpt_separator: "<!--more-->"
tags:
  - python
  - pandas
tech:
  - Python
  - Pandas
---

Here's an interesting puzzle I encountered.

I'm working with a dataset with two features of interest: naive datetimes (naive meaning without any timezone information) and timezones. What I'd like is a new feature that has all the date and time information in the datetime feature, except converted to UTC time.

Seems simple enough, right? Well... no. Especially not for a very, very big dataset.

<!--more-->

<figure>
<img src="/assets/images/utc_conversion_1.png" alt="robot foot race">
<figcaption align='center'>It's a race! By DALL-E 2</figcaption>
</figure>


# The Data
Here's a simplified version of the dataset I'm working with:

```python
data.head()
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
      <th>datetime_naive</th>
      <th>timezone</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>2022-10-08 19:13:00</td>
      <td>America/New_York</td>
    </tr>
    <tr>
      <th>1</th>
      <td>2022-11-04 08:00:00</td>
      <td>America/Los_Angeles</td>
    </tr>
    <tr>
      <th>2</th>
      <td>2023-04-05 09:00:00</td>
      <td>America/New_York</td>
    </tr>
    <tr>
      <th>3</th>
      <td>2022-11-25 14:40:00</td>
      <td>America/Denver</td>
    </tr>
    <tr>
      <th>4</th>
      <td>2023-03-11 09:00:00</td>
      <td>America/New_York</td>
    </tr>
  </tbody>
</table>
</div>


```python
data.dtypes
```


    datetime_naive    datetime64[ns]
    timezone                  object
    dtype: object


As promised, there's `datetime_naive`, which is contains our date/time information, and `timezone`, which contains the timezone string.

Now, if the `datetime_naive` feature all belonged to the same timezone (say, "America/New_York"), converting to UTC after first localizing to East coast time is trivial:


```python
tz = 'America/New_York'

data['datetime_nyc'] = data['datetime_naive'].dt.tz_localize(tz)
data['datetime_utc'] = data['datetime_nyc'].dt.tz_convert('UTC')

data.head()
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
      <th>datetime_naive</th>
      <th>timezone</th>
      <th>datetime_nyc</th>
      <th>datetime_utc</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>2022-10-08 19:13:00</td>
      <td>America/New_York</td>
      <td>2022-10-08 19:13:00-04:00</td>
      <td>2022-10-08 23:13:00+00:00</td>
    </tr>
    <tr>
      <th>1</th>
      <td>2022-11-04 08:00:00</td>
      <td>America/Los_Angeles</td>
      <td>2022-11-04 08:00:00-04:00</td>
      <td>2022-11-04 12:00:00+00:00</td>
    </tr>
    <tr>
      <th>2</th>
      <td>2023-04-05 09:00:00</td>
      <td>America/New_York</td>
      <td>2023-04-05 09:00:00-04:00</td>
      <td>2023-04-05 13:00:00+00:00</td>
    </tr>
    <tr>
      <th>3</th>
      <td>2022-11-25 14:40:00</td>
      <td>America/Denver</td>
      <td>2022-11-25 14:40:00-05:00</td>
      <td>2022-11-25 19:40:00+00:00</td>
    </tr>
    <tr>
      <th>4</th>
      <td>2023-03-11 09:00:00</td>
      <td>America/New_York</td>
      <td>2023-03-11 09:00:00-05:00</td>
      <td>2023-03-11 14:00:00+00:00</td>
    </tr>
  </tbody>
</table>
</div>


```python
data.dtypes
```


    datetime_naive                      datetime64[ns]
    timezone                                    object
    datetime_nyc      datetime64[ns, America/New_York]
    datetime_utc                   datetime64[ns, UTC]
    dtype: object


First I localized `datetime_naive` to East Coast time (`datetime_nyc`), and then I converted that to UTC (`datetime_utc`). You'll notice that `datetime_naive` and `datetime_nyc` are almost identical, except the localized version includes the UTC offset information, which above is either -04:00 or -05:00 depending on DST. The dtypes differ, as well, with `datetime_nyc` typed as a *localized* datetime64 object.

Then, I converted the localized `datetime_nyc` to UTC time, so you'll notice that the UTC offset for `datetime_utc` (as expected) is now +00:00. Its dtype is localized to UTC, as well.

So, that's easy enough. But our problem is not this. Our problem is complicated by the fact that each datetime value in `datetime_naive` corresponds to a distinct timezone, so calling `.dt.tz_localize()` will not work, since we aren't localizing the entire feature.


# Solution 1: `.apply()` yourself!

<figure>
<img src="/assets/images/utc_conversion_3.png" alt="robot foot race">
<figcaption align='center'>Let's see what you can do. By DALL-E 2</figcaption>
</figure>

My first thought was to convert each `datetime_naive` record individually using `.apply()` in tandem with the pytz library. Something like this:


```python
import pytz

def convert_to_utc(dt, tz):
    tz = pytz.timezone(tz)
    localized = tz.localize(dt)
    utc = localized.astimezone(pytz.utc)
    return utc

data['datetime_utc'] = data.apply(lambda row: convert_to_utc(row['datetime_naive'], row['timezone']), axis=1)
data.head()
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
      <th>datetime_naive</th>
      <th>timezone</th>
      <th>datetime_utc</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>2022-10-08 19:13:00</td>
      <td>America/New_York</td>
      <td>2022-10-08 23:13:00+00:00</td>
    </tr>
    <tr>
      <th>1</th>
      <td>2022-11-04 08:00:00</td>
      <td>America/Los_Angeles</td>
      <td>2022-11-04 15:00:00+00:00</td>
    </tr>
    <tr>
      <th>2</th>
      <td>2023-04-05 09:00:00</td>
      <td>America/New_York</td>
      <td>2023-04-05 13:00:00+00:00</td>
    </tr>
    <tr>
      <th>3</th>
      <td>2022-11-25 14:40:00</td>
      <td>America/Denver</td>
      <td>2022-11-25 21:40:00+00:00</td>
    </tr>
    <tr>
      <th>4</th>
      <td>2023-03-11 09:00:00</td>
      <td>America/New_York</td>
      <td>2023-03-11 14:00:00+00:00</td>
    </tr>
  </tbody>
</table>
</div>


```python
data.dtypes
```


    datetime_naive         datetime64[ns]
    timezone                       object
    datetime_utc      datetime64[ns, UTC]
    dtype: object


Using `.apply()`, we call `convert_to_utc()` for each row of the dataframe, passing the paired `datetime_naive` and `timezone` values as arguments. Then `convert_to_utc()` localized the `datetime_naive` value according to the `timezone` before converting the localized valu to UTC.

Now, this works. Sort of. This dataset has 1,000 records. The one I was working with when I encountered this problem had millions. I'm not sure how long the operation took because I was too impatient, so let's just say it took a while. `.apply()` is not the most efficent route.

How to proceed? I really scratched my head about this for a while. At first I was thinking that maybe I could chunk the dataset and perform the same `.apply()` method on one (smaller) chunk at a time. After all, it works well enough for 1,000 records, doesn't it? My thinking was that maybe I was bumping up against a memory issue. I implemented this solution, but still was too impatient to find out how long it took to process the entire dataset.

# Solution 2: Vector? Check, sir

<figure>
<img src="/assets/images/utc_conversion_2.png" alt="robot foot race">
<figcaption align='center'>Specter of the vector. By DALL-E 2</figcaption>
</figure>

Knowing how fast it was to simply localize an entire datetime feature to a given timezone and then convert that, I kept on thinking that there must be a vectorized solution to this. Maybe if I process all the datetimes for a given timezone at once?

That ended up looking something like this:


```python
def vectorized_convert_to_utc(df, dt_col, tz_col):
    # Get list of timezone
    tzs = df[tz_col].unique()

    for tz in tzs:
        # Create mask for current timezome
        is_current_tz = (df[tz_col] == tz)

        # Localize all datetime records matching `tz` and convert to UTC
        df.loc[is_current_tz, 'datetime_utc'] = (
            df.loc[is_current_tz, dt_col].dt.tz_localize(tz).dt.tz_convert('UTC')
        )

    return df['datetime_utc']

data['datetime_utc'] = vectorized_convert_to_utc(data, 'datetime_naive', 'timezone')
data.head()
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
      <th>datetime_naive</th>
      <th>timezone</th>
      <th>datetime_utc</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>2022-10-08 19:13:00</td>
      <td>America/New_York</td>
      <td>2022-10-08 23:13:00+00:00</td>
    </tr>
    <tr>
      <th>1</th>
      <td>2022-11-04 08:00:00</td>
      <td>America/Los_Angeles</td>
      <td>2022-11-04 15:00:00+00:00</td>
    </tr>
    <tr>
      <th>2</th>
      <td>2023-04-05 09:00:00</td>
      <td>America/New_York</td>
      <td>2023-04-05 13:00:00+00:00</td>
    </tr>
    <tr>
      <th>3</th>
      <td>2022-11-25 14:40:00</td>
      <td>America/Denver</td>
      <td>2022-11-25 21:40:00+00:00</td>
    </tr>
    <tr>
      <th>4</th>
      <td>2023-03-11 09:00:00</td>
      <td>America/New_York</td>
      <td>2023-03-11 14:00:00+00:00</td>
    </tr>
  </tbody>
</table>
</div>


```python
data.dtypes
```


    datetime_naive         datetime64[ns]
    timezone                       object
    datetime_utc      datetime64[ns, UTC]
    dtype: object


The result is the same here, but it was miles apart with my other dataset of millions of records instead of 1,000, since the computation actually finished.

# The results?

<figure>
<img src="/assets/images/utc_conversion_4.png" alt="robot foot race">
<figcaption align='center'>We got a winner, folks. By DALL-E 2</figcaption>
</figure>

Let's speed test side by side:


```python
# `.apply()`
%timeit data.apply(lambda row: convert_to_utc(row['datetime_naive'], row['timezone']), axis=1)
```

    136 ms ± 2.9 ms per loop (mean ± std. dev. of 7 runs, 10 loops each)



```python
# Vectorized
%timeit vectorized_convert_to_utc(data, 'datetime_naive', 'timezone')
```

    2.32 ms ± 113 µs per loop (mean ± std. dev. of 7 runs, 100 loops each)


Hot damn! That right there is why the vectorized solution crunched through millions of records no problem, while `.apply()` left me hanging. It's ~60 times faster. Which checks out, since even the vectorized version took maybe 5 seconds to execute on my machine, which means applying `.apply()` would've taken 5 minutes.
