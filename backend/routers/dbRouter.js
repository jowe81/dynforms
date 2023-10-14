import { log } from '../helpers/jUtils.js';
import { storeUpdateRecord } from '../db/mongodb.js';
import { ObjectId } from 'mongodb';

const initRouter = (express, db) => {
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

  dbRouter.post('/post/:collectionName', async (req, res) => {
    const { collectionName } = req.params;
    const record = req.body;

    // If an ID came back it came back as a string; cast it to ObjectId.
    if (record._id) {
        record._id = new ObjectId(record._id);
    }
    
    const collection = db.collection(collectionName);

    const result = await record._id ? collection.replaceOne({ _id: record._id }, record) : collection.insertOne(record);

    res.json(result);
  });
  
  return dbRouter;
}

export default initRouter;
