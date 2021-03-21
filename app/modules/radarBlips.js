import { cartesianFromPolar, polarFromCartesian, segmentFromCartesian } from './drawingUtilities.js'

export { drawRadarBlips }

const color_white = "#FFF"
const radarCanvasElementId = "radarCanvas"
const blipsLayerElementId = "blipsLayer"
let currentViewpoint
const drawRadarBlips = function (viewpoint) {
    currentViewpoint = viewpoint
    document.getElementById('showImages').checked = currentViewpoint.blipDisplaySettings.showImages 

document.getElementById('showLabels').checked = currentViewpoint.blipDisplaySettings.showLabels 

document.getElementById('showShapes').checked = currentViewpoint.blipDisplaySettings.showShapes 
    let blipsLayer
    blipsLayer = d3.select(`#${blipsLayerElementId}`)
    if (blipsLayer.empty()) {
        const radarCanvasElement = d3.select(`#${radarCanvasElementId}`)
        blipsLayer = radarCanvasElement.append("g")
            .attr("id", blipsLayerElementId)
    }
    else {
        blipsLayer.selectAll("*").remove();
    }
    const blipElements = blipsLayer.selectAll(".blip")
        .data(viewpoint.blips)
        .enter()
        .append("g")
        .attr("class", "blip")
        .attr("class", "draggable-group")
        // .attr("transform", function (d, i) { return legend_transform(config.getQuadrant(d), config.getRing(d), segmented, i); })
        // .on("dblclick", function (d) { showModal(d); })
        // .on("mouseover", function (d) { showBubble(d); highlightLegendItem(d); })
        // .on("mouseout", function (d) { hideBubble(d); unhighlightLegendItem(d); })
        .on('contextmenu', (e, d) => {

            createContextMenu(e, d, this, viewpoint);
        })

    // configure each blip
    blipElements.each(function (d) {
        const blip = d3.select(this);
        drawRadarBlip(blip, d, viewpoint);

    });
    return viewpoint.blips
}

const priorSectorsAnglePercentageSum = (sectorId, config) => config.sectorConfiguration.sectors.filter((sector, index) => index < sectorId)
    .reduce((sum, sector) => sum + sector.angle, 0)

const priorRingsWidthPercentageSum = (ringId, config) => config.ringConfiguration.rings.filter((ring, index) => index < ringId)
    .reduce((sum, ring) => sum + ring.width, 0)

const sectorRingToPosition = (sector, ring, config) => { // return randomized X,Y coordinates in segment corresponding to the sector and ring 
    const phi = priorSectorsAnglePercentageSum(sector, config) + (0.1 + Math.random() * 0.8) * config.sectorConfiguration.sectors[sector].angle
    const r = config.maxRingRadius * (1 - priorRingsWidthPercentageSum(ring, config) - (0.1 + Math.random() * 0.8) * config.ringConfiguration.rings[ring].width) // 0.1 to not position the on the outer edge of the segment
    return cartesianFromPolar({ r: r, phi: 2 * (1 - phi) * Math.PI })
}

const blipInSegment = (cartesian, viewpoint, segment) => {
    const cartesianSegment = segmentFromCartesian(cartesian, viewpoint)
    //console.log(`REAL sector ${segment.sector} ring ${segment.ring};XY RING  ${cartesianSegment.ring} sector ${cartesianSegment.sector}`)
    return cartesianSegment.sector == segment.sector
        && ((cartesianSegment.ring ?? -1) == (segment.ring ?? -1))
}

