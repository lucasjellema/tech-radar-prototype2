export { launchFileManager }
import { drawRadar, subscribeToRadarEvents, publishRadarEvent } from './radar.js';
import { getViewpoint, getData, publishRefreshRadar, populateTemplateSelector, createObject, createRating } from './data.js';
import { launchShapeEditor } from './shapeEditing.js'
import { getListOfSupportedShapes, capitalize, getPropertyFromPropertyPath, getPropertyValuesAndCounts, populateFontsList, createAndPopulateDataListFromBlipProperties, undefinedToDefined, getAllKeysMappedToValue, getNestedPropertyValueFromObject, setNestedPropertyValueOnObject, initializeImagePaster, populateSelect, getElementValue, setTextOnElement, getRatingTypeProperties, showOrHideElement, uuidv4, populateDatalistFromValueSet } from './utils.js'

const launchFileManager = (viewpoint, drawRadarBlips) => {
    showOrHideElement("modalMain", true)
    setTextOnElement("modalMainTitle", "File Management")
    document.getElementById("fileConfigurationTab").classList.add("warning") // define a class SELECTEDTAB 
    const contentContainer = document.getElementById("modalMainContentContainer")
    let html = ``
    html += `                    <input type="button" id="uploadFile" name="upload" value="Upload Radar File">< br/>
    <input type="button" id="uploadCSVFile" name="upload" value="Upload CSV File to Merge into Radar">
    <input type="file" id="uploadfileElem" multiple accept="application/json,text/*" style="display:none">
`
    contentContainer.innerHTML = `${html}<br/> <br/><br/>`

    let fileType = "radar"
    let fileElem = document.getElementById("uploadfileElem");
    fileElem.addEventListener("change", async (e) => {
        if (!e.target.files.length) {
            console.log(`no files selected`)
        } else {
            const contents = await e.target.files[0].text()
            if (fileType == "radar") {
                handleUploadedFiles(contents)
            }
            else if (fileType == "csv") {
                handleUploadedCSVFiles(contents)
            }
        }
    }
        , false);

    document.getElementById('uploadFile').addEventListener("click", () => {
        fileType = "radar"
        if (fileElem) { fileElem.click() }
    });

    document.getElementById('uploadCSVFile').addEventListener("click", () => {
        fileType = "csv"
        if (fileElem) { fileElem.click() }
    });
    const buttonBar = document.getElementById("modalMainButtonBar")
    buttonBar.innerHTML = ``
}


