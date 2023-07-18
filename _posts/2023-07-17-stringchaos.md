---
title: "String Chaos and Compiler Sleight-of-Hand"
excerpt_separator: "<!--more-->"
category: Recurse Center
tags:
  - C
  - Building an Assembler in C
series-intro: >
  Daily dispatches from my 12 weeks at the Recurse Center in Summer 2023
Modified: 2023-07-18
---

We need to talk about strings.

I'm working on porting my Python assembler to C, and I'm getting to the harder stuff. As I wrote about [in my last post](https://www.datadoodad.com/recurse%20center/Assembler-Part-2/) I settled on parallel arrays to deal with lookups for various assembly commands. Now I need to start thinking about how to support symbols. 

Symbols are a slightly different beast because, unlike the finite list of assembly commands, symbols can be arbitrary in number. That means I need some sort of symbols table that can grow every time the assembler discovers a new **label** (a line like `(JUMPHERE)`) or a **symbol** (a human-friendly name for an arbitrary space in RAM, like `@my_var`). As with the lookup tables from last time, the obvious choice is a hashmap, which can do inserts and lookups in constant time, but I'm leaving hashmaps for another day. So the way I see it I have two options:
1. **parallel arrays** (again). These have the advantage of being easy to use but the disadvantage of being static in size, which means I either have to allocate enough space to safely handle what I determine to be a reasonable number of symbols (probably not a great idea, and also inefficient for small programs with few labels) or include functionality to reallocate larger arrays in the event that the symbols outgrow the array initially allocated for them (. . .nah)
2. a **linked list**, with each node holding a key/value pair. Linked lists also have the advantage of being relatively easy to implement, and, like the parallel arrays solution, have linear time commplexity. However, unlike arrays, they're dynamic, which means they need only take up as much space as the number of symbols we encounter -- nothing more, nothing less.

Linked list it is! My decision made, I turned towards implementation.

```c
typedef struct Node {
    char*        key;
    int          value;
    struct Node* next;
} Node;

Node* create_node(char* key, int val)
{
    Node* node   = malloc(sizeof(Node));

    node->key = key;
    node->value  = val;
    node->next   = NULL;

    return node;
}

 void insert_node(Node* head, Node* new_node)
 {
     while (head->next != NULL)
         head = head->next;
 
     head->next = new_node;
 }
```

So far, so good, right? \*brushes dirt off hands\*

Just need a little search function specific to this assembler: it'll perform a linear search for a given `key` string and return the matching `value` if it finds it. If not, it'll insert a new node into the list with that `key` and assign it a unique integer value (the arbitrary memory address that that symbol key will be associated with).

```c
int search(Node* head, char* target, int* default_val)
{
    for (Node* cur = head; cur != NULL; cur = cur->next) {
        if(cur->key == target)
            return cur->value;
    }

    insert_node(head, create_node(target, *default_val));

    return (*default_val)++;
}
```

Let's say, then, we have the following linked list `key/value` pairs (an abridged version of how the assmbler's symbols table will be initialized):

    SP/0 -> LCL/1 -> ARG/2 -> THIS/3 -> THAT/4 -> 

Now we can search for things:

```c
int default_val = 16;   // default value for symbol additions
int res;                // search result

res = search(symbols, "ARG", &default_val);     // => 2
res = search(symbols, "my_var", &default_val);  // => 16
res = search(symbols, "x", &default_val);       // => 17
res = search(symbols, "THAT", &default_val);    // => 4
```

And now the linked list looks like this:

    SP/0 -> LCL/1 -> ARG/2 -> THIS/3 -> THAT/4 -> my_var/16 -> x/17 ->

It works! But it probably shouldn't. Or, rather, it works because the compiler is doing a little legerdemain that obscures the reasons why this solution is not excellent.

# String chaos

<figure>
<img src="/assets/images/2023-07-17/chaos-reigns.gif" alt="chaos reigns" width="100%;">
<figcaption align='center'>I'm pretty sure the compiler is the fox in this metaphor</figcaption>
</figure>

The problem lies in my naive approach to comparing strings: `cur->key == target`. This is not doing what I think it's doing, that is, comparing the string of characters to which each pointer is pointing. No, what it's doing is comparing the *pointers*, full stop. Which, come to think of it, seems like it shouldn't even work in the first place, since how could the string "ARG" that I'm passing into `search()` have the same address as the the node whose `key` is "ARG"? And yet, if we printed the addresses of `cur->key` and `target` from within the `search()` function, it turns out that they're the same!

Here's a more concise illustration of this unexpected behaviour:

```c
char *symbol_1 = "my_var";
char *symbol_2 = "my_var";
Node* my_node = create_node(symbol_1, 10);

if (symbol_1 == symbol_2)
    printf("symbol_1 == symbol_2\n"); // this gets printed
else
    printf("symbol_1 != symbol_2\n");

printf("symbol_1 address: %p\n", symbol_1);
printf("symbol_2 address: %p\n", symbol_2);
printf("my_node->key:     %p\n", my_node->key);
```

