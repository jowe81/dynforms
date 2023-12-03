
/**
 * This module processes requests from other APIs.
 */
import { log } from "../helpers/jUtils.js";

import { ObjectId } from "mongodb";
import {
    constructSearchFilter,
    getSortObjectFromQueryData,
    getEnhancedCollection,
} from "../db/dbutils.js";

const maxRecords = 1000;

function M2m(db) {

    async function processRequest(request) {
        let {
            connectionName,
            collectionName,
            sessionId,
            filter,
            orderBy,
            settings,
        } = request;

        const result = {
            data: {},            
        }

        if (!collectionName) {
            result.error = 'Collection Name is required.'
            return result;
        }

        if (!filter) {
            filter = {};
        }

        if (!orderBy) {
            orderBy = {};
        }

        let recordsInfo;

        if (!settings.singleRecord) {
            recordsInfo = await retrieveMultiple(connectionName, collectionName, filter, orderBy, settings);
        } else {
            recordsInfo = await retrieveSingle(connectionName, collectionName, filter, orderBy, settings);
        }

        if (!recordsInfo) {
            result.error = 'Unable to fulfill request.';
            return result;
        }

        result.data = recordsInfo.data;
        result.error = recordsInfo.error;

        return result;
    }

    async function retrieveMultiple(connectionName, collectionName, filter, orderBy, settings) {
        const result = {
            data: {},            
        }

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

    async function retrieveSingle(
        connectionName,
        collectionName,
        filter,
        orderBy,
        settings
    ) {
        const result = {
            data: {},
        };

        
        try {
            const collection = getEnhancedCollection(db, collectionName);

            let index = parseInt(settings.singleRecord.index);

            // Get a count to check if the index is valid.
            const recordsCount = await collection.countDocuments(filter);            

            // Roll over if needed.
            if (index > recordsCount - 1 || index < 0) {
                index = 0;
            }
            
            // Retrieve the target record.
            const records = await collection
                .find(filter)
                .sort(orderBy)
                .skip(index)
                .limit(1)
                .toArray();

            result.data = {
                count: records.length,
                index,
                records,
            };

            log(`Retrieved single record (index: ${index}): ${JSON.stringify(records[0])}`);

        } catch (err) {
            console.log(err);
            result.error = err.message;
        }

        return result;
    }

    return {
        processRequest
    }
}

export default M2m;