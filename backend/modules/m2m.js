
/**
 * This module processes requests from other APIs.
 */

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


    return {
        processRequest
    }
}

export default M2m;