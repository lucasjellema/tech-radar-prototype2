
import { cartesianFromPolar, polarFromCartesian, segmentFromCartesian } from './drawingUtilities.js'
import { createAndPopulateDataListFromBlipProperties, getNestedPropertyValueFromObject, setNestedPropertyValueOnObject, setTextOnElement, populateSelect, getRatingTypeProperties, showOrHideElement, initializeImagePaster, uuidv4 } from './utils.js'
import { getViewpoint, getObjectListOfOptions, publishRefreshRadar, getRatingListOfOptions, getData, createBlip, getRatingTypeForRatingTypeName, createRating } from './data.js'
import { publishRadarEvent } from './radar.js';

export { handleBlipDrag, launchNewBlipWizard, launchBlipEditor }



let blipEdited
let drawRadarBlipsToCall
let viewpointToReuse


const initializeTagsField = (blip) => {
    const tagsContainer = document.getElementById('blipTagsContainer')
    tagsContainer.innerHTML = null
    if (blip.rating.object.tags != null && blip.rating.object.tags.length > 0) {
        for (let i = 0; i < blip.rating.object.tags.length; i++) {
            const innerHTML = `<div class="dropup">
     <span id="tag0" class="extra tagfilter dropbtn">${blip.rating.object.tags[i]}</span>
     <div class="dropup-content">
         <a href="#" id="removeBlipTag${i}">Remove</a>
     </div>`
            const div = document.createElement('div');
            div.className = "dropup"
            div.innerHTML = innerHTML
            tagsContainer.appendChild(div)
            document.getElementById(`removeBlipTag${i}`).addEventListener("click", () => { blip.rating.object.tags.splice(i, 1); initializeTagsField(blip) })
        }
    }
}




const launchNewBlipWizard = (viewpoint, drawRadarBlips) => {
    showOrHideElement("modalBlipEditor", true)
    showOrHideElement("newBlip", true)

    setTextOnElement('blipEditorTitle', "Create New Blip - for new or existing object or rating")

    const objectForNewBlipSelectionContainer = document.getElementById('newBlip')
    const html = `                <div class="column1_3">
<div>
              <label for="objectSelect">Based on Existing Object</label>
                <br />
                <select id="objectSelect" name="objectSelect">
                   <option value="" disabled selected>Select Object to base Blip on</option>
                </select>
                <br />
             </div>
<p>or</p>
<label for="newObjectLabel">Label for new object</label>
<input type="text" title="Label for new object" id="newObjectLabel"></input>
</div>
<div id="ratingSelectionSection" class="column1_3">
<label for="ratingSelect">Based on Existing Rating</label>
<select id="ratingSelect" name="ratingSelect">
    <option value="" disabled selected>Select Rating to create Blip for</option>
</select>
<label for="newRatingCheck">Create a new rating</label>
<input type="checkbox" title="Create a new rating for the object" id="newRatingCheck"></input>
</div>
<div id="newblipEditorButtonBar" style="position: absolute; bottom: 25;right: 100;">


<input id="goEditNewBlip" type="button" value="Create and Edit new Blip"></input>
<hr/>
<h3>Special Rating and Blip Generation</h3>
<input id="generateBlipsForAllRatings" type="button" value="Generate Blips for all Ratings without Blip"></input>
<input id="generateRatingsAndBlips" type="button" value="Generate Blips and Ratings for all Objects without Rating / Blip "></input>

</div>
<br /><br /><br /><br /><br /><br /><br /><br /> <br /><br /><br /><br />
<br /><br /><br /><br />
`
    objectForNewBlipSelectionContainer.innerHTML = html
    showOrHideElement("blipForm", false)
    showOrHideElement("blipImage", false)
    showOrHideElement("ratingSelectionSection", false)

    populateSelect("objectSelect", getObjectListOfOptions(getRatingTypeForRatingTypeName(viewpoint.ratingType).objectType), null)
    document.getElementById("objectSelect").addEventListener("change", (e) => {
        console.log(`object selection changed to ${e.target.value}`)
        // find ratings for selected object
        const objectId = e.target.value
        if (objectId != null && objectId != "-1") {
            populateSelect("ratingSelect", getRatingListOfOptions(viewpoint.ratingType, objectId), null)
            showOrHideElement('ratingSelectionSection', true)
        } else showOrHideElement('ratingSelectionSection', false)
    })
    document.getElementById('goEditNewBlip').addEventListener("click", (e) => {
        const objectId = document.getElementById("objectSelect").value
        const objectNewLabel = document.getElementById("newObjectLabel").value

        const ratingId = document.getElementById("ratingSelect").value
        const selectedObjectId = (objectId != null && objectId != "-1") ? objectId : null
        const selectedRatingId = (ratingId != null && ratingId != "-1") ? ratingId : null
        const labelForNewObject = (objectNewLabel != null && objectNewLabel.length > 0) ? objectNewLabel : null
        if ((selectedObjectId ?? labelForNewObject) != null) {
            const blip = createBlip(selectedObjectId, labelForNewObject, selectedRatingId, viewpoint)
            launchBlipEditor(blip, getViewpoint(), drawRadarBlips, selectedObjectId==null)
        }
    })

    document.getElementById('generateBlipsForAllRatings').addEventListener('click', (e) => {
        console.log(`generate blips for all ratings (without blip)`)
        generateBlipsForRatings(viewpoint)
    })
    document.getElementById('generateRatingsAndBlips').addEventListener('click', (e) => {
        console.log(`generate blips for all objects and ratings (without blip)`)
        generateRatingsForObjectsAndBlipsForRatings(viewpoint)
    })
}

