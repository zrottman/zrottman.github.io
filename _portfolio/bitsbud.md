---
title: "BitsBud"
excerpt: "A friendly bit manipulator to help folks develop better intuition for bits, bytes, and bitwise operations."
header:
  teaser: /assets/images/js_playground_03_bitwise-operations.png
link: http://www.bitsbud.com
tech:
  - HTML/CSS
  - JavaScript
customlinks:
  - label: GitHub Repo
    url: https://github.com/zrottman/bitsbud
  - label: Blog Post
    url: https://www.datadoodad.com/observerpattern/
---

A friendly bit manipulator to help folks develop better intuition for bits, bytes, and bitwise operations.

![Screenshot of BitsBud](/assets/images/js_playground_03_bitwise-operations.png)

A while back I started getting into basic circuitry. I loved building and playing with logic gates, using them to create 4-bit adders, that sort of thing. So when I first encountered weird Python syntax like `8 & 11 # -> 8` or `2 ^ 12 # -> 14` or `11 >> 1 # -> 5`, I understood what was going on -- at least once I sorted out that these were bitwise operations which were manipulating and combining the binary guts of these integers. Without so much time connecting LEDs to logic gates, though, I'm not sure I would have been as primed to confront bitwise operations.

With that in mind, I wanted to create a simple interface that would facilitate the kind of things I was doing with LEDs on a breadboard. I wrote a JavaScript program to store the states of two input bytes, each represented by an array of 8 1's and 0's, and render them as clickable `&lt;button&gt;` elements which would toggle bits on and off. And then an output byte, also represented by an array of 8 1's and 0's and rendered as `&lt;button&gt;` elements, would display the result of a given logical operation -- `AND`, `OR`, or `XOR`. I also wanted to make sure that the visual representations of these bytes was translated to its binary and integer equivalents. That way, if the user toggled on and off some input bits, she could see that one input was 01100110 (the binary equivalent of 102) and the other was 00101010 (the binary equivalent of 42), and that `AND`ing these two bytes would result in 00100010 (or 34), since those are the bits that were active in both input bytes. And while I was at it, I thought I may as well add some bit-shifting functionality for the input bytes, right? So I did that, too.

I get it: Building combinatorial circuits on breadboards with LEDs and logic gates isn't everyone's thing. Hopefully this tool can provide a similar, and similarly tinker-y, benefit for others with a bit less tedium.
