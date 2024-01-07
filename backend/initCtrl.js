import dotenv from "dotenv";
dotenv.config();

// Project files
import mongoConnect from "./db/mongodb.js";
import { log } from "./helpers/jUtils.js";
import { getEnhancedCollection } from "./db/dbutils.js";
import { getBlankCtrlField } from "./helpers/helpers.js";

if (process.argv.length <= 2) {
    log(`Required arguments: collectionName, optional argument: overwrite`);
    process.exit();
}

const collectionName = process.argv[2];
const overwrite = !!process.argv[3];

mongoConnect()
    .then(async (db) => {
        log("Connected to database. [CTRL+C to end this script]");

        const collection = getEnhancedCollection(db, collectionName);

        const docs = await collection.find({}).toArray();

        docs.forEach(async (doc) => {
            const ctrlFieldExists = Object.keys(doc).includes('__ctrl');
            const overwriteThisDoc = overwrite && ctrlFieldExists;
            if (ctrlFieldExists && !overwriteThisDoc) {
                log(`Doc ${doc._id} - already initialized, skipping`);
                return;                
            } else {
                const __ctrl = getBlankCtrlField();
                const action = overwriteThisDoc ? `overwrote` : `added`;

                const result = await collection._updateOne({_id: doc._id}, { $set: { __ctrl } });
                if (result.acknowledged && result.modifiedCount === 1) {
                    log(`Doc ${doc._id} - ${action} __ctrl field: ${JSON.stringify(__ctrl)}`);
                } else {
                    log(`Doc ${doc._id} - something went wrong; unable to write to db.`, 'red');
                }
                
            }
        })        
    })
    .catch((err) => {
        log(`Unable to connect to database. Exiting.`, null, err);
    });
