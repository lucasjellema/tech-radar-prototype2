export { initializeViewpointFromURL, initializeFiltersTagsFromURL, getConfiguration, getViewpoint, getData, createBlip, subscribeToRadarRefresh, getState, publishRefreshRadar }
import { initializeTree } from './tree.js'
import { getSampleData } from './sampleData.js'
import { getDataSet as getEmergingDataSource} from './emerging-technologies-dataset.js'
import { getDataSet as getTechnologyRadarDataSource} from './technology-radar-dataset.js'

const RADAR_INDEX_KEY = "RADAR-INDEX"

let data = {
    model: {}
    , templates: []
    , objects: {}
    , viewpoints: []

}

// describes the current state for the radar application - not intrinsic qualities of the template
let state = {
    currentTemplate: 0,
    currentViewpoint: 0,
    selectedRing: 1,
    selectedSector: 2,
    editMode: true,
    editType: "viewpoint"  // template or viewpoint-configuration

}

const getData = () => {
    return data
}

const getConfiguration = () => {
    return state.editType == "template" ? data.templates[state.currentTemplate] : data.viewpoints[state.currentViewpoint].template
}

const getViewpoint = () => {
    return data.viewpoints[state.currentViewpoint]
}

const initializeViewpointFromURL = () => {
    const params = new URLSearchParams(window.location.search)
    const viewpointId = params.get('viewpoint')
    if (viewpointId != null) {
        // find viewpoint with id and when found - set currentViewpoint and edittype
        for (let i = 0; i < data.viewpoints.length; i++) {
            if (data.viewpoints[i].id == viewpointId) {
                state.currentViewpoint = i
                state.editType = "viewpoint"
            }
        }
    }
}

const initializeFiltersTagsFromURL = () => {
    const params = new URLSearchParams(window.location.search)
    const tagParam = params.get('tags')
    console.log(`tags ${tagParam}`)
    // default type = plus; if last character == ~ then type is minus, if *  then must
    if (tagParam != null && tagParam.length > 0) {
        if (getViewpoint().blipDisplaySettings.tagFilter==null  || getViewpoint().blipDisplaySettings.tagFilter.length==0) {getViewpoint().blipDisplaySettings.tagFilter=[]}
        const tags = tagParam.split(',')
        for (let i = 0; i < tags.length; i++) {
            let tag = tags[i]
            let type = "plus"
            if (tag.endsWith("~")) {
                tag = tag.slice(0, tag.length - 1)
                type = "minus"
            }
            if (tag.endsWith("*")) {
                tag = tag.slice(0, tag.length - 1)
                type = "must"
            }
            getViewpoint().blipDisplaySettings.tagFilter.push({ type: type, tag: tag })
        }
    }
}



const getState = () => {
    return state
}


const freshTemplate =
{
    svg_id: "radarSVGContainer",
    width: 1450,
    height: 1000,
    topLayer: "sectors", // rings or sectors
    selectedRing: 0,
    selectedSector: 0,
    rotation: 0,
    maxRingRadius: 450,
    sectorBoundariesExtended: false,
    editMode: true,
    defaultFont: { color: "black", fontSize: "38px", fontFamily: "Arial, Helvetica", fontStyle: "normal", fontWeight: "normal" }, // fontStyle: oblique, normal, italic; fontWeight: normal, bold, bolder, lighter; 100 .. 900
    title: { text: "Technology Radar", x: -700, y: -470, font: { fontSize: "34px" } },

    colors: {
        background: "#fef",
        grid: "#bbb",
        inactive: "#ddd"
    },
    ringConfiguration: {
        outsideRingsAllowed: true,
        font: { color: "purple" },
        rings: [ // rings are defined from outside going in; the first one is the widest
            { label: "Ring One", width: 0.3 },
            { label: "Ring Two", width: 0.5 },
        ]
    },
    sectorConfiguration: {
        outsideSectorsAllowed: true,
        font: { fontSize: "32px", fontFamily: "Arial, Helvetica" }
        , sectors: [ // starting from positive X-axis, listed anti-clockwise
            { label: "Sector 1", angle: 0.7 },
            { label: "Sector 2", angle: 0.3 },
        ]
    },
    colorsConfiguration: {
        colors: [
            { label: "Unassigned", color: "blue", enabled: true },
            { label: "Unassigned", color: "green", enabled: false },
            { label: "Unassigned", color: "gray", enabled: false },
            { label: "Unassigned", color: "red", enabled: false },
            { label: "Unassigned", color: "white" }
        ]
    },
    sizesConfiguration: {
        sizes: [
            { label: "Regular", size: 1, enabled: true },
            { label: "Regular", size: 2, enabled: false },
            { label: "Regular", size: 3, enabled: true },
        ]
    },
    shapesConfiguration: {
        shapes: [
            { label: "Unassigned", shape: "square" }
            , { label: "Unassigend", shape: "diamond" }
            , { label: "Unassigend", shape: "rectangleHorizontal", enabled: false }
            , { label: "Unassigned", shape: "circle", enabled: false }
        ]
    }
}



