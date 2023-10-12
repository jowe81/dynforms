import { log } from '../helpers/jUtils.js';
import { storeUpdateRecord } from '../db/mongodb.js';

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
    const data = req.body;
    const collection = db.collection(collectionName);
    const result = await collection.insertOne(data);
    console.log('insert result', result);
    console.log(`Data`, data);
    //storeUpdateRecord();
    res.json(result);
  });
  
  return dbRouter;
}

export default initRouter;
