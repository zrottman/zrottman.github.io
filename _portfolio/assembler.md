---
title: "Assembler"
excerpt: "Converts assembly language to 16-bit machine code."
header:
  teaser: /assets/images/portfolio/assembler/assembler.png
tech:
  - C
  - Python
customlinks:
  - label: GitHub Repo (C)
    url: https://github.com/zrottman/assembler
  - label: GitHub Repo (Python)
    url: https://github.com/zrottman/nand2tetris/tree/main/projects/06
  - label: Related Blog Posts
    url: https://github.com/zrottman/nand2tetris/tree/main/projects/06
---

![Assembler in action](/assets/images/portfolio/assembler/assembler_long.gif)

## Hack Spec

This program assembles Hack, a simple assembly language from *The Elements of Computing Systems* (aka *Nand to Tetris*). Hack comprises of three kinds of instructions:
- **A(ddress) instructions** begin with `@` and load a 15-bit memory address into the CPU's A register
- **C(ompute) instructions** begin with either a destination or computation code and tell the CPU which registers to read from, what to do with those values, where to store the result, and whether to jump elsewhere in the code.
- **L(abel) instructions** are enclosed in parentheses. These are pseudocommands since they are used to label line numbers to enable jumping, but they are not themselves converted into assembly.

### A Instructions

![A instruction](/assets/images/portfolio/assembler/assembler-a.jpg)

- the most significant bit</span> (set to 0) identifies the instruction as an A instruction
- the least significant 15 bits represent a 15-bit unsigned integer

### C Instructions

**C(omputation) Instructions** have three component parts that are encoded into the 16-bit instruction string. For sample C-instructions like "AD=M+1" or "D;JEQ" or "D=1" or "D=M-1;JLT":
- everything to the left of the `=` is the destination part of the command -- i.e., where the ALU's output needs to go. (**D** is the destination in the command `D=M+1`.) This piece of information gets encoded as a 3-bit sequence and spans bits 3-5 of the resulting instruction string.
- everything to the right of the `=` and to the left of the `;` is the computation command -- i.e., what computation the ALU performs on its inputs. (**M+1** is the computation in the command `D=M+1`.) There are a lot of options here, so this piece of information gets encoded as a 7-bit sequence and spans bits 6-12 of the resulting instruction string.
- everything right of the `;` is the jump command, which, if present, loads the value in the A Register (in this case representing a program line number) into the Program Counter, thus "jumping" to another line in the program. (**JGT** specifies the jump in the command `D;JGT`.) This piece of information gets encoded as a 3-bit sequence and spans bits 0-2 in the resulting instruction string.

![C instruction](/assets/images/portfolio/assembler/assembler-c.jpg)

- the most significant bit (set to 1) identifies the instruction as a C Instruction
- bits 13 and 14 aren't used
- the a bit (bit 12) dictates whether the ALU should accept its `y` input from the A Register or from somewhere in memory. This is effectively part of the computation instruction.
- the 6 c bits (bits 6-11) specify the ALU function and are fed into its 6 function inputs `zx`, `nx`, `zy`, `ny`, `f`, and `no`.
- the 3 d bits (bits 3-5) specify the destination for the ALU's output, either `M` (memory), `A` (A register), or `D` (D register), or some combination of the three.
- the 3 j bits (bits 0-2) specify any jump command based on whether the ALU's output is `< 0`, `<= 0`, `== 0`, `>= 0`, or `> 0`.

The binary encodings for each of these component parts are as follows:

**Computation  (bits 6-12)**

