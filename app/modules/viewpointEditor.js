import { cartesianFromPolar, polarFromCartesion } from './drawingUtilities.js'
import { makeDraggable } from './drag.js'
import { drawRadar } from './radar.js'

export { viewpointEditor, switchboard }

let config = {
    svg_id: "radarSVGContainer",
    width: 1450,
    height: 1000,
    topLayer: "sectors", // rings or sectors
    selectedRing: 1,
    selectedSector: 2,
    rotation: 0,
    maxRingRadius: 450,
    sectorBoundariesExtended: true,
    editMode: true,
    title: { text: "Conclusion Technology Radar 2021.1", x: -700, y: -470, fontSize: "34px", fontFamily: "Arial, Helvetica" },

    colors: {
        background: "#fef",
        grid: "#bbb",
        inactive: "#ddd"
    },
    ringConfiguration: {
        outsideRingsAllowed: true
        , rings: [ // rings are defined from outside going in; the first one is the widest
            { label: "Spotted", width: 0.15, opacity: 0.2 },
            { label: "Hold", width: 0.2 },
            { label: "Assess", width: 0.25 },
            { label: "Trial", width: 0.18 },
            { label: "Adopt", width: 0.2 },

        ]
    },
    sectorConfiguration: {
        outsideSectorsAllowed: true
        , sectors: [ // starting from positive X-axis, listed anti-clockwise
            { label: "Data Management", angle: 0.1, backgroundImage: { image: "https://cdn.pixabay.com/photo/2019/07/06/14/02/drawing-4320529_960_720.png" } },
            { label: "Libraries & Frameworks", angle: 0.2, backgroundImage: { image: "https://dappimg.com/media/image/app/eaa3cb625c164f659ecd6db2aae39e46.png" } },
            { label: "Infrastructure", angle: 0.25 },
            { label: "Languages", angle: 0.1 },
            { label: "Concepts & Methodology", backgroundColor: "red", angle: 0.15 },
        ]
    },
}

const knobBuffer = 0.04