const handleUploadedFiles = (contents) => {
    const uploadedData = JSON.parse(contents)
    const target = getData()

    console.log(`Processing uploaded files`)
    // add new object types
    for (let i = 0; i < Object.keys(uploadedData.model.objectTypes).length; i++) {
        console.log(`loaded: ${uploadedData.model.objectTypes[Object.keys(uploadedData.model.objectTypes)[i]].name}`)
        const objectType = uploadedData.model.objectTypes[Object.keys(uploadedData.model.objectTypes)[i]]
        console.log(`loaded: ${objectType.name}`)
        if (target.model.objectTypes.hasOwnProperty(objectType.name)) {
            console.log(`object type already exists`)
        } else {
            target.model.objectTypes[objectType.name] = objectType
        }
    }
    // add new rating types
    for (let i = 0; i < Object.keys(uploadedData.model.ratingTypes).length; i++) {
        const ratingType = uploadedData.model.ratingTypes[Object.keys(uploadedData.model.ratingTypes)[i]]
        console.log(`loaded: ${ratingType.name}`)
        // replace objecttype reference with reference to objectType in target
        if (target.model.ratingTypes.hasOwnProperty(ratingType.name)) {
            console.log(`rating type already exists`)
        } else {
            target.model.ratingTypes[ratingType.name] = ratingType
            let objectTypeName
            if (typeof (ratingType.objectType) == "string") objectTypeName = ratingType.objectType
            if (typeof (ratingType.objectType) == "object") objectTypeName = ratingType.objectType.name
            ratingType.objectType = target.model.objectTypes[objectTypeName]
        }
    }

    // add new objects
    for (let i = 0; i < Object.keys(uploadedData.objects).length; i++) {
        const object = uploadedData.objects[Object.keys(uploadedData.objects)[i]]
        if (target.objects.hasOwnProperty(object.id)) {
            // object already exists; for now assume no update or merge is desired
        } else {
            let objectTypeName
            if (typeof (object.objectType) == "string") objectTypeName = object.objectType
            if (typeof (object.objectType) == "object") objectTypeName = object.objectType.name
            object.objectType = target.model.objectTypes[objectTypeName]
            target.objects[object.id] = object
            console.log(`added new object  ${JSON.stringify(object)}`)
        }
    }



    const ratingConversionMap = {}
    // specify values for scope and author for all ratings imported from file ??
    // add new ratings (with scope and author settings)
    // add new objects
    for (let i = 0; i < Object.keys(uploadedData.ratings).length; i++) {
        const rating = uploadedData.ratings[Object.keys(uploadedData.ratings)[i]]
        rating.object = target.objects[rating.object]
        if (rating.object.label == "DB2") {
            console.log(`DB2!!`)
        }
        let ratingTypeName
        if (typeof (rating.ratingType) == "string") ratingTypeName = rating.ratingType
        if (typeof (rating.ratingType) == "object") ratingTypeName = rating.ratingType.name
        const ratingType = target.model.ratingTypes[ratingTypeName]

        if (target.ratings.hasOwnProperty(rating.id)) {
            // rating already exists; 
            // if we find differences in context properties (such as author, scope, timestamp) , we will create a new rating object 
            // find rating properties marked as context
            const contextProperties = []
            for (let p = 0; p < Object.keys(ratingType.properties).length; p++) {
                const property = ratingType.properties[Object.keys(ratingType.properties)[p]]
                if (property.context) {
                    contextProperties.push(property)
                }
            }

            // compare context properties such as scope and author and timestamp; if those differ - then create new rating
            let differ = false
            for (let j = 0; j < contextProperties.length; j++) {
                const propertyName = contextProperties[j].name
                const targetRating = target.ratings[rating.id]
                if ((rating[propertyName] != targetRating[propertyName])
                ) {
                    differ = true
                    break
                }
            }
            if (differ) {
                // create new rating object based on the current one - because it is a new reflection
                const newRating = {}
                // copy  all property values
                for (let p = 0; p < Object.keys(rating).length; p++) {
                    newRating[Object.keys(rating)[p]] = rating[Object.keys(rating)[p]]
                }
                // assign fresh id
                newRating.id = uuidv4()  // assign new id
                ratingConversionMap[rating.id] = newRating.id
                newRating.ratingType = ratingType
                target.ratings[newRating.id] = newRating
                console.log(`created new rating because of differences in context properties ${JSON.stringify(newRating)}`)
            } else {
                console.log(`not imported (or cloned) rating because collision ${JSON.stringify(rating)}`)

            }

        } else {
            target.ratings[rating.id] = rating
            rating.ratingType = ratingType
            console.log(`added new rating  ${JSON.stringify(rating)}`)
        }
    }


    // generate new ratings for colliding ratings with different values for scope, author, timestamp
    // update blip.rating = set UUID for newly generated ratings UUID
    // add new viewpoints
    for (let i = 0; i < uploadedData.viewpoints.length; i++) {
        const viewpoint = uploadedData.viewpoints[i]
        let ratingTypeName
        if (typeof (viewpoint.ratingType) == "string") ratingTypeName = viewpoint.ratingType
        if (typeof (viewpoint.ratingType) == "object") ratingTypeName = viewpoint.ratingType.name
        viewpoint.ratingType = target.model.ratingTypes[ratingTypeName]
        // the blip refers to the rating object in the target set - which may have a new ID because a new rating was created
        viewpoint.blips.forEach((blip) => blip.rating =
            target.ratings[ratingConversionMap.hasOwnProperty(blip.rating) ? ratingConversionMap[blip.rating] : blip.rating]
        )
        target.viewpoints.push(viewpoint) // just add all viewpoints - as adjacent radars / no merging at all

    }

    populateTemplateSelector()

}