const getFreshTemplate = () => {
    return freshTemplate
}

//data.templates.push(freshTemplate)
//let config = data.templates[0]

const initializeDatasetFromURL = () => {
    const params = new URLSearchParams(window.location.search)
    const source = params.get('source')
    console.log(`source ${source}`)
    if (source != null && source.length > 0) {
        if (source=="emerging") { data = getEmergingDataSource()}
        if (source=="techradar") { data = getTechnologyRadarDataSource()}
    } else {
        data = getSampleData()
        
    }
}
initializeDatasetFromURL()
//let radarIndex = { templates: [{ title: encodeURI(config.title.text), description: "", lastupdate: "20210310T192400" }], objects: [] }

// TODO use default values for all properties as defined in the meta-model
const createBlip = () => {
    let newRating = {
        timestamp: Date.now()
        , scope: "Conclusion"
        , comment: "no comment yet"
        , author: `system generated at ${Date.now()}`
        , object: { label: `NEW${getViewpoint().blips.length} ${Date.now()}`, category: "infrastructure", homepage: null, image: null }
        , magnitude: "medium"
        , ambition: "trial"
    }
    let blip = { id: `${getViewpoint().blips.length}`, rating: newRating }
    let blipCount = getViewpoint().blips.push(blip)
    console.log(`after creating the blip the count is now ${blipCount} == ${getViewpoint().blips.length}`)
    return blip

}

const saveDataToLocalStorage = () => {
    localStorage.setItem(RADAR_INDEX_KEY, JSON.stringify(data));
    // console.log(`${JSON.stringify(getConfiguration().colorsConfiguration)}`)
    // // for every viewpoint, save viewpoint document
    // // TODO save project? save individual templates and object sets?
    // localStorage.removeItem(encodeURI(getConfiguration().title.text))
    // localStorage.setItem(encodeURI(getConfiguration().title.text), JSON.stringify(data));
}

const loadDataFromLocalStore = () => {
    //    radarIndex = JSON.parse(localStorage[RADAR_INDEX_KEY])
    // for every viewpoint in the index, load document
    //    data = JSON.parse(localStorage[radarIndex.templates[0].title])
    data = JSON.parse(localStorage[RADAR_INDEX_KEY])

    publishRefreshRadar()
}

// source: https://ourcodeworld.com/articles/read/189/how-to-create-a-file-and-generate-a-download-with-javascript-in-the-browser-without-a-server
function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

const downloadRadarData = function () {
    download(`radar-data.json`, JSON.stringify(data))
}

const uploadRadarData = () => {
    if (fileElem) {
        fileElem.click();
    }
}
let fileElem
function initializeUpload() {
    if (fileElem == null) {
        fileElem = document.getElementById("fileElem");
        fileElem.addEventListener("change", handleUploadedFiles, false);
    }
}

let uploadedData
//TODO support multiple filers
async function handleUploadedFiles() {
    if (!this.files.length) {
        console.log(`no files selected`)
        //       fileList.innerHTML = "<p>No files selected!</p>";
    } else {

        const contents = await this.files[0].text()
        uploadedData = JSON.parse(contents)
        initializeTree("filemodelTree", uploadedData, "upload", (uploadedData) => {

            console.log(`uploaded data has arrived ${JSON.stringify(uploadedData)}`)
            data.model = Object.assign(data.model, uploadedData.model)
            data.templates = data.templates.concat(uploadedData.templates)
            data.viewpoints = data.viewpoints.concat(uploadedData.viewpoints)
            if (uploadedData.objects != null && uploadedData.objects.length > 0) {
                // merge the arrays of uploaded objects in with the existing objects per object type
                for (let i = 0; i < Object.keys(uploadedData.objects).length; i++) {
                    data.objects[Object.keys(uploadedData.objects)[i]] =
                        uploadedData.objects[Object.keys(uploadedData.objects)[i]].concat(data.objects[Object.keys(uploadedData.objects)[i]])
                }
            }

            publishRefreshRadar()
        }, data.model)
        publishRefreshRadar()

    }
}

