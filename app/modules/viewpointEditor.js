import { cartesianFromPolar, polarFromCartesion } from './drawingUtilities.js'

export { viewpointEditor, switchboard }

let config = {
    svg_id: "radar",
    width: 1450,
    height: 1000,
    topLayer: "sectors", // rings or sectors
    selectedRing: 1,
    selectedSector: 2,


    colors: {
        background: "#fef",
        grid: "#bbb",
        inactive: "#ddd"
    },
    rotation: 0.20,
    maxRingRadius: 450,
    ringConfiguration: {
        outsideRingsAllowed: true
        , rings: [ // rings are defined from outside going in; the first one is the widest
            { label: "Spotted", backgroundColor: "#FFF", width: 0.15 },
            { label: "Hold", backgroundColor: "gray", width: 0.2 },
            { label: "Assess", backgroundColor: "gold", width: 0.25 },
            { label: "Trial", backgroundColor: "silver", width: 0.18 },
            { label: "Adopt", backgroundColor: "gray", width: 0.2 },

        ]
    },
    sectorConfiguration: {
        outsideSectorsAllowed: true, sectors: [
            { label: "Data Management", backgroundColor: "#blue", angle: 0.1 },
            { label: "Libraries & Frameworks", backgroundColor: "green", angle: 0.2 },
            { label: "Infrastructure", backgroundColor: "cyan", angle: 0.25 },
            { label: "Languages", backgroundColor: "orange", angle: 0.1 },
            { label: "Concepts & Methodology", backgroundColor: "red", angle: 0.15 },
        ]
    },
}

const switchboard = {
    handleLayersChange: (e) => {
        config.topLayer = e.currentTarget.id
        drawRadar();
    },
    handleSectorSelection: (sector) => {
        config.selectedSector = sector
        drawRadar();
    },
    handleRingSelection: (ring) => {
        config.selectedRing = ring
        drawRadar();
    },
    handleColorSelection: (color) => {
        if ("sectors" == config.topLayer)
            config.sectorConfiguration.sectors[config.selectedSector].backgroundColor = color.hexString
        if ("rings" == config.topLayer)
            config.ringConfiguration.rings[config.selectedRing].backgroundColor = color.hexString
        console.log(color.hexString);
        drawRadar()
    }
}

const viewpointEditor = function () {
    drawRadar()
    const colorPicker = new iro.ColorPicker('#picker');
    colorPicker.on('color:change', switchboard.handleColorSelection);
    rotationSlider()
}


function drawRadar() {
    const radar = initializeRadar()
    const radarCanvas = radar.append("g")
    radarCanvas.attr("transform", `rotate(${-360 * config.rotation})`) // clockwise rotation

    if ("sectors" == config.topLayer) { // draw top layer last 
        drawRings(radarCanvas)
        drawSectors(radarCanvas)
    }
    else {
        drawSectors(radarCanvas)
        drawRings(radarCanvas)
    }
}


const handleRotationSlider = function (value) {
    config.rotation = value
    drawRadar()
}

