
/**
 * This module processes requests from other APIs.
 */
import { log } from "../helpers/jUtils.js";
import { getItemFromDb } from "../helpers/helpers.js";
import {
    getEnhancedCollection,
} from "../db/dbutils.js";

const maxRecords = 1000;

function M2m(db) {
    async function processRequest(request) {
        let { clientId, connectionName, collectionName, sessionId, filter, orderBy, settings } = request;
        const requestRecord = await handleRequestMeta(request);

        const result = {
            data: {},
        };

        if (!collectionName) {
            result.error = "Collection Name is required.";
            return result;
        }

        if (!filter) {
            filter = {};
        }

        processFilterObject(filter, processFilterValue);

        if (!orderBy) {
            orderBy = {};
        }

        let recordsInfo;

        if (!settings.singleRecord) {
            recordsInfo = await retrieveMultiple(connectionName, collectionName, filter, orderBy, settings);
        } else {
            recordsInfo = await retrieveSingle(connectionName, collectionName, filter, orderBy, settings, requestRecord);
        }

        if (!recordsInfo) {
            result.error = "Unable to fulfill request.";
            return result;
        }

        result.data = recordsInfo.data;
        result.error = recordsInfo.error;
        // Return the (resolved) filter as well.
        result.filter = { ...filter }; 

        return result;
    }

    async function getLibraryInfo(collectionName, filter) {
        const collection = getEnhancedCollection(db, collectionName);
        const totalDocumentCount = await collection.countDocuments({});

        return {
            totalDocumentCount
        }
    }

    // Go through the filter and replace any encoded values, such as dates.
    function processFilterObject(filter, callback) {
        for (let key in filter) {
            if (typeof filter[key] === "object" && filter[key] !== null) {
                // Recursively search nested objects
                processFilterObject(filter[key], callback);
            } else if (typeof filter[key] === "string" && filter[key].startsWith("__")) {
                filter[key] = callback(filter[key]);
            }
        }
        console.log('Resolved Filter: ', filter);
    }

    function processFilterValue(value) {
        let result = value;

        const separatorIndex = value.indexOf("-");
        const keyword = value.substring(2, separatorIndex);
        const payload = value.substring(separatorIndex + 1);
        let parsedPayload;

        switch (keyword) {
            case "DATE":
                // The payload is time in milliseconds.
                // Example: '__DATE-1703785527694'
                result = new Date(parseInt(payload));
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

    async function retrieveMultiple(connectionName, collectionName, filter, orderBy, settings) {
        const result = {
            data: {},
        };

        const collection = getEnhancedCollection(db, collectionName);

        try {
            const records = await collection
                .find(filter)
                .sort(orderBy)
                .skip(settings?.skip ?? 0)
                .limit(settings?.limit ?? maxRecords)
                .toArray();

            // Add in the index
            records.forEach((record, index) => (record._index = settings?.skip + index));

            result.data = {
                count: records.length,
                records,
            };
        } catch (err) {
            console.log(err);
            result.error = err.message;
        }

        return result;
    }

    async function retrieveSingle(connectionName, collectionName, filter, orderBy, settings, requestRecord) {
        const result = {
            data: {},
        };

        try {
            const collection = getEnhancedCollection(db, collectionName);

            let algorithm;
            let records = [];
            let type = settings.singleRecord?.type;

            if (type === '__RANDOMIZED_PREORDERED') {
                algorithm = "__RANDOMIZED_PREORDERED";
                const item = await getItemFromDb(filter, collection);

                if (item) {
                    records = [item];
                }
            } else if (type === "__CURSOR_INDEX") {                
                algorithm = "__CURSOR_INDEX";
                let index = requestRecord?.cursorIndex;

                // Get a count to check if the index is valid.
                const recordsCount = await collection.countDocuments(filter);

                // Roll over if needed.
                if (index > recordsCount - 1 || index < 0) {
                    index = 0;

                    const resetSuccessful = await resetRequestCursor(requestRecord);
                    if (!resetSuccessful) {
                        log(`Failed to reset the cusor index for request: ${JSON.stringify(requestRecord)}`, "bgRed", true);
                    } else {
                        log(`Successfully reset request cursor for request: ${JSON.stringify(requestRecord)}`);
                    }
                }

                // Retrieve the target record.
                log(`Retrieving single record / __CURSOR_INDEX: ${requestRecord?.cursorIndex}, computed index: ${index}`);
                records = await collection.find(filter).sort(orderBy).skip(index).limit(1).toArray();

                result.data.index = index;
            } else {
                algorithm = "__INDEX";
                let index = parseInt(settings.singleRecord.index);

                // Get a count to check if the index is valid.
                const recordsCount = await collection.countDocuments(filter);

                // Roll over if needed.
                if (index > recordsCount - 1 || index < 0) {
                    index = 0;
                }

                // Retrieve the target record.
                records = await collection.find(filter).sort(orderBy).skip(index).limit(1).toArray();

                result.data.index = index;
            }

            result.data.algorithm = algorithm;
            result.data.records = records;
            result.data.count = records.count;

            log(`Retrieved single record (algorithm: ${algorithm}): ${JSON.stringify(records[0])}`);
        } catch (err) {
            console.log(err);
            result.error = err.message;
        }

        return result;
    }

    async function handleRequestMeta(request) {
        const { clientId, connectionName, collectionName, sessionId, filter, orderBy, settings } = request;
        if (!settings.singleRecord) {
            // Only need this for single record requests.
            return;
        }
        const fingerPrint = getRequestFingerPrint(request);
        const collection = getEnhancedCollection(db, 'dynforms');
        let record = await collection.findOne({
            fingerPrint
        });

        if (!record) {
            record = {
                fingerPrint,
                cursorIndex: 0,
                created_at: new Date(),
                updated_at: new Date(),
            }

            const result = await collection.insertOne(record);

            if (!result.insertedId) {
                log(`Failed to insert record into dynforms. Fingerprint: ${fingerPrint}`, 'bgRed');
            } else {
                log(`Added dynforms request record ${result.insertedId} with fingerprint: ${fingerPrint}`, "yellow");
                return record;
            }
        }
        const updated_at = new Date(record.updated_at);
        if (settings.singleRecord?.advance === 'daily') {
            if (!isToday(updated_at)) {
                log(`Daily request hasn't been received yet today - advancing index.`, 'yellow');
                record.cursorIndex++;
            } else {
                log(`Daily request has been received before (${updated_at.toLocaleTimeString()}), serving current index.`, "yellow");
            }
        } else {
            record.cursorIndex++;
        }
        
        record.updated_at = new Date();
        
        await collection.updateOne({_id: record._id}, record, null, []);
        return record;
    }

    async function resetRequestCursor(requestRecord) {
        if (!requestRecord) {
            return null;
        }

        requestRecord.cursorIndex = 0;
        requestRecord.updated_at = new Date();

        const collection = getEnhancedCollection(db, "dynforms");
        await collection.updateOne({ _id: requestRecord._id }, requestRecord, null, []);
        return requestRecord;
    }


    function isToday(date) {
        if (!date) {
            return false;
        }

        const today = new Date();

        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        );
    }; 

    function getRequestFingerPrint(request) {
        const { clientId, connectionName, collectionName, sessionId, filter, orderBy, settings } = request;
        return clientId;
    }

    return {
        processRequest,
        getLibraryInfo,
        resetRequestCursor,
    };
}

export default M2m;