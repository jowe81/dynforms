import formTypes from "../formTypes.js";
import { getEnhancedCollection } from "../db/dbutils.js";
import { getFormattedDate } from "../helpers/jUtils.js";

async function getCsvDataFromCollection(db, collectionName, orderBy) {
    const collection = getEnhancedCollection(db, collectionName);

    if (!collection) {
        res.json({ success: false, error: `Could not get collection ${collectionName}.` });
    }

    const formDefinition = formTypes.find((item) => item.collectionName === collectionName);
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
            let value = record[field.key];

            switch (field.type) {
                case "date":
                    value = getFormattedDate(new Date(value), null);
                    break;

                case "number":
                    if (isNaN(value)) {
                        value = ``;
                    }
                    break;


                default:
                    if (![null, undefined].includes(typeof value)) {
                        
                        value = `"${value}"`;
                    } else {
                        value = `NA`;
                    }
                    
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

export { 
    getCsvDataFromCollection 
};