const rotationSlider = () => {
    var slider = d3
        .sliderHorizontal()
        .min(0)
        .max(1)
        .step(0.05)
        .width(300)
        .displayValue(false)
        .on('onchange', (sliderValue) => {
            handleRotationSlider(sliderValue)
        });

    d3.select('#rotationSlider')
        .append('svg')
        .attr('width', 500)
        .attr('height', 100)
        .append('g')
        .attr('transform', 'translate(30,30)')
        .call(slider);
}
const drawSectors = function (radar) {
    let currentAnglePercentage = 0
    radar.append("line") //horizontal sector boundary
        .attr("x1", 0).attr("y1", 0)
        .attr("x2", config.maxRingRadius).attr("y2", 0)
        .style("stroke", config.colors.grid)
        .style("stroke-width", 1);

    for (let i = 0; i < config.sectorConfiguration.sectors.length; i++) {
        let sector = config.sectorConfiguration.sectors[i]
        currentAnglePercentage = currentAnglePercentage + sector.angle
        let currentAngle = 2 * Math.PI * currentAnglePercentage
        const sectorEndpoint = cartesianFromPolar({ r: config.maxRingRadius, phi: currentAngle })
        // using angle and maxring radius, determine x and y for endpoint of line, then draw line
        radar.append("line")
            .attr("x1", 0).attr("y1", 0)
            .attr("x2", sectorEndpoint.x).attr("y2", - sectorEndpoint.y)
            .style("stroke", config.colors.grid)
            .style("stroke-width", 3);
        let startAngle = (- 2 * (currentAnglePercentage - sector.angle) + 0.5) * Math.PI
        let endAngle = (- 2 * currentAnglePercentage + 0.5) * Math.PI

        const sectorArc = d3.arc()
            .outerRadius(config.maxRingRadius)
            .innerRadius(15)
            // startAngle and endAngle are measured clockwise from the 12 o’clock in radians; the minus takes care of anti-clockwise and the +0.5 is for starting at the horizontal axis pointing east
            .startAngle(startAngle)
            .endAngle(endAngle)
        radar.append("path")
            .attr("id", `piePiece${i}`)
            .attr("d", sectorArc)
            .style("fill", sector.backgroundColor)
            .attr("opacity", 0.6)
            // define borders of sectors
            .style("stroke", ("sectors" == config.topLayer && config.selectedSector == i) ? "red" : "#000")
            .style("stroke-width", ("sectors" == config.topLayer && config.selectedSector == i) ? 6 : 2)
            .style("stroke-dasharray", ("sectors" == config.topLayer && config.selectedSector == i) ? "" : "5 1")
            .on('click', () => { const sector = i; switchboard.handleSectorSelection(sector) })



        // print sector label along the edge of the arc
        let textArc = d3.arc()
            .outerRadius(config.maxRingRadius + 30)
            .innerRadius(150)
            // startAngle and endAngle are measured clockwise from the 12 o’clock in radians; the minus takes care of anti-clockwise and the +0.5 is for starting at the horizontal axis pointing east
            // for angle + rotation percentages up to 70%, we flip the text - by sweeping from end to begin
            .endAngle((currentAnglePercentage + config.rotation) % 1 < 0.6 ? startAngle : endAngle)
            .startAngle((currentAnglePercentage + config.rotation) % 1 < 0.6 ? endAngle : startAngle)
        textArc = textArc().substring(0, textArc().indexOf("L"))
        // create the path following the circle along which the text is printed
        radar.append("path")
            .attr("id", `pieText${i}`)
            .attr("d", textArc)
            .attr("opacity", 0.0)

        const textPaths = radar.append("g").attr('class', 'textPaths');
        textPaths.append("text")
            .attr("id", `sectorLabel${i}`)
            .attr("dy", 10)
            .attr("dx", 45)
            .style("font-family", "sans-serif")
            .style("font-size", "30px")
            .style("fill", "#fff")

            .append("textPath")
            // .attr("class", "textpath tp_avg")
            .attr('fill', '#000')
            .attr("startOffset", "40%")
            .style("text-anchor", "middle")
            .attr("xlink:href", `#pieText${i}`)
            .text(`${sector.label}`)
            .call(make_editable, ["sectorLabel", sector.label, `sectorLabel${i}`]);
        ;



    }
}


