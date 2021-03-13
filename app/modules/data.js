export { getConfiguration, subscribeToRadarRefresh , getState, publishRefreshRadar}

const RADAR_INDEX_KEY = "RADAR-INDEX"

let data = {
    templates: []
    , objects: []

}

// describes the current state for the radar application - not intrinsic qualities of the template
let state = {
    currentTemplate: 0,
    selectedRing: 1,
    selectedSector: 2,
    editMode: true,

}

const getConfiguration = () => {
    return data.templates[state.currentTemplate]
}

const getState = () => {
    return state
}
// load index RADAR-INDEX from LocalStorage
// in RADAR_INDEX are references to other documents
// { viewpoints : [{title, description, lastupdate}, {title}] 
// , objects : [ "technologies", "AMIS Staff"]
// }
// if it does not exist, create a new radar index


let config = {
    svg_id: "radarSVGContainer",
    width: 1450,
    height: 1000,
    topLayer: "sectors", // rings or sectors
    selectedRing: 3,
    selectedSector: 0,
    rotation: 0,
    maxRingRadius: 450,
    sectorBoundariesExtended: true,
    editMode: true,
    title: { text: "Conclusion Technology Radar", x: -700, y: -470, fontSize: "34px", fontFamily: "Arial, Helvetica" },

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
    colorsConfiguration: {
        colors: [
            { label: "Super Status", color: "blue", enabled: true },
            { label: "Unassigned", color: "white", enabled: false },
            { label: "Unassigned", color: "white", enabled: false },
            { label: "Unassigned", color: "white", enabled: false },
            { label: "Unassigned", color: "white" }
        ]
    },
    sizesConfiguration: {
        sizes: [
            { label: "Regular", size: 1, enabled: true },
            { label: "Regular", size: 2, enabled: false },
            { label: "Regular", size: 3, enabled: true },
            { label: "Regular", size: 4 },
            { label: "Regular", size: 5, enabled: false },
        ]
    },
    shapesConfiguration: {
        shapes: [
            { label: "Library & Framework", shape: "square" }
            , { label: "Tool", shape: "diamond" }
            , { label: "Shape Label", shape: "rectangleHorizontal", enabled: false }
            , { label: "Shape Label", shape: "circle", enabled: false }
            , { label: "Shape Label", shape: "star", enabled: false }
            , { label: "Shape Label", shape: "rectangleVertical", enabled: false }
            , { label: "Shape Label", shape: "triangle", enabled: false }
            , { label: "Shape Label", shape: "ring", enabled: false } // circle with fat stroke-width
            , { label: "Shape Label", shape: "plus", enabled: false } // circle with fat stroke-width
        ]
    }
}

data.templates.push(config)

let radarIndex = { templates: [{ title: encodeURI(config.title.text), description: "", lastupdate: "20210310T192400" }], objects: [] }

const saveDataToLocalStorage = () => {
    localStorage.setItem(RADAR_INDEX_KEY, JSON.stringify(radarIndex));
    console.log(`${JSON.stringify(getConfiguration().colorsConfiguration)}`)
    // for every viewpoint, save viewpoint document
    // TODO save project? save individual templates and object sets?
    localStorage.removeItem(encodeURI(getConfiguration().title.text))
    localStorage.setItem(encodeURI(getConfiguration().title.text), JSON.stringify(data));
}

const loadDataFromLocalStore = () => {
    radarIndex = JSON.parse(localStorage[RADAR_INDEX_KEY])
    // for every viewpoint in the index, load document
    data = JSON.parse(localStorage[radarIndex.templates[0].title])
    
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


//TODO support multiple filers, support add/merge instead of replace of files
async function handleUploadedFiles() {
    if (!this.files.length) {
        console.log(`no files selected`)
        //       fileList.innerHTML = "<p>No files selected!</p>";
    } else {

        const contents = await this.files[0].text()
        data = JSON.parse(contents)
        publishRefreshRadar()

    }
}

document.getElementById('save').addEventListener("click", saveDataToLocalStorage);
document.getElementById('load').addEventListener("click", loadDataFromLocalStore);
document.getElementById('download').addEventListener("click", downloadRadarData);
document.getElementById('upload').addEventListener("click", uploadRadarData);

initializeUpload()

// mini event bus for the Refresh Radar Event
const subscribers = []
const subscribeToRadarRefresh = (subscriber)=> { subscribers.push(subscriber)}
const publishRefreshRadar = () => { subscribers.forEach((subscriber) => {subscriber()})}