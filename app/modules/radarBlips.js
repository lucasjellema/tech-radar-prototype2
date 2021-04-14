import { cartesianFromPolar, polarFromCartesian, segmentFromCartesian } from './drawingUtilities.js'
import { launchBlipEditor } from './blipEditing.js'
import { getViewpoint, getData, publishRefreshRadar } from './data.js'
import { getDistinctTagValues, getPropertyFromPropertyPath, getNestedPropertyValueFromObject, uuidv4 } from './utils.js'
export { drawRadarBlips }


const radarCanvasElementId = "radarCanvas"
const blipsLayerElementId = "blipsLayer"
let currentViewpoint

const filterBlip = (blip, viewpoint) => {
    // console.log(`filter blip ${blip.rating.object.label} with tagfilter ${viewpoint.blipDisplaySettings.tagFilter}`)
    // determine all tags in the tag filter  - for now as individual strings, no + or - support TODO
    let blipOK = viewpoint.blipDisplaySettings.tagFilter?.length == 0 // no filter - then blip is ok 
    if (viewpoint.blipDisplaySettings.tagFilter?.length ?? 0 > 0) {
        //if all tags are minus filter, then are starting assmption is that the blip is ok
        const minusFiltercount = viewpoint.blipDisplaySettings.tagFilter.reduce(
            (sum, tagFilter) => sum + (tagFilter.type == 'minus' ? 1 : 0)
            , 0)
        blipOK = viewpoint.blipDisplaySettings.tagFilter?.length == minusFiltercount
        try {
            for (let i = 0; i < viewpoint.blipDisplaySettings.tagFilter.length; i++) {
                const filter = viewpoint.blipDisplaySettings.tagFilter[i]
                try {
                    let blipHasFilter
                    if (filter.tag.startsWith('"')) {
                        const labelProperty = viewpoint.propertyVisualMaps.blip.label
                        const blipLabel = getNestedPropertyValueFromObject(blip.rating, labelProperty).toLowerCase()
                        const filterTag = filter.tag.replace(/^"+|"+$/g, '').toLowerCase()

                        blipHasFilter = blipLabel.includes(filterTag)
                    } else {
                        blipHasFilter = JSON.stringify(blip.rating.object.tags)?.toLowerCase()?.trim()?.indexOf(filter.tag) > -1

                        // TODO derive discrete properties dynamically from data.model instead of hard coded
                        const discretePropertyPaths = ["object.category", "object.offering", "object.vendor", "scope", "ambition", "author"]
                        for (let j = 0; !blipHasFilter && j < discretePropertyPaths.length; j++) {
                            blipHasFilter = getNestedPropertyValueFromObject(blip.rating, discretePropertyPaths[j])?.toLowerCase().trim() == filter.tag
                        }
                    }


                    // minus filter: if tag is in rating.object.tags then blip is not ok  
                    if (blipHasFilter && filter.type == "minus") {
                        blipOK = false; break;
                    }

                    // must filter: if the tag is not in rating.object.tags then the blip cannot be ok
                    if (!blipHasFilter && filter.type == "must") {
                        blipOK = false; break;
                    }
                    if (blipHasFilter && filter.type == "plus") {
                        blipOK = true
                    }

                } catch (e) { console.log(`${e} exception filter for ${JSON.stringify(blip)}`) }
            }
        } catch (e) { console.log(`exception in filter blip ${JSON.stringify(e)} ${e}`) }
    }

    return blipOK
}

const initializeTagsFilter = () => {
    const filteringTagsContainer = document.getElementById('filteringTagsContainer')
    filteringTagsContainer.innerHTML = null
    // loop over existing filtering tags and for each add to container 

    for (let i = 0; i < currentViewpoint.blipDisplaySettings.tagFilter.length; i++) {
        const innerHTML = `<div class="dropup">
     <span id="tag0" class="${currentViewpoint.blipDisplaySettings.tagFilter[i].type} tagfilter dropbtn">${currentViewpoint.blipDisplaySettings.tagFilter[i].tag}</span>
     <div class="dropup-content">
     <a href="#" id="mustTag${i}">Must</a>
     <a href="#" id="plusTag${i}">Plus</a>
     <a href="#" id="minusTag${i}">Minus</a>
         <a href="#" id="removeTag${i}">Remove</a>
     </div>`
        const div = document.createElement('div');
        div.className = "dropup"
        div.innerHTML = innerHTML
        filteringTagsContainer.appendChild(div)
        document.getElementById(`mustTag${i}`).addEventListener("click", () => { currentViewpoint.blipDisplaySettings.tagFilter[i].type = "must"; drawRadarBlips(currentViewpoint) })
        document.getElementById(`plusTag${i}`).addEventListener("click", () => { currentViewpoint.blipDisplaySettings.tagFilter[i].type = "plus"; drawRadarBlips(currentViewpoint) })
        document.getElementById(`minusTag${i}`).addEventListener("click", () => { currentViewpoint.blipDisplaySettings.tagFilter[i].type = "minus"; drawRadarBlips(currentViewpoint) })
        document.getElementById(`removeTag${i}`).addEventListener("click", () => { currentViewpoint.blipDisplaySettings.tagFilter.splice(i, 1); drawRadarBlips(currentViewpoint) })
    }

    let resetFilterButton = document.getElementById("resetFilterButton")
    if (resetFilterButton) {
        resetFilterButton.remove()
    }

    if (currentViewpoint.blipDisplaySettings.tagFilter.length > 0) {
        const container = document.getElementById("resetTagsFilterControlContainer")
        container.innerHTML = `<input type="button" id="resetFilterButton" name="resetFilter" style="margin-top:10px" title="Remove All Tags" value="Reset Filter"></input>`
        resetFilterButton = document.getElementById("resetFilterButton")
        resetFilterButton.addEventListener("click", (e) => { currentViewpoint.blipDisplaySettings.tagFilter = []; drawRadarBlips(currentViewpoint) })
    }
    // populate datalist with all unique tag values in all blips
    populateDatalistWithTags(true)

}

