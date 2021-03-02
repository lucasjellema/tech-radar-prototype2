import { cartesianFromPolar, polarFromCartesion } from './drawingUtilities.js'

export { viewpointEditor }

let config = {
    svg_id: "radar",
    width: 1450,
    height: 1000,

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
            { label: "Status A", backgroundColor: "gray", width: 0.2 },
            { label: "Status X", backgroundColor: "gold", width: 0.25 },
            { label: "Status Y", backgroundColor: "silver", width: 0.28 },
            { label: "Status Z", backgroundColor: "gray", width: 0.2 },

        ]
    },
    sectorConfiguration: {
        outsideSectorsAllowed: true, sectors: [
            { label: "Group I", backgroundColor: "#blue", angle: 0.1 },
            { label: "Group II", backgroundColor: "green", angle: 0.4 },
            { label: "Group III", backgroundColor: "cyan", angle: 0.25 },
            { label: "Group IV", backgroundColor: "orange", angle: 0.1 },
            { label: "Group V", backgroundColor: "red", angle: 0.15 },
        ]
    },
}

const viewpointEditor = function () {
    const radar = initializeRadar()
    const radarCanvas = radar.append("g");
    radarCanvas.attr("transform", `rotate(${- 360 * config.rotation})`); // clockwise rotation

    drawRings(radarCanvas)
    drawSectors(radarCanvas)

    const colorPicker = new iro.ColorPicker('#picker');
    colorPicker.on('color:change', function (color) {
        console.log(color.hexString);
    });
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
        console.log(`current angle % ${currentAnglePercentage}, sector angle ${sector.angle} currentAngle = ${currentAngle} ${JSON.stringify(sectorEndpoint)}`)
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
            .attr("opacity", 0.2)
            // define borders of sectors
            .style("stroke", "#000")
            .style("stroke-width", 2)
            .style("stroke-dasharray", "5 1")




        // print sector label along the edge of the arc
               let textArc = d3.arc()
            .outerRadius(config.maxRingRadius + 30)
            .innerRadius(150)
            // startAngle and endAngle are measured clockwise from the 12 o’clock in radians; the minus takes care of anti-clockwise and the +0.5 is for starting at the horizontal axis pointing east
            // for angle + rotation percentages up to 70%, we flip the text - by sweeping from end to begin
            .endAngle((currentAnglePercentage + config.rotation) % 1 < 0.7 ? startAngle : endAngle)
            .startAngle((currentAnglePercentage + config.rotation)%1 < 0.7 ? endAngle : startAngle)
        textArc = textArc().substring(0, textArc().indexOf("L"))
        // create the path following the circle along which the text is printed
        radar.append("path")
            .attr("id", `pieText${i}`)
            .attr("d", textArc)
            .attr("opacity", 0.0)

        const textPaths = radar.append("g").attr('class', 'textPaths');
        textPaths.append("text")
            .attr("dy", 10)
            .attr("dx", 45)
            .append("textPath")
            // .attr("class", "textpath tp_avg")
            .attr('fill', '#000')
            .attr("startOffset", "40%")
            .style("text-anchor", "middle")
            .attr("xlink:href", `#pieText${i}`)
            .text(`${sector.label} ${currentAnglePercentage}  ${config.rotation}`)
            ;



    }
}


const drawRings = function (radar) {
    const totalRingPercentage = config.ringConfiguration.rings.reduce((sum, ring) => { return sum + ring.width }, 0)
    let currentRadiusPercentage = totalRingPercentage
    for (let i = 0; i < config.ringConfiguration.rings.length; i++) {
        let ring = config.ringConfiguration.rings[i]
        let currentRadius = currentRadiusPercentage * config.maxRingRadius
        radar.append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", currentRadius)
            .style("fill", ring.backgroundColor)
            .style("stroke", "#003")
            .style("stroke-width", 3);

        radar.append("text")
            .text(ring.label)
            .attr("y", -currentRadius + 62)
            .attr("text-anchor", "middle")
            .style("fill", "#e5e5e5")
            .style("font-family", "Arial, Helvetica")
            .style("font-size", "32px")
            .style("font-weight", "bold")
            .style("pointer-events", "none")
            .style("user-select", "none");

        currentRadiusPercentage = currentRadiusPercentage - ring.width
    }
}

function initializeRadar() {
    const svg = d3.select(`svg#${config.svg_id}`)
        .style("background-color", config.colors.background)
        .attr("width", config.width)
        .attr("height", config.height);

    const radar = svg.append("g");
    radar.attr("transform", `translate(${config.width / 2},${config.height / 2}) `);
    return radar;
}
