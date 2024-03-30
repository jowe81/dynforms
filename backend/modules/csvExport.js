import formTypes from "../formTypes.js";
import { getEnhancedCollection } from "../db/dbutils.js";
import { getFormattedDate } from "../helpers/jUtils.js";

async function getCsvDataFromCollection(db, collectionName, orderBy) {
    const collection = getEnhancedCollection(db, collectionName);

    if (!collection) {
        res.json({ success: false, error: `Could not get collection ${collectionName}.` });
    }

    const formDefinition = formTypes.find((item) => item.collectionName === collectionName);
    if (!formDefinition?.allowExport) {
        return null;
    }

    formDefinition.fields?.sort((a, b) => (a.rank > b.rank ? 1 : -1));

    const displayFields = getCsvDisplayFields(formDefinition.fields);
    const sortObj = getSortObjectForMongo(displayFields, orderBy);

    const records = await collection.find({}).sort(sortObj).toArray();

    if (formDefinition) {
        const fields = formDefinition.fields;

        if (fields) {
            const csvData = getCsvDataFromRecords(records, fields, orderBy);
            return csvData;
        }
    }

    return null;
}


function getCsvDisplayFields(fields) {
    if (!Array.isArray(fields)) {
        return;
    }

    return fields.filter(
        (field) => field.export !== false && field.display !== false && field.displayInTable !== false
    );
}

function getSortObjectForMongo(displayFields, orderBy) {
    const displayFieldKeys = displayFields.map((field) => field.key);

    let sortObj = {};

    if (orderBy) {
        const orderByInfoFromQuery = orderBy.split(",");
        
        orderByInfoFromQuery.forEach(info => {
            const parts = info.split('|');

            // Get the key and the sorting direction
            const fieldKey = parts[0];            

            if (!displayFieldKeys.includes(fieldKey)) {
                return;
            }

            let direction = 1;
            if (parts.length > 1 && parts[1].toLowerCase() === "desc") {
                direction = -1;
            }
            
            sortObj[fieldKey] = direction;            
        })        
    } else {
        // Default.
        sortObj = { created_at: -1 };
    }

    return sortObj;
}

function getCsvDataFromRecords(records, fields, orderBy) {
    const displayFields = getCsvDisplayFields(fields);
    
    const csv = records.map((record) => {
        const values = displayFields.map((field) => {
            let value = record[field.key] ?? '';
            
            switch (field.type) {
                case "subfieldArray":
                    if (!Array.isArray(field.fields)) {
                        value = ``;
                        break;
                    }
                    if (Array.isArray(value) && value.length) {
                        const itemValues = value.map((item) => {
                            const trimmedItem = removeEmptyKeys(item);
                            let str = "";
                            for (let key in trimmedItem) {
                                const subfield = field.fields.find((field) => field.key === key);                                
                                str += `\n${subfield.label}: ${renderFlatValue(subfield.type, trimmedItem[key], true)}`;
                            }
                            return str;
                        });

                        value = '"' + itemValues.join("\n") + '"';
                    }
                    break;

                case "date":
                case "number":
                case "boolean":
                default:
                    value = renderFlatValue(field.type, value);
                    break;
            }

            return value;
        });

        const line = values.join(',');
        return line;
    });

    return getCsvHeaderRow(displayFields) + csv.join("\r\n");
}

function getCsvHeaderRow(fields) {
    return fields.map((field) => field.label).join(",") + "\r\n";
}

function renderFlatValue(type, inputValue, omitQuotes) {    
    switch (type) {
        case "date":
            return getFormattedDate(new Date(inputValue), null);

        case "number":
            return isNaN(inputValue) ? `` : inputValue;

        case "boolean":
            return inputValue ? "true" : "false";

        default:            
            if (![null, undefined].includes(typeof inputValue)) {
                if (!inputValue) {
                    return '';
                }
                const escapedInputValue = typeof inputValue === "string" ? escapeDoubleQuotes(inputValue) : "";
                return omitQuotes ? escapedInputValue : `"${escapedInputValue}"`;
            } else {
                return `NA`;
            }
    }
}

function escapeDoubleQuotes(str) {
    return str.replace(/"/g, '""');
}

function removeEmptyKeys(obj) {
    const copy = {...obj};
    for (let key in copy) {
        if (!copy[key]) {
            delete copy[key];
        }
    }

    return copy;
}

export { 
    getCsvDataFromCollection 
};