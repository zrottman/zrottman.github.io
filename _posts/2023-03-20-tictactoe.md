---
title: "Building a Tic-Tac-Toe CLI Game: Representing the Board and Detecting Winners"
excerpt_separator: "<!--more-->"
tech:
  - Python
  - NumPy
customlinks:
  - label: GitHub Repo
    url: https://github.com/zrottman/tic-tac-toe/blob/main/prep-work/tictactoe.ipynb
---

I recently coded up a quick'n dirty [command line tic-tac-toe game](https://github.com/zrottman/tic-tac-toe) as part of a coding exercise. 

<!--more-->

<figure>
<img src="/assets/images/tictactoe-02_dalle2.png" alt="What DALL-E thinks tic-tac-toe is like">
<figcaption align='center'>What DALL-E 2 thinks tic-tac-toe looks like</figcaption>
</figure>

It seems like a simple task but actually involved some compelling challenges, in particular conceiving of how to represent the board so that its current state could be displayed on the command line and, more importantly, evaluated after each turn for a winning scenario (or stalemate, as the case may be). It was rewarding enough of a puzzle that I wanted to share some of my thinking, go through the various options I explored, and discuss why I ended up making the decision that I did.

## Solution 1: 3 x 3 Matrix with Bitwise Operations to Detect Winners
My first thought was to represent the board with a 3 x 3 matrix of characters: 'X' and 'O' for player tokens and a blank ' ' for an unoccupied square. The initialization would look like this:


```python
board = [[' ', ' ', ' '],
         [' ', ' ', ' '],
         [' ', ' ', ' ']]
```

What was appealing about this solution was that it made setting and getting super intuitive. If player1 makes their first move in the top right corner (i.e., row 0 and column 2), updating the board would be as simple as:


```python
row = 0
col = 2
board[row][col] = 'X' # -> [[' ', ' ', 'X'],[' ', ' ', ' '],[' ', ' ', ' ']]
```

This solution also had the advantage of lending itself to straightforward display, since printing the current board state would be a matter of looping through the outer array for each row.

In it's simplest form:


```python
# Super simply display function
def display_matrix_simple(board):
    for row in board:
        print(''.join(row))

# Get a few more moves in there
board[2][0] = 'O'
board[2][1] = 'X'
board[1][2] = 'O'

display_matrix_simple(board)
```

      X
      O
    OX


A prettier printing function could look like this:


```python
def display_matrix(board):
    out = '   |   |   \n '
    out += '\n___|___|___\n   |   |   \n '.join([' | '.join(row) for row in board])
    out += '\n   |   |   '
    return out

print(display_matrix(board))
```

       |   |
       |   | X
    ___|___|___
       |   |
       |   | O
    ___|___|___
       |   |
     O | X |
       |   |


That's all well and good, but how to evaluate a winning position?

This is where bitwise operations come in. There are 8 winning combinations in tic-tac-toe: the three rows, the three columns, and the two diagonals. My thought was that each of these could be represented by a binary value. For instance, a diagonal winner would look like this:

```
[[1, 0, 0],
 [0, 1, 0],
 [0, 0, 1]]
```

Or, in a flattened form: `[1, 0, 0, 0, 1, 0, 0, 0, 1]`

Or, as a binary string: `0b100010001`

Or, as an integer: `273`

Encoding all 8 winning positions would look like this:


```python
winners = [
    0b111000000,
    0b000111000,
    0b000000111,
    0b100100100,
    0b010010010,
    0b001001001,
    0b100010001,
    0b001010100
]
```

That means if we encode a given player's positions such that `1` represents a position occupied by that player and a `0` a position occupied by the other player or unoccupied, we can use bitwise `&` for each of the 8 combinations to evaluate whether the result is indeed a winner.

This means a few additional steps:
- flattening our 3x3 array into a single list of length 9
- encoding this as a binary string for a given player token
- returning the integer value of that binary string

