export { getDataSet }
const getDataSet = () => {
    return dataset
}


// these genericRatingProperties are applied to every ratingType
const genericRatingProperties = {
    scope: { label: "Scope", description: "The scope or context to which the rating applies", defaultValue: "Conclusion" }
    , author: { label: "Author/Evaluator", description: "The name of the person who made the judgement", defaultValue: "System Generated" }
    , timestamp: { label: "Time of Evaluation", description: "When was this rating defined" }
    , comment: { label: "Comment/Rationale", description: "Additional remark regarding this rating" , type:"text"}
}

const model =
{
    objectTypes:
    {
        technology: {
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
                    type: "text"
                }, reference: {
                    label: "Internet Resource",
                    type: "url"
                }, image: {
                    label: "Visualization",
                    type: "image"
                }, tags: {
                    label: "Tags",
                    type: "tags",
                },
                "category": {
                    label: "Category",

                    type: "string", allowableValues: [{ value: "businessEnabler", label: "Business Enabler" }
                        , { value: "interfaceExperience", label: "Interface Experience" }
                        , { value: "productivityRevolution", label: "Productivity Revolution" }
                        
                    ] //
                    , defaultValue: "businessEnabler"
                }
            }
        }

    }
}




model.ratingTypes =
{
    technologyAdoption: {
        label: "Technology Adoption",
        objectType: model.objectTypes.technology, properties:
            Object.assign(
                {
                    ambition: {
                        label: "Range",
                        description: "Range estimates the distance (in years) that the technology or trend is from “crossing the chasm” from early-adopter to early majority adoption"
                        , defaultValue: "68yrs"
                        , allowableValues: [
                            { value: "68yrs", label: "6-8 Years" },
                            { value: "36yrs", label: "3-6 Years" },
                            { value: "13yrs", label: "1-3 Years" },
                            { value: "now", label: "Now (0-1 Years)" }
]
                        
                    },
                    magnitude: {
                        label: "Mass",
                        description: "This indicates how substantial an impact the technology or trend will have on existing products and markets."
                        , defaultValue: "medium"
                        , allowableValues: [
                            { value: "low", label: "Low" }, { value: "medium", label: "Medium" }, { value: "high", label: "High" },{value:"veryhigh",label:"Very High"}]
                    },
                    experience: {
                        label: "Experience/Maturity",
                        description: "The relative time this technology has been around (for us)", defaultValue: "medium"
                        , allowableValues: [{ value: "short", label: "Fresh" }, { value: "medium", label: "Intermediate" }, { value: "long", label: "Very Mature" }]
                    }

                }, genericRatingProperties)
    }

}

