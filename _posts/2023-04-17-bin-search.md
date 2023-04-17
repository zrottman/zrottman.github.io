---
title: "A Curious Variation of Binary Search"
tags:
  - Algorithms
tech:
  - Python
exerpt_separator: "<!--more-->"
---

Binary search  is a simple and efficient (and surprisingly intuitive!) way of searching a sorted array for a certain item that runs in O(log n) time.

<!--more-->

<style type="text/css">
  table, tr, td {
    border: none;
    text-align: center;
  }

  .array td {
    border: 1px solid black;
    background-color: white;
    width: 50px;
    height: 50px;
  }

  .left {
  }
  .right {
  }
  .array .mid {
    background: yellow;
  }
  .array .inactive {
    background: lightgray;
  }

</style>

It’s intuitive because it describes what, for many of us, would be the default strategy of searching a book index, for example, or guessing the number someone else is thinking of:
 1. pick a spot or number in the middle
 1. if you find what you're looking for, you're done!
 1. if not, search the lower or upper half of what remains depending on whether you're too low or too high
 1. repeat until you find what you're looking for or else exhaust all possibilities

In practice it might go something like this:

> **I'm thinking of a random number between 1 and 10 (inclusive).**
>
> Is it 5?
>
> **Too low.**
> 
> Must be between 6 and 10. Is it 8?
>
> **Too high**
>
> Okay, that leaves 6 and 7. Is it 6?
>
> **You got it! It took you 3 guesses.**

Visually this process might look like this:

**It's somewhere between 1 and 10, inclusive. Is it 5?**

<table>
  <tr class='array'>
    <td>1</td>
    <td>2</td>
    <td>3</td>
    <td>4</td>
    <td class='mid'>5</td>
    <td>6</td>
    <td>7</td>
    <td>8</td>
    <td>9</td>
    <td>10</td>
  </tr>
  <tr>
    <td></td>
    <td></td>
    <td></td>
    <td></td>
    <td>guess</td>
    <td></td>
    <td></td>
    <td></td>
    <td></td>
    <td></td>
  </tr>
</table>

**It's bigger than 5. Is it 8?**

<table>
  <tr class='array'>
    <td class="inactive">1</td>
    <td class="inactive">2</td>
    <td class="inactive">3</td>
    <td class="inactive">4</td>
    <td class="inactive">5</td>
    <td>6</td>
    <td>7</td>
    <td class='mid'>8</td>
    <td>9</td>
    <td>10</td>
  </tr>
  <tr>
    <td></td>
    <td></td>
    <td></td>
    <td></td>
    <td></td>
    <td></td>
    <td></td>
    <td>guess</td>
    <td></td>
    <td></td>
  </tr>
</table>

**Smaller than 8. Is it 6?**

<table>
  <tr class='array'>
    <td class="inactive">1</td>
    <td class="inactive">2</td>
    <td class="inactive">3</td>
    <td class="inactive">4</td>
    <td class="inactive">5</td>
    <td class='mid'>6</td>
    <td>7</td>
    <td class="inactive">8</td>
    <td class="inactive">9</td>
    <td class="inactive">10</td>
  </tr>
  <tr>
    <td></td>
    <td></td>
    <td></td>
    <td></td>
    <td></td>
    <td>guess</td>
    <td></td>
    <td></td>
    <td></td>
    <td></td>
  </tr>
</table>

**It's 6!**

You may have noticed that each time we guess we are effectively halving the number of options. This gets to what is most excellent about binary search: it runs in O(log n) time. That means that each time the number of options doubles, it'll take you only one additional guess.
- If I'm thinking of a number between 1 and 1 (i.e., just one number), you'll guess it in one guess (duh)
- If I'm thinking of a number between 1 and 2, inclusive, it'll take you two guesses max.
- Between 1 and 4 (4 numbers)? 3 guesses max.
- Between 1 and 8? 4 guesses max
- 5 guesses for a number between 1 and 16
- 6 guesses for a number between 1 and 32
- 7 for a number between 1 and 64
- ...

That means that if I'm thinking of a number between 1 and 1 million, it would take you no more than 20 guesses. And if the number was between 1 and 1 billion? You could do it in 30 guesses. That right there is the power of logarithmic time.


# Implementation

