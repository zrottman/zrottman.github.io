---
title: "Type Punning"
excerpt_separator: "<!--more-->"
category: Recurse Center
tags:
  - C
  - type punning
series-intro: >
  Daily dispatches from my 12 weeks at the Recurse Center in Summer 2023
---

Here are 32 bits, or 4 bytes. Seems like a pretty big number. And it is . . . sorta. Depends on how you look at it.

<style type="text/css">
  table, tr, td {
    border: none;
    text-align: center;
    padding: 0;
  }

  .array td {
    border: 1px solid black;
    padding: 0;
    margin: 0;
    width: 20px;
    height: 25px;
  }

  .bitsPlace { color: gray; }

  .one { background: #d3f6db; }
  .zero { background: #92d5e6; }

</style>

<table>
  <tr class='array'>
    <td class="zero">0</td>
    <td class="one">1</td>
    <td class="zero">0</td>
    <td class="zero">0</td>
    <td class="zero">0</td>
    <td class="zero">0</td>
    <td class="zero">0</td>
    <td class="zero">0</td>

    <td class="one">1</td>
    <td class="zero">0</td>
    <td class="zero">0</td>
    <td class="one">1</td>
    <td class="zero">0</td>
    <td class="zero">0</td>
    <td class="one">1</td>
    <td class="zero">0</td>

    <td class="zero">0</td>
    <td class="zero">0</td>
    <td class="zero">0</td>
    <td class="one">1</td>
    <td class="one">1</td>
    <td class="one">1</td>
    <td class="one">1</td>
    <td class="one">1</td>

    <td class="one">1</td>
    <td class="one">1</td>
    <td class="zero">0</td>
    <td class="one">1</td>
    <td class="one">1</td>
    <td class="zero">0</td>
    <td class="one">1</td>
    <td class="one">1</td>
  </tr>
  <tr class='bitsPlace'>
    <td>31</td>
    <td>30</td>
    <td>29</td>
    <td>28</td>
    <td>27</td>
    <td>26</td>
    <td>25</td>
    <td>24</td>
    <td>23</td>
    <td>22</td>
    <td>21</td>
    <td>20</td>
    <td>19</td>
    <td>18</td>
    <td>17</td>
    <td>16</td>
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

One way to look at it is as an 32-bit integer, in which case this number is, indeed, on the large side -- 1,078,530,011.

Another way to look at it is as a float, which also takes up 4 bytes of space, but which is represented in memory very differently. As a float, the same sequence of bytes represents 3.141593.

Now for the fun part: let's say that you want to store a value in memory as one type, but that you sometimes want to interpret that same value as another type entirely. Enter . . .

# Type Punning

Before getting into why one would want to do something insane like this, it bears mentioning that doing this is generally frowned upon, since it is non-portable and can lead to unexpected behavior. Some computers and architectures are big-endian, some little-endian; some represent floats one way, others another way. So, while on my machine the underlying bits representing the integer 1,078,530,011 also represent the floating-point decimal 3.141593, the same may not be true on your machine -- all depends on how types are represented.

As a result, there are a number of anti-aliasing rules that put in place some guardrails to generally discourage this kind of thing.

The C17 standard lays out the following guidelines in **§6.5 Expressions**:

```
An object shall have its stored value accessed only by an lvalue expression that has one of the following types:
- a type compatible with the effective type of the object,
- a qualified version of a type compatible with the effective type of the object,
- a type that is the signed or unsigned type corresponding to the effective type of the object,
- a type that is the signed or unsigned type corresponding to a qualified version of the effective type of the object
- an aggragate or union type that includes one of the aforementioned types among its members, or
- a character type.
```

In other words, a variable typed `int` can be accessed as a qualified version of that type (e.g., `const int`) or a signed/unsigned type corresponding to its type (e.g., `unsigned int` or `signed int`) or both. Or it can be accessed as a character type. Or as a union type (more on this soon). But a value in memory typed as an `int` cannot be accessed as a `float`.

Well, it sort of can, if you try really hard. It's just that, like I said, it can lead to unexpected and weird behaviour. Here's one way you can force it:

```c
uint32_t my_int   = 1078530011;
float    my_float = *(float*)&my_int;

printf("my_int: %u\n", my_int);     // => 1078530011
prtinf("my_float: %f\n", my_float); // => 3.141593
```

Here we're basically saying: get the address of `my_int`, recast that address as a float pointer, and dereference the result.

But if you're really insistent on type punning, there's a better and more above-board way of doing it, which also happens to obey the C17 rules above. We can use a union:

```c
union type_pun {
    uint32_t i;
    float    f;
};

union type_pun u;
u.i = 1078530011;

printf("u.i: %u\n", u.i); // => 1078530011
printf("u.f: %f\n", u.f); // => 3.141593
```

The reason this works is because all the members of the union share the same hunk of memory, so the integer `u.i` and the floating-point number `u.f` are both represented by the same underlying bytes. It's just a matter of whether we access those bytes through the integer-typed member or the float-typed member.

That said, there are still good reasons *not* to do this -- and those reasons are the same as before: type punning like this is non-portable and can lead to inconsistent results that are machine- and architecture-dependent. But if you really wanna pun, then, by god, pun!

So . . . why would anyone ever want to do something like this?

# Application 1: NaN-Boxing

One application is nan-boxing, where you use a `double` (a 64-bit floating point number) either literally as a double or, in the event that it's `not a number`, as a vessel for carrying a payload.

A double consists of three parts:
- a sign bit (bit 63)
- 11 bits representing the exponent (bits 52-62)
- 52 bits representing the mantissa, or fraction (bits 0-51)

To represent `nan` (not a number), all 11 exponent bits are set to 1. So the idea is that we can use a double encoded as a `nan` to carry 52 bits of information in its mantissa -- it's just a matter of accessing them. 

And that's where type punning comes in: To access those mantissa bits and extract the payload, we'd have to access that double as a 64-bit integer so we can do the appropriate bitwise mask.

# Application 2: Type Agnostic Data Structures

Another application I stumbled upon more recently is creating type-agnostic data structures. For instance, let's say I want to create a linked list but that I want the nodes comprising that linked list to store either integers or floats or strings. Here's a punny approach involving what's called tagged unions:

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

enum data_type { STRING, INT, FLOAT };

union value {
    int   i;
    float f;
    char  *s;
};

struct variable_data {
    union value    val;
    enum data_type type;
};

struct Node {
    struct variable_data cargo;
    struct Node          *next;
};

struct Node* create_node(enum data_type type, void *val)
{
    struct Node *n = malloc(sizeof(struct Node));

    switch (type) {
        case STRING:
            n->cargo.val.s = (char*)malloc(strlen((char*)val) + 1);
            strcpy(n->cargo.val.s, (char*)val);
            break;
        case INT:
            n->cargo.val.i = *(int*)val;
            break;
        case FLOAT:
            n->cargo.val.f = *(float*)val;
            break;
    }
    n->cargo.type = type;
    n->next       = NULL;

    return n;
}

void print_node(struct Node* n)
{
    switch (n->cargo.type) {
        case STRING:
            printf("%s\n", n->cargo.val.s);
            break;
        case INT:
            printf("%d\n", n->cargo.val.i);
            break;
        case FLOAT:
            printf("%f\n", n->cargo.val.f);
            break;
    }
}

int main()
{

    int my_int = 12345;
    struct Node *int_node = create_node(INT, &my_int);
    print_node(int_node);    // => 12345

    float my_float = 3.1415;
    struct Node *float_node = create_node(FLOAT, &my_float);
    print_node(float_node);  // => 3.1415

    char *my_str = "hello, world";
    struct Node *string_node = create_node(STRING, my_str);
    print_node(string_node); // => hello, world

    return 0;
}
```

Now I can link all these nodes together in a linked list, I can iterate through them and do stuff, etc.
