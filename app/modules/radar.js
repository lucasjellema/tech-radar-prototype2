import { cartesianFromPolar, polarFromCartesion } from './drawingUtilities.js'
export { drawRadar, subscribeToRadarEvents }

const color_white = "#FFF"

const subscribers = []
const subscribeToRadarEvents = (subscriber) => { subscribers.push(subscriber) }
const publishRadarEvent = (event) => { subscribers.forEach((subscriber) => { subscriber(event) }) }

const styleText = (textElement, configNode, config, alternativeFontSource = null) => {
    const fontStyleElements = [{ style: "fill", property: "color" }, { style: "font-size", property: "fontSize" }
        , { style: "font-family", property: "fontFamily" }, { style: "font-weight", property: "fontWeight" }
        , { style: "font-style", property: "fontStyle" }
    ]
    fontStyleElements.forEach((fontStyleElement) => {
        try {
            let styleProperty = (configNode?.font?.[fontStyleElement.property] ?? alternativeFontSource?.font?.[fontStyleElement.property]) ?? config.defaultFont[fontStyleElement.property]
            textElement
                .style(fontStyleElement.style
                    , styleProperty
                )
        } catch (e) { console.log(`Exception in styleText for ${JSON.stringify(fontStyleElement)} applied to ${JSON.stringify(textElement)}`) }
    })
}

function drawRadar(config, elementDecorator = null) {
    const radar = initializeRadar(config)
    const title = radar.append("text")
        .attr("transform", `translate(${config.title.x != null ? config.title.x : -500}, ${config.title.y != null ? config.title.y : -400})`)
        .text(config.title.text)
        .attr("class", "draggable")
        .call(elementDecorator ? elementDecorator : () => { console.log(`no decorator`) }, [`svg#${config.svg_id}`, config.title.text, `title`]);
    styleText(title, config.title, config)
    const radarCanvas = radar.append("g").attr("id", "radarCanvas")
    let sectorCanvas, ringCanvas
    if ("sectors" == config.topLayer) { // draw top layer last 
        ringCanvas = drawRings(radarCanvas, config)
        sectorCanvas = drawSectors(radarCanvas, config, elementDecorator)
    }
    else {
        sectorCanvas = drawSectors(radarCanvas, config, elementDecorator)
        ringCanvas = drawRings(radarCanvas, config)
    }
    //rotation only on sectors - not on rings
    sectorCanvas.attr("transform", `rotate(${-360 * config.rotation})`) // clockwise rotation
    drawRingLabels(radar, config, elementDecorator)
}

function initializeRadar(config) {
    const svg = d3.select(`svg#${config.svg_id}`)
        .style("background-color", config.colors.background)
        .attr("width", config.width)
        .attr("height", config.height)
    if (svg.node().firstChild) {
        svg.node().removeChild(svg.node().firstChild)
    }
    const radar = svg.append("g").attr("id", "radar");
    radar.attr("transform", `translate(${config.width / 2},${config.height / 2}) `);
    return radar;
}



