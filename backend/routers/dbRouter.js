import { log } from '../helpers/jUtils.js';
import { storeUpdateRecord } from '../db/mongodb.js';
import { ObjectId } from 'mongodb';
import { constructSearchFilter, getSortObjectFromQueryData, getEnhancedCollection } from '../db/dbutils.js';
import formTypes from '../formTypes.js';

const initRouter = (express, db) => {
  const castId = obj => obj._id = obj._id ? new ObjectId(obj._id) : null;
  const logError = err => log(`Error: ${err.message}`);

  const dbRouter = express.Router();

  dbRouter.use((err, req, res, next) => {
    logError(err);
    res.status(500).send(err);
    next(err);
  });

  dbRouter.use((req, res, next) => {    
    log(`/post/dbRouter${req.url}`);
    next();
  })
  
  dbRouter.get('/formtypes', async (rec, res) => {
    res.json(formTypes);
  });

  dbRouter.get('/pageCount/:collectionName', async (req, res) => {
    const { collectionName } = req.params;
    const { search, itemsPerPage } = req.query;
    const searchFilter = constructSearchFilter(search, formTypes[2].fields);

    const collection = getEnhancedCollection(db,collectionName);
    try {
        const recordsCount = await collection.find(searchFilter).count();
        
        const pageCount = itemsPerPage ? Math.ceil(recordsCount / itemsPerPage) : 1;

        res.json({ collectionName, pageCount, recordsCount });
    } catch (err) {
        logError(err);
        res.status(500).send();
    }
  });

  dbRouter.get('/records/:collectionName', async (req, res) => {
    const { collectionName } = req.params;
    let { search, sortCol1, sortCol2 } = req.query;
    const itemsPerPage = parseInt(req.query.itemsPerPage)
    const page = parseInt(req.query.page);
    const skip = Math.max((page - 1) * itemsPerPage, 0);

    const formDefinition = formTypes.find(formDefinition => formDefinition.collectionName === collectionName);

    const searchFilter = constructSearchFilter(search, formDefinition.fields);

    const sortObject = getSortObjectFromQueryData([sortCol1, sortCol2]);

    const collection = getEnhancedCollection(db,collectionName);
    try {
        const records = await collection
            .find(searchFilter)
            .sort(sortObject)
            .skip(skip)
            .limit(itemsPerPage).toArray();        
        res.json(records);    
    } catch (err) {
        logError(err);
        res.status(500).send();
    }
  });

  dbRouter.delete('/records/:collectionName/:_id', async (req, res) => {
    castId(req.params);

    const { collectionName, _id } = req.params;
    log(`Delete: ${collectionName} ${_id}`)

    const collection = getEnhancedCollection(db,collectionName);
    try {
        const result = await collection.deleteOne({ _id });
        res.json(result);
    } catch (err) {
        logError(err);      
        res.status(500).send();
    }

  });

  dbRouter.post('/post/:collectionName', async (req, res) => {    
    const { collectionName } = req.params;
    const collection = getEnhancedCollection(db,collectionName);

    const formDefinition = formTypes.find(formDefinition => formDefinition.collectionName === collectionName);
    const fields = formDefinition?.fields;

    if (!fields) {
        return res.status(500).send();
    }

    const record = req.body;
    castId (record);
    
    try {
        const result = await record._id ? 
            collection.updateOne({ _id: record._id }, record, null, fields) :
            collection.insertOne(record, null, null, fields);
        res.json(result);
    } catch (err) {
        logError(err);
        res.status(500).send();
    }
  });
  
  return dbRouter;
}

export default initRouter;