const generateBlipsForRatings = (viewpoint) => {
    const ratingTypeName = viewpoint.ratingType.name
    const blippedRatingsSet = new Set()
    viewpoint.blips.forEach((blip) => blippedRatingsSet.add(blip.rating.id))
    for (let i = 0; i < Object.keys(getData().ratings).length; i++) {
        const rating = getData().ratings[Object.keys(getData().ratings)[i]]
        if (!blippedRatingsSet.has(rating.id) && rating.ratingType.name == ratingTypeName) {
            let blip = { id: uuidv4(), rating: rating }
            viewpoint.blips.push(blip)
        }
    }
    showOrHideElement("newBlip", false)
    showOrHideElement("modalBlipEditor", false)
    publishRadarEvent({ type: "shuffleBlips" })
    publishRefreshRadar()
}


const generateRatingsForObjectsAndBlipsForRatings = (viewpoint) => {
    // first: generate ratings for objects
    // next: generate blips for all ratings not yet blipped
    const objectTypeName = viewpoint.ratingType.objectType.name

    const ratingTypeName = viewpoint.ratingType.name

    const ratedObjectsSet = new Set()
    for (let i = 0; i < Object.keys(getData().ratings).length; i++) {
        const rating = getData().ratings[Object.keys(getData().ratings)[i]]
        if (rating.ratingType.name == ratingTypeName) {
            ratedObjectsSet.add(rating.object.id)
        }
    }
    for (let i = 0; i < Object.keys(getData().objects).length; i++) {
        const object = getData().objects[Object.keys(getData().objects)[i]]
        if (!ratedObjectsSet.has(object.id) && (object.objectType.name == objectTypeName)) {
            // CREATE A NEW RATING!
            const rating = createRating(ratingTypeName, object)
            delete rating.pending
            getData().ratings[rating.id] = rating
            // TODO set author, scope on rating??
        }
    }

    // TODO default values for ratings
    generateBlipsForRatings(viewpoint)
}


