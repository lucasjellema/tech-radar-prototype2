import { cartesianFromPolar, polarFromCartesian } from './drawingUtilities.js'
export { handleBlipDrag }

const handleBlipDrag = function (blipDragEvent, viewpoint) {
    const polar = polarFromCartesian({ x: blipDragEvent.newX, y: blipDragEvent.newY })
    const dropAnglePercentage = (polar.phi < 0) ? - polar.phi / (2 * Math.PI) : 1 - polar.phi / (2 * Math.PI)
    const dropRadialPercentage = polar.r / viewpoint.template.maxRingRadius
    console.log(`polar drop zone ${JSON.stringify(polar)} anglepercentage ${dropAnglePercentage} radial percentage = ${dropRadialPercentage} `)
    let dropSector
    let angleSum = 0
    // iterate over sectors until sum of sector angles > anglePercentage    ; the last sector is the dropzone 
    for (let i = 0; i < viewpoint.template.sectorConfiguration.sectors.length; i++) {
        angleSum = angleSum + viewpoint.template.sectorConfiguration.sectors[i].angle
        if (angleSum > dropAnglePercentage) {
            dropSector = i
            break
        }

    }
    console.log(`drop blip ${blipDragEvent.blipId} sector ${dropSector} ${viewpoint.template.sectorConfiguration.sectors[dropSector].label}`)
    // iterate of rings until sum of ring widths > 1- radialPercentage; the last ring is the dropzone

    let dropRing
    let widthSum = 0
    // iterate over rings until sum of ring widths > dropRadialPercentage    ; the last ring is the dropzone 
    for (let i = 0; i < viewpoint.template.ringConfiguration.rings.length; i++) {
        widthSum = widthSum + viewpoint.template.ringConfiguration.rings[i].width
        if (widthSum > 1 - dropRadialPercentage) {
            dropRing = i
            break
        }
    }
    if (dropRadialPercentage > 1) dropRing = -1
    console.log(`drop blip ${blipDragEvent.blipId.substring(5)} ring ${dropRing} ${viewpoint.template.ringConfiguration.rings[dropRing]?.label}`)

    const blip =viewpoint.blips[parseInt(blipDragEvent.blipId.substring(5))]
    console.log(`blip ${JSON.stringify(blip)}`) 
    blip.x = blipDragEvent.newX
    blip.y = blipDragEvent.newY

    // TODO: determine from meta data which blip property has to be updated from the new sector
    // update the category - mapped to sector - to the value mapped to the newly selected sector 
    blip.rating.object.category = getKeyForValue(viewpoint.propertyVisualMaps.sectorMap,dropSector) // "find category value mapped to the sector value of dropSector" 

        // TODO: determine from meta data which blip property has to be updated from the new ring

    // update the ambition - mapped to ring  - to the value mapped to the newly selected ring 
    //  = "find ambition value mapped to the ring value of dropRing" 
    blip["rating"]["ambition"] = getKeyForValue(viewpoint.propertyVisualMaps.ringMap,dropRing)
}

const getKeyForValue = function (object, value) {
    return Object.keys(object).find(key => object[key] === value);
  }