const drawRadarBlip = (blip, d, viewpoint) => {
    const blipSector = viewpoint.propertyVisualMaps.sectorMap[d.rating.object.category]
    const blipRing = viewpoint.propertyVisualMaps.ringMap[d.rating.ambition]
    const blipShapeId = viewpoint.propertyVisualMaps.shapeMap[d.rating.object?.offering] 
                        ?? viewpoint.propertyVisualMaps.shapeMap["other"]
    const blipShape = viewpoint.template.shapesConfiguration.shapes[blipShapeId].shape

    const blipColorId = viewpoint.propertyVisualMaps.colorMap[d.rating?.experience] 
                      ?? viewpoint.propertyVisualMaps.colorMap["other"]
                      const blipColor = viewpoint.template.colorsConfiguration.colors[blipColorId].color

    const blipSizeId = viewpoint.propertyVisualMaps.sizeMap[d.rating.magnitude] 
    ?? viewpoint.propertyVisualMaps.sizeMap["other"]
    const blipSize = viewpoint.template.sizesConfiguration.sizes[blipSizeId].size

    let xy

    if (d.x != null && d.y != null && blipInSegment(d, viewpoint, { sector: blipSector, ring: blipRing }) != null) { // TODO and x,y is located within ring/.sector segment
        xy = { x: d.x, y: d.y }
    } else {
        xy = sectorRingToPosition(blipSector, blipRing, viewpoint.template)
    }
    blip.attr("transform", `translate(${xy.x},${xy.y}) scale(${blipSize})`)
        .attr("id", `blip-${d.id}`)



    // the blip can consist of:
    // text/label (with color and text style?) and/or either an image or a shape
    // the user determines which elements should be displayed for a blip 
    // perhaps the user can also indicate whether colors, shapes and sizes should be visualized (or set to default values instead)
    // and if text font size should decrease/increase with size?
    if (viewpoint.blipDisplaySettings.showLabels || ((viewpoint.blipDisplaySettings.showImages && d.rating.object.image == null))) {
        const label = d.rating.object.label
        blip.append("text")
            .text(label.length > 10 ? label.split(" ")[0] : label)
            .attr("x", 0) // if on left side, then move to the left, if on the right side then move to the right
            .attr("y", -30) // if on upper side, then move up, if on the down side then move down
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "before-edge")
            .style("fill", "#000")
            .style("font-family", "Arial, Helvetica")
            .style("font-stretch", "extra-condensed")
            .style("font-size", function (d) { return label.length > 2 ? `${14}px` : "17px"; })
    }

    if (viewpoint.blipDisplaySettings.showShapes) {
        let shape

        if (blipShape == "circle") {
            shape = blip.append("circle")
                .attr("r", 15)
        }
        if (blipShape == "diamond") {
            const diamond = d3.symbol().type(d3.symbolDiamond).size(800);
            shape = blip.append('path').attr("d", diamond)
        }
        if (blipShape == "square") {
            const square = d3.symbol().type(d3.symbolSquare).size(800);
            shape = blip.append('path').attr("d", square)
        }



        shape.attr("fill", blipColor);
        shape.attr("opacity", "0.4");
    }

    if (viewpoint.blipDisplaySettings.showImages && d.rating.object.image != null) {
        let image = blip.append('image')
            .attr('xlink:href', d.rating.object.image)
            .attr('width', 80)
            .attr('height', 40)
            .attr("x", "-40") // if on left side, then move to the left, if on the right side then move to the right
            .attr("y", "-15")
        //.attr("class","outlinedImage")
        // to create a colored border around the image, use a rectangle
        let border = blip.append('rect')
            .attr('width', 80)
            .attr('height', 40)
            .attr('x', -40)
            .attr('y', -15)
            .style('fill', "none")
            .style("stroke", "red") // TODO: use the blip color
            .style("stroke-width", "0px") // TODO: when a color is derived properly, set a border width
    }
}

const handleShowImagesChange = (event) => {
    currentViewpoint.blipDisplaySettings.showImages = event.target.checked
    drawRadarBlips(currentViewpoint)
}

const handleShowLabelsChange = (event) => {
    currentViewpoint.blipDisplaySettings.showLabels = event.target.checked
    drawRadarBlips(currentViewpoint)
}
const handleShowShapesChange = (event) => {
    currentViewpoint.blipDisplaySettings.showShapes = event.target.checked
    drawRadarBlips(currentViewpoint)
}

const createContextMenu = (e, d, blip, viewpoint) => {
    menu(e.pageX, e.pageY, d, blip, viewpoint);
    e.preventDefault();
}

