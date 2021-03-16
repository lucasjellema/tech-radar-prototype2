# Logbook of explorations in this prototype

## TODOs
- sector-label and ring-label styling? (font, size, fill) editable in UI 
- assign background color to area outside radar (ring == -1? , per sector or in general?)
- extend (foreign object) text editor for labels - larger, add font family/size/color/style
- extend (foreign object) text editor for different types of input (select, combo, radio)
- add background image (upload/URL) for sector; 
- define position (X,Y) and scale for background image
- remove background image for sector/ring



## March 16th

- drag & drop sector background images
- set scale factor for sector background image

## March 15th

- paste background image for sector

### Resources
- Paste Images, capture in JavaScript  https://ourcodeworld.com/articles/read/491/how-to-retrieve-images-from-the-clipboard-with-javascript-in-the-browser

- How does the paste image from clipboard functionality work in Gmail and Google Chrome 12+?
  https://stackoverflow.com/questions/6333814/how-does-the-paste-image-from-clipboard-functionality-work-in-gmail-and-google-c 

## March 13th
- upload/download entire data set 
- consider radar an ecapsulated component that allows a decorator function (to enhance radar elements/make them editable ) and publishes radar events (ring selection, sector selection)
- pub/sub mechanism (through data.js) for refresh radar (various events can trigger radar refresh - load data, change template, change template details)
- code for text editing in module textEditing
- leverage font styling for element, parent, default at template level (radar.js styleText)
- clone template & create new template
- select template (from list of templates)

### Resources
* Optional Chaining - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining
* Nullish Coaleascing operator - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing_operator

## March 12th

- configure the sizes 
- configure the shapes for the template 
- blackout function for simple, custom debouncing (module utils.js)
- manage data in data.js - complex object with multiple templates

## March 11th

- save data to local storage // note: with two browser tabs open, race conditions may occur around saving data
- load data from local storage
- configure the colors for the viewpoint template (which colors can be selected for the blips)

## March 10th

- title - editable
- synchronize opacity slider with currently selected ring or sector
- add rings or sectors
- remove rings or sectors
- move/resequence rings and sectors


### Resources
* Add item to/remove item from Array (using splice) - https://flaviocopes.com/how-to-add-item-to-array-javascript/


## March 9th

- extended (or not extended) sector boundaries
- ring knobs - for changing ring width
- sector knobs - for changing sector angle
- opacity slider - for changing ring and sector opacity
- apply rotation only to sectors (not rings)
- print ring labels separately and lastly (on top)
  

### Resources
Drag & Drop in SVG - https://www.petercollingridge.co.uk/tutorials/svg/interactive/dragging/
Debouncing & Throttling  https://www.telerik.com/blogs/debouncing-and-throttling-in-javascript


## March 8th

- allow setting background color for selected ring or sector
- allow (visual) selection of ring or sector
- determine/switch whether rings or sectors are top layer (top layer)  use order of rendering (no layers available) in SVG to determine whether sectors or rings are on top

Challenges 
- dynamically add event handler to DOM element
- show SVG element in right 'layering' (simply draw top element last; no z-dimension or layers in SVG)
- divide page in two panels (wide column for radar and narrow column for controls)

## March 7th

- use arcs for rings instead of full circles


### Resources
3 column layout with CSS https://www.w3schools.com/howto/howto_css_three_columns.asp


## March 2nd

- edit sector labels (and if rings are on top, also edit ring titles)
 
implemented:
- slider to rotate the radar
- sector labels are clickable; a popup field editor appears - and disappears; TODO: process new value


### Resources
Sliders - https://bl.ocks.org/johnw alley/e1d256b81e51da68f7feb632a53c3518
D3 sliders - https://github.com/johnwalley/d3-simple-slider
Field Editor - http://bl.ocks.org/GerHobbelt/2653660  SVG Foreign Object

## March 1st

Ring and Sector can both have a background; sector is laid on top of ring - with a degree of transparancy
Show sector label curved around the outer ring
When dragging sector knobs - derive polar phi angle from polar coordinates of mouse position

implemented:
- rings - variable number, labels and colors dynamically assigned
- sectors - variable number, labels and colors dynamically assigned
- sector labels printed alongside the outer ring's rim - flipping for top half for better readability
- rotation of full radar TODO: undo rotation for RING labels

### Resources:
SVG: Convert circle to path  - http://complexdan.com/svg-circleellipse-to-path-converter/
SVG Place text along path - https://oreillymedia.github.io/Using_SVG/extras/ch07-textpaths.html
Curved Text Along a Path - https://css-tricks.com/snippets/svg/curved-text-along-path/
Mozilla Developer - introduction to SVG Path - https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths 
D3.js arc generator - https://www.d3indepth.com/shapes/#arc-generator 
D3 Arc Generator for Pie and Donut Chart - https://edupala.com/d3-arc-generator-for-pie-and-donut-chart/
SVG Circle Segments - https://observablehq.com/@haakenlid/svg-circle 

## Objective One - 28th February

The Viewpoint Editor
A webpage that allows defining the configuration of a viewpoint. Components in this configuration are:
- number and width of rings
- number and percentage of sectors (fka quadrants)
- labels for sectors
- labels for rings
- color and background image for: sectors, rings, segments
- location of legend (per sector or per ring)
- special segments (default, no-go areas)

this editor works on a data structure that defines the viewpoint:

- label
- type (radar)
- rotation (%)
- rings - outside rings allowed? []
  - label
  - width (%)
  - background color
  - background image 
  - hidden?
- sectors []
  - label
  - angle (%)
  - background color
  - background image  
  - hidden?
- sizes
  - radius
- shapes
  - ... 
- default segment (ring, sector)
- blip default - color, shape, size 

Ring-widths do not have to add up to 100% - it may be less (not more) what is left is used for the area outside the rings
Sector angles do not have to add up to 100% -it may be less (not more) what is left is used for the area outside the sectors

Use color picker - https://iro.js.org/guide.html#working-with-colors
Learn about polar coordinates - https://en.wikipedia.org/wiki/Polar_coordinate_system


## getting started

Create GitHub Repo and Clone locally

npm init
npm install eslint,htmllint,browser-sync --save-dev
create index.html - set title, shortcut icon
load d3 script from cdn (https://github.com/d3/d3)