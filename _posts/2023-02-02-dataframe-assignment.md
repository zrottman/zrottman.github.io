---
title: "Troubleshooting Index-Based DataFrame Selection and Assignment in Pandas"
tags:
  - Python
  - Pandas
exerpt_separator: "<!--more-->"
---

I've been working on cleaning and parsing a large dataset in preparation for building a predictive model, and I encountered an interesting issue with simultaneous index-based selection and assignment with a Pandas DataFrame. Here's how I solved it.

<!--more-->

## The Data
Here's a sample of the kind of data I'm dealing with: dimensions rendered in multiple units and multiple formats. (The actual data was even messier than this, but this will serve our purposes.)

```python
In [1]: # Import pandas
import pandas as pd

# Create Dataframe
df = pd.DataFrame({
    'dimensions': [
        '40 x 30cm', 
        '49.0 x 27.99 in', 
        '76.2 x 101.6 in',
        '116.0 x 89.0 cm', 
        '121.01 x 96.49 in', 
        '48.26 x 66.04 in',
        '54 x 73.2 cm', 
        '4 1/2 x 3 in. (11.4 x 7.6 cm.)',
        '182.0 x 24.0 cm', 
        '152.4 x 121.9 cm'
    ]
})

# Preview
df
```

|    | dimensions                     |
|---:|:-------------------------------|
|  0 | 40 x 30cm                      |
|  1 | 49.0 x 27.99 in                |
|  2 | 76.2 x 101.6 in                |
|  3 | 116.0 x 89.0 cm                |
|  4 | 121.01 x 96.49 in              |
|  5 | 48.26 x 66.04 in               |
|  6 | 54 x 73.2 cm                   |
|  7 | 4 1/2 x 3 in. (11.4 x 7.6 cm.) |
|  8 | 182.0 x 24.0 cm                |
|  9 | 152.4 x 121.9 cm               |


## The Dilemma

Let's say that you want to extract the width from each measurement (i.e., the first dimension), but only for the values with metric units. You might start with something like this, like I did:

```python
# Create mask for metric values
is_cm = df['dimensions'].str.contains('cm')

# Extract first dimension from metric values
df.loc[cm, 'dimensions'].str.extract(r'.*?(\d+\.?\d*) x \d+\.?\d* ?cm')
```

|    |     0 |
|---:|------:|
|  0 |  40   |
|  3 | 116.0 |
|  6 |  54   |
|  7 |  11.4 |
|  8 | 182.0 |
|  9 | 152.4 |

Looks good! So now all we have to do is assign those valued to a new column in the same index-based selection of the DataFrame, right?

```python
df.loc[cm, 'width'] = df.loc[cm, 'dimensions'].str.extract(r'.*?(\d+\.?\d*) x \d+\.?\d*?cm')

df
```

|    | dimensions                     |   width |
|---:|:-------------------------------|--------:|
|  0 | 40 x 30cm                      |     nan |
|  1 | 49.0 x 27.99 in                |     nan |
|  2 | 76.2 x 101.6 in                |     nan |
|  3 | 116.0 x 89.0 cm                |     nan |
|  4 | 121.01 x 96.49 in              |     nan |
|  5 | 48.26 x 66.04 in               |     nan |
|  6 | 54 x 73.2 cm                   |     nan |
|  7 | 4 1/2 x 3 in. (11.4 x 7.6 cm.) |     nan |
|  8 | 182.0 x 24.0 cm                |     nan |
|  9 | 152.4 x 121.9 cm               |     nan |

Hey, what gives!

This one really threw me for a while, until I realized that the `.extract()` method was returning not a Series but a DataFrame. Doh! Why? Because the `extract()` method by default returns one column for every capture group, even when there is only one capture group.

There are two solutions.

## Solution 1: Assign a Slice of the Returned DataFrame

Because the `.extract()` method is returning a DataFrame, one option is slice a Series from the resulting DataFrame and assign that.

```python
df.loc[cm, 'width'] = df.loc[cm, 'dimensions'].str.extract(r'.*?(\d+\.?\d*) x \d+\.?\d*?cm')[0]

df
```

|    | dimensions                     |   width |
|---:|:-------------------------------|--------:|
|  0 | 40 x 30cm                      |    40   |
|  1 | 49.0 x 27.99 in                |   nan   |
|  2 | 76.2 x 101.6 in                |   nan   |
|  3 | 116.0 x 89.0 cm                |   116.0 |
|  4 | 121.01 x 96.49 in              |   nan   |
|  5 | 48.26 x 66.04 in               |   nan   |
|  6 | 54 x 73.2 cm                   |    54   |
|  7 | 4 1/2 x 3 in. (11.4 x 7.6 cm.) |    11.4 |
|  8 | 182.0 x 24.0 cm                |   182.0 |
|  9 | 152.4 x 121.9 cm               |   152.4 |