const menu = (x, y, d, blip, viewpoint) => {
    const config = viewpoint.template
    d3.select('.context-menu').remove(); // if already showing, get rid of it.
    d3.select('body') // click anywhere outside the context menu to hide it TODO perhaps remove on mouse out?
        .on('click', function () {
            //  d3.select('.context-menu').remove();
        });

    const entryHeight = 42 // number vertical pixel per context menu entry
    let height = 25 + Math.max(Object.keys(viewpoint.propertyVisualMaps.sizeMap).length, Object.keys(viewpoint.propertyVisualMaps.shapeMap).length, Object.keys(viewpoint.propertyVisualMaps.colorMap).length) * entryHeight // derive from maximum number of entries in each category
    const circleRadius = 12
    const initialColumnIndent = 30
    const columnWidth = 70
    let width = initialColumnIndent + 10 + 3*columnWidth

    const contextMenu = d3.select(`svg#${config.svg_id}`)
        .append('g').attr('class', 'context-menu')
        .attr('transform', `translate(${x},${y})`)

    contextMenu.append('rect')
        .attr('width', width)
        .attr('height', height)
        .attr('class', 'rect')
        .attr("style", "fill:lightgray;")
        .style("opacity", 0.8)
        .on("mouseout", (e) => {
            // check x and y - to see whether they are really outside context menu area (mouse out also fires when mouse is on elements inside context menu)
            const deltaX = x - e.pageX
            const deltaY = y - e.pageY
            if (((deltaX > 0) || (deltaX <= - width ) || (deltaY > 0) || (deltaY <= - height))
            ) {
                d3.select('.context-menu').remove();
            }
        })
    const sizesBox = contextMenu.append('g')
        .attr('class', 'sizesBox')
        .attr("transform", `translate(${initialColumnIndent}, ${15})`)

        sizesBox.append("text")       
        .text(config.sizesConfiguration.label)
        .attr("x", -25)
        .style("fill", "#000")
        .style("font-family", "Arial, Helvetica")
        .style("font-size", "12px")
        .style("font-weight", "normal")
        .attr("transform","scale(0.7,1)")
        
    for (let i = 0; i < Object.keys(viewpoint.propertyVisualMaps.sizeMap).length; i++) {
        const key = Object.keys(viewpoint.propertyVisualMaps.sizeMap)[i]
        const scaleFactor = config.sizesConfiguration.sizes[viewpoint.propertyVisualMaps.sizeMap[key]].size
        const label = config.sizesConfiguration.sizes[viewpoint.propertyVisualMaps.sizeMap[key]].label
        const sizeEntry = sizesBox.append('g')
            .attr("transform", `translate(0, ${30+ i * entryHeight})`)
            .append('circle')
            .attr("id", `templateSizes${i}`)
            .attr("r", circleRadius)
            .attr("fill", "black")
            .attr("transform", `scale(${scaleFactor})`)
        decorateContextMenuEntry(sizeEntry, "size", key, d, viewpoint,label)
    }
    const shapesBox = contextMenu.append('g')
        .attr('class', 'shapesBox')
        .attr("transform", `translate(${initialColumnIndent + columnWidth}, ${15})`)
        
        shapesBox.append("text")       
        .text(config.shapesConfiguration.label)
        .attr("x", -25)
        .style("fill", "#000")
        .style("font-family", "Arial, Helvetica")
        .style("font-size", "12px")
        .style("font-weight", "normal")
        .attr("transform","scale(0.7,1)")

        
    for (let i = 0; i < Object.keys(viewpoint.propertyVisualMaps.shapeMap).length; i++) {
        const key = Object.keys(viewpoint.propertyVisualMaps.shapeMap)[i]
        const shapeToDraw = config.shapesConfiguration.shapes[viewpoint.propertyVisualMaps.shapeMap[key]].shape
        const label = config.shapesConfiguration.shapes[viewpoint.propertyVisualMaps.shapeMap[key]].label
        const shapeEntry = shapesBox.append('g')
            .attr("transform", `translate(0, ${30+ i * entryHeight})`)
            let shape

            if (shapeToDraw == "circle") {
                shape = shapeEntry.append("circle")
                    .attr("r", circleRadius)
            }
            if (shapeToDraw == "diamond") {
                const diamond = d3.symbol().type(d3.symbolDiamond).size(420);
                shape = shapeEntry.append('path').attr("d", diamond)
            }
            if (shapeToDraw == "square") {
                const square = d3.symbol().type(d3.symbolSquare).size(420);
                shape = shapeEntry.append('path').attr("d", square)
            }
            shape
            .attr("id", `templateSizes${i}`)
            .attr("fill", "black")
            
        decorateContextMenuEntry(shapeEntry, "shape", key, d, viewpoint,label)
    }
    // draw color
    const colorsBox = contextMenu.append('g')
    .attr('class', 'colorsBox')
    .attr("transform", `translate(${initialColumnIndent + 2* columnWidth}, ${15})`)
    colorsBox.append("text")       
    .text(config.colorsConfiguration.label)
    .attr("x", -25)
    .style("fill", "#000")
    .style("font-family", "Arial, Helvetica")
    .style("font-size", "12px")
    .style("font-weight", "normal")
    .attr("transform","scale(0.7,1)")
for (let i = 0; i < Object.keys(viewpoint.propertyVisualMaps.colorMap).length; i++) {
    const key = Object.keys(viewpoint.propertyVisualMaps.colorMap)[i]
    const colorToFill = config.colorsConfiguration.colors[viewpoint.propertyVisualMaps.colorMap[key]].color
    const label = config.colorsConfiguration.colors[viewpoint.propertyVisualMaps.colorMap[key]].label
    const colorEntry = colorsBox.append('g')
        .attr("transform", `translate(0, ${30+ i * entryHeight})`)
        .append('circle')
        .attr("id", `templateSizes${i}`)
        .attr("r", circleRadius)
        .attr("fill", colorToFill)
        
    decorateContextMenuEntry(colorEntry, "color", key, d, viewpoint,label)
}
}