const drawRadarBlips = function (viewpoint) {
    currentViewpoint = viewpoint
    document.getElementById('showImages').checked = currentViewpoint.blipDisplaySettings.showImages

    document.getElementById('showLabels').checked = currentViewpoint.blipDisplaySettings.showLabels

    document.getElementById('showShapes').checked = currentViewpoint.blipDisplaySettings.showShapes
    document.getElementById('sectors').checked = currentViewpoint.template.topLayer == "sectors"
    document.getElementById('rings').checked = currentViewpoint.template.topLayer == "rings"
    document.getElementById('blipScaleFactorSlider').value = currentViewpoint.blipDisplaySettings.blipScaleFactor ?? 1
    document.getElementById('sectors').addEventListener("change", (e) => {
        const changed = currentViewpoint.template.topLayer != e.currentTarget.id
        currentViewpoint.template.topLayer = e.currentTarget.id
        if (changed) publishRefreshRadar()
    });
    document.getElementById('rings').addEventListener("change", (e) => {
        const changed = currentViewpoint.template.topLayer != e.currentTarget.id
        currentViewpoint.template.topLayer = e.currentTarget.id
        if (changed) publishRefreshRadar()
    });

    initializeTagsFilter()

    document.getElementById('applyShapes').checked = currentViewpoint.blipDisplaySettings.applyShapes
    document.getElementById('applySizes').checked = currentViewpoint.blipDisplaySettings.applySizes
    document.getElementById('applyColors').checked = currentViewpoint.blipDisplaySettings.applyColors
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
        .data(viewpoint.blips.filter((blip) => filterBlip(blip, viewpoint)))
        .enter()
        .append("g")
        .attr("class", "blip")
        .attr("class", "draggable-group")
        // .on("dblclick", function (d) { showModal(d); })

        .on('contextmenu', (e, d) => {

            createContextMenu(e, d, this, viewpoint);
        })

    // configure each blip
    blipElements.each(function (d) {
        const blip = d3.select(this);
        //        try {
        drawRadarBlip(blip, d, viewpoint);
        //       } catch (e) {
        //         console.log(`failed to draw blip ${d.rating?.object?.label} because of ${e}`)
        //       console.log(`blip:  ${JSON.stringify(d)}`)
        // }

    });
    return viewpoint.blips
}

const sectorExpansionFactor = () => {
    const totalAvailableAngle = currentViewpoint.template.sectorConfiguration.totalAngle ?? 1
    const initialAngle = parseFloat(currentViewpoint.template.sectorConfiguration.initialAngle ?? 0)
    //  console.log(`totalAvailableAngle = ${totalAvailableAngle}`)

    // factor to multiply each angle with - derived from the sum of angles of all visible sectors , calibrated with the total available angle
    const totalVisibleSectorsAngleSum = currentViewpoint.template.sectorConfiguration.sectors.reduce((sum, sector) =>
        sum + (sector?.visible != false ? sector.angle : 0), 0)
    //    return totalAvailableAngle * (totalVisibleSectorsAngleSum == 0 ? 1 : 1 / totalVisibleSectorsAngleSum)
    const expansionFactor = parseFloat((totalAvailableAngle - initialAngle) * (totalVisibleSectorsAngleSum == 0 ? 1 : (1 / totalVisibleSectorsAngleSum)))
    //   console.log(`expansionFactor ${expansionFactor}`)
    return expansionFactor

}




const priorSectorsAnglePercentageSum = (sectorId, config) => config.sectorConfiguration.sectors.filter((sector, index) => index < sectorId)
    .reduce((sum, sector) =>
        sum + (sector?.visible != false ? sector.angle : 0), 0) * sectorExpansionFactor() + parseFloat(currentViewpoint.template.sectorConfiguration.initialAngle ?? 0)



