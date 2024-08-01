import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
import * as url from 'url';

const allAreBoolean = testVariables => {
  let foundNonBoolean = false;

  testVariables.every(testVariable => {
    if (typeof testVariable !== typeof true) {
      foundNonBoolean = true;
      return false; // Break the loop    
    }

    return true;
  })

  return !foundNonBoolean;
}

/**
 * Return an array of filenames in the targetPath
 * 
 * @param {*} targetPath 
 * @param {*} callingScriptPath 
 * @returns 
 */
const getFileNames = (targetPath, callingScriptPath) => {
  const directoryPath = path.join(getSystemConstants(callingScriptPath).__dirname, targetPath);
  return fs.readdirSync(directoryPath);
}

const getFormattedDate = (date, color = 'gray', forFilename = false) => {
    if (!date) {
        date = new Date();
    }

    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    if (forFilename) {
        return `${year}-${pad(month, 2, "0")}-${pad(day, 2, "0")} ${pad(hours, 2, '0')}_${pad(minutes, 2, '0')}`;
    }

    const formattedDate = `${year}/${pad(month, 2, "0")}/${pad(day, 2, "0")}`;
    const formattedTime = `${pad(hours, 2, "0")}:${pad(minutes, 2, "0")}:${pad(seconds, 2, "0")}`;

    const text = `${formattedDate} ${formattedTime}`
    return color ? chalk[color](text) : text;
}

/**
 * Serialize the object such that equivalent objects return the same string.
 * The empty object gives 'none'.
 * @param {*} obj 
 */
function getIdFromObject(obj) {
    if (!["object", "array", "string", "number", "boolean"].includes(typeof obj)) {
        return `__unsupported_type`;
    }

    if (typeof obj === 'boolean') {
        return `__boolean_${obj ? "true" : "false"}`;
    }

    if (typeof obj === 'string') {
        return `__string_${obj}`;
    }
    
    if (typeof obj === "number") {
        return `__number_${obj}`;
    }

    if (typeof obj === "object" && Object.keys(obj).length === 0) {
        return "__empty_object";
    }

    if (typeof obj === "array" && obj.length === 0) {
        return "__empty_array";
    }

    // Use ordered array of keys to ensure equivalent objects get the identical representation
    // though the order of their properties may differ.
    const sortedKeys = Object.keys(obj).sort();
    const stringified = `_${JSON.stringify(obj, sortedKeys)}`;
    const sanitized = stringified.replace(/[^A-Za-z0-9_]/g, "");

    return sanitized;
}

/**
 * Return the constants for the urlPath passed in
 * 
 * @param string urlPath 
 * @returns 
 */
const getSystemConstants = (urlPath) => {
  if (!urlPath) {
    return null;
  }

  // From https://blog.logrocket.com/alternatives-dirname-node-js-es-modules/
  return {
    __filename: url.fileURLToPath(urlPath),
    __dirname: url.fileURLToPath(new URL('.', urlPath)),  
  }
}

/**
 * Return the value that lies the specified percentage between value and altValue.
 * 
 * @param {*} value 
 * @param {*} altValue 
 * @param {*} percentage 
 */
const scale = (value, altValue, percentage, decimals = 0) => {
  const range = altValue - value;  
  const fullResult = value + (percentage * range);

  return parseFloat(fullResult.toFixed(decimals));
}

/**
 * Pad the front of a string.
 * @param   string    input 
 * @param   integer   targetLength 
 * @param   string    paddingCharacter 
 * @returns string
 */
const pad = (input, targetLength, paddingCharacter = ' ') => {
    if (!input) { 
      input = '' 
    };

    if (typeof(input) === 'number') {
        input = input.toString();
    }

    const repeats = Math.max(targetLength - input.length, 0);

    //Default to '0'
    if (!paddingCharacter) {
        paddingCharacter = '0';
    }

    return paddingCharacter.repeat(repeats) + input;
}

const log = (text, color = null, err) => {
  let styled;
  if (err) {
    styled = chalk.red(text ?? err.message);
    console.log(getFormattedDate() + ` ${styled}`, err);
  } else {
    styled = color ? chalk[color](text) : text;
    console.log(getFormattedDate() + ` ${styled}`);
  }  
}


const findByField = (field, value, arr, returnIndex = false) => {
  if (!field || !value || !arr) {
    return null;
  }

  let foundItem = null;
  let foundIndex = null;

  arr.every((item, index) => {
    if (item && (item[field] === value)) {
      foundItem = item;
      foundIndex = index;
      return false;
    }

    return true;
  })

  return returnIndex ? foundIndex : foundItem;
}

const findById = (id, arr) => {
  return findByField('id', id, arr);
}

function convertJavascriptToJson(jsString) {
    // Remove single line comments
    jsString = jsString.replace(/\/\/.*$/gm, "");

    // Remove multi-line comments
    jsString = jsString.replace(/\/\*[\s\S]*?\*\//g, "");

    // Remove trailing commas
    jsString = jsString.replace(/,(\s*[}\]])/g, "$1");

    // Add double quotes around keys
    jsString = jsString.replace(/([\{\s,])([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');

    return jsString;
}

function parseJSON(value) {
    let result;
    try {
        // First try parsing it straight.
        result = JSON.parse(value);
        return result;
    } catch (ex) {
        // Didn't work, attempt conversion.
    }

    try {
        // Try parsing it after converting it.
        result = JSON.parse(convertJavascriptToJson(value));
        return result;
    } catch (ex) {
        // Failed again - give up.
    }
}

// From SODA.
function arrayGet(jsonArray, key, defaultValue) {
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

function arraySet(jsonArray, key, value) {
    if (!jsonArray || !key) {
        return;
    }

    let data = jsonArray;
    const keyPath = key.split('.');

    while (keyPath.length > 1) {
        key = keyPath.shift();
        if (!data[key]) {
            data[key] = {}
        }
        data = data[key];
    }

    data[keyPath[0]] = value;
}

export {
    allAreBoolean,
    arrayGet,
    arraySet,
    findByField,
    findById,
    getFileNames,
    getFormattedDate,
    getIdFromObject,
    getSystemConstants,
    pad,
    parseJSON,
    log,
    scale,    
}

