# The Jungle
Welcome!

## Intro ##
The Jungle is a working copy of my experiments in game engine design, experimental artificial intelligence, procedural world generation, and various other wide-ranging game engine and design concepts I will be testing throughout the lifetime of this code. It's programmed in JavaScript and the graphics system used is HTML5 Canvas for the time being. Everything is currently single-threaded, but webworkers will probably be used at some point in the future once requirements begin to rise. 

## Files ##
 # app.js #
 This is the main application file that initializes and abstracts platform code (the canvas, the event listeners, some of the drawing functions, etc.), implements some of the larger structures that are used throughout the project (the map hash table, asset caching, etc.), and also handles drawing to the screen (both HUD elements/debug info and entities). As time goes on, I plan on pulling a lot of the specialized functionality out of this file (such as the drawing, and perhaps the hash mapping system) to make it so that this just calls on other files and establishes the platform. 

 # assets.js #
 This brief file establishes the file structure for the image .pngs, loads the images, and adds them to the cache.

 # behaviors.js # 
 This file encapsulates entity behaviors, entity knowledge, and functions for simulating decision trees modularly for all entities.

 # entity.js # 
 This file is where entities are created and given properties, including properties that define their behavior. These are taken from the previous file, in theory - right now, they're all the same behavior with differences based on their differing instantiation properties. 

 # perlin.js #
 In theory, this file will be used when generating environments procedurally, but it isn't being used now. 

## Credits ##
perlin.js:
'A speed-improved perlin and simplex noise algorithms for 2D.
Based on example code by Stefan Gustavson (stegu@itn.liu.se).
Optimisations by Peter Eastman (peastman@drizzle.stanford.edu).
Better rank ordering method by Stefan Gustavson in 2012.
Converted to Javascript by Joseph Gentle.
Version 2012-03-09
This code was placed in the public domain by its original author,
Stefan Gustavson. You may use it as you see fit, but
attribution is appreciated.'
