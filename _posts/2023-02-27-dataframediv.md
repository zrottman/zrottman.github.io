---
title: "How to Perform Element-Wise Operations Between Multiple DataFrames"
excerpt_separator: "<!--more-->"
tags:
  - tutorial
tech:
  - Python
  - Pandas
customlinks:
  - label: GitHub Repo
    url: https://github.com/zrottman/data-exploration/blob/main/blog/dataframe-div.ipynb
---

How do you perform element-wise operations on a DataFrame and another element data structure?

<!--more-->

Take the following dataframe:

```python
data={
    'hot_dogs': [5, 11, 3, 14, 15],
    'pizza':[9, 2, 11, 12, 6],
    'burgers':[8, 9, 7, 5, 6]
}
years = pd.Series([2015, 2016, 2017, 2018, 2019], name='year')

df = pd.DataFrame(data=data, index=years)

df
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
      <th>hot_dogs</th>
      <th>pizza</th>
      <th>burgers</th>
    </tr>
    <tr>
      <th>year</th>
      <th></th>
      <th></th>
      <th></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>2015</th>
      <td>5</td>
      <td>9</td>
      <td>8</td>
    </tr>
    <tr>
      <th>2016</th>
      <td>11</td>
      <td>2</td>
      <td>9</td>
    </tr>
    <tr>
      <th>2017</th>
      <td>3</td>
      <td>11</td>
      <td>7</td>
    </tr>
    <tr>
      <th>2018</th>
      <td>14</td>
      <td>12</td>
      <td>5</td>
    </tr>
    <tr>
      <th>2019</th>
      <td>15</td>
      <td>6</td>
      <td>6</td>
    </tr>
  </tbody>
</table>
</div>


Let's say that, for each year, you want to compute each item as a proportion of the total items sold. In 2015, for instance, we'd expect a proportion of .23 for hot dogs (`5 / (5 + 9 + 8)`) and .41 for pizza (`9 / (5 + 9 + 8)`).

It's simple enough to find the sum of each row:


```python
annual_sum = df.sum(axis=1)
annual_sum
```




    year
    2015    22
    2016    22
    2017    21
    2018    31
    2019    27
    dtype: int64



So just a matter of dividing our dataframe by the sum of each of its rows, right?


```python
df / annual_sum
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
      <th>2015</th>
      <th>2016</th>
      <th>2017</th>
      <th>2018</th>
      <th>2019</th>
      <th>burgers</th>
      <th>hot_dogs</th>
      <th>pizza</th>
    </tr>
    <tr>
      <th>year</th>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>2015</th>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
    </tr>
    <tr>
      <th>2016</th>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
    </tr>
    <tr>
      <th>2017</th>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
    </tr>
    <tr>
      <th>2018</th>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
    </tr>
    <tr>
      <th>2019</th>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
    </tr>
  </tbody>
</table>
</div>



Uh oh, what the heck happened?

Well, Pandas is attempting to align the columns of `df` ('pizza', 'burgers', 'hot_dogs') with the index of `annual_sum` ('2015', '2016', '2017', '2018', '2019') and then perform the division, but the two do not align. For this operation to work, each `pizza` value in `df` would need to be divided be a value sharing that same index `pizza`.

Although it doesn't serve our purposes here, the following illustrates this behaviour:


```python
foods = pd.Series([5, 10, 20], index=['pizza', 'burgers', 'pie'])
foods
```




    pizza       5
    burgers    10
    pie        20
    dtype: int64




```python
df / foods
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
      <th>burgers</th>
      <th>hot_dogs</th>
      <th>pie</th>
      <th>pizza</th>
    </tr>
    <tr>
      <th>year</th>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>2015</th>
      <td>0.8</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>1.8</td>
    </tr>
    <tr>
      <th>2016</th>
      <td>0.9</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>0.4</td>
    </tr>
    <tr>
      <th>2017</th>
      <td>0.7</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>2.2</td>
    </tr>
    <tr>
      <th>2018</th>
      <td>0.5</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>2.4</td>
    </tr>
    <tr>
      <th>2019</th>
      <td>0.6</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>1.2</td>
    </tr>
  </tbody>
</table>
</div>



Now, each value in `df['burgerss']` is divided by 10 (the `burgers`-indexed value in `foods`), and each value in `df['pizza']` is divded by 5 (the `pizza`-indexed value in `foods`). But notice the NaNs that result: NaNs for the `df['hot_dogs']` values, which in this case do not have a matching divisor in `foods`, and NaN's for a new column `pie`, since there was no matching dividend in `df`.

This is not what we want. To perform this division operation elementwise for each row, we'd instead have to use an object method: `pd.DataFrame.div`.

On it's own, this method produces a behavior idential to that which we observed before:


```python
df.div(annual_sum)
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
      <th>2015</th>
      <th>2016</th>
      <th>2017</th>
      <th>2018</th>
      <th>2019</th>
      <th>burgers</th>
      <th>hot_dogs</th>
      <th>pizza</th>
    </tr>
    <tr>
      <th>year</th>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>2015</th>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
    </tr>
    <tr>
      <th>2016</th>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
    </tr>
    <tr>
      <th>2017</th>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
    </tr>
    <tr>
      <th>2018</th>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
    </tr>
    <tr>
      <th>2019</th>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
    </tr>
  </tbody>
</table>
</div>



Why? Because by default the axis 1 or columns, which means that pandas is once again attempting to match the columns of `df` ('pizza', 'burgers', 'hot_dogs') with the index of `annual_sum` ('2015', '2016', '2017', '2018', '2019'), which we already saw doesn't work.

All we have to do is specify `axis=0` so that we're matching the index of `df` to annual sum, and in this case there is a match, since we're performing division on each `2015` value of `df` and the matching `2015` value of `annual_sum`, and so on:


```python
df.div(annual_sum, axis=0)
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
      <th>hot_dogs</th>
      <th>pizza</th>
      <th>burgers</th>
    </tr>
    <tr>
      <th>year</th>
      <th></th>
      <th></th>
      <th></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>2015</th>
      <td>0.227273</td>
      <td>0.409091</td>
      <td>0.363636</td>
    </tr>
    <tr>
      <th>2016</th>
      <td>0.500000</td>
      <td>0.090909</td>
      <td>0.409091</td>
    </tr>
    <tr>
      <th>2017</th>
      <td>0.142857</td>
      <td>0.523810</td>
      <td>0.333333</td>
    </tr>
    <tr>
      <th>2018</th>
      <td>0.451613</td>
      <td>0.387097</td>
      <td>0.161290</td>
    </tr>
    <tr>
      <th>2019</th>
      <td>0.555556</td>
      <td>0.222222</td>
      <td>0.222222</td>
    </tr>
  </tbody>
</table>
</div>



Now we know that pizza apparently accounted for almsot 41% of all sales in 2015 but only 9% the following year--weird!

