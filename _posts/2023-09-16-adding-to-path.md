---
title: "On Adding Executables to PATH and Becoming All-Powerful"
excerpt_separator: "<!--more-->"
tags:
  - C
  - Linux
  - Unix
---

For the past few months you've been learning C and writing toy programs. But you're getting sick of having to include their relative paths when you want to execute them.

<!--more-->

```
~/path/to/my/program $ ./hi
Hello, handsome genius.
```

What a hassle for a quick compliment!

Wouldn't it be cool if you could indulge your vanity just as quickly and easily as using any of the familiar utilities on which you rely? Things like `wc` or `dig`?

Thanks to your C journey, you have the vague but probably correct notion that those classic utilities are also written in C and that, moreover, the compiled executables are in all likelihood just stored somewhere special. So, you think, perhaps it's possible to write your own custom utilities, if only you knew how to make them executable from anywhere in the shell.

Turns out it's super easy and high-reward, and you feel like the handsome genius you knew you always were even without the computer telling you so.

Here are the steps you took along the way:

### 1. Compile your C program.

```
~/path/to/my/program $ cc hi.c -o hi
```

### 2. Make your special utils directory
Make a directory where you'll put your custom utility (apparently `~/bin` is a common place to put these, so that's what you do, but there are plenty of other conventions and options), and put your executable there.

```
~/path/to/my/program $ mkdir ~/bin
~/path/to/my/program $ mv hi ~/bin
```

### 3. Update PATH
Add your new `~/bin` directory to your PATH variable, which specifies where the shell should look for commands. You can do this for the duration of your session with `export PATH=$PATH`, or you can add a line like this to your shell config file (i.e., `.bash_rc`, `.bash_profile`, etc.). If you do the latter, reload that config file with `source ~/path/to/.config_file`.

Option 1: Add to PATH for the sesh
```
~/path/to/my/program $ export PATH="$PATH:$HOME/bin"
```

Option 2: Permanently add to PATH
```
~/path/to/my/program $ echo 'export PATH="$PATH:$HOME/bin"' >> ~/.bash_profile
~/path/to/my/program $ source ~/.bash_profile
```

### 4. Call your utility.

```
> hi
Hello, handsome genius.
```

### 5. Revel in your power.
You are a genius.