<table style="border-collapse: collapse;">
  <tr>
    <th style="padding: 10px; text-align: center; border-right: 0; border-bottom: 2px solid black;">zx</th>
    <th style="padding: 10px; text-align: center; border-right: 0; border-bottom: 2px solid black;">nx</th>
    <th style="padding: 10px; text-align: center; border-right: 0; border-bottom: 2px solid black;">zy</th>
    <th style="padding: 10px; text-align: center; border-right: 0; border-bottom: 2px solid black;">ny</th>
    <th style="padding: 10px; text-align: center; border-right: 0; border-bottom: 2px solid black;">f</th>
    <th style="padding: 10px; text-align: center; border-right: 2px solid black; border-bottom: 2px solid black;">no</th>
    <th style="padding: 10px; text-align: center; border-right: 0; border-bottom: 2px solid black;">out</th>
  </tr>
  <tr>
    <th style="padding: 10px; text-align: center; border-right: 0;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 2px solid black;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">0</th>
  </tr>
  <tr>
    <th style="padding: 10px; text-align: center; border-right: 0;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 2px solid black;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">1</th>
  </tr>
  <tr>
    <th style="padding: 10px; text-align: center; border-right: 0;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 2px solid black;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">-1</th>
  </tr>
  <tr>
    <th style="padding: 10px; text-align: center; border-right: 0;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 2px solid black;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">x</th>
  </tr>
  <tr>
    <th style="padding: 10px; text-align: center; border-right: 0;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 2px solid black;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">y</th>
  </tr>
  <tr>
    <th style="padding: 10px; text-align: center; border-right: 0;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 2px solid black;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">!x</th>
  </tr>
  <tr>
    <th style="padding: 10px; text-align: center; border-right: 0;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 2px solid black;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">!y</th>
  </tr>
  <tr>
    <th style="padding: 10px; text-align: center; border-right: 0;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 2px solid black;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">-x</th>
  </tr>
  <tr>
    <th style="padding: 10px; text-align: center; border-right: 0;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 2px solid black;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">-y</th>
  </tr>
  <tr>
    <th style="padding: 10px; text-align: center; border-right: 0;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 2px solid black;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">x+1</th>
  </tr>
  <tr>
    <th style="padding: 10px; text-align: center; border-right: 0;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 2px solid black;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">y+1</th>
  </tr>
  <tr>
    <th style="padding: 10px; text-align: center; border-right: 0;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 2px solid black;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">x-1</th>
  </tr>
  <tr>
    <th style="padding: 10px; text-align: center; border-right: 0;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 2px solid black;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">y-1</th>
  </tr>
  <tr>
    <th style="padding: 10px; text-align: center; border-right: 0;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 2px solid black;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">x+y</th>
  </tr>
  <tr>
    <th style="padding: 10px; text-align: center; border-right: 0;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 2px solid black;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">x-y</th>
  </tr>
  <tr>
    <th style="padding: 10px; text-align: center; border-right: 0;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 2px solid black;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">y-x</th>
  </tr>
  <tr>
    <th style="padding: 10px; text-align: center; border-right: 0;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 2px solid black;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">x&y</th>
  </tr>
  <tr>
    <th style="padding: 10px; text-align: center; border-right: 0;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 2px solid black;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">x|y</th>
  </tr>
</table>

**Destination (bits 4-6)**

<table style="border-collapse: collapse;">
  <tr>
    <th style="padding: 10px; text-align: center; border-right: 0; border-bottom: 2px solid black;">d<sub>5</sub></th>
    <th style="padding: 10px; text-align: center; border-right: 0; border-bottom: 2px solid black;">d<sub>4</sub></th>
    <th style="padding: 10px; text-align: center; border-right: 2px solid black; border-bottom: 2px solid black;">d<sub>3</sub></th>
    <th style="padding: 10px; text-align: center; border-right: 0; border-bottom: 2px solid black;">Mnemonic</th>
    <th style="padding: 10px; text-align: center; border-right: 0; border-bottom: 2px solid black;">Destination</th>
  </tr>
  <tr>
    <th style="padding: 10px; text-align: center; border-right: 0;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 2px solid black;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">null</th>
    <th style="padding: 10px; text-align: left; border-right: 0;">Don't store anywhere</th>
  </tr>
  <tr>
    <th style="padding: 10px; text-align: center; border-right: 0;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 2px solid black;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">M</th>
    <th style="padding: 10px; text-align: left; border-right: 0;">Memory[A]</th>
  </tr>
  <tr>
    <th style="padding: 10px; text-align: center; border-right: 0;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 2px solid black;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">D</th>
    <th style="padding: 10px; text-align: left; border-right: 0;">D Register</th>
  </tr>
  <tr>
    <th style="padding: 10px; text-align: center; border-right: 0;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 2px solid black;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">MD</th>
    <th style="padding: 10px; text-align: left; border-right: 0;">Memory[A], D Register</th>
  </tr>
  <tr>
    <th style="padding: 10px; text-align: center; border-right: 0;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 2px solid black;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">A</th>
    <th style="padding: 10px; text-align: left; border-right: 0;">A Register</th>
  </tr>
  <tr>
    <th style="padding: 10px; text-align: center; border-right: 0;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 2px solid black;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">AM</th>
    <th style="padding: 10px; text-align: left; border-right: 0;">A Register, Memory[A]</th>
  </tr>
  <tr>
    <th style="padding: 10px; text-align: center; border-right: 0;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 2px solid black;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">AD</th>
    <th style="padding: 10px; text-align: left; border-right: 0;">A Register, D Register</th>
  </tr>
  <tr>
    <th style="padding: 10px; text-align: center; border-right: 0;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 2px solid black;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">AMD</th>
    <th style="padding: 10px; text-align: left; border-right: 0;">A Register, Memory[A], D Register</th>
  </tr>
