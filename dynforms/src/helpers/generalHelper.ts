// Go through the object and run the callback on each field.
function traverseObject(obj, callback) {
    for (let key in obj) {
        if (typeof obj[key] === "object" && obj[key] !== null) {
            // Recursively search nested objects
            traverseObject(obj[key], callback);
        } else if (typeof obj[key] === "string") {
            obj[key] = callback(key, obj[key]);
        }
    }
}

// From SODA.
function arrayGet(jsonArray: any, key: string, defaultValue: any) {
    if (!jsonArray || !key) {
        return defaultValue;
    }

    let selectedItem = jsonArray;
    let convertedKey = key.replace(/\[(\S+?)\]/g, ".$1");
    let keys = convertedKey.split(".");

    // Go through the array and find the key, if not found pass back the default value
    let arrayLength = keys.length;
    for (let i = 0; i < arrayLength; i++) {
        let selectedKey = keys[i];

        if (
            selectedItem !== null &&
            typeof selectedItem !== "undefined" &&
            typeof selectedItem === "object" &&
            selectedKey in selectedItem
        ) {
            selectedItem = selectedItem[selectedKey];
        } else if (
            selectedItem !== null &&
            typeof selectedItem !== "undefined" &&
            Array.isArray(selectedItem) &&
            !isNaN(selectedKey) &&
            parseInt(selectedKey) < selectedItem.length
        ) {
            selectedItem = selectedItem[parseInt(selectedKey)];
        } else {
            return defaultValue;
        }
    }

    return selectedItem;
}

function arraySet(jsonArray: any, key: string, value: any) {
    if (!jsonArray || !key) {
        return;
    }

    let data = jsonArray;
    const keyPath = key.split(".");

    while (keyPath.length > 1) {
        key = keyPath.shift();
        if (!data[key]) {
            data[key] = {};
        }
        data = data[key];
    }

    data[keyPath[0]] = value;
}

export { arrayGet, arraySet, traverseObject };