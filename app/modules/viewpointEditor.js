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
    rotation: 0.30,
    maxRingRadius: 450,
    ringConfiguration: {
        outsideRingsAllowed: true
        , rings: [ // rings are defined from outside going in; the first one is the widest
            { label: "Status A", backgroundColor: "green", width: 0.2 },
            { label: "Status X", backgroundColor: "gold", width: 0.25 },
            { label: "Status Y", backgroundColor: "silver", width: 0.28 },
            { label: "Status Z", backgroundColor: "lime", width: 0.2 },

        ]
    },
    sectorConfiguration: {
        outsideSectorsAllowed: true, sectors: [
            { label: "Group I", backgroundColor: "#fef", angle: 0.2 },
            { label: "Group II", backgroundColor: "#fef", angle: 0.25 },
            { label: "Group III", backgroundColor: "bbb", angle: 0.25 },
            { label: "Group IV", backgroundColor: "bbb", angle: 0.1 },
            { label: "Group V", backgroundColor: "bbb", angle: 0.2 },
        ]
    },
}

const viewpointEditor = function () {
    const radar = initializeRadar()
    drawRings(radar)
    drawSectors(radar)
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
        console.log(`current angle % ${currentAnglePercentage} currentAngle = ${currentAngle} ${JSON.stringify(sectorEndpoint)}`)
        // using angle and maxring radius, determine x and y for endpoint of line, then draw line
        radar.append("line")
            .attr("x1", 0).attr("y1", 0)
            .attr("x2", sectorEndpoint.x).attr("y2", - sectorEndpoint.y)
            .style("stroke", config.colors.grid)
            .style("stroke-width", 3);
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
    radar.attr("transform", `translate(${config.width / 2},${config.height / 2})`);
    return radar;
}
