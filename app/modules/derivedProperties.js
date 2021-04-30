export { calculateDerivedProperties, resetCache }
import { getDefaultSettingsBlip, getViewpoint, getObjectListOfOptions, publishRefreshRadar, getRatingListOfOptions, getData, createBlip, getRatingTypeForRatingTypeName, createRating } from './data.js'
import { getNestedPropertyValueFromObject } from './utils.js';

const calculateDerivedProperties = () => {
    // iterate over object types 
    if (getData().model?.objectTypes != null) {
        for (let i = 0; i < Object.keys(getData().model.objectTypes).length; i++) {
            const objectType = getData().model.objectTypes[Object.keys(getData().model.objectTypes)[i]];
            calculateDerivedPropertiesForObjectType(objectType);
        }
    }
    if (getData().model?.ratingTypes != null) {
        for (let i = 0; i < Object.keys(getData().model.ratingTypes).length; i++) {
            const ratingType = getData().model.ratingTypes[Object.keys(getData().model.ratingTypes)[i]];
            calculateDerivedPropertiesForRatingType(ratingType);
        }
    }
}

const calculateProperty = (property, entity, baseValue) => {
    // console.log(`calculate property ${property.name} from ${property.baseProperty} with values ${baseValue} using ${property.derivationFunction}   for ${entity.label}`)
    if (property.derivationFunction == null || !derivationFunctions.hasOwnProperty(property.derivationFunction)) return;
    entity[property.name] = derivationFunctions[property.derivationFunction].call(property, baseValue, property.derivationFunctionConfiguration)
}

const one_day_in_ms = 1000 * 60 * 60 * 24

const getMonthPlusYear = (timems) => {
    const date = new Date(timems)
    return `${date.getMonth() + 1}-${date.getFullYear()}`
}

const getDaysAgo = (timems) => {
    const numberOfDays = Math.round((Date.now() - timems) / one_day_in_ms)
    return numberOfDays
}

const valueMapsCache = new Map()

const resetCache = () => {
    valueMapsCache.clear()
}

//"derivationFunctionConfiguration": "[[adopt,production],[donot,deprecated],[*,*]",
const getMappedValue = (value, valueMapConfiguration) => {
    let mapElements = valueMapsCache.get(hashCode)
    if (mapElements == null) {

        mapElements = valueMapConfiguration.split("]")
            .map((element) => element.replaceAll("[", ""))  //     // remove all [ and leading , 
            .map((element) => element.substring(element.substring(0, 1) == ',' ? 1 : 0))
            .reduce((valueMap, element) => {
                const keyValue = element.split(',');
                if (keyValue[0] != null && keyValue[0].length > 0) {
                    valueMap.set(keyValue[0], keyValue[1]);
                }
                return valueMap
            }, new Map())
        valueMapsCache.set(hashCode, mapElements)
    }
    let result = null
    if (mapElements.has(value)) { result = mapElements.get(value) }
    else {
        if (mapElements.has("*")) {
            result = mapElements.get("*")
            if (result == "*") { result = value }
        }
    }
    return result
}


const derivationFunctions = {}
derivationFunctions['Month + Year from Time'] = getMonthPlusYear
//derivationFunctions['']= 
derivationFunctions['Days Ago from Time'] = getDaysAgo
derivationFunctions['Value Map (convert base property value)'] = getMappedValue


function calculateDerivedPropertiesForEntityType(entityType, objectOrRating) {
    const derivedProperties = Object.keys(entityType.properties)
        .filter((key) => entityType.properties[key].derived == true)
        .map((key) => entityType.properties[key]);
    if (derivedProperties.length > 0) {
        const entities = getData()[objectOrRating == "object" ? "objects" : "ratings"]
        Object.keys(entities)
            .filter((entityId) => entities[entityId][`${objectOrRating}Type`] == entityType.name
                || entities[entityId][`${objectOrRating}Type`].name == entityType.name)
            .map((entityId) => entities[entityId])
            .forEach((entity) => {
                derivedProperties.forEach((property) => {
                    calculateProperty(property, entity
                        , objectOrRating == "object" ? entity[property.baseProperty] : getNestedPropertyValueFromObject(entity, property.baseProperty));
                });
            });
    }
}

function calculateDerivedPropertiesForObjectType(objectType) {
    calculateDerivedPropertiesForEntityType(objectType, "object")
}

function calculateDerivedPropertiesForRatingType(ratingType) {
    calculateDerivedPropertiesForEntityType(ratingType, "rating")
}


const hashCode = function (s) {
    return s.split("").reduce(function (a, b) { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0);
}