Here are some helper functions we'll need:


```python
def flatten(board):
    return [item for row in board for item in row]

def flat_to_binary(flat_board, playerchar):
    binseq = '0b'
    for char in flat_board:
        if char == playerchar:
            binseq += '1'
        else:
            binseq += '0'
    return binseq

def binary_to_int(encoded):
    return int(encoded, 2)
```

Now let's see them in action:


```python
board = [['X', 'O', ' '],
         ['X', ' ', 'O'],
         ['O', 'X', 'X']]

print("Pretty display of board:")
print(display_matrix(board))
print()

print("Flattened board: {}"
      .format(flatten(board)))
print()

print("Binary encoding of board for token 'X': {}"
      .format(flat_to_binary(flatten(board), 'X')))
print()

print("Integer equivalent of binary encoding of board for token 'X': {}"
      .format(binary_to_int(flat_to_binary(flatten(board), 'X'))))
```

    Pretty display of board:
       |   |
     X | O |
    ___|___|___
       |   |
     X |   | O
    ___|___|___
       |   |
     O | X | X
       |   |

    Flattened board: ['X', 'O', ' ', 'X', ' ', 'O', 'O', 'X', 'X']

    Binary encoding of board for token 'X': 0b100100011

    Integer equivalent of binary encoding of board for token 'X': 291


Now all we have to do is loop through the 8 winning board combinations and see if our encoded board `&` the current winner `==` the current winner. If so, we've got a winner!

In practice:


```python
def is_winner(encoded):
    for winner in winners:
        if winner & encoded == winner:
            return True
    return False
```


```python
board = [['X', 'O', ' '],
         ['X', ' ', 'X'],
         ['X', 'O', 'O']] # -> To be encoded as '100101100' for 'X'

print(display_matrix(board))

print("Winner for 'O'? {}"
      .format(is_winner(binary_to_int(flat_to_binary(flatten(board), 'O')))))
print("Winner for 'X'? {}"
      .format(is_winner(binary_to_int(flat_to_binary(flatten(board), 'X')))))
```

       |   |
     X | O |
    ___|___|___
       |   |
     X |   | X
    ___|___|___
       |   |
     X | O | O
       |   |
    Winner for 'O'? False
    Winner for 'X'? True


There are definitely some extra steps involved here: every time we want to evaluate the current board state for a winner, we would have to flatten it, encode it to binary and then as an integer for the current player, and then compare the encoded board state to each of the 8 winning combination boards. But the flip side is that we get a 3x3 board representation that is intuitive and easy to set/get.

Incidentally, the same procedure would be used to compute a stalemate, except for a stalemate we'd want to know whether each player's position plus all the unoccupied squares contains a given winner. If not, then that's a stalemate, baby!

## Solution 2: Same as Above, but 1x9 List Instead of 3x3 Matrix

What appealed to me about the above solution was it's intuitiveness: Representing a 3x3 tic-tac-toe game as a 3x3 matrix makes sense. But under the hood we're constantly having to flatten that matrix in order to do anything with it.

As such, another option is to simply represent the board and its current state as a list to begin with, thus obviating the need for flattening. On the flipside, this means an extra step when setting/getting board positions, since we'd need to convert row/column input to a list index, but this is easily solved with a function like this:


```python
def get_index(row, col):
    return row * 3 + col

row, col = 1, 2
print("Row {} and column {} -> index {}".format(row, col, get_index(row, col)))

row, col = 2, 0
print("Row {} and column {} -> index {}".format(row, col, get_index(row, col)))

row, col = 0, 1
print("Row {} and column {} -> index {}".format(row, col, get_index(row, col)))
```

    Row 1 and column 2 -> index 5
    Row 2 and column 0 -> index 6
    Row 0 and column 1 -> index 1


An update function could thus look like this:


```python
def update_board(row, col, player_token):
    board[get_index(row, col)] = player_token
```

And a slightly more complicated display function would look like this:


