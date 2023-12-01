import { ObjectId } from "mongodb";


function constructSearchFilter(search, fields) {
    if (!search || !fields) {
        return {};
    }
    
    const orQueries = [];

    fields.forEach(field => {
        if (!['subfield_array', 'boolean'].includes(field.type)) {
            orQueries.push({ [field.key] : { '$regex': search, '$options': 'i' }});            
        }
    })

    const filter = { '$or' : orQueries };
    
    return filter;
}

/**
 * Convert an array of strings of the form fieldName|desc and 
 * return an object that can be passed to the Mongo driver.
 * @param array queryItems 
 * @returns {}
 */
function getSortObjectFromQueryData(queryItems) {

    const columnsInfo = [];

    queryItems.forEach(queryItem => {
        if (queryItem) {
            const parts = queryItem.split('|');

            const columnInfo = {
                column: parts[0],
                desc: parts.length ? !!parts[1] : false,
            }

            columnsInfo.push(columnInfo);
        }
    })

    return constructSortObject(columnsInfo);
}

function constructSortObject(columns) {
    if (!Array.isArray(columns)) {
        return { _id: 1 };
    }

    const sortObject = {}

    columns.forEach(columnInfo => {
        const { column, desc } = columnInfo;

        if (column) {
            sortObject[column] = desc ? -1 : 1;
        }        
    });

    // Required: https://www.mongodb.com/docs/manual/reference/method/cursor.skip/#using-skip---with-sort--
    sortObject['_id'] = 1;

    return sortObject;
}

function constructUpdate(doc) {
    delete doc._id;
    delete doc.created_at;
    delete doc.updated_at;
    
    const update = {};

    Object.keys(doc).forEach(key => {
        update[key] = doc[key];
    })

    update.updated_at = new Date();
    
    return { '$set': update };
}

/**
 * Returns a collection with enhanced functionality.
 */
function getEnhancedCollection(db, collectionName) {
    const collection = db.collection(collectionName);
    
    collection._insertMany = collection.insertMany;
    collection._insertOne = collection.insertOne;
    collection._updateOne = collection.updateOne;

    /**
     * Insert many with created_at/updated_at fields. Will test for unique with
     * the optionally supplied field key(s).
     */
    collection.insertMany = async (docs, options, uniqueKeys) => {
        const now = new Date();
        docs.forEach(doc => {
            doc.created_at = now;
            doc.updated_at = now;    
        })

        if (uniqueKeys && Array.isArray(uniqueKeys)) {
            // Insert them one by one when unique fieldKey(s) were supplied.
            let promises = [];
            docs.forEach(async doc => promises.push(collection.insertOne(doc, options, uniqueKeys)));

            const results = await Promise.all(promises);

            let insertedCount = 0;
            results.forEach(inserted => inserted && insertedCount++);

            return insertedCount;
        } else {
            return await collection._insertMany(docs, options);
        }        
    }

    /**
     * Insert one with created_at/updated_at fields. Will test for unique with
     * the optionally supplied field key(s).
     */
    collection.insertOne = async (doc, options, uniqueKeys, fields) => {        
        applyFieldsFilter(doc, fields);

        const now = new Date();
        doc.created_at = now;
        doc.updated_at = now;
        
        if (Array.isArray(uniqueKeys)) {
            const records = await collection.find(constructUniqueTestFilter(uniqueKeys, doc)).toArray();
            if (!records.length) {
                try {
                    return await collection._insertOne(doc);
                } catch {
                    return false;
                }
                
            } else {
                return false;
            }            
        } else {
            return await collection._insertOne(doc);
        }
    }

    collection.updateOne = async (filter, doc, uniqueKeys, fields) => {
        applyFieldsFilter(doc, fields);
        
        const update = constructUpdate(doc);
        return await collection._updateOne(filter, update);
    }

    return collection;
}

function constructUniqueTestFilter(uniqueKeys, doc) {
    const filter = {};
    if (Array.isArray(uniqueKeys)) {
        uniqueKeys.forEach(fieldKey => {
            filter[fieldKey] = doc[fieldKey];
        })
    }

    return filter;
}

function applyFieldsFilter(doc, fields) {
    fields.forEach(field => {
        const value = doc[field.key];
        
        switch (field.type) {
            case 'boolean':                
                doc[field.key] = !!value;
                break;

            case 'number':
                doc[field.key] = parseInt(value);
                break;

            case 'date':
                const date = new Date(value);
                doc[field.key] = date;
                break;
            
            case 'birthday':                
                const {year, month, day} = getDateComponents(value);
                if (year && month && day) {
                    // Have a full valid date; store additionally as an actual date
                    const yyyymmdd = `${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
                    const mmdd = `${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
                    doc[field.key + "_date"] = new Date(value);
                    doc[field.key + "_MMDD"] = mmdd;
                    doc[field.key] = yyyymmdd;  
                } else if (month && day) {
                    // Have partial date, store as MM-DD
                    const mmdd = `${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
                    doc[field.key + "_date"] = null;
                    doc[field.key + "_MMDD"] = mmdd;
                    doc[field.key] = '????-' + mmdd;                    
                } else {
                    // Invalid data given. Reset fields.
                    doc[field.key] = null;
                    doc[field.key + "_date"] = null;
                    doc[field.key + "_MMDD"] = null;
                }

                break;

        }

        console.log(`${field.key} -> ${field.type}: ${value} -> ${doc[field.key]}`)
    })
}

// Expecting something like Y-M-D
function isFullDateString(value) {
    const { year, month, day } = getDateComponents(value);

    if (!(year && month && day)) {
        return false;
    }

    return true;
}

// Expecting something like M-D
function isPartialDateString(value) {
    const { month, day } = getDateComponents(value);

    if (!(month && day)) {
        return false;
    }

    return true;
}

function getDateComponents(value, assumedCentury = 20) {    
    const components = {};

    if (typeof value !== 'string') {
        return components
    }

    // Split by non-alphanumeric characters to see if we get 3 parts.
    const parts = value.split(/[^a-zA-Z0-9?]+/);

    let year = null;
    let month = null;
    let day = null;;

    if (parts.length === 3) {
        // Assume Y-M-D
        year = parseInt(parts[0]);
        month = parseInt(parts[1]);
        day = parseInt(parts[2]);
    }

    if (parts.length === 2) {
        // Assume M-D
        month = parseInt(parts[0]);
        day = parseInt(parts[1]);
    }

    if (year !== null && year > 0 && year < 9999) {

        if (year < 100) {
            year += (assumedCentury - 1) * 100;
        }
        components.year = year;
    }

    if (month !== null && month > 0 && month < 13) {
        components.month = month;
    }

    if (day !== null && day > 0 && day < 32) {
        components.day = day;
    }
    console.log('Components: ', components)
    return components;
}

export {
    constructSearchFilter,
    constructSortObject,
    getEnhancedCollection,
    getSortObjectFromQueryData,
}