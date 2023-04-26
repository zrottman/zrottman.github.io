---
title: "Implementing the Observer Pattern"
tags:
  - Design Patterns
tech:
  - python
exerpt_separator: "<!--more-->"
---

I faced some challenges on a recent project, which I solved by implementing the Observer design pattern. Or a version of it, anyway. Here's how I did it.


<!--more-->

<figure>
<img src="/assets/images/observer-robot.png" alt="Robots, observed">
<figcaption align='center'>Robots, observed (by DALL-E 2).</figcaption>
</figure>


# The Problem

While working on [this bit manipulator tool](http://bitsbud.com/), I encountered an interesting dilemma. The idea for the JavaScript app was simple: Two interactive input bytes, with each bit represented by a clickable <code>&lt;button&gt;</code> element, and an output byte, which dynamically reflects a logical operation performed on the two bits. Every time an input bit is toggled on or off, the output byte would change accordingly. Every time an input byte was shifted left or right, the output byte would change accordingly. And every time a different logical operation is selected (i.e., `AND`, `OR`, or `XOR`) -- you guessed it -- the output byte would change accordingly.

The question for me was how to accomplish this.

# The Functional Approach

The first time through, I took a functional approach, hard-coding in my two input bits and my output bits, and building a variety of functions to manipulate the input bits in all the ways listed above, each of which in turn calling a `render()` function that would re-render the UX: the two input bytes and the output byte, each with binary and integer equivalents.

This worked worked, but at a certain point I realized there was a lot of redundancy. For instance, my `render()` function may have needed to call a `renderBinary()` function three times -- once for each byte. And all of a sudden I realized that an object-oriented approach would offer a natural and more maintanable solution, since each `Byte` object would effectively need the same range of properties (for example, an array of 8 integers holding its current state) and methods (for instance, a method to return that state as a binary string or as an integer).

# The Object-Oriented Approach

Reconceptualizing the software in terms of `Byte` objects made a whole lot of sense, and immediately simplified and consolidated much of the code. But there was one major issue: I couldn't quite figure out how to get the objects to talk to one another. In the previous functional iteration, updating the output byte was just a matter of calling an `update()` function, which in turn updated the output byte depending on the current states of the two input bytes and the selected logical operation, and then re-rendered the various input and output elements to the screen. Now, however, if I toggled a bit on one of the input `Byte` objects, how in the world was the output `Byte` object supposed to know about it?

It seemed like the input bytes (let's call them `byteA` and `byteB`) would have to have some knowledge of the output byte (`byteY`) so that they could prompt `byteY` to update itself each time one of their states changed. In that case, maybe calling `byteA.updateOutput()` would in turn call `byteY.updateOutput(this)` on its reference to `byteY`, passing itself along to the `byteY` object. But that wouldn't quite cut it, since `ByteY` needs the states of `byteA` *and* `byteB` in order to update itself.

Surely this was a problem others have encountered before. And indeed, after much head-scratching, I stumbled upon the Observer pattern, which was designed to fulfill a very similar use case.

# The Observer Approach

In its simplest form, the Observer pattern requires two types of objects, an Observable or Subject and an Observer. 
- The Observable holds references to its Observer(s) and, when it has an update, it will call a `notify()` method, which will in turn call an `update()` method for each of its Observer objects, passing along itself as an argument. An Observable can also attach and detach observers if need be.
- The Observer object has the aformentioned `update()` method, which takes as a parameter an Observable object, whose state it can use to update itself accordingly.

Let's say we have an Observable with a `value` property and a `set_value()` method to update that property. And let's say we have an Observer with a `value` property that is always updated to be the square of the Observable's `value`. That code would look something like this in Python:

```python
class Observable:
    
    def __init__(self, value = None):
        self.observers = []
        self.value = value
    
    def attach_observer(self, observer):
        if observer not in self.observers:
            self.observers.append(observer)
            observer.update(self)
    
    def detach_observer(self, observer):
        if observer in self.observers:
            self.observers.remove(observer)
    
    def notify_observers(self):
        for observer in self.observers:
            observer.update(self)
    
    def set_value(self, new_value):
        self.value = new_value
        self.notify_observers()
    
    def get_value(self):
        return self.value

        
class Observer:
    
    def __init__(self, observable):
        self.value = None
        observable.attach_observer(self)
    
    def update(self, observable):
        self.value = observable.value ** 2
    
    def get_value(self):
        return self.value

subject = Observable(10)     # Set the subject's value to 10
observer = Observer(subject) # Create an Observer to observe `subject`

observer.get_value()
```



    100




```python
subject.set_value(5)
observer.get_value()
```




    25




```python
subject.detach_observer(observer)
subject.set_value(100)
observer.get_value()
```




    25




```python
subject.attach_observer(observer)
observer.get_value()
```




    10000




Pretty cool! As you can see, each time we call `set_value()` on the Observable, it calls `notify_observers()`, which, for each of its Observers, calls `update()`. In other words, any time we change the Observable's value, the Observer (or Observers, since there can be more than one) knows about it and does whatever it needs to do. If we detach the Observer, then it no longer gets updated. It's no longer observing, after all! And if we reattach it, it automatically updates itself once again, since that's the way I've built the class.

# Implementing Observer with the Bit Manipulation App

Okay, so, seems like the Observer pattern was just what the doctor ordered, right?

Almost. The issue, which I already sensed was coming, is that the Observer object in this case needs to know about the states of *both* input bytes, not just the one that's calling `notify()`. My solution, which may be a little clunky since it involves tightly coupling the Observables and Observer, is to add additional parameters to the class to hold these two input references. If `byteA` has a state change and calls its `notify()` method, it will in turn simply call the `update()` method for its Observer without having to pass itself along as an argument, since the Observer already knows what it's inputs are. 

While this is tightly coupled, I think it can be justified since it reflects the real-world scenario that this class is attempting to represent -- namely mimicing basic logic circuitry, where two inputs and an output are connected through a logic gate. The output bit needs to know what its two input bits are -- its a function of them -- and each of the input bits needs to be connected to an output.

There's one additional consideration in the code I landed on, which I'm about to demo. In the implementation above, there were distinct Observer and Observable classes. But what if an object can be observed *and* observe? That's the case with a combinational circuit, where two bits may be the inputs for an output bit, which may in turn be an input elsewhere.

Without further ado, then, here's a schematic version of the `Byte` class I came up with, which can both observe two input bytes and also be observed by an output byte.


```python
class Byte:
    
    def __init__(self, name, input_bytes = (None, None)):
        self.name = name       # For display purposes
        self.bits = [0] * 8    # [0, 0, 0, 0, 0, 0, 0, 0]
        
        # Properties for observable (input) bytes
        self.observer = None   # Output byte "observing" two input bytes
        
        # Properties for observer (output) bytes
        self.operator = '&'
        self.operator_function = lambda a, b: a & b  # Default operator
        self.input_a, self.input_b = input_bytes
        if self.input_a: self.input_a.attach_observer(self)
        if self.input_b: self.input_b.attach_observer(self)
        
    
    # Output methods    
    def __str__(self):
        return '{}{:<9}: {:3} (0b{})'.format(self.name, self.to_operation_str(), self.to_int(), self.to_bin_str())
    
    def to_bin_str(self):
        return ''.join([str(bit) for bit in self.bits])
    
    def to_int(self): 
        return int('0b' + self.to_bin_str(), 2)
    
    def to_operation_str(self):
        if not self.observer:
            return ' = ' + self.input_a.name + ' ' + self.operator + ' ' + self.input_b.name
        else:
            return ''
    
    
    # Bit manipulation methods    
    def toggle_bit(self, i):
        self.bits[i] = 0 if self.bits[i] else 1    
        self.notify_observer()

    def shift_left(self):
        shifted = self.to_int() << 1
        shifted = min(shifted, 255) # Ensure `shifted` is 8-bit int
        self._update_bin_arr(shifted)
        self.notify_observer()

    def shift_right(self):
        shifted = self.to_int() >> 1
        self._update_bin_arr(shifted)
        self.notify_observer()
        
    
    # Operator methods   
    def set_operator_function(self, operator):
        match operator:
            case 'AND':
                self.operator = '&'
                self.operator_function = lambda a, b: a & b
            case 'OR':
                self.operator = '|'
                self.operator_function = lambda a, b: a | b
            case 'XOR':
                self.operator = '^'
                self.operator_function = lambda a, b: a ^ b

        self.update()

    
    # Helper methods    
    def _update_bin_arr(self, num):
        # Translates integer `num` to binary and updates `self.bits`
        bin_str = bin(num)[2:]
        bin_str = '00000000'[len(bin_str):] + str(bin_str)
        self.bits = [int(bit) for bit in bin_str]
        
    
    # Observable (input byte) methods    
    def attach_observer(self, observer):
        self.observer = observer
    
    def notify_observer(self):
        if self.observer: self.observer.update()
    
    
    # Observer (output byte) methods    
    def update(self):
        a_int = self.input_a.to_int()
        b_int = self.input_b.to_int()
        self._update_bin_arr(self.operator_function(a_int, b_int))
```


```python
a = Byte('a')         # Input byte
b = Byte('b')         # Input byte
y = Byte('y', (a, b)) # Output byte with inputs `a` and `b`

a.toggle_bit(3)
a.toggle_bit(4)
a.toggle_bit(5)

b.toggle_bit(2)
b.toggle_bit(3)
b.toggle_bit(4)

print(a)
print(b)
print(y)
```

    a         :  28 (0b00011100)
    b         :  56 (0b00111000)
    y = a & b :  24 (0b00011000)



```python
y.set_operator_function('OR')
a.toggle_bit(0)
print(a)
print(b)
print(y)
```

    a         : 156 (0b10011100)
    b         :  56 (0b00111000)
    y = a | b : 188 (0b10111100)



```python
y.set_operator_function('XOR')
print(a)
print(b)
print(y)
```

    a         : 156 (0b10011100)
    b         :  56 (0b00111000)
    y = a ^ b : 164 (0b10100100)



Pretty cool!

And just to prove that `Byte` instances can serve as inputs *and* outputs, here's a more complex example:
- inputs `a1` and `b1` output `y1`
- inputs `a2` and `b2` output `y2`
- `y1` and `y2` are designated as inputs for the final output of this combinatorial circuit, `z`


```python
a1 = Byte('a1')
b1 = Byte('b1')
y1 = Byte('y1', (a1, b1))

a1.toggle_bit(3)
a1.toggle_bit(4)
a1.toggle_bit(5)

b1.toggle_bit(2)
b1.toggle_bit(3)
b1.toggle_bit(4)

print(a1)
print(b1)
print(y1)
```

    a1          :  28 (0b00011100)
    b1          :  56 (0b00111000)
    y1 = a1 & b1:  24 (0b00011000)



```python
a2 = Byte('a2')
b2 = Byte('b2')
y2 = Byte('y2', (a2, b2))

a2.toggle_bit(0)
a2.toggle_bit(1)
a2.toggle_bit(4)
a2.toggle_bit(7)

b2.toggle_bit(0)
b2.toggle_bit(3)
b2.toggle_bit(5)

y2.set_operator_function('XOR')

print(a2)
print(b2)
print(y2)
```

    a2          : 201 (0b11001001)
    b2          : 148 (0b10010100)
    y2 = a2 ^ b2:  93 (0b01011101)



```python
z = Byte('z', (y1, y2))
z.set_operator_function('XOR')
print(y1)
print(y2)
print(z)
```

    y1          :  24 (0b00011000)
    y2          :  93 (0b01011101)
    z  = y1 ^ y2:  69 (0b01000101)