const createNewTemplate = () => {
    console.log(`create new template`)
    const newTemplate = JSON.parse(JSON.stringify(getFreshTemplate()))
    newTemplate.title.text = `NEW template`
    data.templates.push(newTemplate)
    state.currentTemplate = data.templates.length - 1
    publishRefreshRadar()
}

const cloneTemplate = () => {
    if (getState().editType == "template") {
        const clone = JSON.parse(JSON.stringify(getConfiguration()))
        clone.title.text = `CLONE of ${clone.title.text}`
        data.templates.push(clone)
        state.currentTemplate = data.templates.length - 1
        publishRefreshRadar()
    }
}

const createViewpointFromTemplate = () => {
    if (getState().editType == "template") {

        const newViewpoint = {}
        newViewpoint.template = JSON.parse(JSON.stringify(getConfiguration()))
        newViewpoint.name = `Created as clone of ${getConfiguration().title.text}`
        newViewpoint.blips = []
        newViewpoint.ratingType = {
            objectType: {
                name: "technology",
                label: "Technology",
                properties:
                {
                    label: {
                        label: "Label",
                        type: "string"
                        , defaultValue: "Some Technology"
                        , displayLabel: true // this property should be used to derive the label for this objectType
                    }, description: {
                        label: "Description",
                        type: "string"
                    }, homepage: {
                        label: "Homepage",
                        type: "url"
                    }, image: {
                        label: "Logo",
                        type: "image"
                    }, vendor: {
                        label: "Vendor",
                        type: "string",
                        discrete: true
                    }, tags: {
                        label: "Tags",
                        type: "tags",
                    }, offering: {
                        label: "Offering",
                        type: "string", allowableValues: [{ value: "oss", label: "Open Source Software" }
                            , { value: "commercial", label: "Commercial Software" }, { value: "other", label: "Other type of offering" }
                        ]
                        , defaultValue: "oss"
                    },
                    "category": {
                        label: "Category",
                        type: "string", allowableValues: [{ value: "database", label: "Data Platform" }
                            , { value: "language", label: "Languages & Frameworks" }, { value: "infrastructure", label: "Infrastructure" }, { value: "concepts", label: "Concepts & Methodology" }
                        ] //
                        , defaultValue: "infrastructure"
                    }
                }
            }, properties:
            {
                ambition: {
                    label: "Ambition",
                    description: "The current outlook or intent regarding this technology", defaultValue: "identified"
                    , allowableValues: [{ value: "identified", label: "Identified" }, { value: "hold", label: "Hold" }, { value: "assess", label: "Assess" }, { value: "trial", label: "Try Out/PoC" }, { value: "adopt", label: "Adopt" }]
                    , defaultValue: "identified"
                },
                magnitude: {
                    label: "Magnitude/Relevance",
                    description: "The relative size of the technology (in terms of investment, people involved, percentage of revenue)", defaultValue: "medium"
                    , allowableValues: [{ value: "tiny", label: "Tiny or Niche" }, { value: "medium", label: "Medium" }, { value: "large", label: "Large" }]
                },
                experience: {
                    label: "Experience/Maturity",
                    description: "The relative time this technology has been around (for us)", defaultValue: "medium"
                    , allowableValues: [{ value: "short", label: "Fresh" }, { value: "medium", label: "Intermediate" }, { value: "long", label: "Very Mature" }]
                }

            }
        }
        // define propertyViewMaps
        newViewpoint.propertyVisualMaps = {
            blip: { label: "object.label", image: "object.image" },
            size: {
                property: "magnitude", valueMap: { "tiny": 0, "medium": 1, "large": 2 } // the rating magnitude property drives the size; the values of magnitude are mapped to values for size
            }
            , sector: {
                property: "object.category", valueMap: { "database": 0, "language": 3, "infrastructure": 2, "concepts": 4, "libraries": 1 } // the object category property drives the sector; the values of category are mapped to values for sector
            }

            , ring: {
                property: "ambition", valueMap: { "hold": 0, "assess": 1, "adopt": 3, "trial": 2 } // the rating ambition property drives the ring; the values of ambition are mapped to values for ring
            }
            , shape: {
                property: "object.offering", valueMap: { "oss": 4, "commercial": 6, "other": 5 }
            }
            , color: { property: "experience", valueMap: { "short": 0, "long": 1, "intermediate": 3, "other": 2 } }
        }

        data.viewpoints.push(newViewpoint)
        state.currentViewpoint = data.viewpoints.length - 1
        publishRefreshRadar()
    }
}