const drawSectors = function (radar, config, elementDecorator = null) {

    const sectorCanvas = radar.append("g").attr("id", "sectorCanvas")

    sectorCanvas.append("line") //horizontal sector boundary
        .attr("x1", 0).attr("y1", 0)
        .attr("x2", config.sectorBoundariesExtended ? 2000 : config.maxRingRadius)
        .attr("y2", 0)
        .style("stroke", config.colors.grid)
        .style("stroke-width", 3);

    for (let layer = 0; layer < 2; layer++) { // TODO if not edit mode then only one layer
        let currentAnglePercentage = 0
        for (let i = 0; i < config.sectorConfiguration.sectors.length; i++) {
            let sector = config.sectorConfiguration.sectors[i]
            currentAnglePercentage = currentAnglePercentage + sector.angle
            let currentAngle = 2 * Math.PI * currentAnglePercentage
            const sectorEndpoint = cartesianFromPolar({ r: config.sectorBoundariesExtended ? 2000 : config.maxRingRadius, phi: currentAngle })

            let startAngle = (- 2 * (currentAnglePercentage - sector.angle) + 0.5) * Math.PI
            let endAngle = (- 2 * currentAnglePercentage + 0.5) * Math.PI
            if (layer == 0) {
                // using angle and maxring radius, determine x and y for endpoint of line, then draw line
                sectorCanvas.append("line")
                    .attr("x1", 0).attr("y1", 0)
                    .attr("x2", sectorEndpoint.x).attr("y2", - sectorEndpoint.y)
                    .style("stroke", config.colors.grid)
                    .style("stroke-width", 4);

                const sectorArc = d3.arc()
                    .outerRadius(config.maxRingRadius)
                    .innerRadius(15)
                    // startAngle and endAngle are measured clockwise from the 12 o’clock in radians; the minus takes care of anti-clockwise and the +0.5 is for starting at the horizontal axis pointing east
                    .startAngle(startAngle)
                    .endAngle(endAngle)
                sectorCanvas.append("path")
                    .attr("id", `piePiece${i}`)
                    .attr("d", sectorArc)
                    .style("fill", sector.backgroundColor != null ? sector.backgroundColor : color_white)
                    .attr("opacity", sector.opacity != null ? sector.opacity : 0.6)
                    // define borders of sectors
                    .style("stroke", ("sectors" == config.topLayer && config.selectedSector == i) ? "red" : "#000")
                    .style("stroke-width", ("sectors" == config.topLayer && config.selectedSector == i) ? 8 : 4)
                    .style("stroke-dasharray", ("sectors" == config.topLayer && config.selectedSector == i) ? "" : "9 1")
                    .on('click', () => { const sector = i; publishRadarEvent({ type: "sectorClick", sector: i }) })
                // add color to the sector area outside the outer ring
                const outerringArc = d3.arc()
                    .outerRadius(config.maxRingRadius * 4)
                    .innerRadius(config.maxRingRadius)
                    .startAngle(startAngle)
                    .endAngle(endAngle)
                sectorCanvas.append("path")
                    .attr("id", `outerring${i}`)
                    .attr("d", outerringArc)
                    .style("fill", sector?.outerringBackgroundColor?? "white")

                // print sector label along the edge of the arc
                displaySectorLabel(currentAnglePercentage, startAngle, endAngle, sectorCanvas, i, sector, config, elementDecorator)

            }
            // TODO make sure that background images are printed after and therefore on top of all sectors    
            if (layer == 1 && sector?.backgroundImage?.image != null) {
                sectorCanvas.append('image')
                    .attr("id", `sectorBackgroundImage${i}`)
                    .attr('xlink:href', sector.backgroundImage.image)
                    .attr('width', 100)
                    .attr("transform", `translate(${sector.backgroundImage.x ?? 100},${sector.backgroundImage.y ?? 100}) scale(${sector.backgroundImage?.scaleFactor ?? 1}) `)
                    .attr("class", "draggable")

            }



            if (layer == 1 && "sectors" == config.topLayer) {
                // draw sector knob at the outer ring edge, on the sector boundaries
                const sectorKnobPoint = cartesianFromPolar({ r: config.maxRingRadius, phi: currentAngle })
                sectorCanvas.append("circle")
                    .attr("id", `sectorKnob${i}`)
                    .attr("cx", sectorKnobPoint.x)
                    .attr("cy", -sectorKnobPoint.y)
                    .attr("r", 15)
                    .style("fill", "red")
                    .attr("opacity", 1)
                    .style("stroke", "#000")
                    .style("stroke-width", 7)
                    .attr("class", "draggable")
            }
        }
    }//layers
    return sectorCanvas
}


