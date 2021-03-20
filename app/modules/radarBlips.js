import { cartesianFromPolar, polarFromCartesian,segmentFromCartesian } from './drawingUtilities.js'
export { drawRadarBlips }

const color_white = "#FFF"
const radarCanvasElementId = "radarCanvas"
const blipsLayerElementId = "blipsLayer"
let currentViewpoint
const drawRadarBlips = function (viewpoint) {
    currentViewpoint = viewpoint
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
        .attr("class", "draggable-group");
    // .attr("transform", function (d, i) { return legend_transform(config.getQuadrant(d), config.getRing(d), segmented, i); })
    // .on("dblclick", function (d) { showModal(d); })
    // .on("mouseover", function (d) { showBubble(d); highlightLegendItem(d); })
    // .on("mouseout", function (d) { hideBubble(d); unhighlightLegendItem(d); })

    // .on('contextmenu', function (d) {
    //     d3.event.preventDefault();
    //     menu(d3.event.pageX, d3.event.pageY, d, this);
    // })

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
    const cartesianSegment = segmentFromCartesian (cartesian, viewpoint)
    //console.log(`REAL sector ${segment.sector} ring ${segment.ring};XY RING  ${cartesianSegment.ring} sector ${cartesianSegment.sector}`)
    return cartesianSegment.sector == segment.sector 
        && ((cartesianSegment.ring ?? -1) == (segment.ring ?? -1))
}

const drawRadarBlip = (blip, d, viewpoint) => {
    const blipSector = viewpoint.propertyVisualMaps.sectorMap[d.rating.object.category]
    const blipRing = viewpoint.propertyVisualMaps.ringMap[d.rating.ambition]
    const blipShapeId = viewpoint.propertyVisualMaps.shapeMap
    [d.rating.object?.offering] ?? viewpoint.propertyVisualMaps.shapeMap["other"]
    const blipShape = viewpoint.template.shapesConfiguration.shapes[blipShapeId].shape

    const blipColor = viewpoint.propertyVisualMaps.colorMap[d.rating?.experience] ?? viewpoint.propertyVisualMaps.colorMap["other"]
    const blipSize = viewpoint.propertyVisualMaps.sizeMap[d.rating.magnitude]

    let xy

    if (d.x != null && d.y != null && blipInSegment(d, viewpoint, {sector:blipSector, ring:blipRing}) != null) { // TODO and x,y is located within ring/.sector segment
        xy = { x: d.x, y: d.y }
    } else {
        xy = sectorRingToPosition(blipSector, blipRing, viewpoint.template)
    }
    blip.attr("transform", `translate(${xy.x},${xy.y}) scale(${viewpoint.template.sizesConfiguration.sizes[blipSize].size})`)
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


document.getElementById('showImages').addEventListener("change", handleShowImagesChange);
document.getElementById('showLabels').addEventListener("change", handleShowLabelsChange);
document.getElementById('showShapes').addEventListener("change", handleShowShapesChange);