It works, although it's a tad ineligant to have to index the resulting DataFrame like that, and it also makes the code a bit harder to intuit. As an alternative, you could append `.values` to transform the resulting DataFrame into a NumPy array, however there's an even better solution.


## Solution 2: Force `extract()` to Return a Series

I mentioned that, by default, the `.extract()` method expands each capture group into its own column, hence the resulting DataFrame. Another option, however, is to suppress this function by setting `expand=False`, which, in the case of a single capture group, forces the method to return a Series. Excellent.

```python
df.loc[cm, 'dimensions'].str.extract(r'.*?(\d+\.?\d*) x \d+\.?\d* ?cm', expand=False)
```

|    |   dimensions |
|---:|-------------:|
|  0 |         40   |
|  3 |        116.0 |
|  6 |         54   |
|  7 |         11.4 |
|  8 |        182.0 |
|  9 |        152.4 |

Now we can complete the original assignment:

```python
df.loc[cm, 'width'] = df.loc[cm, 'dimensions'].str.extract(r'.*?(\d+\.?\d*) x \d+\.?\d*?cm', expand=False)

df
```

|    | dimensions                     |   width |
|---:|:-------------------------------|--------:|
|  0 | 40 x 30cm                      |    40   |
|  1 | 49.0 x 27.99 in                |   nan   |
|  2 | 76.2 x 101.6 in                |   nan   |
|  3 | 116.0 x 89.0 cm                |   116.0 |
|  4 | 121.01 x 96.49 in              |   nan   |
|  5 | 48.26 x 66.04 in               |   nan   |
|  6 | 54 x 73.2 cm                   |    54   |
|  7 | 4 1/2 x 3 in. (11.4 x 7.6 cm.) |    11.4 |
|  8 | 182.0 x 24.0 cm                |   182.0 |
|  9 | 152.4 x 121.9 cm               |   152.4 |

Party time excellent.

## Bonus Solution: Leverage the Expansion!

Since the `.expand()` method allows us to have multiple capture groups, why not leverage that capabiliity and extract (and assign) both width and height simultaneously?

```python
df[['width', 'height']] = df.loc[cm, 'dimensions'].str.extract(r'.*?(\d+\.?\d*) x (\d+\.?\d*) ?cm')

df
```

|    | dimensions                     |   width |   height |
|---:|:-------------------------------|--------:|---------:|
|  0 | 40 x 30cm                      |    40   |     30   |
|  1 | 49.0 x 27.99 in                |   nan   |    nan   |
|  2 | 76.2 x 101.6 in                |   nan   |    nan   |
|  3 | 116.0 x 89.0 cm                |   116.0 |     89.0 |
|  4 | 121.01 x 96.49 in              |   nan   |    nan   |
|  5 | 48.26 x 66.04 in               |   nan   |    nan   |
|  6 | 54 x 73.2 cm                   |    54   |     73.2 |
|  7 | 4 1/2 x 3 in. (11.4 x 7.6 cm.) |    11.4 |      7.6 |
|  8 | 182.0 x 24.0 cm                |   182.0 |     24.0 |
|  9 | 152.4 x 121.9 cm               |   152.4 |    121.9 |


Note that we don't need to index the assignment target (the left-hand side of the operation) since the assignment value (on the right) is an indexed DataFrame.


## Double Bonus: An Even Better Solution to the Original Problem

Amazing how working through even a simple problem like this helps you understand the underlying mechanics. And indeed, what I just realized in the above example is that the solution to the original problem is to not index the assignment target in the first place. As in the above example, since the result of `.extract()` is an indexed DataFrame, we can just do this:

```python
df['width'] = df.loc[cm, 'dimensions'].str.extract(r'.*?(\d+\.?\d*) x \d+\.?\d* ?cm')

df
```

|    | dimensions                     |   width |
|---:|:-------------------------------|--------:|
|  0 | 40 x 30cm                      |    40   |
|  1 | 49.0 x 27.99 in                |   nan   |
|  2 | 76.2 x 101.6 in                |   nan   |
|  3 | 116.0 x 89.0 cm                |   116.0 |
|  4 | 121.01 x 96.49 in              |   nan   |
|  5 | 48.26 x 66.04 in               |   nan   |
|  6 | 54 x 73.2 cm                   |    54   |
|  7 | 4 1/2 x 3 in. (11.4 x 7.6 cm.) |    11.4 |
|  8 | 182.0 x 24.0 cm                |   182.0 |
|  9 | 152.4 x 121.9 cm               |   152.4 |

Voila!
