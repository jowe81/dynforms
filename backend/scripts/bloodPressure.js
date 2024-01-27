/**
 * This was to add sys/dia fields to johannes_medical, with data from the bloo_pressure field.
 **/

import { MongoClient  } from "mongodb";

// MongoDB database configuration
const mongoConfig = {
    url: "mongodb://server.wnet.wn:27017",
    dbName: "dynforms",
    collectionName: "address_book",
};

async function getClient() {
    const client = new MongoClient(mongoConfig.url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    await client.connect();

    return client;
}


async function getCollection(client, collectionName) {
    const database = client.db('dynforms');
    return database.collection(collectionName);
}

// Main function to execute the data migration
async function migrateData() {
    try {
        const client = await getClient();
        const collection = await getCollection(client, 'johannes_medical');

        const docs = await collection.find({}).toArray();
        console.log('Have ' , docs.length, ' docs');
        const promises = docs.map(function (doc) {
            // Split the sysDia field into two parts

            if (doc.blood_pressure) {
                var parts = doc.blood_pressure?.split("/");
                var sysValue = parseInt(parts[0]);
                var diaValue = parseInt(parts[1]);

                const updateObj = {
                    sys: sysValue,
                    dia: diaValue,
                };

                // Update the document with sys and dia fields
                return collection.updateOne(
                    { _id: doc._id },
                    {
                        $set: updateObj,
                    }
                );
            } else {
                return Promise.resolve();
            }
        });                

        console.log('Have ', promises.length, ' promises');
        
        await Promise.all(promises);
        await client.close();
        process.exit();
    } catch (error) {
        console.error("Error during data migration:", error);
    }
}

// Execute the migration process
migrateData();