const ringExpansionFactor = () => {
    // factor to multiply each witdh with - derived from the sum of widths of all visible rings , calibrated with the total available ring width
    const totalVisibleRingsWidthSum = currentViewpoint.template.ringConfiguration.rings.reduce((sum, ring) =>
        sum + (ring?.visible != false ? ring.width : 0), 0)
    const expansionFactor = totalVisibleRingsWidthSum == 0 ? 1 : 1 / totalVisibleRingsWidthSum
    return expansionFactor
}
const priorRingsWidthPercentageSum = (ringId, config) => config.ringConfiguration.rings.filter((ring, index) => index < ringId)
    .reduce((sum, ring) => sum + (ring?.visible != false ? ring.width : 0), 0) * ringExpansionFactor()

const sectorRingToPosition = (sector, ring, config) => { // return randomized X,Y coordinates in segment corresponding to the sector and ring 
    try {
        const phi = priorSectorsAnglePercentageSum(sector, config) +
            (0.1 + Math.random() * 0.8) * config.sectorConfiguration.sectors[sector].angle * sectorExpansionFactor()
        // ring can be undefined (== the so called -1 ring, outside the real rings)
        let r
        if (ring != null && ring > -1) {
            let rFactor = (1 - priorRingsWidthPercentageSum(ring, config) -
                (0.1 + Math.random() * 0.8) * config.ringConfiguration.rings[ring].width * ringExpansionFactor())  // 0.1 to not position the on the outer edge of the segment
            r = config.maxRingRadius * rFactor
        }
        else {
            r = config.maxRingRadius * (1.01 + Math.random() * 0.33)  // 0.33 range of how far outer ring blips can stray NOTE depends on sector angle - for the sectors between 0.4 and 0.6 and 0.9 and 0.1 there is more leeway  
        }
        return cartesianFromPolar({ r: r, phi: 2 * (1 - phi) * Math.PI })
    } catch (e) {
        console.log(`radarblips,.sectorRingToPosition ${e} ${sector}${ring}`)
    }

}

const blipInSegment = (cartesian, viewpoint, segment) => {
    const cartesianSegment = segmentFromCartesian(cartesian, viewpoint, sectorExpansionFactor())
    //console.log(`REAL sector ${segment.sector} ring ${segment.ring};XY RING  ${cartesianSegment.ring} sector ${cartesianSegment.sector}`)
    const isBlipInSegment =
        ((cartesianSegment.sector ?? -1) == (segment.sector ?? -1))
        &&
        ((cartesianSegment.ring ?? -1) == (segment.ring ?? -1))
    return isBlipInSegment
}

const findSectorForRating = (rating, viewpoint) => {
    const propertyMappedToSector = viewpoint.propertyVisualMaps.sector.property
    let sectorProperty = getPropertyFromPropertyPath(propertyMappedToSector, viewpoint.ratingType, getData().model)
    let sector
    const propertyValue = getNestedPropertyValueFromObject(rating, propertyMappedToSector)
    if (sectorProperty.type == "tags") {
        for (let i = 0; i < propertyValue.length; i++) {
            sector = viewpoint.propertyVisualMaps.sector.valueMap[propertyValue[i]]
            if (sector != null) break // stop looking as soon as one of the tags has produced a sector. The order of tags can be important
        }
    } else {
        sector = viewpoint.propertyVisualMaps.sector.valueMap[propertyValue]
    }
    // TODO support for a catch all sector and/or a sector -1
    return sector
}