const launchBlipEditor = (blip, viewpoint, drawRadarBlips, editObject = true) => {
    // var modal = document.getElementById("modalBlipEditor");
    // modal.style.display = "block";
    showOrHideElement("modalBlipEditor", true)
    showOrHideElement("newBlip", false)
    showOrHideElement("blipForm", true)
    showOrHideElement("blipImage", true)
    const form = document.getElementById("blipForm")

    let html = `
<table id="blipEditorTable">
</table>
<hr />
<label for="blipTagsContainer">Tags</label>
<div id="blipTagsContainer"></div>
<br />
<div id="tagControls">
</div>

<div id="blipEditorButtonBar" style="position: absolute; bottom: 25;right: 100;">
    <input id="saveBlipEdits" type="button" value="Save Changes"></input>
</div>`
    form.innerHTML = html
    document.getElementById("saveBlipEdits").addEventListener("click", () => {
        saveBlipEdit(editObject)
    })

    const tbl = document.getElementById("blipEditorTable")
    // remove current content
    tbl.innerHTML = null
    let ratingType = viewpoint.ratingType
    if (typeof (ratingType) == "string") {
        ratingType = getData().model?.ratingTypes[ratingType]
    }

    setTextOnElement('blipEditorTitle', `Edit Blip for ${blip.rating[viewpoint.propertyVisualMaps.blip.label]}`)


    // TODO cater for tags
    let blipProperties = getRatingTypeProperties(ratingType, getData().model, editObject)

    html = ''
    for (let i = 0; i < blipProperties.length; i++) {
        const blipProperty = blipProperties[i]
        if (blipProperty.property.type == "tags") { // skip tags type properties
            continue
        }
        let value = getNestedPropertyValueFromObject(blip.rating, blipProperty.propertyPath)
        if (value == null) value = ""

        const inputElementId = `blip${blipProperty.propertyPath}`
        let inputElement
        if (blipProperty.property.allowableValues != null && blipProperty.property.allowableValues.length > 0) // select
            inputElement = `<select id="${inputElementId}" ></select>`
        else if (blipProperty.property.discrete != null && blipProperty.property.discrete) {
            createAndPopulateDataListFromBlipProperties(`${inputElementId}List`, `${blipProperty.propertyPath}`, viewpoint.blips)
            inputElement = `<input id="${inputElementId}" list="${inputElementId}List" value="${value}"></input>`
        }
        else if (blipProperty.property.type == "text") {
            inputElement = `<textarea id="${inputElementId}" rows="2" columns="75" value="${value}"></textarea>`
        }

        else {
            inputElement = `<input id="${inputElementId}" type="text" value="${value}"></input>`
        }
        if (blipProperty.property.type == "image") {
            inputElement = `${inputElement}<img id="${inputElementId}Image" style="padding:6px" src="${value}" width="70px"></img>
            <textarea id="${inputElementId}ImagePasteArea" placeholder="Paste Image" title="Paste Image for ${blipProperty.property.label} here" rows="1" cols="15"></textarea>`

        }
        // distribute fields over two columns in the property table
        html = `${html}${i % 2 == 0 ? "<tr>" : ""}<td class="propertyLabel"><label for="${inputElementId}">${blipProperty.property.label}</label></td>
                     <td>${inputElement}</td>${i % 2 == 1 ? "</tr>" : ""}`

    }
    tbl.innerHTML = `${tbl.innerHTML}${html}`
    //  populate SELECTs after all HTML has been created
    //  add change handlers
    for (let i = 0; i < blipProperties.length; i++) {
        const blipProperty = blipProperties[i]
        const inputElementId = `blip${blipProperty.propertyPath}`
        if (blipProperty.property.allowableValues != null && blipProperty.property.allowableValues.length > 0) {
            let value = getNestedPropertyValueFromObject(blip.rating, blipProperty.propertyPath)
            populateSelect(inputElementId, blipProperty.property.allowableValues, value)
        }
        if (blipProperty.property.type == "image") {
            initializeImagePaster((imageURL) => {
                document.getElementById(inputElementId).value = imageURL
                document.getElementById(`${inputElementId}Image`).src = imageURL
                if (blipProperty.propertyPath == viewpoint.propertyVisualMaps.blip.image) {
                    document.getElementById("blipImage").src = imageURL
                }
            }, `${inputElementId}ImagePasteArea`)
        }
    }
    blipEditorTitle.innerText = `Editing Rating of ${getNestedPropertyValueFromObject(blip.rating, viewpoint.propertyVisualMaps.blip.label)}`

    // set main image for blip 
    let imageSource = getNestedPropertyValueFromObject(blip.rating, viewpoint.propertyVisualMaps.blip.image)
    if (imageSource != null && imageSource.length>0) {
        document.getElementById("blipImage").src = imageSource
    }
    initializeTagsField(blip)
    const tagControlsContainer = document.getElementById("tagControls")
    tagControlsContainer.innerHTML = `                    <input list="tagsList" id="blipTagSelector"></input>
    <input type="button" id="addTagToBlip" name="addTag" value="Add Tag" />
`

    document.getElementById("addTagToBlip").addEventListener("click",
        (event) => {
            const filterTagValue = document.getElementById("blipTagSelector").value
            document.getElementById("blipTagSelector").value = ""
            if (blip.rating.object.tags == null) { blip.rating.object.tags = [] }
            blip.rating.object.tags.push(filterTagValue)
            initializeTagsField(blip)
        })

    blipEdited = blip
    drawRadarBlipsToCall = drawRadarBlips
    viewpointToReuse = viewpoint
}