const handleUploadedCSVFiles = (contents) => {
    const objects = d3.csvParse(contents)
    console.log(`CSV file:  # of records ${objects.length}`)
    console.log(`CSV file properties:  ${JSON.stringify(objects.columns)}`)
    showOrHideElement("modalMain", true)
    setTextOnElement("modalMainTitle", "Import CSV Document")
    document.getElementById("fileConfigurationTab").classList.add("warning") // define a class SELECTEDTAB 
    const contentContainer = document.getElementById("modalMainContentContainer")
    let html = ``
    html += `<h3>Quick File Summary</h3>
    <p># of records ${objects.length}</p>
    <h3>Mapping Properties from CSV to Radar</h3>
    `
    html += `<table><tr><th>CSV Field</th><th>Sample values from CSV</th><th>Mapped to Radar Property</th></tr>`

    for (let i = 0; i < objects.columns.length; i++) {
        let uniqueValues = objects.reduce((valueSample, row) => {
            const value = row[objects.columns[i]]
            if (value != null && value.length > 0) { valueSample.add(value)}
            return valueSample 
        }, new Set())

        let values = Array.from(uniqueValues)
        .reduce( (valueSample, value, index) => {
            return valueSample + (index > 0 ? ", " : "") + value             
        }
        , "")
        html += `<tr><td><span id="field${i}">${objects.columns[i]}</span></td>
    <td><span id="values${i}" title="${values}">Sample values from CSV</span></td>
    <td><input id="mappedProperty${i}" list="mappedPropertiesList" title="Select a predefined property (path) or define your own new property"></input></td></tr>`

    }

    html += `</table>`
    html += `<datalist id="mappedPropertiesList">        <option value="X"></option></datalist>`

    contentContainer.innerHTML = `${html}<br/> <br/><br/>`
    const listOfRatingPropertyPaths = []
    const ratingTypeProperties = getRatingTypeProperties(getViewpoint().ratingType, getData().model, true)
    for (let i = 0; i < ratingTypeProperties.length; i++) {
        listOfRatingPropertyPaths.push(ratingTypeProperties[i].propertyPath)
    }

    populateDatalistFromValueSet("mappedPropertiesList", listOfRatingPropertyPaths)
    const buttonBar = document.getElementById("modalMainButtonBar")
    buttonBar.innerHTML = `
    <input type="button" id="processCSVrecords" name="process" value="Process CSV records based on this mapping configuration">
    `
    document.getElementById("processCSVrecords").addEventListener("click", () => {
        // construct object with mapping between CSV field and Radar Property Path
        const csvToRadarMap = {}
        for (let i = 0; i < objects.columns.length; i++) {
            const mappedPropertyPath = getElementValue(`mappedProperty${i}`)
            if (mappedPropertyPath != null && mappedPropertyPath.length > 0) {
                csvToRadarMap[objects.columns[i]] = mappedPropertyPath
            }
        }
        processCSVRecords(objects, csvToRadarMap)
    })

}

const processCSVRecords = (objects, csvToRadarMap) => {
    console.log(`csvToRadarMap ${JSON.stringify(csvToRadarMap)}`)
    // do we create ratings as well as objects?
    let shouldCreateRating = false
    for (let i = 0; i < Object.keys(csvToRadarMap).length; i++) {
        const csvField = Object.keys(csvToRadarMap)[i]
        if (!csvToRadarMap[csvField].startsWith("object.")) {
            shouldCreateRating=true
            break
        }
    }

    objects.forEach((row) => {
        // create object with defaults for object type
        const object = createObject(getViewpoint().ratingType.objectType.name)
        // then update object with values from csv row
        for (let i = 0; i < Object.keys(csvToRadarMap).length; i++) {
            const csvField = Object.keys(csvToRadarMap)[i]
            if (csvToRadarMap[csvField].startsWith("object.")) {
                object[csvToRadarMap[csvField].substring(7)] = row[csvField]
            }
        }
        // finally add object to data.objects
        console.log(`New Object: ${JSON.stringify(object)}`)
        getData().objects[object.id] = object
        
        console.log(`Also new rating?: ${shouldCreateRating}`)
        const rating = createRating(getViewpoint().ratingType.name, object) // all session defaults will now have been applied
        for (let i = 0; i < Object.keys(csvToRadarMap).length; i++) {
            const csvField = Object.keys(csvToRadarMap)[i]
            if (!csvToRadarMap[csvField].startsWith("object.")) {
                rating[csvToRadarMap[csvField]] = row[csvField]
            }
        }
        getData().ratings[rating.id] = rating


        

    })


}