const dataset = {
    "model": model,
    "viewpoints": [
        {
            "name": "Emerging Technologies and Trends Impact Radar",
            "id": "emerging-tech-trends",
            "ratingType": "technologyAdoption",
            "template": {
                "svg_id": "radarSVGContainer",
                "width": 1450,
                "height": 1100,
                "topLayer": "rings",
                "selectedRing": 0,
                "selectedSector": 0,
                "rotation": 0,
                "maxRingRadius": 450,
                "sectorBoundariesExtended": true,
                "editMode": false,
                "defaultFont": {
                    "color": "black",
                    "fontSize": "38px",
                    "fontFamily": "Arial, Helvetica",
                    "fontStyle": "italic",
                    "fontWeight": "bold"
                },
                "title": {
                    "text": "Emerging Technologies",
                    "x": -700,
                    "y": -520,
                    "font": {
                        "fontSize": "34px",
                        "fontFamily": "Courier"
                    }
                },
                "colors": {
                    "background": "#FFF",
                    "grid": "#bbb",
                    "inactive": "#ddd"
                },
                "ringConfiguration": {
                    "outsideRingsAllowed": true,
                    "font": {
                        "color": "blacvk",
                        "fontSize": "24px",
                        "fontFamily": "Arial, Helvetica",
                        "fontStyle": "normal",
                        "fontWeight": "bold"
                    },
                    "stroke": {
                        "strokeWidth": 6,
                        "strokeColor": "white",
                        "strokeArray": "100 1"
                    },
                    "rings": [
                        {
                            "label": "6-8 years",
                            "width": 0.25,
                            "backgroundImage": {},
                            "backgroundColor": "#737071"
                        },
                        {
                            "label": "3-6 years",
                            "width": 0.2,
                            "backgroundImage": {},
                            "backgroundColor": "#bdb9ba"
                        },
                        {
                            "label": "1-3 years",
                            "width": 0.2,
                            "backgroundImage": {},
                            "backgroundColor": "#ebe6e7"
                        },
                        {
                            "label": "Now (0-1 year)",
                            "width": 0.35,
                            "backgroundImage": {},
                            "backgroundColor": "#ffdb26"
                        }
                    ]
                },
                "sectorConfiguration": {
                    "outsideSectorsAllowed": true,
                    "font": {
                        "color": "#000",
                        "fontSize": "28px",
                        "fontFamily": "Arial, Helvetica",
                        "fontStyle": "normal",
                        "fontWeight": "normal"
                    },
                    "stroke": {
                        "strokeWidth": 6,
                        "strokeColor": "white",
                        "strokeArray": "100 1"
                    },
                    "sectors": [
                        {
                            "label": "Business Enablers",
                            "angle": 0.3333333333333333,
                            "backgroundImage": {},
                            "backgroundColor": "white",
                            "outerringBackgroundColor": "#FFF"
                        },
                        {
                            "label": "Interfaces and Experiences",
                            "angle": 0.3333333333333333,
                            "backgroundImage": {},
                            "backgroundColor": "white",
                            "outerringBackgroundColor": "#FFF"
                        },
                        {
                            "label": "Productivity Revolution",
                            "angle": 0.3333333333333333,
                            "backgroundImage": {},
                            "backgroundColor": "white",
                            "outerringBackgroundColor": "#FFF"
                        }
                    ]
                },
                "colorsConfiguration": {
                    "label": "Mass",
                    "colors": [
                        {
                            "label": "Low",
                            "color": "#4d94d1",
                            "enabled": true
                        },
                        {
                            "label": "Medium",
                            "color": "#44d4eb",
                            "enabled": true
                        },
                        {
                            "label": "High",
                            "color": "#3471a3",
                            "enabled": true
                        },
                        {
                            "label": "Very High",
                            "color": "#0e0f52",
                            "enabled": true
                        },
                        {
                            "label": "Unassigned",
                            "color": "white"
                        }
                    ]
                },
                "sizesConfiguration": {
                    "label": "Mass",
                    "sizes": [
                        {
                            "label": "Low",
                            "size": 0.55,
                            "enabled": false
                        },
                        {
                            "label": "Medium",
                            "size": 0.8,
                            "enabled": true
                        },
                        {
                            "label": "High",
                            "size": 1.05,
                            "enabled": true
                        },
                        {
                            "label": "Very High",
                            "size": 1.4,
                            "enabled": true
                        },
                        {
                            "label": "Very High",
                            "size": 5,
                            "enabled": true
                        }
                    ]
                },
                "shapesConfiguration": {
                    "label": "Offering",
                    "shapes": [
                        {
                            "label": "Commercial",
                            "shape": "square"
                        },
                        {
                            "label": "Open Source",
                            "shape": "diamond"
                        },
                        {
                            "label": "Label",
                            "shape": "rectangleHorizontal",
                            "enabled": false
                        },
                        {
                            "label": "Other",
                            "shape": "circle",
                            "enabled": false
                        },
                        {
                            "label": "Label",
                            "shape": "star",
                            "enabled": false
                        },
                        {
                            "label": "Label",
                            "shape": "rectangleVertical",
                            "enabled": false
                        },
                        {
                            "label": "Label",
                            "shape": "triangle",
                            "enabled": false
                        },
                        {
                            "label": "Label",
                            "shape": "ring",
                            "enabled": false
                        },
                        {
                            "label": "Label",
                            "shape": "plus",
                            "enabled": false
                        }
                    ]
                }
            },
            "ratingTypes": [],
            "propertyVisualMaps": {
                "blip": { "label": "object.label", "image": "object.image" },
                "size": {
                    "property": "magnitude", "valueMap": {
                        "low": 0,
                        "medium": 1,
                        "high": 2,
                        "veryhigh": 3
                    }
                },
                "sector": {
                    "property": "object.category", "valueMap": {
                        "businessEnabler": 0,
                        "interfaceExperience": 1,
                        "productivityRevolution": 2
                    }
                },
                "ring": {
                    "property": "ambition", "valueMap": {
                        "68yrs": 0,
                        "36yrs": 1,
                        "13yrs": 2,
                        "now": 3
                    }
                },
                "shape": {
                    "property": "object.offering", "valueMap": {
                        "other": 0
                    }
                },
                "color": {
                    "property": "experience", "valueMap": {
                        "low": 0,
                        "medium": 1,
                        "high": 2,
                        "veryhigh": 3
                    }
                }
            },
            "blipDisplaySettings": {
                "showImages": false,
                "showShapes": true,
                "showLabels": true,
                "applyShapes": false,
                "applySizes": true,
                "applyColors": true,
                "tagFilter": ""
            },
            "blips": [
                {
                    "id": "0",
                    "rating": {
                        "ambition": "68yrs",
                        "magnitude": "high",
                        "experience": "veryhigh",
                        "timestamp": 1616445531644,
                        "scope": "Conclusion",
                        "comment": "no comment yet",
                        "author": "system generated",
                        "object": {
                            "label": "AR Cloud",
                            "category": "businessEnabler"
                        }
                    },
                    "x": 97.01754760742188,
                    "y": -383.282470703125
                },
                {
                    "id": "1",
                    "rating": {
                        "ambition": "36yrs",
                        "magnitude": "high",
                        "experience": "high",
                        "timestamp": 1616445531644,
                        "scope": "Conclusion",
                        "comment": "no comment yet",
                        "author": "system generated",
                        "object": {
                            "label": "Distributed Cloud",
                            "category": "businessEnabler"
                        }
                    },
                    "x": 91.1558837890625,
                    "y": -270.5555419921875
                },
                {
                    "id": "2",
                    "rating": {
                        "ambition": "36yrs",
                        "magnitude": "high",
                        "experience": "high",
                        "timestamp": 1616445531644,
                        "scope": "Conclusion",
                        "comment": "no comment yet",
                        "author": "system generated",
                        "object": {
                            "label": "Tokenization",
                            "category": "businessEnabler"
                        }
                    },
                    "x": -58.02020263671875,
                    "y": -268.0058898925781
                },
                {
                    "id": "3",
                    "rating": {
                        "ambition": "36yrs",
                        "magnitude": "high",
                        "experience": "high",
                        "timestamp": 1616445531644,
                        "scope": "Conclusion",
                        "comment": "no comment yet",
                        "author": "system generated",
                        "object": {
                            "label": "Smart Personalization",
                            "category": "interfaceExperience"
                        }
                    },
                    "x": -203.8729705810547,
                    "y": -189.46595764160156
                },
                {
                    "id": "4",
                    "rating": {
                        "ambition": "13yrs",
                        "magnitude": "medium",
                        "experience": "medium",
                        "timestamp": 1616445531644,
                        "scope": "Conclusion",
                        "comment": "no comment yet",
                        "author": "system generated",
                        "object": {
                            "label": "Application Ecosystems",
                            "category": "businessEnabler"
                        }
                    },
                    "x": 94.7358169555664,
                    "y": -158.8962860107422
                },
                {
                    "id": "5",
                    "rating": {
                        "ambition": "now",
                        "magnitude": "high",
                        "experience": "veryhigh",
                        "timestamp": 1616445531644,
                        "scope": "Conclusion",
                        "comment": "no comment yet",
                        "author": "system generated",
                        "object": {
                            "label": "Low-Code Application Platform",
                            "category": "businessEnabler"
                        }
                    },
                    "x": 29.67843246459961,
                    "y": -50.70744323730469
                },
                {
                    "id": "6",
                    "rating": {
                        "ambition": "36yrs",
                        "magnitude": "medium",
                        "experience": "veryhigh",
                        "timestamp": 1616445531644,
                        "scope": "Conclusion",
                        "comment": "no comment yet",
                        "author": "system generated",
                        "object": {
                            "label": "Distributed Ledgers",
                            "category": "businessEnabler"
                        }
                    },
                    "x": 232.503662109375,
                    "y": -190.65847778320312
                },
                {
                    "id": "7",
                    "rating": {
                        "ambition": "36yrs",
                        "magnitude": "medium",
                        "experience": "medium",
                        "timestamp": 1616445531644,
                        "scope": "Conclusion",
                        "comment": "no comment yet",
                        "author": "system generated",
                        "object": {
                            "label": "Productization of Data",
                            "category": "businessEnabler"
                        }
                    },
                    "x": 268.4955749511719,
                    "y": -113.04769897460938
                },
                {
                    "id": "8",
                    "rating": {
                        "ambition": "36yrs",
                        "magnitude": "high",
                        "experience": "high",
                        "timestamp": 1616445531644,
                        "scope": "Conclusion",
                        "comment": "no comment yet",
                        "author": "system generated",
                        "object": {
                            "label": "Smart Contract",
                            "category": "businessEnabler"
                        }
                    },
                    "x": 290.99705505371094,
                    "y": -34.341400146484375
                },
                {
                    "id": "9",
                    "rating": {
                        "ambition": "36yrs",
                        "magnitude": "medium",
                        "experience": "medium",
                        "timestamp": 1616445531644,
                        "scope": "Conclusion",
                        "comment": "no comment yet",
                        "author": "system generated",
                        "object": {
                            "label": "Packaged Business Capabilities",
                            "category": "businessEnabler"
                        }
                    },
                    "x": 165.34857177734375,
                    "y": -223.74972534179688
                },
                {
                    "id": "10",
                    "rating": {
                        "ambition": "36yrs",
                        "magnitude": "medium",
                        "experience": "medium",
                        "timestamp": 1616445531644,
                        "scope": "Conclusion",
                        "comment": "no comment yet",
                        "author": "system generated",
                        "object": {
                            "label": "mmWave 5G",
                            "category": "businessEnabler"
                        }
                    },
                    "x": -124.58564758300781,
                    "y": -252.63987731933594
                },
                {
                    "id": "11",
                    "rating": {
                        "ambition": "68yrs",
                        "magnitude": "high",
                        "experience": "high",
                        "timestamp": 1616445531644,
                        "scope": "Conclusion",
                        "comment": "no comment yet",
                        "author": "system generated",
                        "object": {
                            "label": "AI-Generated Composite Applications",
                            "category": "businessEnabler"
                        }
                    },
                    "x": -145.38397216796875,
                    "y": -338.10899353027344
                },
                {
                    "id": "12",
                    "rating": {
                        "ambition": "36yrs",
                        "magnitude": "veryhigh",
                        "experience": "veryhigh",
                        "timestamp": 1616445531644,
                        "scope": "Conclusion",
                        "comment": "no comment yet",
                        "author": "system generated",
                        "object": {
                            "label": "IoT Platforms",
                            "category": "interfaceExperience"
                        }
                    },
                    "x": -290.4978332519531,
                    "y": 17.463623046875
                },
                {
                    "id": "13",
                    "rating": {
                        "ambition": "13yrs",
                        "magnitude": "high",
                        "experience": "high",
                        "timestamp": 1616445531644,
                        "scope": "Conclusion",
                        "comment": "no comment yet",
                        "author": "system generated",
                        "object": {
                            "label": "Advanced Virtual Assistants",
                            "category": "interfaceExperience"
                        }
                    },
                    "x": -189.22834014892578,
                    "y": -20.5234375
                },
                {
                    "id": "14",
                    "rating": {
                        "ambition": "now",
                        "magnitude": "high",
                        "experience": "high",
                        "timestamp": 1616445531644,
                        "scope": "Conclusion",
                        "comment": "no comment yet",
                        "author": "system generated",
                        "object": {
                            "label": "Advanced Computer Vision",
                            "category": "interfaceExperience"
                        }
                    },
                    "x": -108.55587577819824,
                    "y": -29.500450134277344
                },
                {
                    "id": "15",
                    "rating": {
                        "ambition": "now",
                        "magnitude": "high",
                        "experience": "veryhigh",
                        "timestamp": 1616445531644,
                        "scope": "Conclusion",
                        "comment": "no comment yet",
                        "author": "system generated",
                        "object": {
                            "label": "Deep Learning",
                            "category": "productivityRevolution"
                        }
                    },
                    "x": 112.3800048828125,
                    "y": 57.485015869140625
                },
                {
                    "id": "16",
                    "rating": {
                        "ambition": "36yrs",
                        "magnitude": "high",
                        "experience": "veryhigh",
                        "timestamp": 1616445531644,
                        "scope": "Conclusion",
                        "comment": "no comment yet",
                        "author": "system generated",
                        "object": {
                            "label": "Composite AI",
                            "category": "productivityRevolution"
                        }
                    },
                    "x": 68.90846252441406,
                    "y": 297.56378173828125
                },
                {
                    "id": "17",
                    "rating": {
                        "ambition": "36yrs",
                        "magnitude": "high",
                        "experience": "high",
                        "timestamp": 1616445531644,
                        "scope": "Conclusion",
                        "comment": "no comment yet",
                        "author": "system generated",
                        "object": {
                            "label": "Digital Twin",
                            "category": "interfaceExperience"
                        }
                    },
                    "x": -189.78863525390625,
                    "y": 232.59970092773438
                },
                {
                    "id": "18",
                    "rating": {
                        "magnitude": "high",
                        "experience": "veryhigh",
                        "timestamp": 1616445531644,
                        "scope": "Conclusion",
                        "comment": "no comment yet",
                        "author": "system generated",
                        "object": {
                            "label": "Quantum Computing",
                            "category": "productivityRevolution"
                        }
                    },
                    "x": -144.52685546875,
                    "y": 490.431640625
                },
                {
                    "id": "19",
                    "rating": {
                        "ambition": "now",
                        "magnitude": "high",
                        "experience": "veryhigh",
                        "timestamp": 1616445531644,
                        "scope": "Conclusion",
                        "comment": "no comment yet",
                        "author": "system generated",
                        "object": {
                            "label": "Edge AI",
                            "category": "productivityRevolution"
                        }
                    },
                    "x": -26.963943481445312,
                    "y": 125.60767364501953
                },
                {
                    "id": "20",
                    "rating": {
                        "ambition": "13yrs",
                        "magnitude": "high",
                        "experience": "veryhigh",
                        "timestamp": 1616445531644,
                        "scope": "Conclusion",
                        "comment": "no comment yet",
                        "author": "system generated",
                        "object": {
                            "label": "Transformer-Based Language Models",
                            "category": "interfaceExperience"
                        }
                    },
                    "x": -167.39625549316406,
                    "y": 112.29374694824219
                },
                {
                    "id": "21",
                    "rating": {
                        "ambition": "now",
                        "magnitude": "veryhigh",
                        "experience": "veryhigh",
                        "timestamp": 1616445531644,
                        "scope": "Conclusion",
                        "comment": "no comment yet",
                        "author": "system generated",
                        "object": {
                            "label": "Cloud AI Developer Services",
                            "category": "productivityRevolution"
                        }
                    },
                    "x": 63.934173583984375,
                    "y": 114.29736328125
                },
                {
                    "id": "22",
                    "rating": {
                        "ambition": "36yrs",
                        "magnitude": "high",
                        "experience": "veryhigh",
                        "timestamp": 1616445531644,
                        "scope": "Conclusion",
                        "comment": "no comment yet",
                        "author": "system generated",
                        "object": {
                            "label": "Model Compression",
                            "category": "productivityRevolution"
                        }
                    },
                    "x": 280.3481750488281,
                    "y": 67.96969604492188
                },
                {
                    "id": "23",
                    "rating": {
                        "magnitude": "low",
                        "experience": "low",
                        "timestamp": 1616445531644,
                        "scope": "Conclusion",
                        "comment": "no comment yet",
                        "author": "system generated",
                        "object": {
                            "label": "",
                            "category": "interfaceExperience"
                        }
                    },
                    "x": -700.9317321777344,
                    "y": 542.3108825683594
                }
            ]
        }

    ],
    "templates": [

    ],
    "objects": {}
}


