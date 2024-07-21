import { log } from "../helpers/jUtils.js";
import { getItemFromDb } from "../helpers/helpers.js";
import { getEnhancedCollection } from "../db/dbutils.js";
import { traverseObject, replaceEncodedValue } from "../helpers/helpers.js";

function M2mMacros(db) {

    async function macroAggregation(collectionName, settings) {
        if (!collectionName || !settings?.aggregation) {
            log(`Bad call to macroAggregation - missing arguments`, "bgRed");
        }

        // Run the filter resolution code on each aggregation element.
        settings.aggregation.forEach((element,index) => {
            traverseObject(element, replaceEncodedValue);            
        });

        const collection = getEnhancedCollection(db, collectionName);

        const data = await collection.aggregate(settings.aggregation).toArray();
        return data;
    }

    return {
        macroAggregation,
    };
}

export default M2mMacros;