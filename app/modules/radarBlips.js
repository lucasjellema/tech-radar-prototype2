import { cartesianFromPolar, polarFromCartesian } from './drawingUtilities.js'
export { drawRadarBlips }

const color_white = "#FFF"
const radarCanvasElementId = "#radarCanvas"

const drawRadarBlips = function (viewpoint) {
    console.log(`drawradarblips`)
    const radarCanvasElement = d3.select(radarCanvasElementId)
    const blipElements = radarCanvasElement.selectAll(".blip")
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

const sectorRingToPosition = (sector, ring, config) => { // return X,Y coordinates corresponding to the sector and ring 
    const phi = priorSectorsAnglePercentageSum(sector, config) + (0.1 + Math.random() * 0.8) * config.sectorConfiguration.sectors[sector].angle
    const r = config.maxRingRadius * (1 - priorRingsWidthPercentageSum(ring, config) - (0.1 + Math.random() * 0.8) * config.ringConfiguration.rings[ring].width) // 0.1 to not position the on the outer edge of the segment
    return cartesianFromPolar({ r: r, phi: 2 * (1 - phi) * Math.PI })
}

const drawRadarBlip = (blip, d, viewpoint) => {
    const blipSector = viewpoint.propertyVisualMaps.sectorMap[d.rating.object.category]
    const blipRing = viewpoint.propertyVisualMaps.ringMap[d.rating.ambition]

    const xy = sectorRingToPosition(blipSector, blipRing, viewpoint.template)

    blip.attr("transform", `translate(${xy.x},${xy.y}) scale(${viewpoint.propertyVisualMaps.sizeMap[d.rating.magnitude]})`)
        .attr("id", `blip-${d.id}`)



    // the blip can consist of:
    // text/label
    // image or shape
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

    const shape = blip.append("circle")
        .attr("r", 15)
    shape.attr("fill", "blue");
    shape.attr("opacity", "0.4");
    if (d.rating.object.image != null) {
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

