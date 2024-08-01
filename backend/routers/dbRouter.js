import { getFormattedDate, log } from "../helpers/jUtils.js";
import {
    getBlankCtrlField,
    getItemFromDb,
    traverseObject,
    replaceEncodedValue,
    getChangedDataForHistory,
} from "../helpers/helpers.js";

import { getCsvDataFromCollection } from "../modules/csvExport.js";
import { ObjectId } from "mongodb";
import ip from "ip";

import {
    constructSearchFilter,
    getSortObjectFromQueryData,
    getEnhancedCollection,
} from "../db/dbutils.js";
import { validateRecordData } from "../helpers/backendValidationHelper.js";
import { loadFormTypesFromDb } from "../formTypes.js";
import M2m from "../modules/m2m.js";

const initRouter = (express, db) => {

    // Initialize data processor for API-2-API requests.
    const m2m = M2m(db);

    const castId = (obj) => (obj._id = obj._id ? new ObjectId(obj._id) : null);
    const logError = (err) => log(`Error: ${err.message}`);

    const cache = {
        lastUsedFilter: {},
    };

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

    dbRouter.get("/formtypes", checkLocalNetwork, async (req, res) => {
        const remoteIp = req.ip.includes("::ffff:")
            ? req.ip.split(":").pop()
            : req.ip;

        const formTypes = await loadFormTypesFromDb(db);        
        const formTypesFiltered = filterFormTypes(remoteIp, formTypes);
        log(`Returning the following form definitions to ${remoteIp} (${formTypesFiltered.length}/${formTypes.length}): ${JSON.stringify(formTypesFiltered.map(item => item.collectionName))}`);
        res.json(formTypesFiltered);
    });

    dbRouter.post(`/getItem`, checkLocalNetwork, async (req, res) => {
        const filter = req.body.filter ?? {};
        const collectionName = req.query.collectionName;

        if (!collectionName) {
            res.json({success: false, error: "syntax: ?collectionName="});
        }

        const collection = getEnhancedCollection(db, collectionName);

        if (!collection) {
            res.json({success: false, error: `Could not get collection ${collectionName}.`});
        }

        const item = await getItemFromDb(filter, collection);
        const success = !!item;

        res.json({ success, item });
    })

    function filterFormTypes(remoteIp, formTypes) {
        const { PUBLIC_COLLECTIONS, ADMIN_CLIENT } = process.env;
        const publicCollectionNames = PUBLIC_COLLECTIONS ? PUBLIC_COLLECTIONS.split(',') : [];

        if (remoteIp && ADMIN_CLIENT && remoteIp === ADMIN_CLIENT) {
            return formTypes;
        }

        return formTypes.filter(formDefinition => publicCollectionNames.includes(formDefinition.collectionName));
    }

    dbRouter.get("/pageCount/:collectionName", checkLocalNetwork, async (req, res) => {
        const { collectionName } = req.params;
        const { search, itemsPerPage } = req.query;
        const searchFilter = constructSearchFilter(search, formTypes[2].fields);

        const collection = getEnhancedCollection(db, collectionName);
        try {
            const recordsCount = await collection.countDocuments(searchFilter);

            const pageCount = itemsPerPage
                ? Math.ceil(recordsCount / itemsPerPage)
                : 1;

            res.json({ collectionName, pageCount, recordsCount });
        } catch (err) {
            logError(err);
            res.status(500).send();
        }
    });

    dbRouter.get("/records/:collectionName", checkLocalNetwork, async (req, res) => {
        const { collectionName } = req.params;
        let { search, sortCol1, sortCol2 } = req.query;
        const itemsPerPage = parseInt(req.query.itemsPerPage);
        const page = parseInt(req.query.page) || 1;
        const skip = Math.max((page - 1) * itemsPerPage, 0);
        
        const formTypes = await loadFormTypesFromDb(db);

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
            const recordsCount = await collection.countDocuments();
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

    dbRouter.delete("/records/:collectionName/:_id", checkLocalNetwork, async (req, res) => {
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

    dbRouter.post("/post/:collectionName", checkLocalNetwork, async (req, res) => {
        const { collectionName } = req.params;
        const collection = getEnhancedCollection(db, collectionName);
        const createCtrlField = !!req.query.ctrl;        
        const formTypes = await loadFormTypesFromDb(db);        
        const formDefinition = formTypes.find(
            (formDefinition) => formDefinition.collectionName === collectionName
        );
        const fields = formDefinition?.fields;

        if (!fields) {
            return res.status(500).send();
        }

        const record = req.body;
        traverseObject(record, replaceEncodedValue);

        const validationErrors = validateRecordData(formDefinition, record);
        if (validationErrors.length) {
            log(`${validationErrors.length} validation errors: ${JSON.stringify(validationErrors)}`, "red");
            return res.status(400).json({ error: "validation_errors", validationErrors });
        }

        // Discard any old indexes that may have come back from the frontend.
        if (record.hasOwnProperty('_index')) {
            delete record._index;
        }

        // Discard history that may have come back from the frontend - we'll read it off the source instead.
        if (record.hasOwnProperty('__history')) {
            delete record.__history;
        }

        if (createCtrlField) {
            // Add meta
            record.__ctrl = getBlankCtrlField();
        }

        castId(record);

        try {
            let result;

            if (record._id) {
                // Update.
                const storedRecord = await collection.findOne({ _id: record._id });
                
                let updatingUser = null;
                if (record.__user) {
                    updatingUser = record.__user;
                    delete record.__user;
                }

                const updatedRecord = storedRecord ? { ...storedRecord, ...record } : { ...record };

                if (formDefinition.historyEnabled) {
                    // Add in history info.
                    if (!updatedRecord.__history) {
                        updatedRecord.__history = [];
                    }

                    updatedRecord.__history.push({
                        user: updatingUser,
                        updated_at: new Date(),
                        data: getChangedDataForHistory(storedRecord, record),
                    });
                }

                await collection.updateOne({ _id: record._id }, updatedRecord, null, fields);
            } else {
                result = await collection.insertOne(record, null, null, fields);
            }

            res.json(result);
        } catch (err) {
            logError(err);
            res.status(500).send();
        }
    });

    dbRouter.post('/m2m/deleteById', checkLocalNetwork, async(req, res) => {
        const { connectionName, collectionName, recordId } = req.body;
        log(`Delete by id request for: ${collectionName}, ${recordId}`);
        
        const collection = getEnhancedCollection(db, collectionName);
        const result = await collection.deleteOne({_id: new ObjectId(recordId)});

        res.json(result);
    });

    dbRouter.post('/m2m/push', checkLocalNetwork, async (req, res) => {
        let { connectionName, collectionName, record, clientId } = req.body;
        if (!clientId) {
            clientId = 'default';
        }
        const createCtrlField = !!req.query.ctrl;
        
        log(`Push request for: ${collectionName}, clientId: ${clientId} `);
        const collection = getEnhancedCollection(db, collectionName);
        const update = record._id ? true : false;
        
        castId(record);
        traverseObject(record, replaceEncodedValue);

        let result;
        
        try {
            const now = new Date();
            
            if (update) {
                record.updated_at = new Date();
                result = await collection._updateOne({ _id: record._id }, { $set: { ...record }});
            } else {
                // Add meta
                if (createCtrlField) {
                     record.__ctrl = getBlankCtrlField();
                }
                record.created_at = now;
                record.updated_at = now;
                result = await collection._insertOne(record);
            }

            const response = {
                success: true,
                collectionName,
                data: { 
                    records: [record],
                    libraryInfo: await m2m.getLibraryInfo(collectionName, cache.lastUsedFilter[clientId]),
                },
                filter: cache.lastUsedFilter[clientId],
            };
            log(`Returning: ${JSON.stringify(response)}`);
            res.json(response);
        } catch (err) {
            logError(err);
            res.status(500).send();
        }
    });

    /**
     * This endpoint is for machine use, e.g. the jj-auto backend.
     */
    dbRouter.post("/m2m/pull", checkLocalNetwork, async (req, res) => {
        let {
            clientId,       // Identifier identifying the app/client who is issueing the request
            connectionName, // Optional target database (use default if undefined)
            collectionName, // Target collection
            sessionId,      // Optional session identifier
            filter,         // Optional Mongo query filter
            orderBy,        // Optional sort filter
            settings,       // Optional settings (.e.g 'random')
        } = req.body;

        if (!filter) {
            filter = {};
        }

        if (!orderBy) {
            orderBy = {};
        }

        if (!connectionName) {
            connectionName = 'dynforms';
        }

        if (!clientId) {
            clientId = "default";
        }

        log(`Processing request for client ${clientId}, collection ${collectionName}, query: ${JSON.stringify(req.query)}, settings: ${JSON.stringify(settings)}, filter: ${JSON.stringify(filter)}, orderBy: ${JSON.stringify(orderBy)}.`);        

        const processingResult = await m2m.processRequest({
            clientId,
            connectionName,
            collectionName,
            sessionId,
            filter,
            orderBy,
            settings,
        });

        const resolvedFilter = processingResult.filter;
        cache.lastUsedFilter[clientId] = resolvedFilter;
        const success = !processingResult.error;
        const data = processingResult.data;
        data.libraryInfo = await m2m.getLibraryInfo(collectionName, resolvedFilter);
        
        const result = {
            connectionName,
            collectionName,
            sessionId,
            filter,
            orderBy,
            settings,
            success,
            data,
            filter: resolvedFilter,
        };

        if (result.data?.records) {
            const recordCount = result.data.records.length;
            log(`Returning ${recordCount} record${recordCount !== 1 ? 's' : ''}.`);
        } else {
            log(`Returning error: ${result.error}`);
        }            

        res.json(result);
    });

    dbRouter.post('/m2m/macro', checkLocalNetwork, async (req, res) => {
        log(`Processing macro request: ${JSON.stringify(req.body)}`)
        try {
            const data = await m2m.runMacroRequest(req);

            const result = { success: true, data };
            log(`Returning macro results: ${data.length} records.`);
            res.json(result);
        } catch (error) {
            console.error("Failed to execute macro", error);
            res.status(500).send("Failed to execute macro");
        }
    });

    dbRouter.get("/_ctrlField", checkLocalNetwork, (req, res) => {
        res.json({ __ctrl: getBlankCtrlField()});
    })


    // Public endpoints (right now)
    dbRouter.get("/export/:collectionName", async (req, res) => {
        const { collectionName } = req.params;
        const { orderBy } = req.query;
        try {
            const csvData = await getCsvDataFromCollection(db, collectionName, orderBy);
            if (!csvData) {
                return res.status(404).send("No documents found in collection or no data available.");
            }

            const filename = `export-${collectionName}-${getFormattedDate(new Date(), null, true)}.csv`;

            // Set the headers to signal a file download to the browser
            res.setHeader("Content-Type", "text/csv");
            res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

            // Send the CSV file data as the response
            res.send(csvData);
        } catch (error) {
            console.error("Failed to export collection to CSV", error);
            res.status(500).send("Failed to export collection to CSV");
        }
    });

    dbRouter.get("/echo", (req, res) => {
        res.json(req.body);
    })

    return dbRouter;
};

const checkLocalNetwork = (req, res, next) => {
    const ipParts = req.ip.split(':');    
    const clientIp = ipParts[ipParts.length - 1];

    if (clientIp.includes('192.168.1.') || clientIp == 1) {
        // Client IP is within the local network, or request is coming from the postman agent - proceed to the next middleware
        next();
    } else {
        // Client IP is not within the local network, send forbidden response
        log(`checkLocalNetwork: denied request from ${clientIp}, original url: ${req.originalUrl}`);
        res.status(403).send("Forbidden");
    }
};

export default initRouter;