```python
def display_flat(board):
    out = '   |   |   \n'
    row_start = 0 # Pointer to keep track of where each row starts
    rows = []

    # Separate `board` list into three rows
    while row_start < len(board):
        rows.append(' ' + ' | '.join(board[row_start:row_start + 3]) + ' \n')
        row_start += 3

    # Join rows
    out += '___|___|___\n   |   |   \n'.join(rows)
    out += '   |   |   \n'

    return out

```

Now we can do all of the above, but without the need for a `flatten()` function or method.


```python
board = ['X', 'O', ' ', 'X', ' ', 'X', 'X', 'O', 'O']

print("Board:")
print(board)
print()

print("Pretty display of board:")
print(display_flat(board))
print()

print("Binary encoding of board for token 'X': {}"
      .format(flat_to_binary(board, 'X')))
print("Integer equivalent of binary encoding of board for token 'X': {}"
      .format(binary_to_int(flat_to_binary(board, 'X'))))
print("Winner for 'X'? {}"
      .format(is_winner(binary_to_int(flat_to_binary(board, 'X')))))
print()

print("Binary encoding of board for token 'O': {}"
      .format(flat_to_binary(board, 'O')))
print("Integer equivalent of binary encoding of board for token 'O': {}"
      .format(binary_to_int(flat_to_binary(board, 'O'))))
print("Winner for 'O'? {}"
      .format(is_winner(binary_to_int(flat_to_binary(board, 'O')))))

```

    Board:
    ['X', 'O', ' ', 'X', ' ', 'X', 'X', 'O', 'O']

    Pretty display of board:
       |   |
     X | O |
    ___|___|___
       |   |
     X |   | X
    ___|___|___
       |   |
     X | O | O
       |   |


    Binary encoding of board for token 'X': 0b100101100
    Integer equivalent of binary encoding of board for token 'X': 300
    Winner for 'X'? True

    Binary encoding of board for token 'O': 0b010000011
    Integer equivalent of binary encoding of board for token 'O': 131
    Winner for 'O'? False


This solution seems a little more complicated, but I gravitate to it since it represents the board in the format that the board is operated on, rather than in a human-friendly format that then needs to be converted to a flattened version to be operated on.

Spoiler alert: this is the solution I picked!

# Solution 3: 3x3 Integer Matrix and Matrix Operations to Detect Winners

My first two solutions both used bitwise operations to detect winners. This third solution is different since it uses matrix operations to fulfill this function: If `1` represents a position held by player 1, `-1` a position held by player 2, and `0` an unoccupied position, then if the sum of any row, column, or diagonal at any point is `3`, then player 1 has won. Likewise, if at any point a row, column, or diagonal sums to `-3`, player 2 has won.

The advantage here is a more intuitive way of detecting winners than hard-coding binary encodings of winning boards.

The disadvantage is that we have to constantly translate the computer-friendly board consisting of `1`s, `-1`s, and `0`s (which is simple to perform some matrix operations on) to a human-friendly board consisting of `X`'s and `O`s.


```python
board = [[ 1, -1, 0],
         [ 0,  0, 1],
         [-1, -1, 1]]

def convert(board):
    char_matrix = []
    for row in board:
        new_row = []
        for val in row:
            match val:
                case 1:
                    new_row.append('X')
                case -1:
                    new_row.append('O')
                case _:
                    new_row.append(' ')
        char_matrix.append(new_row)
    return char_matrix

print("Board:")
for row in board:
    print(row)
print()

print("Converted to human readable:")
print(display_matrix(convert(board)))
```

    Board:
    [1, -1, 0]
    [0, 0, 1]
    [-1, -1, 1]

    Converted to human readable:
       |   |
     X | O |
    ___|___|___
       |   |
       |   | X
    ___|___|___
       |   |
     O | O | X
       |   |


To detect a winner, we need to be able to sum the rows, columns, and diagonals.

Summing the rows is easy:


