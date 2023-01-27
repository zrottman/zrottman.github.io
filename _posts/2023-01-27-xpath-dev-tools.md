---
title: "How to Find an Element's XPath with Dev Tools"
tags:
  - HTML/CSS
  - Selenium
  - Dev Tools
exerpt_separator: "<!--more-->"
---

I'm working on a script for scraping a particularly complicated site, which makes targeting specific HTML elements especially tricky. Dev tools to the rescue!

<!--more-->

At first I was manually reconstructing tag hierarchies (e.g., `.class_1 .class_2 .class_3`) to target specific elements, and then passing those hierarchies to BeautifulSoup's `.select()` method. Usually this worked, but it was a tendious process for this site and one that yielded unexpected results at times, too, since it turned out additional page elements shared the same tags, which meant I had to go back and built an even more specific tag hierarchy. Targeting elements using an XPath expression would provide more control, but manually putting that path together posed the same problem.

Turns out developer tools does it for you:

1. Right-click the element you're targeting and select `Inspect` to open Dev Tools
2. In the `Elements` tab, ensure you've selected the correct HTML element
3. Right-click on the element you're targeting, and then select `Copy > Copy XPath`

Voila! So simple. Armed with the XPaths of the elements I was targeting, I ended up using Selenium's `.find_elements()` method like this:

```python
# Import Selenium modules
from selenium import webdriver
from selenium.webdriver.common.by import By

# Instantiate driver
driver = webdriver.Chrome()

# Load page
driver.get('http://www.mywebsite.com')

# Target element
try:
    target_element = driver.find_element(By.XPATH, '//sample/xpath/to/targeted[@class="element"]')
except NoSuchElementException:
    # Handle exception
else:
    # Do something with target_element
```