</table>

**Jump (bits 1-3)**

<table style="border-collapse: collapse;">
  <tr>
    <th style="padding: 10px; text-align: center; border-right: 0; border-bottom: 2px solid black;">j<sub>2</sub></th>
    <th style="padding: 10px; text-align: center; border-right: 0; border-bottom: 2px solid black;">j<sub>1</sub></th>
    <th style="padding: 10px; text-align: center; border-right: 2px solid black; border-bottom: 2px solid black;">j<sub>0</sub></th>
    <th style="padding: 10px; text-align: center; border-right: 0; border-bottom: 2px solid black;">Mnemonic</th>
    <th style="padding: 10px; text-align: center; border-right: 0; border-bottom: 2px solid black;">Jump Command</th>
  </tr>
  <tr>
    <th style="padding: 10px; text-align: center; border-right: 0;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 2px solid black;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">null</th>
    <th style="padding: 10px; text-align: left; border-right: 0;">No jump</th>
  </tr>
  <tr>
    <th style="padding: 10px; text-align: center; border-right: 0;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 2px solid black;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">JGT</th>
    <th style="padding: 10px; text-align: left; border-right: 0;">Jump if <i>out</i> > 0</th>
  </tr>
  <tr>
    <th style="padding: 10px; text-align: center; border-right: 0;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 2px solid black;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">JEQ</th>
    <th style="padding: 10px; text-align: left; border-right: 0;">Jump if <i>out</i> = 0</th>
  </tr>
  <tr>
    <th style="padding: 10px; text-align: center; border-right: 0;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 2px solid black;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">JGE</th>
    <th style="padding: 10px; text-align: left; border-right: 0;">Jump if <i>out</i> >= 0</th>
  </tr>
  <tr>
    <th style="padding: 10px; text-align: center; border-right: 0;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 2px solid black;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">JLT</th>
    <th style="padding: 10px; text-align: left; border-right: 0;">Jump if <i>out</i> < 0</th>
  </tr>
  <tr>
    <th style="padding: 10px; text-align: center; border-right: 0;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 2px solid black;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">JNE</th>
    <th style="padding: 10px; text-align: left; border-right: 0;">Jump if <i>out</i> != 0</th>
  </tr>
  <tr>
    <th style="padding: 10px; text-align: center; border-right: 0;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 2px solid black;">0</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">JLE</th>
    <th style="padding: 10px; text-align: left; border-right: 0;">Jump if <i>out</i> <= 0</th>
  </tr>
  <tr>
    <th style="padding: 10px; text-align: center; border-right: 0;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 2px solid black;">1</th>
    <th style="padding: 10px; text-align: center; border-right: 0;">JMP</th>
    <th style="padding: 10px; text-align: left; border-right: 0;">Jump</th>
  </tr>
</table>

### L Instructions

**L(abel) Instructions** are pseudo-instructions, since they do not directly translate into equivalent lines of machine code. Instead, when L Instructions are encoundered, they are added to a symbols table as references to corresponding line numbers.

## Two Pass Approach

This assembler performs two passes on an input .asm file. 

The first pass identifies L Instructions and adds them to a symbols table with a corresponding line number, so that jump instructions specifying that label know to which line of machine code to jump.

The second pass handles A and C instructions. When symbols are encountered, these are added to the symbols table with an arbitrarily assigned memory address such that each symbol corresponds to a unique address.

## Symbol/Label Lookups

