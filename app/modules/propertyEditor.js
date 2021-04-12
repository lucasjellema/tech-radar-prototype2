export { launchPropertyEditor }
import { getViewpoint, getData, publishRefreshRadar } from './data.js';
import { capitalize, getPropertyFromPropertyPath, populateFontsList, createAndPopulateDataListFromBlipProperties, undefinedToDefined, getAllKeysMappedToValue, getNestedPropertyValueFromObject, setNestedPropertyValueOnObject, initializeImagePaster, populateSelect, getElementValue, setTextOnElement, getRatingTypeProperties, showOrHideElement } from './utils.js'


const launchPropertyEditor = (propertyToEdit, viewpoint, drawRadarBlips) => {
    
    showOrHideElement("modalEditor", true)
    setTextOnElement('modalEditorTitle', `Edit Property ${propertyToEdit.label}`)
    const contentContainer = document.getElementById("modalContentContainer")
    let html = ``

    html+= `<label for="propertyLabel">Label</label>
       <input id="propertyLabel" value="${propertyToEdit.label}"></input><br/>`
       html+= `<label for="propertyType">Type</label>
       <input id="propertyType" value="${propertyToEdit.type}"></input><br/>`
       html+= `<label for="propertyDescription">Description</label>
       <input id="propertyDescription" value="${undefinedToDefined(propertyToEdit.description,"")}"></input><br/>`
       html+= `<label for="propertyDefaultValue">Default Value</label>
       <input id="propertyDefaultValue" value="${undefinedToDefined(propertyToEdit.defaultValue,"")}"></input><br/>`
       html+= `<label for="propertyDiscrete">Discrete</label>
       <input id="propertyDiscrete" value="${undefinedToDefined(propertyToEdit.discrete,"false")}"></input><br/>`

    contentContainer.innerHTML = html
    const buttonBar = document.getElementById("modalButtonBar")
    buttonBar.innerHTML = `<input id="launchMainEditor" type="button" value="Main Editor"></input> <input id="savePropertyEdits" type="button" value="Save Changes"></input>`
    document.getElementById("savePropertyEdits").addEventListener("click",
        (event) => {
            console.log(`save property edits for ${propertyToEdit.label} `)
            saveProperty(propertyToEdit, viewpoint)
            showOrHideElement('modalEditor', false)
            publishRefreshRadar()
            if (drawRadarBlips != null) drawRadarBlips(viewpoint)

        })

    document.getElementById("launchMainEditor").addEventListener("click", () => {
        hideMe()
        publishRadarEvent({ type: "mainRadarConfigurator", tab:"datamodel" })
    })

}

const             saveProperty= (propertyToEdit, viewpoint) => {
    console.log(`save property `)
}