const switchboard = {
    handleLayersChange: (e) => {
        config.topLayer = e.currentTarget.id
        drawRadar(config);
        synchronizeControlsWithCurrentRingOrSector()
    },
    handleSectorSelection: (sector) => {
        config.selectedSector = sector
        drawRadar(config);
        synchronizeControlsWithCurrentRingOrSector()
    },
    handleRingSelection: (ring) => {
        config.selectedRing = ring
        drawRadar(config);
        synchronizeControlsWithCurrentRingOrSector()
    },
    handleSectorBoundariesChange: (e) => {

        config.sectorBoundariesExtended = "extendedSectorBoundaries" == e.currentTarget.id
        drawRadar(config);
    },
    handleColorSelection: (color) => {
        if ("sectors" == config.topLayer)
            config.sectorConfiguration.sectors[config.selectedSector].backgroundColor = color.hexString
        if ("rings" == config.topLayer)
            config.ringConfiguration.rings[config.selectedRing].backgroundColor = color.hexString

        drawRadar(config)
    },
    handleOpacitySlider: (sliderValue) => {

        if ("sectors" == config.topLayer)
            config.sectorConfiguration.sectors[config.selectedSector].opacity = sliderValue
        if ("rings" == config.topLayer)
            config.ringConfiguration.rings[config.selectedRing].opacity = sliderValue
        drawRadar(config)
    },
    handleDragEvent: (eventType, element, dragCoordinates) => {
        let newCoordinates = dragCoordinates
        //console.log(`dragged element: ${element.id}`)
        if (element.id.startsWith("sectorBackgroundImage")) {
            handleDragSectorBackgroundImage(element.id.substring(21), newCoordinates)
        }
        const isRingDrag = (element.id != null && element.id.startsWith("ringKnob"))
        if (isRingDrag) {
            newCoordinates.deltaY = 0
            const ringId = element.id.substring(8) // 8 = length "ringKnob"

            let deltaWidth = newCoordinates.deltaX / config.maxRingRadius
            if (ringId > 0) {
                deltaWidth = Math.min(deltaWidth, config.ringConfiguration.rings[ringId - 1].width - knobBuffer)
                if (deltaWidth < 0) { // current ring is decreased in width
                    deltaWidth = Math.max(deltaWidth, -config.ringConfiguration.rings[ringId].width + knobBuffer)
                }
                config.ringConfiguration.rings[ringId - 1].width = config.ringConfiguration.rings[ringId - 1].width - deltaWidth
            }
            // TODO make sure that sum of ring width <=1
            config.ringConfiguration.rings[ringId].width = config.ringConfiguration.rings[ringId].width + deltaWidth
            drawRadar(config)

        }
        const isSectorDrag = (element.id != null && element.id.startsWith("sectorKnob"))
        if (isSectorDrag) {
            const sectorId = element.id.substring(10) // 10 = length "sectorKnob"
            const newPolarCoordinates = polarFromCartesion({ x: newCoordinates.x - config.width / 2, y: newCoordinates.y - config.height / 2 })
            // phi is -PI  (angle% 0.5) to PI (also 50%)
            const dragAnglePercentage = newPolarCoordinates.phi < 0 ? - newPolarCoordinates.phi / (2 * Math.PI) : 1 - newPolarCoordinates.phi / (2 * Math.PI)

            // aggregate total angle for current and earlier sectors  
            const currentAnglePercentage = config.sectorConfiguration.sectors.filter((sector, index) => index <= sectorId)
                .reduce((sum, sector) => sum + sector.angle, 0)
            const deltaAngle = dragAnglePercentage - currentAnglePercentage // the change in angle as a result of the drag action
            config.sectorConfiguration.sectors[sectorId].angle = config.sectorConfiguration.sectors[sectorId].angle + deltaAngle;
            // TODO cater for sum of angle percentages > 1 ?  
            drawRadar(config)
            // derive new x and y from polar phi and maximumradiun
            newCoordinates = cartesianFromPolar({ phi: newPolarCoordinates.phi, r: config.maxRingRadius })

            return { deltaX: newCoordinates.x + config.width / 2 - dragCoordinates.x, deltaY: newCoordinates.y + config.height / 2 - dragCoordinates.y }

        }
        return newCoordinates
    },
    handleDecreaseRingOrSector: (event) => {
        if (config.topLayer == "rings" && config.selectedRing < config.ringConfiguration.rings.length - 1) {
            //swap selectedRing and selectedRing+1 and set selectedRing++; redraw
            const tmp = config.ringConfiguration.rings[config.selectedRing]
            config.ringConfiguration.rings[config.selectedRing] = config.ringConfiguration.rings[config.selectedRing + 1]
            config.ringConfiguration.rings[config.selectedRing + 1] = tmp
            config.selectedRing++
            drawRadar(config)
        }

        if (config.topLayer == "sectors" && config.selectedSector < config.sectorConfiguration.sectors.length - 1) {
            const tmp = config.sectorConfiguration.sectors[config.selectedSector]
            config.sectorConfiguration.sectors[config.selectedSector] = config.sectorConfiguration.sectors[config.selectedSector + 1]
            config.sectorConfiguration.sectors[config.selectedSector + 1] = tmp
            config.selectedSector++
            drawRadar(config)
        }

    },
    handleIncreaseRingOrSector: (event) => {
        if (config.topLayer == "rings" && config.selectedRing > 0) {
            //swap selectedRing and selectedRing-1 and set selectedRing--; redraw
            const tmp = config.ringConfiguration.rings[config.selectedRing]
            config.ringConfiguration.rings[config.selectedRing] = config.ringConfiguration.rings[config.selectedRing - 1]
            config.ringConfiguration.rings[config.selectedRing - 1] = tmp
            config.selectedRing--
            drawRadar(config)
        }
        if (config.topLayer == "sectors" && config.selectedSector > 0) {
            const tmp = config.sectorConfiguration.sectors[config.selectedSector]
            config.sectorConfiguration.sectors[config.selectedSector] = config.sectorConfiguration.sectors[config.selectedSector - 1]
            config.sectorConfiguration.sectors[config.selectedSector - 1] = tmp
            config.selectedSector--
            drawRadar(config)
        }
    },
    handleRemoveRingOrSector: (event) => {
        if (config.topLayer == "rings") {
            const freedUpWidth = config.ringConfiguration.rings[config.selectedRing].width
            config.ringConfiguration.rings.splice(config.selectedRing, 1)
            config.ringConfiguration.rings[config.selectedRing].width = config.ringConfiguration.rings[config.selectedRing].width + freedUpWidth
        }
        if (config.topLayer == "sectors") {
            const freedUpAngle = config.sectorConfiguration.sectors[config.selectedSector].angle
            config.sectorConfiguration.sectors.splice(config.selectedSector, 1)
            config.sectorConfiguration.sectors[config.selectedSector].angle = config.sectorConfiguration.sectors[config.selectedSector].angle + freedUpAngle
        }
        drawRadar(config)

    },
    handleAddRingOrSector: (event) => {
        if (config.topLayer == "rings") {
            const halfWidth = config.ringConfiguration.rings[config.selecteRing].width/2
            config.ringConfiguration.rings[config.selecteRing].width = halfWidth
            config.ringConfiguration.rings.splice(config.selectedRing, 0, { label: "NEW!!", width: halfWidth })

        }
        if (config.topLayer == "sectors") {
            const halfAngle = config.sectorConfiguration.sectors[config.selectedSector].angle/2
            config.sectorConfiguration.sectors[config.selectedSector].angle= halfAngle 
            config.sectorConfiguration.sectors.splice(config.selectedSector, 0, { label: "NEW!!", angle: halfAngle })
        }
        drawRadar(config)
    }
}