An assembler must maintain a list of symbols, both for A Instructions and L Instructions.

During the first pass, if the assembler encountered an L Instruction -- e.g., `(MY_LABEL)` -- it will insert this label into the symbols table as a key with the corresponding line number as its matching value. When the assembler encounters a label on its second pass, it need only look up `MY_LABEL` in the symbols table to access its matching value (which, in the case of labels, corresponds to a line number for use in jump instructions).

A similar process occurs when the assembler encounters symbols in A Instructions. For instance, if the assembler reads in a line like `@my_var`, it will attempt to look that symbol up in a symbols table to find the corresponding value (in this case, a memory location).  If `my_var` does not exist in the symbols table, then it is arbitrarily assigned an unused address location.

To handle lookups, this assembler implementation uses a linked list, whose nodes have key/value pair members. When the assembler encounters a label on its first pass, it appends that label and corresponding line number to the symbols linked list (a constant time operation, since the linked list struct holds a reference to both head and tail nodes). When the assembler encounters labels or symbols on its second pass, it performs a linear time lookup. If found, the matching value is returned, otherwise a new node is appended to the end of the linked list.

A proper hash table with constant time lookups would be more performant -- I plan to implement this functionality in a future version.

## C Instruction Lookups

The assembler must also be able to convert C Instruction tokens to their corresponding integer codes. For instance, destination command `MD` corresponds to `3` (`0b011`), and the computation commany `A+1` corresponds to `55` (`0b0110111`). To handle lookups for destination, jump, and computation instrutions, this assmbler implementation utilizes parallel arrays to hold key/value pairs. In practice, this involves linear time lookups, however the performance hit is nominal since these arrays are small and constant size.

## Usage

### 1. Compilation:

Before using the assembler, compile it using the included `makefile`. From the root directory, run `make`, which will compile the project and all its dependencies, producing a variety of object files and an executable named `assembler`.

### 2. Assembling:

Once the assembler has been compiled, you can use it to translate your assembly code into machine code. The assembler takes one command line argument, which is the path to the assembly file you want to translate. The command follows this format:

```bash
./assembler path/to/your/assembly_file.asm
```

Replace `path/to/your/assembly_file.asm` with the actual path to your assembly file.

### 3. Output:

After running the above command, the assembler will process the assembly file and generate the corresponding machine code. In addition to being printed to stdout, the output will be saved to a new file with the same name as the input assembly file, but with a different extension (e.g., .hack). You can find this output file in the same directory where your assembly file is located.

### 4. Clean:

To remove executable and all dependent object files, run `make clean`.

## Example

Here's an example of how you could use the assembler to translate an assembly file named "example.asm":

```bash
./assembler example.asm
```

After running this command, you will find the assembled machine code in a file named "example.hack" in the same directory.

```
> ./assembler path/to/Rect.asm
 0:              @0 --> 0000000000000000
 1:             D=M --> 1111110000010000
 2:  @INFINITE_LOOP --> 0000000000010111
 3:           D;JLE --> 1110001100000110
 4:        @counter --> 0000000000010000
 5:             M=D --> 1110001100001000
 6:         @SCREEN --> 0100000000000000
 7:             D=A --> 1110110000010000
 8:        @address --> 0000000000010001
 9:             M=D --> 1110001100001000
10:          (LOOP) -->
10:        @address --> 0000000000010001
11:             A=M --> 1111110000100000
12:            M=-1 --> 1110111010001000
13:        @address --> 0000000000010001
14:             D=M --> 1111110000010000
15:             @32 --> 0000000000100000
16:           D=D+A --> 1110000010010000
17:        @address --> 0000000000010001
18:             M=D --> 1110001100001000
19:        @counter --> 0000000000010000
20:          MD=M-1 --> 1111110010011000
21:           @LOOP --> 0000000000001010
22:           D;JGT --> 1110001100000001
23: (INFINITE_LOOP) -->
23:  @INFINITE_LOOP --> 0000000000010111
24:           0;JMP --> 1110101010000111
Output file: path/to/Rect.hack
Took 0.001327 seconds
```

## Misc.

This assembler is a C port of the Python assembler I built during my Summer 2023 batch at the Recurse Center while completing [The Elements of Computing Systems](https://github.com/zrottman/nand2tetris).