function decorateContextMenuEntry(menuEntry, dimension, value, blip, viewpoint, label) { // dimension = shape, size, color
    menuEntry.attr("class", "clickableProperty")
        .on("click", () => {
            if (dimension == "size") {
                // translate dimensionSequence 
                blip["rating"]["magnitude"] = value // getKeyForValue(viewpoint.propertyVisualMaps.sizeMap, dimensionSequence)
                drawRadarBlips(viewpoint)
            }
            if (dimension == "shape") {
                console.log(`clicked ${label}   for ${dimension} for blip: ${blip.rating.object.label}; new value = ${value}`);
                blip["rating"]["object"]["offering"] = value // getKeyForValue(viewpoint.propertyVisualMaps.shapeMap, dimensionSequence)
                drawRadarBlips(viewpoint)
            }
            if (dimension == "color") {
                console.log(`clicked ${label}   for ${dimension} for blip: ${blip.rating.experience}; new value = ${value}`);
                blip["rating"]["experience"] = value // getKeyForValue(viewpoint.propertyVisualMaps.shapeMap, dimensionSequence)
                drawRadarBlips(viewpoint)
            }
        })
        .on("mouseover", (e,d) => {
            addTooltip(
                (d) => {return `<div>     
            <b>${label}</b>
          </div>`}
          , d, e.pageX, e.pageY);
          })
            .on("mouseout", () => {
              removeTooltip();
            });
;
}

 // Add the tooltip element to the graph
 const tooltip = document.querySelector("#graph-tooltip");
 if (!tooltip) {
   const tooltipDiv = document.createElement("div");
   tooltipDiv.classList.add("tooltip"); // refers to div.tooltip CSS style definition
   tooltipDiv.style.opacity = "0";
   tooltipDiv.id = "graph-tooltip";
   document.body.appendChild(tooltipDiv);
 }
 const div = d3.select("#graph-tooltip");

 const addTooltip = (hoverTooltip, d, x, y) => { // hoverToolTip is a function that returns the HTML to be displayed in the tooltip
   div
     .transition()
     .duration(200)
     .style("opacity", 0.9);
   div
     .html(hoverTooltip(d))
     .style("left", `${x}px`)
     .style("top", `${y - 28}px`);
 };

 const removeTooltip = () => {
   div
     .transition()
     .duration(200)
     .style("opacity", 0);
 };


const getKeyForValue = function (object, value) {
    return Object.keys(object).find(key => object[key] === value);
  }

document.getElementById('showImages').addEventListener("change", handleShowImagesChange);
document.getElementById('showLabels').addEventListener("change", handleShowLabelsChange);
document.getElementById('showShapes').addEventListener("change", handleShowShapesChange);