const viewpointEditor = function () {
    config['make_editable'] = make_editable
    config['switchboard'] = switchboard
    const radar = drawRadar(config)
    const svg = d3.select(`svg#${config.svg_id}`)

    makeDraggable(svg.node(), switchboard.handleDragEvent)

    initializeColorPicker()
    initializeRotationSlider()
    initializeOpacitySlider()
}

const synchronizeControlsWithCurrentRingOrSector = () => {
    const selectedObject = config.topLayer == "rings" ? config.ringConfiguration.rings[config.selectedRing] : config.sectorConfiguration.sectors[config.selectedSector]
    // throw away and recreate opacity slider
    initializeOpacitySlider(selectedObject.opacity)
}

let colorPicker
const initializeColorPicker = () => {
    colorPicker = new iro.ColorPicker('#picker');
    colorPicker.on('color:change', switchboard.handleColorSelection);
}

const handleRotationSlider = function (value) {
    config.rotation = value
    drawRadar(config)
}

const initializeRotationSlider = () => {
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

const initializeOpacitySlider = (initialValue = 0) => {
    const svgOpacitySliderId = "svgOpacitySlider"
    const svgOpacitySlider = document.getElementById(svgOpacitySliderId);
    if (svgOpacitySlider != null) svgOpacitySlider.remove()
    var slider = d3
        .sliderHorizontal()
        .min(0)
        .max(1)
        .step(0.05)
        .width(300)
        .value(initialValue)
        .displayValue(false)
        .on('onchange', (sliderValue) => {
            switchboard.handleOpacitySlider(sliderValue)
        });

    d3.select('#opacitySlider')
        .append('svg')
        .attr('width', 500)
        .attr('height', 100)
        .attr('id', svgOpacitySliderId)
        .append('g')
        .attr('transform', 'translate(30,30)')
        .call(slider);
}




const handleInputChange = function (fieldIdentifier, newValue) {
    const sectorLabelStringLength = 11
    const ringLabelStringLength = 9
    if (fieldIdentifier.startsWith("sectorLabel")) {
        const sectorIndex = fieldIdentifier.substring(sectorLabelStringLength)
        config.sectorConfiguration.sectors[sectorIndex].label = newValue
        drawRadar(config)
    }
    if (fieldIdentifier.startsWith("ringLabel")) {
        const ringIndex = fieldIdentifier.substring(ringLabelStringLength)
        config.ringConfiguration.rings[ringIndex].label = newValue
        drawRadar(config)
    }
    if (fieldIdentifier.startsWith("title")) {
        config.title.text = newValue
        drawRadar(config)
    }
}

const handleDragSectorBackgroundImage = function (sectorId, newCoordinates) {
    console.log(`handle drag background image for sector ${sectorId}`)
    const newPolarCoordinates = polarFromCartesion({ x: newCoordinates.x - config.width / 2, y: newCoordinates.y - config.height / 2 })

}

// copied from http://bl.ocks.org/GerHobbelt/2653660
function make_editable(d, field) {

    const valueToEdit = arguments[1][1]
    const fieldIdentifier = arguments[1][2]
    d
        .on("mouseover", function () {
            d3.select(this).style("fill", "red");
        })
        .on("mouseout", function () {
            d3.select(this).style("fill", null); // TODO reset fill style to previous value, not reset to null
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