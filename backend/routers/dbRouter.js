import { log } from '../helpers/jUtils.js';
import { storeUpdateRecord } from '../db/mongodb.js';
import { ObjectId } from 'mongodb';

const initRouter = (express, db) => {
  const castId = obj => obj._id = obj._id ? new ObjectId(obj._id) : null;
  const axiosError = err => log(`Axios error: ${err.message}`);
  
  const dbRouter = express.Router();

  dbRouter.use((err, req, res, next) => {
    console.log('- An error occurred: ', err);
    res.status(500).send(err);
    next(err);
  });

  dbRouter.use((req, res, next) => {    
    log(`/post/dbRouter${req.url}`);
    next();
  })
  
  dbRouter.get('/records/:collectionName', async (req, res) => {
    const { collectionName } = req.params;
    const collection = db.collection(collectionName);
    try {
        const records = await collection.find({}).toArray();        
        res.json(records);    
    } catch {
        res.status(500).send();
    }
  });

  dbRouter.delete('/records/:collectionName/:_id', async (req, res) => {
    castId(req.params);

    const { collectionName, _id } = req.params;
    log(`Delete: ${collectionName} ${_id}`)

    const collection = db.collection(collectionName);
    try {
        const result = await collection.deleteOne({ _id });
        res.json(result);
    } catch (error) {
        console.log(error.message);        
        res.status(500).send();
    }

  });

  dbRouter.post('/post/:collectionName', async (req, res) => {    
    const { collectionName } = req.params;
    const collection = db.collection(collectionName);

    const record = req.body;
    castId (record);
    
    const result = await record._id ? 
        collection.replaceOne({ _id: record._id }, record) :
        collection.insertOne(record);

    res.json(result);
  });
  
  return dbRouter;
}

export default initRouter;