const drawRings = function (radar, config) {
    const ringCanvas = radar.append("g").attr("id", "ringCanvas")
    const totalRingPercentage = config.ringConfiguration.rings.reduce((sum, ring) => { return sum + ring.width }, 0)
    let currentRadiusPercentage = totalRingPercentage
    for (let i = 0; i < config.ringConfiguration.rings.length; i++) {
        let ring = config.ringConfiguration.rings[i]
        let currentRadius = currentRadiusPercentage * config.maxRingRadius

        const ringArc = d3.arc()
            .outerRadius(config.maxRingRadius * currentRadiusPercentage)
            .innerRadius(config.maxRingRadius * (currentRadiusPercentage - ring.width))
            .startAngle(0)
            .endAngle(359)
        ringCanvas.append("path")
            .attr("id", `ring${i}`)
            .attr("d", ringArc)
            .style("fill", ring.backgroundColor != null ? ring.backgroundColor : color_white)
            .attr("opacity", ring.opacity != null ? ring.opacity : 0.6)
            // define borders of rings
            .style("stroke", ("rings" == config.topLayer && config.selectedRing == i) ? "red" : "#000")
            .style("stroke-width", ("rings" == config.topLayer && config.selectedRing == i) ? 6 : 2)
            .style("stroke-dasharray", ("rings" == config.topLayer && config.selectedRing == i) ? "" : "5 1")
            .on('click', () => { const ring = i; publishRadarEvent({ type: "ringClick", ring: i }) })
        if (ring.backgroundImage && ring.backgroundImage.image) {
            ringCanvas.append('image')
                .attr("id", `ringBackgroundImage${i}`)
                .attr('xlink:href', ring.backgroundImage.image)
                .attr('width', 100)
                .attr("transform", "translate(100,100)")
                .attr("class", "draggable")
        }
        if (config.editMode && "rings" == config.topLayer) {
            // draw ring knob at the out edge, horizontal axis
            ringCanvas.append("circle")
                .attr("id", `ringKnob${i}`)
                .attr("cx", config.maxRingRadius * currentRadiusPercentage)
                .attr("cy", 0)
                .attr("r", 15)
                .style("fill", "red")
                .attr("opacity", 1)
                .style("stroke", "#000")
                .style("stroke-width", 7)
                .attr("class", "draggable")
        }

        currentRadiusPercentage = currentRadiusPercentage - ring.width
    }
    return ringCanvas
}


const drawRingLabels = function (radar, config, elementDecorator) {
    const totalRingPercentage = config.ringConfiguration.rings.reduce((sum, ring) => { return sum + ring.width }, 0)
    let currentRadiusPercentage = totalRingPercentage
    for (let i = 0; i < config.ringConfiguration.rings.length; i++) {
        let ring = config.ringConfiguration.rings[i]
        let currentRadius = currentRadiusPercentage * config.maxRingRadius
        const ringlabel = radar.append("text")
            .attr("id", `ringLabel${i}`)
            .text(ring.label)
            .attr("y", -currentRadius + 62)
            .attr("text-anchor", "middle")

            //            .style("pointer-events", "none")
            .style("user-select", "none")
            .call(elementDecorator ? elementDecorator : () => { console.log(`no decorator`) }, [`svg#${config.svg_id}`, ring.label, `ringLabel${i}`]);
        styleText(ringlabel, ring, config, config.ringConfiguration)

        currentRadiusPercentage = currentRadiusPercentage - ring.width
    }
}

function displaySectorLabel(currentAnglePercentage, startAngle, endAngle, sectorCanvas, sectorIndex, sector, config, elementDecorator = null) {
    let textArc = d3.arc()
        .outerRadius(config.maxRingRadius + 30)
        .innerRadius(150)
        // startAngle and endAngle are measured clockwise from the 12 o’clock in radians; the minus takes care of anti-clockwise and the +0.5 is for starting at the horizontal axis pointing east
        // for angle + rotation percentages up to 70%, we flip the text - by sweeping from end to begin
        .endAngle((currentAnglePercentage + config.rotation) % 1 < 0.6 ? startAngle : endAngle)
        .startAngle((currentAnglePercentage + config.rotation) % 1 < 0.6 ? endAngle : startAngle)
    textArc = textArc().substring(0, textArc().indexOf("L"))
    // create the path following the circle along which the text is printed; the actual printing of the text is done next
    sectorCanvas.append("path")
        .attr("id", `pieText${sectorIndex}`)
        .attr("d", textArc)
        .attr("opacity", 0.0)

    const textPaths = sectorCanvas.append("g").attr('class', 'textPaths')
    const sectorLabel = textPaths.append("text")
        .attr("id", `sectorLabel${sectorIndex}`)
        .attr("dy", 10)
        .attr("dx", 45)
    // .style("font-family", "sans-serif")
    // .style("font-size", "30px")
    // .style("fill", "#fff")
    styleText(sectorLabel, sector, config, config.sectorConfiguration)

    sectorLabel.append("textPath")
        // .attr("class", "textpath tp_avg")
        //  .attr('fill', '#000')
        .attr("startOffset", "40%")
        .style("text-anchor", "middle")
        .attr("xlink:href", `#pieText${sectorIndex}`)
        .text(`${sector.label}`)
        .call(elementDecorator ? elementDecorator : () => { console.log(`no decorator`) }, [`svg#${config.svg_id}`, sector.label, `sectorLabel${sectorIndex}`]);

}