const saveBlipEdit = (editObject) => {
    const blip = blipEdited
    // check if the values have changed for the two properties mapped to sector and ring
    // if they have, the current XY should be reset 
    const sectorPropertyPath = viewpointToReuse.propertyVisualMaps.sector.property
    const ringPropertyPath = viewpointToReuse.propertyVisualMaps.ring.property
    let resetXY = false
    if (!(editObject && sectorPropertyPath.startsWith("object."))) {
        let originalValue = getNestedPropertyValueFromObject(blip.rating, sectorPropertyPath)
        let currentValue = document.getElementById(`blip${sectorPropertyPath}`).value
        if (originalValue != currentValue) { resetXY = true }
    }

    if (!(editObject && ringPropertyPath.startsWith("object."))) {
        let originalValue = getNestedPropertyValueFromObject(blip.rating, ringPropertyPath)
        let currentValue = document.getElementById(`blip${ringPropertyPath}`).value
        if (originalValue != currentValue) { resetXY = true }
    }
    if (resetXY) {
        blip.x = null
        blip.y = null
        blip.rating.timestamp = Date.now() // TODO set Date.now() for any change in any rating property? (or any property mapped to visual characteristics)
    }



    let blipProperties = getRatingTypeProperties(viewpointToReuse.ratingType, getData().model)
    for (let i = 0; i < blipProperties.length; i++) {
        const blipProperty = blipProperties[i]
        if (blipProperty.property.type == "tags") { } // TODO handle tags (currently tags are saved directly on the blip instead of on the UI element)
        else {
            const inputElementId = `blip${blipProperty.propertyPath}`
            let value = document.getElementById(inputElementId).value
            setNestedPropertyValueOnObject(blip.rating, blipProperty.propertyPath, value)
        }
    }

    //if blip.pending - this means a new blip is added, one with perhaps a new object and or a new rating
    if (blip.pending) {
        delete blip.pending
        let blipCount = getViewpoint().blips.push(blip)
        console.log(`after saving  the pending  blip the count is now ${blipCount} == ${getViewpoint().blips.length}`)

        if (blip.rating?.pending) {
            delete blip.rating.pending
            getData().ratings[blip.rating.id] = blip.rating
        }
        if (blip.rating?.object?.pending) {
            delete blip.rating.object.pending
            getData().objects[blip.rating.object.id] = blip.rating.object
        }

    }

    // close modal editor

    showOrHideElement("modalBlipEditor", false)
    drawRadarBlipsToCall(viewpointToReuse)
}