```python
def is_winning_combo(combo_sum):
    if combo_sum == 3:
        return "Winner for player 1"
    elif combo_sum == -3:
        return "Winner for player 2"
    else:
        return "No winner"

def sumrows(board):
    rowresults = []
    for row in board:
        result = 0
        for col in row:
            result += col
        rowresults.append(result)
    return rowresults

rowsums = sumrows(board)

print("Board:")
print(display_matrix(convert(board)))
print()

for i, rowsum in enumerate(rowsums):
    print("Sum of row {}: {} --> {}".format(i, rowsum, is_winning_combo(rowsum)))
```

    Board:
       |   |
     X | O |
    ___|___|___
       |   |
       |   | X
    ___|___|___
       |   |
     O | O | X
       |   |

    Sum of row 0: 0 --> No winner
    Sum of row 1: 1 --> No winner
    Sum of row 2: -1 --> No winner


Summing the main diagonal is also easy, since we're looking only at positions where `row == col`:


```python
def sumdiag(board):
    n = len(board)
    result = 0
    for i in range(n):
        result += board[i][i]
    return result

diagsum = sumdiag(board)

print("Board:")
print(display_matrix(convert(board)))
print()

print('Sum of main diagonal: {} --> {}'.format(diagsum, is_winning_combo(diagsum)))
```

    Board:
       |   |
     X | O |
    ___|___|___
       |   |
       |   | X
    ___|___|___
       |   |
     O | O | X
       |   |

    Sum of main diagonal: 2 --> No winner


Summing the columns and anti-diagonal, though, are a a little more annoying.

My solution is to rotate the matrix 90 degrees, and then we can sum the rows as above to compute the column sums and sum the main diagonal, also as above, to compute the anti-diagonal sum.

To rototate the board 90 degrees clockwise requires a few intermediary steps:
1. Transpose the mirrored board (i.e., mirror the board over the main diagonal)
1. Mirror the transposed board from left to right (i.e., reverse each row in the board variable)

The result of these two steps is a rotated matrix.


```python
def reverse_row(row):
    newrow = []
    i = len(row) - 1
    while i >= 0:
        newrow.append(row[i])
        i -= 1
    return newrow

def mirror(board):
    newboard = []
    for row in board:
        newboard.append(reverse_row(row))
    return newboard


def transpose(board):
    newboard = [['','',''],['','',''],['','','']]
    for row in range(len(board)):
        for col in range(len(board[row])):
            newboard[row][col] = board[col][row]
    return newboard

def rotate90(board):
    return mirror(transpose(board))
```


```python
print("Original Board:")
print(display_matrix(convert(board)))
print()

print("Mirrored Board:")
print(display_matrix(convert(mirror(board))))
print()

print("Transposed Board:")
print(display_matrix(convert(transpose(board))))
print()

print("90-Deg Rotated (i.e., Mirrored and Transposed) Board:")
print(display_matrix(convert(rotate90(board))))
print()
```

    Original Board:
       |   |
     X | O |
    ___|___|___
       |   |
       |   | X
    ___|___|___
       |   |
     O | O | X
       |   |

    Mirrored Board:
       |   |
       | O | X
    ___|___|___
       |   |
     X |   |
    ___|___|___
       |   |
     X | O | O
       |   |

    Transposed Board:
       |   |
     X |   | O
    ___|___|___
       |   |
     O |   | O
    ___|___|___
       |   |
       | X | X
       |   |

    90-Deg Rotated (i.e., Mirrored and Transposed) Board:
       |   |
     O |   | X
    ___|___|___
       |   |
     O |   | O
    ___|___|___
       |   |
     X | X |
       |   |



Now that we have a rotated board, we can simply sum the rows and the main diagonal as before:


