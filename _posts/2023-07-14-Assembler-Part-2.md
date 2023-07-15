---
title: "Porting my assembler to C, Part II"
excerpt_separator: "<!--more-->"
category: Recurse Center
tags:
  - Nand2Tetris
  - C
  - Building an Assembler in C
series-intro: >
  Daily dispatches from my 12 weeks at the Recurse Center in Summer 2023
---

<style type="text/css">
  table, tr, td {
    border: none;
    text-align: center;
  }

  .array td {
    border: 1px solid black;
    /*background-color: white;*/
    width: 30px;
    height: 30px;
  }

  .bitsPlace { color: gray; }

  .i { background: #d3f6db; }
  .a { background: #92d5e6; }
  .c { background: #772d8b; color: #ccc; }
  .d { background: #5a0b4d; color: #ccc; }
  .j { background: #a1ef8b; }

</style>


I've been keeping that good Impossible Stuff Day energy going today and made excellent progress on my assembler project. It can't handle labels or symbols yet, however it is happily parsing A instructions with number literals as well as the whole gamut of C instructions. It reads from a file, but for the sake of convenience it currently just emits machine code translations to `stdout` like so:

```
 1:    @2 --> 0000000000000010
 2:   D=A --> 1110110000010000
 3:    @3 --> 0000000000000011
 4: D=D+A --> 1110000010010000
 5:    @0 --> 0000000000000000
 6:   M=D --> 1110001100001000
```

Hey, cool!

Here are some of my solutions to the many little challenges along the way.

# Trimming leading spaces from each line

This is a feature my previous iteration did not have, which meant that the assembler assembled very little of sample .asm files that indented with reckless abandon.

Here's what I did:

```c
 // trim leading spaces from `line_in[]`
 i = 0; j = 0;
 while (line_in[i] == ' ' || line_in[i] == '\t')
     i++;
 if (i > 0) {
     while (line_in[i] != '\0')
         line_in[j++] = line_in[i++];
     line_in[j] = '\0';
 }
 ```

I am using two pointers, `i` and `j`, which both start at zero. I march `i` along past every damn space and tab it sees and then stop. Presuming `i` has indeed done some marching, which is to say that it is no longer `0`, I then march `i` (from wherever it is) and `j` (which is at zero) along until `line[i] == '\0'`, and as I go I reassign whatever non-space character is at `line_in[i]` to `line_in[j]`, in effect shifting the non-space portion of the string left.

# Tokenizing C Instructions

Identifying A instructions is easy enough -- they start with `@`. And identifying L instructions (i.e., labels) is also easy enough -- they start with `(`. Everything else is a C instruction. Tokenizing a C instruction turned out to be a bit tricky, though, since they can consist of two or three parts.

The general format is `<destination>=<computation>;<jump>`, however a valid command need only have `<destination>` or `<jump>` (or both, although this is rare in practice). That means I'm often faced with a command that looks like `M=M-1` (just the destination and computation commands) or that look like `D;JNE` (just the computation and jump commands).

At first I played around with `strtok()` and `strsep()`. `strtok()` in particular seemed promising, since you can pass it multiple characters to split on (in this case `=;`), and on successive iterations it returns the next chunk of the input string. The problem I encountered, though, was how to efficiently deal with the results. If all C Instructions had three tokens, that would have been one thing, but most of the time they end up consisting of just two tokens. How, then, to know if you're getting a destination/computation pair or a computation/jump pair?

Eventually I abandoned this (although I'm sure there's a good way of doing what I wanted to do) in favor of `strchr()`, which takes in a string and a search character and returns the index of the first occurrence of that character if it's there or `NULL` if not. Here's what the code looked like:

```c
void tokenize(char *line, char *comp, char *dest, char *jump)
{
    char *equal_sign, *semicolon;

    // if there's an equal sign, we must have dest. and comp. tokens at least
    if ((equal_sign = strchr(line, '='))) {
        *equal_sign = '\0';
        strcpy(dest, line);             // copy everything up to the equal sign to dest
        strcpy(comp, equal_sign + 1);   // copy everything else to comp
        // if comp contains a semi-colon, we have to extract the jump command
        if ((semicolon = strchr(comp, ';'))) {
            *semicolon = '\0';          // terminate comp where the semicolon was
            strcpy(jump, semicolon + 1);// copy everything else to jump
        } else {
            strcpy(jump, "");           // else jump is NULL
        }
    // if there's no equal sign, we just have comp. and jump tokens
    } else {
        semicolon = strchr(line, ';');
        *semicolon = '\0';
        strcpy(dest, "");               // dest. is NULL
        strcpy(comp, line);             // copy everything up to semi-colon to comp
        strcpy(jump, semicolon + 1);    // copy everything else to jump
    }
}
```

I pass this function my `line_in` string, as well as empty strings to hold each of the three tokens. It is this function's job to put stuff in those.

First, I check to see if the line has an equal sign. If so, then we assume it has destination and computation tokens at the very least, so we copy everything up to the `=` to `dest` and everything after it to `comp`. Then, we check `comp` for the presence of a semicolon. If there is one, we terminate `comp` where the semicolon was and copy everything after to `jump`. If not, then `comp` is complete and `jump` just needs to be set to NULL.

If, on the other hand, the input line does not have an equal sign, then we just go ahead and assume it only consists of computation and jump instructions. Same process here, except we set `dest` to NULL, `comp` to everything up to where the semicolon was, and `jump` to everything after.

When I was trying to figure this out, I made this little REPL version of the tokenizer, which looks like this:

![Tokenizer Demo](/assets/images/2023-07-14/tokenizer_demo.gif)

# Lookups 

Once we have our tokens, we need some way of tranlsating them to their binary equivalents. For example, a 3-bit jump command like `JLT` is encoded as `100`, and a 3-bit destination command like `MD` is encoded as `011`. There are 8 permutations of both jump and destination commands, which is fitting for 3-bit numbers ($$ 2^3=8 $$).

The computation commands consist of 7 bits, but mercifully there are not $$ 2^7 $$ permutations to deal with! Just 28 permutations in this version of assembly.

As another reminder, here's what the C instruction encoding looks like:

<table>
  <tr class='array'>
    <td class="i">1</td>
    <td>x</td>
    <td>x</td>
    <td class="a">a</td>
    <td class="c">c</td>
    <td class="c">c</td>
    <td class="c">c</td>
    <td class="c">c</td>
    <td class="c">c</td>
    <td class="c">c</td>
    <td class="d">d</td>
    <td class="d">d</td>
    <td class="d">d</td>
    <td class="j">j</td>
    <td class="j">j</td>
    <td class="j">j</td>
  </tr>
  <tr class='bitsPlace'>
    <td>15</td>
    <td>14</td>
    <td>13</td>
    <td>12</td>
    <td>11</td>
    <td>10</td>
    <td>9</td>
    <td>8</td>
    <td>7</td>
    <td>6</td>
    <td>5</td>
    <td>4</td>
    <td>3</td>
    <td>2</td>
    <td>1</td>
    <td>0</td>
  </tr>
</table>

- <span class="i">C instruction bit</span>: identifies the computation instruction as such
- bits 13 and 14 aren't used
- <span class="a"><b>a</b> bit</span>: dictates whether the ALU should accept its `y` input from the A Register or from somewhere in Memory. Effectively part of the computation instruction.
- <span class="c"><b>c</b> bits</span>: comutation instruction
- <span class="d"><b>d</b> bits</span>: destination instruction
- <span class="j"><b>j</b> bits</span>: jump instruction

When I initially wrote my assembler in Python, my approach was to use dictionaries as lookup tables to match each of the 8 destination instructions with their 3-bit binary counterparts, each of the 8 jump instructions with their 3-bit binary counterparts, and each of the 28 computation instructions with their 7-bit counterparts, sort of like this:

```python
dest_table = {
   'M'  :'001',
   'D'  :'010',
   'MD' :'011',
   'A'  :'100',
   'AM' :'101',
   'AD' :'110',
   'AMD':'111'
   }
jump_table = {
   'JGT':'001',
   'JEQ':'010',
   'JGE':'011',
   'JLT':'100',
   'JNE':'101',
   'JLE':'110',
   'JMP':'111'
   }
comp_table = {
   '0'  :'0101010',
   '1'  :'0111111',
   '-1' :'0111010',
   'D'  :'0001100',
   'A'  :'0110000',
   'M'  :'1110000',
   '!D' :'0001101',
   '!A' :'0110001',
   '!M' :'1110001',
   '-D' :'0001111',
   '-A' :'0110011',
   '-M' :'1110011',
   'D+1':'0011111',
   'A+1':'0110111',
   'M+1':'1110111',
   'D-1':'0001110',
   'A-1':'0110010',
   'M-1':'1110010',
   'D+A':'0000010',
   'D+M':'1000010',
   'D-A':'0010011',
   'D-M':'1010011',
   'A-D':'0000111',
   'M-D':'1000111',
   'D&A':'0000000',
   'D&M':'1000000',
   'D|A':'0010101',
   'D|M':'1010101',
   }
```

Then it was just a matter of concatenating the strings that resulted.

```python
dest = dest_table.get(d_token, '000')
jump = jump_table.get(j_token, '000')
comp = comp_table.get(c_token, '0000000')

c_instruction = ''.join(['111', comp, dest, jump])
```

C doesn't have hashmaps built in, of course. I considered building the data structure, but then thought it was overkill for lookups from lists of just a handful of items. Instead, I decided to use the ol' parallel arrays method (although truth be told this concept was brand new to me!). If dictionaries/hashmaps have key/value pairs, this other method uses one array to hold the keys and the other to hold the values. To find what you need, you do a linear-time search on the keys array, hold on to the index once you find it, and then index in to the values array in constant time to get your match. It's a far cry from the awesome O(1) time-complexity that a hashmap boasts, but, you know what? It's fine.

Here, then, is an example of one of my parallel arrays: 

```c
 char *dest_keys[] = { "M", "D", "MD", "A", "AM", "AD", "AMD" };
 int   dest_vals[] = { 1, 2, 3, 4, 5, 6, 7 };
```

And here is the matching lookup function: 

```c
int parse_dest(char *dest_command)
{
    int len = sizeof(dest_vals)/sizeof(dest_vals[0]);

    for (int i=0; i<len; ++i) {
        if (!strcmp(dest_command, dest_keys[i])) {
            return dest_vals[i];
        }
    }

    return 0;
}
```

(I'm realizing all of a sudden that, while I can't consolidate the three pairs of parallel arrays into a single parralel array -- since, for instance, some destination instructions and computation instructions are identical -- I *can* get away with a single parsing function, since each one does the same thing! Duh.)

Anyway, the parsing function does the thing I described: it searches through the keys array for the destination token, and if it finds a match it returns the value at that same index of the values array. Else it returns 0.

# Building the C Instruction bitwise

You may have noticed that the values array above did not consist of 3-bit strings but of integers. Aha! This is my final breakthrough of the day (which, incidentally, was a direct beneficiary of my [excursions into network programming](https://www.datadoodad.com/recurse%20center/RC41/)). In Python, as I mentioned, I just concatenated each of my little bitstrings together to form my C-instruction. Sounds tedious in C, though. Fortunately I realized I can build up the 16-bit integer I need using bitwise operations.

Here's how I'd do it in Python:

```python
# tokens
d_token = 5   # --> 101 for dest. token AM
c_token = 114 # --> 1110010 for comp. token M-1
j_token = 0   # --> 000 when jump is NULL

# c-instruction under construction
c_inst = 7   # --> 111, which is what our three most signficant bits will need to be

c_inst <<= 7      # make room for the 7-bit computation token
c_inst |= c_token # add in computation token
c_inst <<= 3      # make room for the 3-bit dest token
c_inst |= d_token # add in the destination token
c_inst <<= 3      # make room for the 3-bit jump token
c_inst |= j_token # add in the jump token

print(c_inst)                   # => 64680
print("{:016b}".format(c_inst)) # => 1111110010101000
```

Voila! Now our 16-bit C instruction is represented by a single 16-bit unsigned integer. Yes, I'll eventually need to convert this to a 16-bit bitstring, [but I already built that conversion function](https://www.datadoodad.com/recurse%20center/RC43/).

Here's my C version:

```c
void build_C_COMMAND(char *line_in, char *line_out)
{
    uint16_t out = 7;
    int dest, comp, jump;
    char dest_command[4] = {0};
    char comp_command[4] = {0};
    char jump_command[4] = {0};

    tokenize(line_in, comp_command, dest_command, jump_command);

    dest = parse_dest(dest_command);
    comp = parse_comp(comp_command);
    jump = parse_jump(jump_command);

    // set output bits
    out = 7; out <<= 7;         // set most signifiant 3 bits to 111
    out |= comp; out <<= 3;     // set 7 comp bits
    out |= dest; out <<= 3;     // set 3 dest bits
    out |= jump;                // set 3 jump bits
    itob(out, line_out, 16);    // convert to binstring
}
```

Next on the list is handling symbols and labels.
