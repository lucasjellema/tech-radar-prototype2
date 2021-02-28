# Logbook of explorations in this prototype

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