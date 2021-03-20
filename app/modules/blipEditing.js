import { cartesianFromPolar, polarFromCartesian,segmentFromCartesian } from './drawingUtilities.js'
export { handleBlipDrag }


const handleBlipDrag = function (blipDragEvent, viewpoint) {
    const dropSegment =  segmentFromCartesian ({x:blipDragEvent.newX, y:blipDragEvent.newY}, viewpoint)

    const blip =viewpoint.blips[parseInt(blipDragEvent.blipId.substring(5))]
    console.log(`blip ${JSON.stringify(blip)}`) 
    blip.x = blipDragEvent.newX
    blip.y = blipDragEvent.newY

    // TODO: determine from meta data which blip property has to be updated from the new sector
    // update the category - mapped to sector - to the value mapped to the newly selected sector 
    blip.rating.object.category = getKeyForValue(viewpoint.propertyVisualMaps.sectorMap,dropSegment.sector) // "find category value mapped to the sector value of dropSector" 

        // TODO: determine from meta data which blip property has to be updated from the new ring

    // update the ambition - mapped to ring  - to the value mapped to the newly selected ring 
    //  = "find ambition value mapped to the ring value of dropRing" 
    blip["rating"]["ambition"] = getKeyForValue(viewpoint.propertyVisualMaps.ringMap,dropSegment.ring)
}

const getKeyForValue = function (object, value) {
    return Object.keys(object).find(key => object[key] === value);
  }
