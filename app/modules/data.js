export { getConfiguration, saveDataToLocalStorage , loadDataFromLocalStore}

const RADAR_INDEX_KEY = "RADAR-INDEX"

const getConfiguration = () => {
    return config
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
    colorsConfiguration: {
         colors: [ 
            { label: "Super Status", color:"blue"}, 
            { label: "Unassigned", color:"white"} ,
            { label: "Unassigned", color:"white"} ,
            { label: "Unassigned", color:"white"} ,
            { label: "Unassigned", color:"white"} 
        ]
    },
    sizesConfiguration: {
         sizes: [ 
            { label: "Regular", size: 2} 
        ]
    },
    shapesConfiguration: {
         shapes: [ 
            { label: "Library & Framework", shape: "square"} 
            ,{ label: "Tool", shape: "diamond"} 
        ]
    }
}

let radarIndex = { viewpoints: [{ title: encodeURI(config.title.text), description: "", lastupdate: "20210310T192400" }], objects: [] }

const saveDataToLocalStorage = () => {
    localStorage.setItem(RADAR_INDEX_KEY, JSON.stringify(radarIndex));
    console.log(`${JSON.stringify(getConfiguration().colorsConfiguration)}`)
    // for every viewpoint, save viewpoint document
    localStorage.removeItem(encodeURI(getConfiguration().title.text))
    localStorage.setItem(encodeURI(getConfiguration().title.text), JSON.stringify(getConfiguration()));
}

const loadDataFromLocalStore = () => {
    radarIndex = JSON.parse(localStorage[RADAR_INDEX_KEY])
    // for every viewpoint in the index, load document
    config = JSON.parse(localStorage[ radarIndex.viewpoints[0].title])
    return config
}
