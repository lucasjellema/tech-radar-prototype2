export { launchDataExplorer }
import { capitalize, getPropertyFromPropertyPath, populateFontsList, createAndPopulateDataListFromBlipProperties, undefinedToDefined, getAllKeysMappedToValue, getNestedPropertyValueFromObject, setNestedPropertyValueOnObject, initializeImagePaster, populateSelect, getElementValue, setTextOnElement, getRatingTypeProperties, showOrHideElement } from './utils.js'

const launchDataExplorer = () => {

    showOrHideElement("modalMain", true)
    setTextOnElement("modalMainTitle", "Data Explorer")
    document.getElementById("dataExplorerConfigurationTab").classList.add("warning") // define a class SELECTEDTAB 
    const contentContainer = document.getElementById("modalMainContentContainer")
    contentContainer.innerHTML = ''

// show an overview of the current data content
// object types, rating types
// objects
// ratings
// allow editing of all of these
// allow create and delete of individual objects and ratings
// allow creation of rating for object (and all ratings for all objects without rating)


}

