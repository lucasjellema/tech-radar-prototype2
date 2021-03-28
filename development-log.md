# Logbook of explorations in this prototype

## TODOs
- sector-label and ring-label styling? (font, size, fill) editable in UI 
- extend (foreign object) text editor for labels - larger, add font family/size/color/style
- extend (foreign object) text editor for different types of input (select, combo, radio)
- context menu on sector to bring up form to edit background color, opacity, image (& scalefactor) 

- themes: filter with selection of positive tags and negative tags 

 
- derive property to sector map from meta-model (instead of hard coded in radarBlips.drawRadarBlip - category, ambition, offering, experience, magnitude)
- add values for discrete properties to combobox for filter tags - and filter on these values (for example support filtering on category, vendor, offering)
- zoom in on a single sector
- zoom in on a single ring 

## March 28th
-  derive property values on rating and object from sector and ring based on meta-data - instead of hardcoded as in blipEditing.handleBlipDrag)

## March 27th
- filter on tags: discern must, plus and minus filters (one or more of the plus filters makes a blip qualify, even one of the minus filters causes a disqualify and a each must filter tag needs to be present in a tag)
- define filter tags through a combobox that suggests all tags assigned to any blip object
- improve property-visual map definition - now including the blip property that is mapped to the visual dimension
- better tag editing for blips (show tags as labels, allow removal of tags from hover menu, add tags from combobox)
- blip window: derive all fields from meta-data - and extend meta-data for technology adoption to provide a complete blip window

## March 26th
- offering property in blip editor (with combobox)
- discern edge sector label and regular sector label
- drag sector label
- switch between viewpoints in main radar UI
- create viewpoint from template
- clone viewpoint

## March 25th
- show raw JSON for elements of radar configuration and viewpoint definition; allow saving manipulated JSON (until proper UI controls are available)
- use "combobox" for scope property in blip editor
- Clone Viewpoint ; create viewpoint as a clone of the currently selected viewpoint

### Resources
Pretty Print JSON - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
Parse JSON - and convert/filter properties while doing so - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse (reviver)
Combobox - input text with suggested (but not limiting) values and with code completion - https://developer.mozilla.org/en-US/docs/Web/HTML/Element/datalist
Generate uuid in JavaScript in  browser - https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid 


## March 24th
- rename index.html to radarConfigurationEditor.html, rename viewpointEditor.html to index.html;
- template/radar configuration editing for templates or viewpoint configurations ; "template" selector is now populated with both tenmplates and viewpoints
- define meta-model in sampleData.js (start for object type technology and ratingtype technologyAdoption)
- populate dropdown select lists in blip editor from meta-model data
- derive display value in blip property viewer using meta model allowable values (where available)


## March 22nd
- honor 'applyColors, applySizes, applyShapes' (either show specifically derived shapes/colors/sizes or use generic)
- hide legends for colors, sizes and shapes depending on toggle setting to apply or not
- support for object.description in blip window and blip editor
- little more leeway for blips in ring -1 
- prepare prototype as Azure Static Webapp - sample data loaded : https://happy-coast-043323e03.azurestaticapps.net/; Git Repo: https://github.com/lucasjellema/technology-radar-v2-prototype

- shows tags in blip viewer - no []
- edit tags in blip editor

- ringlabels closer to their upper ring edge

- better distribute blip labels over two lines
- new sample data set (for emerging tech gartner style radar)
- filter on tags (simple style)

## March 21st
- show tooltip for size options in context menu (tooltip can define HTML content, style defined in CSS style)
- show heading for columns in context menu
- set properties on blip derived from shape and color in context menu
- synch display style settings (checkboxes) with blip display
- hide tooltip when dragging a blip
- generate blips without x & y coordinates 
- generate rating without artifical ambition (i.e. ring == -1)
- deal with blips in ring -1 (no ring assigned); find location
- double click on blip brings up blip property window
- edit button opens blip property edit window (this window can be closed and changes can be saved back to blip; radar is synchronized)
- save data to and load data from local storage
- edit properties author,scope, ..
- support paste images into blip editor
- create new blip (with default values) (from context menu on dashboard title); fix the duplication of new blips: caused by creating click handlers over and over again

### Resources
- Using Font Attributes with D3.js https://richardbrath.wordpress.com/2018/11/24/using-font-attributes-with-d3-js/
- Omnibus Type for making a well-designed open-source font super-family in a variety of widths and weights freely available. 
- Get selected value from select list: https://mkyong.com/javascript/javascript-get-selected-value-from-dropdown-list/

## March 20th

- show legend for sizes, shapes, colors
- save blips-data (incl ratings and objects)
- load blips data from file
- if not text to be displayed and images displayed but no image available then show text
- use X and Y as stored for blip (unless X, Y are outside segment - defined by ring and sector)
- show context menu for blip; show sizes
- hide context menu for mouse out of context menu
- set property value on blip (rating/object) for selected size in context menu

### Resources
- d3 V6 event handling: https://observablehq.com/@d3/d3v6-migration-guide#events
- Adding a Context Menu to D3 Force Graph - https://gilfink.medium.com/adding-a-context-menu-to-d3-force-graph-def5f197f343 

## March 19th
- show shape for blip (derived from object.offerType)
- show color for blip (derived from rating.experience)
- allow user to determine display style (show image or shape and/or label)

## March 18th
- new page viewpoint.html, new module radarBlips.js , start of meta model in sampleData.js
- show (generated sample data) blips using hardcoded property <=> sector/ring/size maps
- derive location of blip from sector and ring (and somewhat randomized with in the segment)
- show image and label for blip 
- allow drag & drop; set x and y and derive property values from new sector and ring (for now hard coded for category and ambition)

## March 17th
- reset template (equal distribution for rings and sectors, no backgroundcolors, no background images)
- include 3 radar templates (for project management, consultant allocation, technology radar)

### Resources
- CNCF Radars - https://radar.cncf.io/overview - for inspiration, for themes and for individual products/technologies

## March 16th

- drag & drop sector background images
- set scale factor for sector background image
- define background color for area outside rings
- specify background image through URL
- define stroke properties for ring edges in data model

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