```python
print("Original Board:")
print(display_matrix(convert(board)))
print()

# Rotate board
rotated = rotate90(board)

# Compute columns sums (i.e., rows of rotated board)
rowsums = sumrows(rotated)

for i, rowsum in enumerate(rowsums):
    print("Sum of col {}: {} --> {}".format(i, rowsum, is_winning_combo(rowsum)))

# Compute anti-diagonal sum (i.e., main diagonal of rotated board)
diagsum = sumdiag(rotated)

print('Sum of anti-diagonal: {} --> {}'.format(diagsum, is_winning_combo(diagsum)))
```

    Original Board:
       |   |
     X | O |
    ___|___|___
       |   |
       |   | X
    ___|___|___
       |   |
     O | O | X
       |   |

    Sum of col 0: 0 --> No winner
    Sum of col 1: -2 --> No winner
    Sum of col 2: 2 --> No winner
    Sum of anti-diagonal: -1 --> No winner


This solution definitely involves a little extra work when it comes to computing winners, but it has the effect of being generalizable to an NxN tic-tac-toe game, whereas the bitwise solutions above require solutions that are hard-coded in. This solution is also more computationally intensive since we have to constantly be transforming the board in order to calculate the various row and column sums.

# Solution 4: 3x3 Integer Matrix, but with NumPy
Above I had to code several functions to transform the board and sum the rows, columns, and diagonals. But we can also just leverage NumPy to accomplish the same thing:


```python
import numpy as np
```


```python
board = np.array([[1, -1, 0], [0, 1, 1], [-1, -1, 1]])

print(display_matrix(convert(board)))
```

       |   |
     X | O |
    ___|___|___
       |   |
       | X | X
    ___|___|___
       |   |
     O | O | X
       |   |



```python
board
```




    array([[ 1, -1,  0],
           [ 0,  1,  1],
           [-1, -1,  1]])




```python
x = board.sum(axis=1)
for i, rowsum in enumerate(x):
    print("Sum of row {}: {} --> {}".format(i, rowsum, is_winning_combo(rowsum)))

```

    Sum of row 0: 0 --> No winner
    Sum of row 1: 2 --> No winner
    Sum of row 2: -1 --> No winner



```python
print(display_matrix(convert(board)))
print()

# Sum rows
rowsums = board.sum(axis=1)
for i, rowsum in enumerate(rowsums):
    print("Sum of row {}: {} --> {}".format(i, rowsum, is_winning_combo(rowsum)))

# Sum cols
colssums = board.sum(axis=0)
for i, colssum in enumerate(colssums):
    print("Sum of col {}: {} --> {}".format(i, colssum, is_winning_combo(colssum)))

# Sum main diagonal
diagsum = board.diagonal().sum()
print("Main dagonal sum: {} --> {}".format(diagsum, is_winning_combo(diagsum)))

# Sum anti-diagonal
antidiagsum = np.fliplr(board).diagonal().sum()
print("Anti-dagonal sum: {} --> {}".format(antidiagsum, is_winning_combo(antidiagsum)))
```

       |   |
     X | O |
    ___|___|___
       |   |
       | X | X
    ___|___|___
       |   |
     O | O | X
       |   |

    Sum of row 0: 0 --> No winner
    Sum of row 1: 2 --> No winner
    Sum of row 2: -1 --> No winner
    Sum of col 0: 0 --> No winner
    Sum of col 1: -1 --> No winner
    Sum of col 2: 2 --> No winner
    Main dagonal sum: 3 --> Winner for player 1
    Anti-dagonal sum: 0 --> No winner


# Conclusions

Of these solutions, I opted to go with solution 2:
- Use a flat list to represent the board.
- Detecting winners by encoding flat list to binary and comparing with known solutions

Disadvantages:
- 8 winning positions are hard-coded (although this could easily be automated to accommodate an NxN size board)
- Setting/getting involve an extra step in order to convert from row/column accessors to a single index accessor
- Non-intuitive representation of board

Advantages:
- Computationally simple winner detection
- Human-friendly board consisting of player token characters rather than integers
- Can accommodate games consisting of K players