const drawRings = function (radar) {
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
        radar.append("path")
            .attr("id", `ring${i}`)
            .attr("d", ringArc)
            .style("fill", ring.backgroundColor)
            .attr("opacity", 0.6)
            // define borders of rings
            .style("stroke", ("rings" == config.topLayer && config.selectedRing == i) ? "red" : "#000")
            .style("stroke-width", ("rings" == config.topLayer && config.selectedRing == i) ? 6 : 2)
            .style("stroke-dasharray", ("rings" == config.topLayer && config.selectedRing == i) ? "" : "5 1")
            .on('click', () => { const ring = i; switchboard.handleRingSelection(ring) })



        radar.append("text")
            .attr("id", `ringLabel${i}`)
            .text(ring.label)
            .attr("y", -currentRadius + 62)
            .attr("text-anchor", "middle")
            .style("fill", "#e5e5e5")
            .style("font-family", "Arial, Helvetica")
            .style("font-size", "32px")
            .style("font-weight", "bold")
            //            .style("pointer-events", "none")
            .style("user-select", "none")
            .call(make_editable, ["ringLabel", ring.label, `ringLabel${i}`]);

        currentRadiusPercentage = currentRadiusPercentage - ring.width
    }
}

function initializeRadar() {
    const svg = d3.select(`svg#${config.svg_id}`)
        .style("background-color", config.colors.background)
        .attr("width", config.width)
        .attr("height", config.height)


    if (svg.node().firstChild) {
        svg.node().removeChild(svg.node().firstChild)
    }
    const radar = svg.append("g");
    radar.attr("transform", `translate(${config.width / 2},${config.height / 2}) `);
    return radar;
}


const handleInputChange = function (fieldIdentifier, newValue) {
    const sectorLabelStringLength = 11
    const ringLabelStringLength = 9
    if (fieldIdentifier.startsWith("sectorLabel")) {
        const sectorIndex = fieldIdentifier.substring(sectorLabelStringLength)
        config.sectorConfiguration.sectors[sectorIndex].label = newValue
        drawRadar()
    }
    if (fieldIdentifier.startsWith("ringLabel")) {
        const ringIndex = fieldIdentifier.substring(ringLabelStringLength)
        config.ringConfiguration.rings[ringIndex].label = newValue
        drawRadar()
    }
}

// copied from http://bl.ocks.org/GerHobbelt/2653660
function make_editable(d, field) {
    //console.log("make_editable", arguments);
    const valueToEdit = arguments[1][1]
    const fieldIdentifier = arguments[1][2]
    d
        .on("mouseover", function () {
            d3.select(this).style("fill", "red");
        })
        .on("mouseout", function () {
            d3.select(this).style("fill", null);
        })
        .on("click", function (d) {
            var p = this.parentNode;

            // inject a HTML form to edit the content here...

            const svg = d3.select(`svg#${config.svg_id}`)
            var frm = svg.append("foreignObject");

            var inp = frm
                .attr("x", d.pageX) // use x and y coordinates from mouse event
                .attr("y", d.pageY)
                .attr("width", 300)
                .attr("height", 25)
                .append("xhtml:form")
                .append("input")
                .attr("title", "Edit value, then press tab or click outside of field")
                .attr("value", function () {
                    // nasty spot to place this call, but here we are sure that the <input> tag is available
                    // and is handily pointed at by 'this':
                    this.focus();

                    return valueToEdit;
                })
                .attr("style", "width: 294px;")
                // make the form go away when you jump out (form looses focus) or hit ENTER:
                .on("blur", function () {
                    const txt = inp.node().value;
                    handleInputChange(fieldIdentifier, txt)
                    // Note to self: frm.remove() will remove the entire <g> group! Remember the D3 selection logic!
                    svg.select("foreignObject").remove();
                })
                .on("keypress", function () {
                    // IE fix
                    if (!d3.event)
                        d3.event = window.event;

                    const e = d3.event;
                    if (e.keyCode == 13) {
                        if (typeof (e.cancelBubble) !== 'undefined') // IE
                            e.cancelBubble = true;
                        if (e.stopPropagation)
                            e.stopPropagation();
                        e.preventDefault();

                        const txt = inp.node().value;
                        handleInputChange(fieldIdentifier, txt)

                        // odd. Should work in Safari, but the debugger crashes on this instead.
                        // Anyway, it SHOULD be here and it doesn't hurt otherwise.
                        svg.select("foreignObject").remove();
                    }
                });
        });
}