const cloneViewpoint = () => {
    if (getState().editType == "template") {
        const clone = JSON.parse(JSON.stringify(getConfiguration()))
        clone.title.text = `CLONE of ${clone.title.text}`
        data.templates.push(clone)
        state.currentTemplate = data.templates.length - 1
        publishRefreshRadar()
    }
}

const resetTemplate = (template) => {
    template.colors.background = "#FFF"
    // all sectors same angle, all rings same width = adding to 1
    for (let i = 0; i < template.ringConfiguration.rings.length; i++) {
        const ring = template.ringConfiguration.rings[i]
        ring.width = 1 / template.ringConfiguration.rings.length
        ring.backgroundImage = {}
        ring.backgroundColor = "white"
    }

    for (let i = 0; i < template.sectorConfiguration.sectors.length; i++) {
        const sector = template.sectorConfiguration.sectors[i]
        sector.angle = 1 / template.sectorConfiguration.sectors.length
        sector.backgroundImage = {}
        sector.backgroundColor = "white"
        sector.outerringBackgroundColor = "#FFF"
    }
}

const resetCurrentTemplate = () => {
    resetTemplate(getConfiguration())
    publishRefreshRadar()
}

const handleTemplateSelection = (event) => {
    console.log(`template selection ${event.target.value} `)
    // ${data.templates[event.target.value].title.text}`)
    //const selectedOption = document.getElementById('templateSelector').options[event.target.value]
    if (event.target.value < data.templates.length) {
        state.currentTemplate = event.target.value
        state.editType = "template"

    } else {
        state.currentViewpoint = event.target.value - data.templates.length
        state.editType = "viewpoint"

    }
    publishRefreshRadar()
}

const populateTemplateSelector = () => {
    const selector = document.getElementById('templateSelector')
    // remove current options beyond 0
    for (var i = 0; i < selector.options.length + 3; i++) {
        selector.remove(1)
    }
    //  if (getState().editType == "template") {
    // add options based on data.templates[].title.text
    for (var i = 0; i < data.templates.length; i++) {
        var option = document.createElement("option");

        option.value = i;
        option.text = `Template: ${data.templates[i].title.text}`;
        option.selected = i == state.currentTemplate && state.editType == "template"
        selector.add(option, null);
    }
    //}
    for (var i = 0; i < data.viewpoints.length; i++) {
        var option = document.createElement("option");

        option.value = i + data.templates.length;
        option.text = `Viewpoint: ${data.viewpoints[i].name}`;
        option.selected = i == state.currentViewpoint && state.editType == "viewpoint"
        selector.add(option, null);
    }
}


document.getElementById('save').addEventListener("click", saveDataToLocalStorage);
document.getElementById('load').addEventListener("click", loadDataFromLocalStore);
document.getElementById('download').addEventListener("click", downloadRadarData);
document.getElementById('upload').addEventListener("click", uploadRadarData);
document.getElementById('newTemplate').addEventListener("click", createNewTemplate);
document.getElementById('cloneTemplate').addEventListener("click", cloneTemplate);
document.getElementById('resetTemplate').addEventListener("click", resetCurrentTemplate);
document.getElementById('templateSelector').addEventListener("change", handleTemplateSelection);
document.getElementById('cloneViewpoint').addEventListener("click", cloneViewpoint);
document.getElementById('createViewpoint').addEventListener("click", createViewpointFromTemplate);

// mini event bus for the Refresh Radar Event
const subscribers = []
const subscribeToRadarRefresh = (subscriber) => { subscribers.push(subscriber) }
const publishRefreshRadar = () => { subscribers.forEach((subscriber) => { subscriber() }) }

initializeUpload()
subscribeToRadarRefresh(populateTemplateSelector)
populateTemplateSelector()