const getSectorExpansionFactor = (viewpoint) => {
    const totalAvailableAngle = viewpoint.template.sectorConfiguration.totalAngle ?? 1
    const initialAngle = parseFloat(viewpoint.template.sectorConfiguration.initialAngle ?? 0)
    //  console.log(`totalAvailableAngle = ${totalAvailableAngle}`)

    // factor to multiply each angle with - derived from the sum of angles of all visible sectors , calibrated with the total available angle
    const totalVisibleSectorsAngleSum = viewpoint.template.sectorConfiguration.sectors.reduce((sum, sector) =>
        sum + (sector?.visible != false ? sector.angle : 0), 0)
    //    return totalAvailableAngle * (totalVisibleSectorsAngleSum == 0 ? 1 : 1 / totalVisibleSectorsAngleSum)
    const expansionFactor = parseFloat((totalAvailableAngle - initialAngle) * (totalVisibleSectorsAngleSum == 0 ? 1 : (1 / totalVisibleSectorsAngleSum)))
    //   console.log(`expansionFactor ${expansionFactor}`)
    return expansionFactor

}



const handleBlipDrag = function (blipDragEvent, viewpoint) {
    // TODO not all elements are supported for dragging (yet) 

    if (blipDragEvent.blipId.startsWith("sectorBackgroundImage")) { handleSectorBackgroundImageDrag(blipDragEvent, viewpoint) }
    else if (blipDragEvent.blipId.startsWith("radarBackgroundImage")) { handleRadarBackgroundImageDrag(blipDragEvent, viewpoint) }
    else {
        // TODO use the real sector expansion factor!!!
        let sectorExpansionFactor = getSectorExpansionFactor(viewpoint)
        const dropSegment = segmentFromCartesian({ x: blipDragEvent.newX, y: blipDragEvent.newY }, viewpoint, sectorExpansionFactor)
        //console.log(`dropsegment ${JSON.stringify(dropSegment)}`)
        const blipId = blipDragEvent.blipId.substring(5)
        let blip
        blip = viewpoint.blips.filter((blip) => blip.id == blipId ? blip : null)[0]
        console.log(`dragged element ${blipDragEvent.blipId}${blip.rating.object.label}`)


        blip.x = blipDragEvent.newX
        blip.y = blipDragEvent.newY

        const propertyMappedToSector = viewpoint.propertyVisualMaps.sector.property
        const propertyValueDerivedFromSector = getKeyForValue(viewpoint.propertyVisualMaps.sector.valueMap, dropSegment.sector) // "find category value mapped to the sector value of dropSector" 
        setNestedPropertyValueOnObject(blip.rating, propertyMappedToSector, propertyValueDerivedFromSector)

        const propertyMappedToRing = viewpoint.propertyVisualMaps.ring.property
        const propertyValueDerivedFromRing = getKeyForValue(viewpoint.propertyVisualMaps.ring.valueMap, dropSegment.ring) // "find category value mapped to the sector value of dropSector" 
        setNestedPropertyValueOnObject(blip.rating, propertyMappedToRing, propertyValueDerivedFromRing)
    }
}

// find in an object the (first) key or property name for a given value 
const getKeyForValue = function (object, value) {
    return Object.keys(object).find(key => object[key] === value);
}

const handleSectorBackgroundImageDrag = (blipDragEvent, viewpoint) => {
    console.log(`OK, end sector background image drag`)
    const sectorId = blipDragEvent.blipId.substring(21)
    const sector = viewpoint.template.sectorConfiguration.sectors[sectorId]
    sector.backgroundImage.x = blipDragEvent.newX // newCoordinates.x - config.width / 2
    sector.backgroundImage.y = blipDragEvent.newY // newCoordinates.y - config.height / 2
}

const handleRadarBackgroundImageDrag = (blipDragEvent, viewpoint) => {
    console.log(`OK, end radar background image drag`)
    viewpoint.template.backgroundImage.x = blipDragEvent.newX // newCoordinates.x - config.width / 2
    viewpoint.template.backgroundImage.y = blipDragEvent.newY // newCoordinates.y - config.height / 2
}

