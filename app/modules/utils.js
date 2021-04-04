export {isOperationBlackedOut, uuidv4, getNestedPropertyValueFromObject, setNestedPropertyValueOnObject
       ,getRatingTypeProperties, getElementValue, showOrHideElement,getDateTimeString
       ,populateSelect, getAllKeysMappedToValue, createAndPopulateDataListFromBlipProperties
       ,populateFontsList , setTextOnElement,initializeImagePaster,undefinedToDefined}


// to prevent an operation from being executed too often, we record a timestamp in the near future until when 
// the operation cannot be executed; the function isOperationBlackedOut checks if the operation is currently blacked out and sets a new blackout end in the map
const blackoutMap = {} // records end of blackout timestamps under specific keys
const blackoutPeriodDefault = 100 // milliseconds
const isOperationBlackedOut = ( blackoutKey, blackoutPeriod = blackoutPeriodDefault) => {
   let isBlackedout = false
   const blackoutDeadline = blackoutMap[blackoutKey]
   const now = new Date().getTime() 
   if (blackoutDeadline != null)  
      isBlackedout = now < blackoutDeadline 
   if (!isBlackedout)  
      blackoutMap[blackoutKey] = now + blackoutPeriod // set fresh blackout if currently not blacked out 
   return isBlackedout
}


const  uuidv4= ()=>  {
   return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
     (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
   );
 }

 // also see: https://stackoverflow.com/questions/6491463/accessing-nested-javascript-objects-and-arrays-by-string-path
 const getNestedPropertyValueFromObject = (object, propertyPath) => {
   const propertyPathSegments = propertyPath.split('.')
   let value = object
   for (let i=0;i<propertyPathSegments.length;i++) {
      if (value==null) break
       value = value[propertyPathSegments[i]]
   }
   if (typeof value == 'undefined') value=null
   return value
}

const setNestedPropertyValueOnObject = (object, propertyPath , value) => {    
   const propertyPathSegments = propertyPath.split('.')
   let elementToSet = object
   for (let i=0;i<propertyPathSegments.length-1;i++) {
       elementToSet = elementToSet[propertyPathSegments[i]]
   }
   elementToSet[propertyPathSegments[propertyPathSegments.length-1]] = value
   return object
}

function getRatingTypeProperties(ratingType, model, includeObjectType=true) { // model = getData().model
   let theRatingType = ratingType
   if (typeof (theRatingType) == "string") {
       theRatingType = model?.ratingTypes[ratingType]
   }
   let properties = []
   if (includeObjectType) {
       properties = properties.concat(Object.keys(theRatingType.objectType.properties).map(
        (propertyName) => {
            return {
                propertyPath: `object.${propertyName}`,
                propertyScope: "object",
                property: theRatingType.objectType.properties[propertyName]
            };
        }))
   }
   properties = properties.concat(
           Object.keys(theRatingType.properties).map(
               (propertyName) => {
                   return {
                       propertyPath: `${propertyName}`,
                       propertyScope: "rating",
                       property: theRatingType.properties[propertyName]
                   };
               })
       )
       return properties
}

const getAllKeysMappedToValue = (object, value) => {
    return Object.keys(object).filter(key => object[key] === value);
}

const showOrHideElement = (elementId, show) => {
    var x = document.getElementById(elementId);
      x.style.display = show?"block":"none"
  }

const getDateTimeString = (timestampInMS) => {
    const time = new Date(timestampInMS)
    return `${time.getUTCHours()}:${(time.getMinutes()+"").padStart(2, '0')} ${time.getUTCDay()}-${time.getUTCMonth()}-${time.getUTCFullYear()}` 
}  

const setTextOnElement = (elementId, text) => {
    const element = document.getElementById(elementId)
    if (element!=null) {
        element.innerText= text
    }
}

const getElementValue = (elementId) => {
    const element = document.getElementById(elementId)
    return element?.value
}

const populateSelect = (selectElementId, data, defaultValue = null) => { // data is array objects with two properties : label and value
    let dropdown = document.getElementById(selectElementId);

    dropdown.length = 0;

    let defaultOption = document.createElement('option');
    defaultOption.text = 'Choose ...';
    defaultOption.value = -1;

    dropdown.add(defaultOption);
    dropdown.selectedIndex = 0;

    let option;
    for (let i = 0; i < data.length; i++) {
        option = document.createElement('option');
        option.text = data[i].label;
        option.value = data[i].value;
        dropdown.add(option);
        if (defaultValue != null && defaultValue == data[i].value) {
            dropdown.selectedIndex = i + 1 //option.inxdex 
        }

    }
}

const populateFontsList = (fontsListElementId) => {
    const fontsList = []
    fontsList.push(`Georgia, serif`)
    fontsList.push(`Gill Sans, sans-serif;`)
    fontsList.push(`sans-serif`)
    fontsList.push(`serif`)
    fontsList.push(`cursive`)
    fontsList.push(`system-ui`)
    fontsList.push(`Helvetica`)
    fontsList.push(`Arial`)
    fontsList.push(`Verdana`)
    fontsList.push(`Calibri`)
    fontsList.push(`Lucida Sans`)
    fontsList.push(`"Century Gothic"`)
    fontsList.push(`Candara`)
    fontsList.push(`Futara`)
    fontsList.push(`Geneva`)
    fontsList.push(`"Times New Rowman"`)
    fontsList.push(`Cambria`)
    fontsList.push(`"Courier New"`)

    populateDatalistFromValueSet(fontsListElementId, fontsList)
}

const undefinedToDefined = (value, definedValue="") => {
    console.log(`value ${value}`)
    let derivedValue = (typeof value == 'undefined') ? definedValue: value
    return derivedValue
}

function populateDatalistFromValueSet(listId, listOfDistinctValues) {
    let listElement = document.getElementById(listId)
    if (listElement == null) {
        listElement = document.createElement("datalist")
        listElement.setAttribute("id", listId)
        document.body.appendChild(listElement)
    }
    //remove current contents
    listElement.length = 0
    listElement.innerHTML = null
    let option
    for (let value of listOfDistinctValues) {
        option = document.createElement('option')
        option.value = value
        listElement.appendChild(option)
    }
}


const createAndPopulateDataListFromBlipProperties = (listId, propertyPath, blips) => {

    const listOfDistinctValues = new Set()
    for (let i = 0; i < blips.length; i++) {
        const blip = blips[i]
        listOfDistinctValues.add(getNestedPropertyValueFromObject(blip.rating, propertyPath))
    }
    populateDatalistFromValueSet(listId, listOfDistinctValues)
}


const initializeImagePaster = (handleImagePaste, pasteAreaElementId) => {
    document.getElementById(pasteAreaElementId).onpaste = function (event) {
        // use event.originalEvent.clipboard for newer chrome versions
        const items = (event.clipboardData || event.originalEvent.clipboardData).items;
        //  console.log(JSON.stringify(items)); // will give you the mime types
        // find pasted image among pasted items
        let blob = null;
        for (var i = 0; i < items.length; i++) {
            if (items[i].type.indexOf("image") === 0) {
                blob = items[i].getAsFile();
            }
        }
        // load image content and assign to background image for currently selected object (sector or ring)
        if (blob !== null) {
            const reader = new FileReader();
            reader.onload = function (event) {
                if (handleImagePaste) handleImagePaste(event.target.result)
            };
            reader.readAsDataURL(blob);
        }
    }

}