The above outputs:

    symbol_1 == symbol_2
    symbol_1 address: 0x10d56feb8
    symbol_2 address: 0x10d56feb8
    my_node->key:     0x10d56feb8

That's counterintuitive! After all, we're creating two separate char pointers, `symbol_1` and `symbol_2`, so intuitively `symbol_1 != symbol_2` (since they ought to be pointing to different places in memorry), and yet they share the same address along with `my_node->key`.

Turns out there are a few things going on here. The first is called string interning, where the compiler notices that we're initializing two char pointers with the same string. Rather than putting that same string in memory twice, the compiler does some optimizations and just points them both to the same sequence of characters. That's why inspecting the addresses of `symbol_1` and `symbol_2` reveals them to be pointing at precisely the same location in memory.

The second issue has to do with building the Node struct. When we set `node->key = key`, we are effectively assigning one char pointer (`node.key`) the value of another char pointer (`key`), which means that both are pointing to the same spot in memory.

Here is a revised version copies the contents of the `key` string to newly-allocated space in memory and performs string comparisons not by comparing their pointers (`str_1 == str_2`) but by comparing their contents, character-for-character (`strcmp(str_1, str_2)`):

```c
typedef struct Node {
    char*        key;
    int          value;
    struct Node* next;
} Node;

Node* create_node(char* key, int val)
{
    Node* node = malloc(sizeof(Node));

    node->key = malloc(strlen(key) + 1);
    strcpy(node->key, key);
    node->value = val;
    node->next  = NULL;

    return node;
}

int search(Node* head, char* target, int* default_val)
{
    for (Node* cur = head; cur != NULL; cur = cur->next) {
        if (strcmp(cur->key, target) == 0)
            return cur->value;
        }
    }

    insert_node(head, create_node(target, (*default_val)++));

    return *default_val;
}

```

In the `create_node()` function, we first allocate space on the heap for a new Node struct (20 bytes in my estimation -- two 8-byte pointers and a 4-byte int). Then we allocate enough space starting where `node->key` is pointing to accommodate the string that has to fit there (`strlen(key) + 1`). Finally we can stick the contents of the `key` parameter there using `strcpy()`. Now, if `search()` checks for equality using `cur->key == target`, this comparison will be false even if the contents of each char pointer are the same, since each is pointing to a separate place in memory, which is to say that the first and second pointers are not the same. Instead, we check for equality using `strcmp` (which returns 0 when the contents of each string are identical).

# For my final trick . . .

Here's my full linked list implementation, which I've fleshed out with wrapper struct `LinkedList` to hold on to references to the head and tail of the linked list.

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct Node {
    char*        key;
    int          val;
    struct Node* next;
} Node;

typedef struct LinkedList {
    Node* head;
    Node* tail;
    int   len;
} LinkedList;

Node* create_node(char* key, int val)
{
    Node* node  = malloc(sizeof(Node));

    node->key   = malloc(strlen(key) + 1);
    strcpy(node->key, key);
    node->val   = val;
    node->next  = NULL;

    return node;
}

LinkedList* create_linked_list(void)
{
    LinkedList* linkedlist = malloc(sizeof(LinkedList));
    linkedlist->head = NULL;
    linkedlist->tail = NULL;
    linkedlist->len  = 0;

    return linkedlist;
}

void print_linked_list(LinkedList* linkedlist)
{
    for (Node* cur = linkedlist->head; cur != NULL; cur = cur->next)
        printf("%s/%d -> ", cur->key, cur->val);
    printf("\n");
}

int append(LinkedList* linkedlist, Node* new_node)
{
    if (linkedlist->head == NULL) {
        linkedlist->head = linkedlist->tail = new_node;
    } else {
        linkedlist->tail->next = new_node;
        linkedlist->tail = linkedlist->tail->next;
    }
    return ++linkedlist->len;
}

int search(LinkedList* linkedlist, char* target_key, int* default_val)
{
    for (Node* cur = linkedlist->head; cur != NULL; cur = cur->next) {
        if (strcmp(cur->key, target_key) == 0)
            return cur->val;
    }

    append(linkedlist, create_node(target_key, *default_val));

    return (*default_val)++;
}

int delete_node(LinkedList* linkedlist, char* target_key)
{
    /* doesn't yet handle deletion of head node */

    Node* tmp;
    for (Node* cur = linkedlist->head; cur->next != NULL; cur = cur->next) {
        if (strcmp(cur->next->key, target_key) == 0) {
            tmp = cur->next->next;
            free(cur->next->key);
            free(cur->next);
            cur->next = tmp;
            return 0;           // return 0 if found
        }
    }

    return -1;                  // return -1 if not found
}

int main()
{

    int default_val = 16;       // starting default val for inserts

    // create empty linked list
    LinkedList* symbols = create_linked_list();

    // add something
    append(symbols, create_node("my_key", 100));

    // search for something that doesn't exist
    search(symbols, "your_key", &default_val); //  => returns 16

    // print
    print_linked_list(symbols); // => my_key/100 -> your_key/16 ->

```
