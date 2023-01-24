---
title: "How to Debug in WordPress"
tags:
  - WordPress
exerpt_separator: "<!--more-->"
---

The other day I was installing a new WordPress theme for a client's site that I inherited from another developer. It can be a bit, well, daunting to confront another dev's work you're not necessarily aware of the site's history, the various development decisions that were made along the way, any modifications, etc. With that in mind, I opted to preview the new theme rather than activate it, and I'm glad I did, because, instead of a site preview, I got an ambiguous but quite dreadful sounding error message: "There has been a critical error on this website." Thanks to WordPress's debugging functionality, though, I was able to get to the bottom of the problem--in this case, a missing PHP extension that was resulting in a call to an undefined function. Voila!

<!--more-->

If you ever find yourself in a similar situation, start by activating WordPress's debugging functions. Here's how.

Set the following three global variables in `wp-config.php`:

```php
// Enable debugging
define( 'WP_DEBUG', true );

// Hide errors from displaying inside page HTML
define( 'WP_DEBUG_DISPLAY', false );

// Instead, write errors to debug.log (by default in wp-content/)
define( 'WP_DEBUG_LOG', true );
```

There are a few other debugging variables available--`SCRIPT_DEBUG` and `SAVEQUERIES` (more info on those [here](https://wordpress.org/documentation/article/debugging-in-wordpress/))--but, for basic debugging, that's all there is to it.