If we wanted to implement a binary search algorithm recursively that returns the index of the target value (or -1 if the target value isn't found), it might look something like this:

```python

def binary_search(arr: List[int], target: int, left=0: int, right=-1: int) -> int:
    
    # Initialize right pointer on first call
    if right == -1: right = len(arr) - 1

    # Base case
    if left == right:
        return left if arr[left] == target else -1
    
    # Recursive cases
    mid = (left + right) // 2
    
    if target == arr[mid]:
        return mid
    elif target < arr[mid]:
        return binary_search(arr, target, left, mid)
    else:
        return binary_search(arr, target, mid + 1, right)

```

Let's say we're looking for `15` in the following array: `[1, 3, 4, 7, 8, 12, 15, 19]`. Here's how the above algo would look, step by step:

Iteration 1: Guessing 7 (`arr[3]`)
<table>
  <tr class='array'>
    <td>1</td>
    <td>3</td>
    <td>4</td>
    <td class="mid">7</td>
    <td>8</td>
    <td>12</td>
    <td>15</td>
    <td>19</td>
  </tr>
  <tr>
    <td>0</td>
    <td>1</td>
    <td>2</td>
    <td>3</td>
    <td>4</td>
    <td>5</td>
    <td>6</td>
    <td>7</td>
  </tr>
</table>

Iteration 2: Too low! Guessing 12 (`arr[5]`)
<table>
  <tr class='array'>
    <td class='inactive'>1</td>
    <td class='inactive'>3</td>
    <td class='inactive'>4</td>
    <td class='inactive'>7</td>
    <td>8</td>
    <td class="mid">12</td>
    <td>15</td>
    <td>19</td>
  </tr>
  <tr>
    <td>0</td>
    <td>1</td>
    <td>2</td>
    <td>3</td>
    <td>4</td>
    <td>5</td>
    <td>6</td>
    <td>7</td>
  </tr>
</table>

Iteration 3: Too low again! Guessing 15 (`arr[6]`)
<table>
  <tr class='array'>
    <td class='inactive'>1</td>
    <td class='inactive'>3</td>
    <td class='inactive'>4</td>
    <td class='inactive'>7</td>
    <td class='inactive'>8</td>
    <td class='inactive'>12</td>
    <td class="mid">15</td>
    <td>19</td>
  </tr>
  <tr>
    <td>0</td>
    <td>1</td>
    <td>2</td>
    <td>3</td>
    <td>4</td>
    <td>5</td>
    <td>6</td>
    <td>7</td>
  </tr>
</table>

Got it! In this case our function would return `6` since target value `15` is at index 6.

# A Curious Variation

The reason I'm thinking about binary searches in the first place is this [K Weakest Rows](https://leetcode.com/problems/the-k-weakest-rows-in-a-matrix/description/) leetcode problem. Without getting into details about the problem, one of the things that the algo needs to do is find the number of "soldiers" (i.e., 1s) in each row of a matrix consisting exclusively of 1s and 0s and where the 1s always precede the 0s (which is to say, it's sorted in non-increasing order).

The brute force solution would be to simply iterate through each row item and add it to a cumulative sum, such that the array `[1, 1, 1, 0, 0]` would sum to 3 and `[1, 0, 0, 0, 0, 0]` would sum to 1. This runs in O(n) time, since we need to touch each item of the array. Sure, you could optimize a bit by breaking early: once you see a `0`, you know you've counted all the `1`s that there are. But worst case (an array of all `1`s), you're still looking at O(n).

Can we do better? Faster than linear O(n) time is logarithmic O(log n) time. And because each row array is always sorted (the 1s come before the 0s), we can achieve that logarithmic time using--you guessed it--a binary search algorithm.

At first, it seems a little tricky, since we want to return the index of the last `1` *plus  1* to get the total number of "soldiers" in the row. But at any given moment, how do we know if we're looking at the last 1 or just some other 1? Well, turns out we can just keep searching until our `left` and `right` pointers converge. That looks something like this:
1. Look at the midpoint. If it's a one, search the upper half of the array (i.e., set `left = mid + 1` and then search `array[left:right]`). If it's a zero, search the lower half of the array (i.e., set `right = mid` and search `array[left:right]`).
1. When `left == right`, we're either at the rightmost `1` or leftmost `0`. So if `arr[left] == 1` the number of "soldiers" in this row is `left + 1`. If on the other hand `arr[left] == 0`, then the number of "solders" is just `left`.

```python

def binary_search(arr: List[int], left=0: int, right=-1: int) -> int:

    # Default right pointer value
    if right == -1:
        right = len(arr) - 1

    # Base case
    if left == right:
        if arr[left] == 1:
            return left + 1
        else:
            return left

    # Recursive cases
    mid = (left + right) // 2
    if arr[mid] == 1:
        left = mid + 1
    else:
        right = mid

    return binary_search(arr, left, right)
```

Here's a visualization of how that might look with the row `[1, 1, 0, 0, 0]`:

Iteration 1: `left = 0`, `right = 4`
<table>
  <tr class='array'>
    <td>1</td>
    <td>1</td>
    <td class="mid">0</td>
    <td>0</td>
    <td>0</td>
  </tr>
  <tr>
    <td>0</td>
    <td>1</td>
    <td>2</td>
    <td>3</td>
    <td>4</td>
  </tr>
</table>

Iteration 2: `left = 0`, `right = 2`
<table>
  <tr class='array'>
    <td>1</td>
    <td class="mid">1</td>
    <td>0</td>
    <td class="inactive">0</td>
    <td class="inactive">0</td>
  </tr>
  <tr>
    <td>0</td>
    <td>1</td>
    <td>2</td>
    <td>3</td>
    <td>4</td>
  </tr>
</table>

Iteration 3: `left = 2`, `right = 2`
<table>
  <tr class='array'>
    <td class="inactive">1</td>
    <td class="inactive">1</td>
    <td class="mid">0</td>
    <td class="inactive">0</td>
    <td class="inactive">0</td>
  </tr>
  <tr>
    <td>0</td>
    <td>1</td>
    <td>2</td>
    <td>3</td>
    <td>4</td>
  </tr>
</table>

In the last iteraction, `left == right == 2`, so we've reached the base case. Because `arr[left]` (`arr[2]`) is 0, the algorithm will simply return `left`, which is 2, which is the number of "soldiers" in the row. Pretty cool! Overkill for a row of 5 items (max 3 iterations), but for a row of 500 items, we could find the row's sum not in 500 iteractions (O(n) time) but in 9 iterations(O(log n) time).
