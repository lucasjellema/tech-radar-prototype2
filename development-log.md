# Logbook of explorations in this prototype

## TODOs

- extend (foreign object) text editor for labels - larger, add font family/size/color/style
- extend (foreign object) text editor for different types of input (select, combo, radio)

- defines themes: filters with selection of positive tags and negative tags 
- sectors composed from mini-sectors - drill down on one sector to expose its mini-sectors; for example: 
  - drill down on infrastructure and get radar using vendors as sectors
  - drill down on infrastructure and get sectors for ci/cd, storage, container management, networking, security and other child-categories
  - define drill down/aggregation paths - category => vendor; category => selected tag value;  category => offering type
  
- sectors defined with (combinations of) tags (or tagfilters); objects that satisfy the tagfilter condition of a sector are displayed in the sector; a viewpoint can contain various sector-configurations - that can be linked - drilling down on one sector to another configuration optionally inherits the master sector's tag-filter - and uses the sector-tagfilters on top of that in the new configuration 

- zoom in on a single (or a few?) sector - that sector fills up the (angle of the) radar - the other sectors are hidden and so are blips in those sectors (same as hiding some or all other sectors?); note: the user assigned x,y are useless in this case; polar could perhaps be converted: multiply phi with how much more angle the sector gets to fill up
  
- zoom in on a single ring - that ring fills up the entire (width of the) radar - the other rings are hidden and so are the blips in those rings

- allow removal of viewpoint, template, object type, rating type, objects of a specific type

- blip zoom "slider" - apply scaling factor to all the blips (not to any other element)
- generate blips in Viewpoint for all objects | selected objects

- ?? record blip coordinates as polar coordinates

- define "start angle" for sectors (to get tilting/rotating effect)
- define "total angle" for sectors (to create half, quarter, two thirds, one third)

- auto-map for radar:  derive rings from distinct property values (and width from number of entries for each value); user can edit labels and sequence in radar editor
- have defaults associated with viewpoint; currently, defaults are created for the current viewpoint and do not synchronize with a new viewpoint
- store state (including defaults) in localstorage (to be reinstated in a later session)
- CSV to (Data Model to) Radar wizard
- fetch radar data from external URL (anything within reach from user's browser) (import dialog & pass sourceURL as query parameter)

- new visual dimensions
  - pattern used to fill blip
  - visual markings - like surrounding ring or partial ring or asterisk
  - font style in label 


- property Description for each sector to describe the meaning ; show as hovertext for sector label
- support font-style, font-weight as property to define for labels in sector
- support dash array property for sector edge
- include allowable property values in combobox for sector property map (in addition to current values)
- allow multiple properties to be mapped to a sector (e.g. sector for open source container management and for Oracle integration tools)

- create Ring Editor similar to sector editor (or reuse sector editor for ring editing)
 
- generate blips (for all ratings that qualify for the viewpoint and its current filters and visible sectors and rings) 

## April 6th


### Resources
- Color Picker - https://www.w3schools.com/colors/colors_picker.asp

## April 5th
- show (after initial hide) advanced sector properties
- handle drag & drop of sector background image in main radar 
- apply sector edge properties (width and color)
- apply curved/straight label indicators at sector level
- apply font size, color and family for sector labels 
- radar configurator - support for sectors: remove sector, add sector, distribute angles, select mapped property
- if no sector found for blip - then do not draw blip 
- support for hiding sectors: in radar configurator and sector editor; in draw radar and drawblips. Still to do: expand space taken up by other sectors (every sector's angle can be multiplied with 1/(sum of all visible sectors))
- derive generated sector label from allowable value label when available
- only generate a blip drag event if there is real movement (> 3 pixels)

## April 4th
- update timestamp voor rating when blip has been edited
- sector editor (assign one or more sector property values to sector)

## April 3rd

- create new blip for existing object
- create new blip for existing rating

### Resources

- Sort Arrary (and use custom compare function) https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
- left pad strings - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart
- delete property from object: https://www.w3schools.com/howto/howto_js_remove_property_object.asp#:~:text=Remove%20Property%20from%20an%20Object&text=The%20delete%20operator%20deletes%20both,effect%20on%20variables%20or%20functions.

## April 2nd

- show similar blips (context menu for blips) => define filter from tags on blip (optionally: all/selected discrete properties)
- work with data sets in pure JSON file (preparation for loading data sets from external URLs)

### Resources

- mxGraph https://github.com/jgraph/mxgraph (sources) 
- Fetch API - https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch (fetching and posting files)
   
## April 1st
- Input Type Color - HTML5 color selector - https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/color for ring &* sector background
- Input Type Color - for Colors Box
- reduce rings angle with sector 'deficiency' (if sectors add up to less than 1, reduce ring arc) 

## March 31st

- select preloaded dataset through URL query parameter source
- edit emerging-technologies-dataset (incl properties)
- edit technology-radar-dataset
- support text as property type (with textarea in blip editor)
- state supports defaultSettings - a rating & object with default values the user wants to have used for newly created ratings and objects; editing the default Settings is done from context menu on radar title (similar to create blip)
- shuffle-button: reset all blip-positions (and have new one rederived)
- generate id (UUID) in new blips (object and rating), in initially loaded datasets and in uploaded files
- add delete blip option in context menu for blip (and perform the delete)
- add clone blip option in context menu for blip (and perform the clone - currently a deep copy of blip, rating and object; it seems that perhaps the clone should create a new rating for the same object?!
- position context menu shifted to the left or to the top when a blip near the edge is right mouse clicked; fix removing context menu when mouse leaves on the right side


## March 30th
- button to reset tags in filter
- blip passes filter if all tags are minus and blip possesses none of them
- filter blips on discrete properties (for now hard coded vendor, offering, ambition, category, scope, author)
- show occurring values of discrete properties in filter combobox 
- define id values for viewpoints (to allow them to be identified through URLs) amis-tech-radar-2021 and "emerging-tech-trends"
- select viewpoint based on query parameter viewpoint (http://localhost:3000/?viewpoint=amis-tech-radar-2021&tags=database,oracle~)
- set initial filter based on query parameter tags ; comma separated values; use ~(minus) and * (must) qualifiers 
 
### Resources
- How to get query string values in JavaScript with URLSearchParams - https://flaviocopes.com/urlsearchparams/

## March 29th

- prettify blip editor (table layout) and meta-data driven (except tags and image)
- handle image in a generic way (meta-data based)
- introducing: the data viewer - tree view of model, templates, viewpoints and objects
- select elements in tree data view for download 

### Resources
- pure JavaScript Tree Control - https://medium.com/metaphorical-web/javascript-treeview-controls-devil-in-the-details-74c252e00ed8

## March 28th
-  derive property values on rating and object from sector and ring based on meta-data - instead of hardcoded as in blipEditing.handleBlipDrag)
-  drawBlip fully meta-data driven
-  support additional types of shapes - rectangle horizontal, vertical, triangle, plus, star
-  correct positioning of tooltip

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