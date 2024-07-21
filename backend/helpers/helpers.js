import { getIdFromObject, log } from './jUtils.js';
import constants from '../constants.js';

async function getItemFromDb(filter, collection) {
    const filterId = getIdFromObject(filter);

    // Pick one of the random numbers on each record to sort by
    const randomKey = getRandomNumber(1, constants.randomNumbersForCtrlData);
    // Pick a direction randomly as well
    const randomSortDirection = Math.random() > 0.5 ? 1 : -1;

    const filterIdPropertyName = `__ctrl.views.${filterId}`;
    const randomNoPropertyName = `__ctrl.random.${randomKey}`;

    const sort = {
        // Sort by view counts for this filter (always ascending)
        [filterIdPropertyName]: 1,
        // Sort by the selected random number
        [randomNoPropertyName]: randomSortDirection,
    };
    log(`Querying: ${JSON.stringify(filter)}, sort ${JSON.stringify(sort)}`);
    const items = await collection.find(filter).sort(sort).limit(1).toArray();
    const item = items.length ? items[0] : null;

    // Got the item, now update the views metadata.
    if (item) {
        const __ctrl = item.__ctrl;

        if (__ctrl) {
            // Update the views for this filter
            const filterViews = __ctrl.views[filterId] ?? 0;
            __ctrl.views[filterId] = filterViews + 1;

            // Update the total views
            const totalViews = __ctrl.totalViews ?? 0;
            __ctrl.totalViews = totalViews + 1;
            __ctrl.lastView = new Date();
        
            await collection._updateOne(
                { _id: item._id },
                { $set: { __ctrl } }
            );
        }
    }

    return item;
}

function getBlankCtrlField() {    
    return {
        totalViews: 0,
        lastView: null,
        views: {},
        random: getRandomNumbers(constants.randomNumbersForCtrlData),
    };
}

function getRandomNumbers(n) {
    const random = {};

    for (let i = 0; i < n; i++) {
        random[i] = Math.random();        
    }

    return random;
}

function getRandomNumber(n, m) {
    if (!n || !m) {
        return 0;
    }

    const randomNumber = n + Math.random() * (m - n);
    return Math.round(randomNumber);
}

// Go through the object and run the callback on each field.
function traverseObject(obj, callback) {
    for (let key in obj) {
        if (typeof obj[key] === "object" && obj[key] !== null) {
            // Recursively search nested objects
            traverseObject(obj[key], callback);
        } else if (typeof obj[key] === "string" && obj[key].startsWith("__")) {
            obj[key] = callback(obj[key]);
        }
    }
}

// Replace any encoded values, such as dates.
function replaceEncodedValue(value) {
    let result = value;
    const separatorIndex = value.indexOf("-");    
    const keyword = value.substring(2, separatorIndex !== -1 ? separatorIndex : undefined);
    const payload = value.substring(separatorIndex + 1);
    let parsedPayload;
    let date;

    switch (keyword) {
        case "DATE":
            // The payload is time in milliseconds.
            // Example: '__DATE-1703785527694'
            result = new Date(parseInt(payload));
            break;

        case "DATE_DAYS_AGO":
            date = new Date();
            date.setDate(date.getDate() - parseInt(payload));
            result = date;
            break;

        case "DATE_CURRENT_YEAR_START":
            date = new Date();
            date.setMonth(0); // Set the month to January (0-indexed)
            date.setDate(1); // Set the day to the 1st
            date.setHours(0, 0, 0, 0); // Set hours, minutes, seconds, and milliseconds to 0
            result = date;
            break;

        case "ARRAY_INCLUDES_ITEM":
            // The payload is a json stringified string.
            // Example: '__ARRAY_INCLUDES_ITEM-"favorites"'
            parsedPayload = JSON.parse(payload);
            result = { $elemMatch: { $eq: parsedPayload } };
            break;

        case "ARRAY_INCLUDES_ARRAY_AND":
            // The payload is a json stringified array.
            // Example: '__ARRAY_INCLUDES_ARRAY_AND-
            parsedPayload = JSON.parse(payload);
            result = { $elemMatch: { $all: parsedPayload } };
            break;

        case "ARRAY_INCLUDES_ARRAY_OR":
            // The payload is a json stringified array.
            // Example: '__ARRAY_INCLUDES_ARRAY_AND-
            parsedPayload = JSON.parse(payload);
            result = { $elemMatch: { $in: parsedPayload } };
            break;
    }
    return result;
}


export {
    getBlankCtrlField,
    getItemFromDb,
    traverseObject,
    replaceEncodedValue
}