const drawRadarBlip = (blip, d, viewpoint) => {

    const blipSector = findSectorForRating(d.rating, viewpoint)
    //   viewpoint.propertyVisualMaps.sector.valueMap[getNestedPropertyValueFromObject(d.rating, propertyMappedToSector)]
    if (blipSector == null || viewpoint.template.sectorConfiguration.sectors[blipSector]?.visible == false) {
        // TODO get sector designated as default / other OR do NOT draw blip at all
        return
    }

    const propertyMappedToRing = viewpoint.propertyVisualMaps.ring.property
    const blipRing = viewpoint.propertyVisualMaps.ring.valueMap[getNestedPropertyValueFromObject(d.rating, propertyMappedToRing)]
    if (blipRing == null || viewpoint.template.ringConfiguration.rings[blipRing]?.visible == false) {
        //do NOT draw blip at all
        return
    }
    let blipShape
    try {
        // TODO cater for : no shape property set; no shape property value to map; no default shape defined to fall back to
        const propertyMappedToShape = viewpoint.propertyVisualMaps.shape.property
        const blipShapeId = viewpoint.propertyVisualMaps.shape.valueMap[getNestedPropertyValueFromObject(d.rating, propertyMappedToShape)]
            ?? viewpoint.propertyVisualMaps.shape.valueMap["other"]
        blipShape = viewpoint.template.shapesConfiguration.shapes[blipShapeId].shape
    } catch (e) { viewpoint.blipDisplaySettings.applyShapes = false; console.log(`draw radar blip fall back to no apply shape because of ${e}`) }


    let blipColor
    try {
        // TODO cater for : no color property set; no color property value to map; no default color defined to fall back to
        const propertyMappedToColor = viewpoint.propertyVisualMaps.color.property
        const blipColorId = viewpoint.propertyVisualMaps.color.valueMap[getNestedPropertyValueFromObject(d.rating, propertyMappedToColor)]
            ?? viewpoint.propertyVisualMaps.color.valueMap["other"]
        blipColor = viewpoint.template.colorsConfiguration.colors[blipColorId].color
    } catch (e) {
        viewpoint.blipDisplaySettings.applyColors = false;
        console.log(`draw radar blip fall back to no apply color because of ${e}`)
    }

    let blipSize
    try {
        // TODO cater for : no size property set; no size property value to map; no default size defined to fall back to
        const propertyMappedToSize = viewpoint.propertyVisualMaps.size.property
        const blipSizeId = viewpoint.propertyVisualMaps.size.valueMap[getNestedPropertyValueFromObject(d.rating, propertyMappedToSize)]
            ?? viewpoint.propertyVisualMaps.size.valueMap["other"]
        blipSize = viewpoint.template.sizesConfiguration.sizes[blipSizeId].size
    } catch (e) {
        viewpoint.blipDisplaySettings.applySizes = false;
        console.log(`draw radar blip fall back to no apply size because of ${e}`)
    }

    if (!viewpoint.blipDisplaySettings.applyShapes) {
        blipShape = viewpoint.propertyVisualMaps.blip?.defaultShape ?? "circle"
        if (blipShape == "") blipShape = "circle"
    }
    if (!viewpoint.blipDisplaySettings.applyColors) {
        blipColor = viewpoint.propertyVisualMaps.blip?.defaultColor ?? "blue"
        if (blipColor == "") blipColor = "blue"
    }
    if (!viewpoint.blipDisplaySettings.applySizes) {
        blipSize = viewpoint.propertyVisualMaps.blip?.defaultSize ?? 1
        if (blipSize == "") blipSize = 1
    }
    let xy

    if (d.x != null && d.y != null
        && blipInSegment(d, viewpoint, { sector: blipSector, ring: blipRing })
    ) {
        xy = { x: d.x, y: d.y }
    } else {
        xy = sectorRingToPosition(blipSector, blipRing, viewpoint.template)
    }
    blip.attr("transform", `translate(${xy.x},${xy.y}) scale(${blipSize * viewpoint.blipDisplaySettings.blipScaleFactor ?? 1})`)
        .attr("id", `blip-${d.id}`)
    if (!viewpoint.blipDisplaySettings.showLabels
        || (!viewpoint.blipDisplaySettings.showImages && d.rating.object.image)
    ) { // any content for the tooltip
        blip
            .on("mouseover", (e, d) => {

                addTooltip(
                    (d) => {
                        let content = `<div>     
                    ${viewpoint.blipDisplaySettings.showLabels ? "" : getNestedPropertyValueFromObject(d.rating, viewpoint.propertyVisualMaps.blip.label)}
                    `
                        if (!viewpoint.blipDisplaySettings.showImages && getNestedPropertyValueFromObject(d.rating, viewpoint.propertyVisualMaps.blip.image) != null) {
                            content = `${content}<img src="${getNestedPropertyValueFromObject(d.rating, viewpoint.propertyVisualMaps.blip.image)}" width="100px"></img>`
                        }
                        return `${content}</div>`
                    }
                    , d, e.pageX, e.pageY);
            })
            .on("mouseout", () => {
                removeTooltip();
            })
    }
    blip.on("dblclick", (e, d) => {
        blipWindow(d, viewpoint)

    })
    // the blip can consist of:
    // text/label (with color and text style?) and/or either an image or a shape
    // the user determines which elements should be displayed for a blip 
    // perhaps the user can also indicate whether colors, shapes and sizes should be visualized (or set to default values instead)
    // and if text font size should decrease/increase with size?
    // TODO: label consisting of two lines 
    if (viewpoint.blipDisplaySettings.showLabels || (viewpoint.blipDisplaySettings.showImages && getNestedPropertyValueFromObject(d.rating, viewpoint.propertyVisualMaps.blip.image) == null)) {
        const label = getNestedPropertyValueFromObject(d.rating, viewpoint.propertyVisualMaps.blip.label).trim()
        // TODO find smarter ways than breaking on spaces to distribute label over multiple lines
        let line = label
        let line0
        if (label.length > 11) {
            line = label.trim().substring(label.trim().indexOf(" "))
            line0 = label.split(" ")[0]
        }
        if (label.length > 11 && line != line0) { // if long label, show first part above second part of label
            blip.append("text")
                .text(line0)
                .attr("x", 0) // if on left side, then move to the left, if on the right side then move to the right
                .attr("y", -45) // if on upper side, then move up, if on the down side then move down
                .attr("text-anchor", "middle")
                .attr("alignment-baseline", "before-edge")
                .style("fill", "#000")
                .style("font-family", "Arial, Helvetica")
                .style("font-stretch", "extra-condensed")
                .style("font-size", "14px")
        }
        blip.append("text")
            .text(line)
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

        if (blipShape == "star") {
            const star = d3.symbol().type(d3.symbolStar).size(720);
            shape = blip.append('path').attr("d", star)
        }
        if (blipShape == "plus") {
            const plus = d3.symbol().type(d3.symbolCross).size(720);
            shape = blip.append('path').attr("d", plus)
        }
        if (blipShape == "triangle") {
            const triangle = d3.symbol().type(d3.symbolTriangle).size(720);
            shape = blip.append('path').attr("d", triangle)
        }
        if (blipShape == "rectangleHorizontal") {
            shape = blip.append('rect').attr('width', 38)
                .attr('height', 10)
                .attr('x', -20)
                .attr('y', -4)
        }
        if (blipShape == "rectangleVertical") {
            shape = blip.append('rect')
                .attr('width', 10)
                .attr('height', 38)
                .attr('x', -5)
                .attr('y', -15)
        }
        shape.attr("fill", blipColor);
        shape.attr("opacity", "0.4");
    }

    if (viewpoint.blipDisplaySettings.showImages && getNestedPropertyValueFromObject(d.rating, viewpoint.propertyVisualMaps.blip.image) != null) {
        let image = blip.append('image')
            .attr('xlink:href', getNestedPropertyValueFromObject(d.rating, viewpoint.propertyVisualMaps.blip.image))
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

const handleBlipScaleFactorChange = (event) => {
    currentViewpoint.blipDisplaySettings.blipScaleFactor = event.target.value
    console.log(`handle scale factor change ${currentViewpoint.blipDisplaySettings.blipScaleFactor}`)
    drawRadarBlips(currentViewpoint)
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
const handleTagFilterChange = (event) => {
    const filterTagValue = document.getElementById("filterTagSelector").value
    currentViewpoint.blipDisplaySettings.tagFilter.push({ type: "plus", tag: filterTagValue })
    document.getElementById("filterTagSelector").value = ""
    drawRadarBlips(currentViewpoint)
}

const handleApplyColorsChange = (event) => {
    currentViewpoint.blipDisplaySettings.applyColors = event.target.checked
    document.getElementById("colorsLegend").setAttribute("style", `display:${event.target.checked ? "block" : "none"}`)
    drawRadarBlips(currentViewpoint)
}

const handleApplySizesChange = (event) => {
    currentViewpoint.blipDisplaySettings.applySizes = event.target.checked
    document.getElementById("sizesLegend").setAttribute("style", `display:${event.target.checked ? "block" : "none"}`)
    drawRadarBlips(currentViewpoint)
}
const handleApplyShapesChange = (event) => {
    currentViewpoint.blipDisplaySettings.applyShapes = event.target.checked
    document.getElementById("shapesLegend").setAttribute("style", `display:${event.target.checked ? "block" : "none"}`)

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

    const entryHeight = 45 // number vertical pixel per context menu entry
    let height = 30 + Math.max(0,
        viewpoint.propertyVisualMaps.size?.valueMap == null ? 0 : Object.keys(viewpoint.propertyVisualMaps.size?.valueMap)?.length
        , viewpoint.propertyVisualMaps.shape?.valueMap == null ? 0 : Object.keys(viewpoint.propertyVisualMaps.shape?.valueMap)?.length
        , viewpoint.propertyVisualMaps.color?.valueMap == null ? 0 : Object.keys(viewpoint.propertyVisualMaps.color?.valueMap)?.length) * entryHeight // derive from maximum number of entries in each category
    const circleRadius = 12
    const initialColumnIndent = 30
    const columnWidth = 70
    let width = initialColumnIndent + 10 + 4 * columnWidth
    const xShift = x > 500 ? -220 : 0
    const yShift = y > 500 ? -250 : 0
    const contextMenu = d3.select(`svg#${config.svg_id}`)
        .append('g').attr('class', 'context-menu')
        .attr('transform', `translate(${x + xShift},${y + yShift})`) // TODO if x and y are on the edge, then move context menu to the left and up

    contextMenu.append('rect')
        .attr('width', width)
        .attr('height', height)
        .attr('class', 'rect')
        .attr("style", "fill:lightgray;")
        .style("opacity", 0.8)
        .on("mouseout", (e) => {
            // check x and y - to see whether they are really outside context menu area (mouse out also fires when mouse is on elements inside context menu)
            const deltaX = x - e.pageX + xShift
            const deltaY = y - e.pageY + yShift
            if (((deltaX > 0) || (deltaX <= - width + 20) || (deltaY > 0) || (deltaY <= - height))
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
        .attr("transform", "scale(0.7,1)")
    if (viewpoint.propertyVisualMaps.size?.valueMap != null) {
        for (let i = 0; i < Object.keys(viewpoint.propertyVisualMaps.size.valueMap).length; i++) {
            const key = Object.keys(viewpoint.propertyVisualMaps.size.valueMap)[i]
            const scaleFactor = config.sizesConfiguration.sizes[viewpoint.propertyVisualMaps.size.valueMap[key]].size
            const label = config.sizesConfiguration.sizes[viewpoint.propertyVisualMaps.size.valueMap[key]].label
            const sizeEntry = sizesBox.append('g')
                .attr("transform", `translate(0, ${30 + i * entryHeight})`)
                .append('circle')
                .attr("id", `templateSizes${i}`)
                .attr("r", circleRadius)
                .attr("fill", "black")
                .attr("transform", `scale(${scaleFactor})`)
            decorateContextMenuEntry(sizeEntry, "size", key, d, viewpoint, label)
        }
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
        .attr("transform", "scale(0.7,1)")

    if (viewpoint.propertyVisualMaps.shape?.valueMap != null) {

        for (let i = 0; i < Object.keys(viewpoint.propertyVisualMaps.shape.valueMap).length; i++) {
            const key = Object.keys(viewpoint.propertyVisualMaps.shape.valueMap)[i]
            const shapeToDraw = config.shapesConfiguration.shapes[viewpoint.propertyVisualMaps.shape.valueMap[key]].shape
            const label = config.shapesConfiguration.shapes[viewpoint.propertyVisualMaps.shape.valueMap[key]].label
            const shapeEntry = shapesBox.append('g')
                .attr("transform", `translate(0, ${30 + i * entryHeight})`)
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
            if (shapeToDraw == "star") {
                const star = d3.symbol().type(d3.symbolStar).size(420);
                shape = shapeEntry.append('path').attr("d", star)
            }
            if (shapeToDraw == "plus") {
                const plus = d3.symbol().type(d3.symbolCross).size(420);
                shape = shapeEntry.append('path').attr("d", plus)
            }
            if (shapeToDraw == "triangle") {
                const triangle = d3.symbol().type(d3.symbolTriangle).size(420);
                shape = shapeEntry.append('path').attr("d", triangle)
            }
            if (shapeToDraw == "rectangleHorizontal") {
                shape = shapeEntry.append('rect').attr('width', 38)
                    .attr('height', 10)
                    .attr('x', -20)
                    .attr('y', -4)
            }

            if (shapeToDraw == "rectangleVertical") {
                shape = shapeEntry.append('rect')
                    .attr('width', 10)
                    .attr('height', 38)
                    .attr('x', -5)
                    .attr('y', -15)
            }
            if (shape) {
            shape
                .attr("id", `templateSizes${i}`)
                .attr("fill", "black")

            decorateContextMenuEntry(shapeEntry, "shape", key, d, viewpoint, label)
            }
        }
    }
    // draw color
    const colorsBox = contextMenu.append('g')
        .attr('class', 'colorsBox')
        .attr("transform", `translate(${initialColumnIndent + 2 * columnWidth}, ${15})`)
    colorsBox.append("text")
        .text(config.colorsConfiguration.label)
        .attr("x", -25)
        .style("fill", "#000")
        .style("font-family", "Arial, Helvetica")
        .style("font-size", "12px")
        .style("font-weight", "normal")
        .attr("transform", "scale(0.7,1)")
    if (viewpoint.propertyVisualMaps.color?.valueMap != null) {

        for (let i = 0; i < Object.keys(viewpoint.propertyVisualMaps.color.valueMap).length; i++) {
            const key = Object.keys(viewpoint.propertyVisualMaps.color.valueMap)[i]
            const colorToFill = config.colorsConfiguration.colors[viewpoint.propertyVisualMaps.color.valueMap[key]].color
            const label = config.colorsConfiguration.colors[viewpoint.propertyVisualMaps.color.valueMap[key]].label
            const colorEntry = colorsBox.append('g')
                .attr("transform", `translate(0, ${30 + i * entryHeight})`)
                .append('circle')
                .attr("id", `templateSizes${i}`)
                .attr("r", circleRadius)
                .attr("fill", colorToFill)

            decorateContextMenuEntry(colorEntry, "color", key, d, viewpoint, label)
        }
    }
    const iconsBox = contextMenu.append('g')
        .attr('class', 'iconsBox')
        .attr("transform", `translate(${initialColumnIndent + 3 * columnWidth - 35}, ${15})`)

    // additional blip actions can be initiated    
    iconsBox.append("text")
        .text("Blip Actions")
        .style("fill", "#000")
        .style("font-family", "Arial, Helvetica")
        .style("font-size", "12px")
        .style("font-weight", "normal")
        .attr("transform", "scale(0.7,1)")


    const menuItemHeight = 18
    // TODO: does clone blip mean clone rating (but for the same existing object?) it probably does; current implementation is full copy - object and rating
    iconsBox.append("text")
        .text("Clone Blip")
        .attr("x", 0)
        .style("fill", "#000")
        .style("font-family", "Arial, Helvetica")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .attr("transform", `translate(0, ${20 + 0 * menuItemHeight})`)
        .attr("class", "clickableProperty")
        .on("click", () => {
            const newBlip = JSON.parse(JSON.stringify(d))
            viewpoint.blips.push(newBlip)
            newBlip.x = newBlip.x != null ? newBlip.x + 15 : null
            newBlip.y = newBlip.y != null ? newBlip.y + 15 : null
            newBlip.id = uuidv4()
            drawRadarBlips(viewpoint)
        })
    iconsBox.append("text")
        .text("Delete Blip")
        .attr("x", 0)
        .style("fill", "#000")
        .style("font-family", "Arial, Helvetica")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .attr("transform", `translate(0, ${20 + 1 * menuItemHeight})`)
        .attr("class", "clickableProperty")
        .on("click", () => {
            const blipIndex = viewpoint.blips.indexOf(d)
            viewpoint.blips.splice(blipIndex, 1)
            d3.select('.context-menu').remove();
            drawRadarBlips(viewpoint)
        })

    iconsBox.append("text")
        .text("Show Similar Blips")
        .attr("x", 0)
        .style("fill", "#000")
        .style("font-family", "Arial, Helvetica")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .attr("transform", `translate(0, ${20 + 2 * menuItemHeight})`)
        .attr("class", "clickableProperty")
        .on("click", () => {
            const blipIndex = viewpoint.blips.indexOf(d)
            // create tag filters from tags on d
            const tags = d.rating.object.tags
            if (tags != null && tags.length != null) {
                tags.forEach((tag) => viewpoint.blipDisplaySettings.tagFilter.push({ type: "plus", tag: tag }))
            }
            drawRadarBlips(viewpoint)
        })



}

function populateDatalistWithTags(includeDiscreteProperties = false) {
    const distinctValues = getDistinctTagValues(getViewpoint(), includeDiscreteProperties)
    const tagsList = document.getElementById('tagsList')
    //remove current contents
    tagsList.length = 0
    tagsList.innerHTML = null
    let option
    for (let tagvalue of distinctValues) {
        option = document.createElement('option')
        option.value = tagvalue
        tagsList.appendChild(option)
    }
}

function decorateContextMenuEntry(menuEntry, dimension, value, blip, viewpoint, label) { // dimension = shape, size, color
    menuEntry.attr("class", "clickableProperty")
        .on("click", () => {
            if (dimension == "size") {
                // translate dimensionSequence 
                blip["rating"]["magnitude"] = value // getKeyForValue(viewpoint.propertyVisualMaps.size.valueMap, dimensionSequence)
                drawRadarBlips(viewpoint)
            }
            if (dimension == "shape") {
                console.log(`clicked ${label}   for ${dimension} for blip: ${getNestedPropertyValueFromObject(d.rating, viewpoint.propertyVisualMaps.blip.label)}; new value = ${value}`);
                blip["rating"]["object"]["offering"] = value // getKeyForValue(viewpoint.propertyVisualMaps.shape.valueMap, dimensionSequence)
                drawRadarBlips(viewpoint)
            }
            if (dimension == "color") {
                console.log(`clicked ${label}   for ${dimension} for blip: ${blip.rating.experience}; new value = ${value}`);
                blip["rating"]["experience"] = value // getKeyForValue(viewpoint.propertyVisualMaps.shape.valueMap, dimensionSequence)
                drawRadarBlips(viewpoint)
            }
        })
        .on("mouseover", (e, d) => {
            addTooltip(
                (d) => {
                    return `<div>     
            <b>${label}</b>
          </div>`}
                , d, e.pageX, e.pageY);
        })
        .on("mouseout", () => {
            removeTooltip();
        })
}

// Add the tooltip element to the radar
const tooltipElementId = "blip-tooltip"
const tooltip = document.querySelector(`#${tooltipElementId}`);
if (!tooltip) {
    const tooltipDiv = document.createElement("div");
    tooltipDiv.classList.add("tooltip"); // refers to div.tooltip CSS style definition
    tooltipDiv.style.opacity = "0";
    tooltipDiv.id = tooltipElementId;
    document.body.appendChild(tooltipDiv);
}
const div = d3.select(`#${tooltipElementId}`);

const addTooltip = (hoverTooltip, d, x, y) => { // hoverToolTip is a function that returns the HTML to be displayed in the tooltip
    div
        .transition()
        .duration(200)
        .style("opacity", 0.8);
    div
        .html(hoverTooltip(d))
        .style("left", `${x + 5}px`)
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
document.getElementById('blipScaleFactorSlider').addEventListener("change", handleBlipScaleFactorChange);

document.getElementById('showLabels').addEventListener("change", handleShowLabelsChange);
document.getElementById('showShapes').addEventListener("change", handleShowShapesChange);
document.getElementById('addTagToFilter').addEventListener("click", handleTagFilterChange);

document.getElementById('applyColors').addEventListener("change", handleApplyColorsChange);
document.getElementById('applySizes').addEventListener("change", handleApplySizesChange);
document.getElementById('applyShapes').addEventListener("change", handleApplyShapesChange);


const addProperty = (label, value, parent) => {
    if (value != null && value.length > 0 && value != "undefined") {
        let p = parent.append("p")
            .html(`<b>${label}</b> ${value}`)
    }
}

const addTags = (label, tags, parent) => {
    let innerHTML = `<b>${label}</b> `
    for (let i = 0; i < tags.length; i++) {
        innerHTML = innerHTML + `<span class="extra tagfilter">${tags[i]}</span>`
    }
    parent.append("div").html(innerHTML)
}


// copied from http://bl.ocks.org/GerHobbelt/2653660
function blipWindow(blip, viewpoint) {

    const svgElementId = `svg#${viewpoint.template.svg_id}` //arguments[1][0]

    // inject a HTML form to edit the content here...

    const svg = d3.select(svgElementId)
    const foreignObject = svg.append("foreignObject");

    foreignObject
        //   .attr("x", d.layerX) // use x and y coordinates from mouse event // TODO for use in size/color/shape - the location needs to be derived differently 
        //   .attr("y", d.layerY)
        .attr("x", 100) // use x and y coordinates from mouse event // TODO for use in size/color/shape - the location needs to be derived differently 
        .attr("y", 100)

        .attr("width", 800)
        .attr("height", 600)

    const body = foreignObject
        .append("xhtml:body")
        .attr("style", "background-color:#fff4b8; padding:6px; opacity:0.9")

    body.append("h2").text(`Properties for ${getNestedPropertyValueFromObject(blip.rating, viewpoint.propertyVisualMaps.blip.label)}`)
    // let model = getData().model
    // let XXratingType = model?.ratingTypes[viewpoint.ratingType]
    // let XXratingTypes  = model?.ratingTypes
    // let key = viewpoint.ratingType
    // let rt = XXratingTypes[key]
    // let rt2 = XXratingTypes["technologyAdaption"]

    let ratingType = (typeof (viewpoint.ratingType) == "string") ? getData().model?.ratingTypes[viewpoint.ratingType] : viewpoint.ratingType


    try {
        for (let propertyName in ratingType.objectType.properties) {
            const property = ratingType.objectType.properties[propertyName]
            let value = blip.rating.object[propertyName]
            if (property.allowableValues != null && property.allowableValues.length > 0) {
                value = getLabelForAllowableValue(value, property.allowableValues)
            }
            if (property.type == "url" && value != null && value.length > 1 && value != "undefined") {
                let newLink = body.append("xlink:a")
                    .attr("src", value)
                    .text(`${property.label}: ${value}`)
                newLink.node().target = "_new"
                newLink.node().addEventListener("click", (e) => { window.open(value); })
            } else if (property.type == "image" && value != null && value.length > 0 && value != "undefined") {
                let img = body.append("img")
                    .attr("src", value)
                    .attr("style", "width: 350px;float:right;padding:15px")
            } else if (property.type == "tags" && value != null && value.length > 0) {
                addTags("Tags", value, body)
            }

            else {
                addProperty(property.label, value, body)
            }
        }


        const ratingDiv = body.append("div")
            .attr("id", "ratingDiv")



        for (let propertyName in ratingType.properties) {
            const property = ratingType.properties[propertyName]
            let value = blip.rating[propertyName]
            if (property.allowableValues != null && property.allowableValues.length > 0) {
                value = getLabelForAllowableValue(value, property.allowableValues)
            }
            addProperty(property.label, value, ratingDiv)
        }




        let buttonDiv = body.append("div")
            .attr("id", "buttonDiv")
            .attr("style", "position: absolute; bottom: 30;left: 30;")
        buttonDiv.append("button")
            .attr("style", "float:left;padding:15px")
            .on("click", () => {
                svg.select("foreignObject").remove();

                launchBlipEditor(blip, viewpoint, drawRadarBlips)
            })
            .html("Edit Blip")
        buttonDiv.append("button")
            .attr("style", "float:right;padding:15px")
            .on("click", () => {
                svg.select("foreignObject").remove();

            }).html("Close")
            ;
    } catch (e) { console.log(`blip window exception ${e}`) }


}


const getLabelForAllowableValue = (value, allowableValues) => {
    let label = ""
    for (let i = 0; i < allowableValues.length; i++) {
        if (allowableValues[i].value == value) { label = allowableValues[i].label; break }
    }
    return label
}