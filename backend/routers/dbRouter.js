import { log } from "../helpers/jUtils.js";
import { storeUpdateRecord } from "../db/mongodb.js";
import { ObjectId } from "mongodb";
import {
    constructSearchFilter,
    getSortObjectFromQueryData,
    getEnhancedCollection,
} from "../db/dbutils.js";
import formTypes from "../formTypes.js";
import M2m from "../modules/m2m.js";

const initRouter = (express, db) => {

    // Initialize data processor for API-2-API requests.
    const m2m = M2m(db);

    const castId = (obj) => (obj._id = obj._id ? new ObjectId(obj._id) : null);
    const logError = (err) => log(`Error: ${err.message}`);

    const dbRouter = express.Router();

    dbRouter.use((err, req, res, next) => {
        logError(err);
        res.status(500).send(err);
        next(err);
    });

    dbRouter.use((req, res, next) => {
        log(`/post/dbRouter${req.url}`);
        next();
    });

    dbRouter.get("/formtypes", async (rec, res) => {
        res.json(formTypes);
    });

    dbRouter.get("/pageCount/:collectionName", async (req, res) => {
        const { collectionName } = req.params;
        const { search, itemsPerPage } = req.query;
        const searchFilter = constructSearchFilter(search, formTypes[2].fields);

        const collection = getEnhancedCollection(db, collectionName);
        try {
            const recordsCount = await collection.find(searchFilter).count();

            const pageCount = itemsPerPage
                ? Math.ceil(recordsCount / itemsPerPage)
                : 1;

            res.json({ collectionName, pageCount, recordsCount });
        } catch (err) {
            logError(err);
            res.status(500).send();
        }
    });

    dbRouter.get("/records/:collectionName", async (req, res) => {
        const { collectionName } = req.params;
        let { search, sortCol1, sortCol2 } = req.query;
        const itemsPerPage = parseInt(req.query.itemsPerPage);
        const page = parseInt(req.query.page) || 1;
        const skip = Math.max((page - 1) * itemsPerPage, 0);

        const formDefinition = formTypes.find(
            (formDefinition) => formDefinition.collectionName === collectionName
        );

        const searchFilter = constructSearchFilter(
            search,
            formDefinition.fields
        );

        const sortObject = getSortObjectFromQueryData([sortCol1, sortCol2]);

        const collection = getEnhancedCollection(db, collectionName);
        try {
            const recordsCount = await collection.find().count();
            const pageCount = itemsPerPage
                ? Math.ceil(recordsCount / itemsPerPage)
                : 1;
            const records = await collection
                .find(searchFilter)
                .sort(sortObject)
                .skip(skip)
                .limit(itemsPerPage)
                .toArray();

            // Add in the index
            records.forEach((record, index) => (record._index = skip + index));

            const data = {
                table: {
                    collectionName,
                    currentPage: page,
                    pageCount,
                    recordsCount,
                    itemsPerPage,
                },
                records,
            };

            res.json(data);
        } catch (err) {
            logError(err);
            res.status(500).send();
        }
    });

    dbRouter.delete("/records/:collectionName/:_id", async (req, res) => {
        castId(req.params);

        const { collectionName, _id } = req.params;
        log(`Delete: ${collectionName} ${_id}`);

        const collection = getEnhancedCollection(db, collectionName);
        try {
            const result = await collection.deleteOne({ _id });
            res.json(result);
        } catch (err) {
            logError(err);
            res.status(500).send();
        }
    });

    dbRouter.post("/post/:collectionName", async (req, res) => {
        const { collectionName } = req.params;
        const collection = getEnhancedCollection(db, collectionName);

        const formDefinition = formTypes.find(
            (formDefinition) => formDefinition.collectionName === collectionName
        );
        const fields = formDefinition?.fields;

        if (!fields) {
            return res.status(500).send();
        }

        const record = req.body;
        castId(record);

        try {
            const result = (await record._id)
                ? collection.updateOne(
                      { _id: record._id },
                      record,
                      null,
                      fields
                  )
                : collection.insertOne(record, null, null, fields);
            res.json(result);
        } catch (err) {
            logError(err);
            res.status(500).send();
        }
    });

    /**
     * This endpoint is for machine use, e.g. the jj-auto backend.
     */
    dbRouter.post("/m2m/pull/:collectionName", async (req, res) => {
        const { collectionName } = req.params;
        const {
            sessionId,  // Optional session identifier
            filter,     // Optional Mongo query filter
            settings,   // Optional settings (.e.g 'random')
        } = req.body;

        const processingResult = await m2m.processRequest({
            collectionName,
            sessionId,
            filter,
            settings,
        });

        const success = !processingResult.error;
        const data = processingResult.data;

        const result = {
            collectionName,
            sessionId,
            filter,
            settings,
            success,
            data,
        };

        res.json(result);
    });

    return dbRouter;
};

export default initRouter;
