/**
 * This migrates data from sql lifelog/ll2_people to mongo dynforms/address_book.
 *
 * When editing: MAKE SURE TO ALWAYS UPDATE COPY IN dynforms/src/scripts!
 */

const mysql = require("mysql2");
const { MongoClient } = require("mongodb");

// MySQL database configuration
const mysqlConfig = {
    host: "192.168.90.232",
    user: "jowede",
    password: "33189",
    database: "lifelog",
};

// MongoDB database configuration
const mongoConfig = {
    url: "mongodb://server.wnet.wn:27017",
    dbName: "dynforms",
    collectionName: "address_book",
};

// Function to connect to MySQL database and fetch records
async function fetchMySQLRecords() {
    const connection = mysql.createConnection(mysqlConfig);

    connection.connect();

    const [rows] = await connection.promise().query("SELECT * FROM ll2_people");

    connection.end();

    return rows;
}

// Function to connect to MongoDB database and insert records
async function insertMongoRecords(records) {
    console.log("Will insert " + records?.length + " records");
    const client = new MongoClient(mongoConfig.url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    await client.connect();

    const database = client.db(mongoConfig.dbName);
    const collection = database.collection(mongoConfig.collectionName);
    await collection.drop();
    await collection.insertMany(records);

    client.close();
}

// Main function to execute the data migration
async function migrateData() {
    try {
        const mysqlRecords = await fetchMySQLRecords();

        if (mysqlRecords.length > 0) {
            const convertedRecords = getConvertedRecords(mysqlRecords);
            await insertMongoRecords(convertedRecords);
            console.log("Data migration successful.");
        } else {
            console.log("No records found in MySQL.");
        }
    } catch (error) {
        console.error("Error during data migration:", error);
    }
}

function getConvertedRecords(mysqlRecords) {
    const converted = [];

    mysqlRecords.forEach((record) => {
        const created_at = new Date(record.created_at * 1000);

        const birthdayFields = getBirthdayFields(record);
        const convertedRecord = {
            first_name: record.firstname,
            last_name: record.lastname,
            middle_names: record.middlename,

            ...birthdayFields,

            show_birthday: !!record.show_birthday,
            year_of_birth_unknown: !!record.year_of_birth_unknown,
            email_addresses: getEmailAddresses(record),
            addresses: getAddresses(record),
            phone_numbers: getPhoneNumbers(record),

            website: record.website,
            notes: record.notes,

            __legacyRecord: { ...record },

            created_at,
            updated_at: created_at,
        };

        converted.push(convertedRecord);
    });

    return converted;
}

function getBirthdayFields(record) {
    /**
     * Have:
     * birthday: (timestamp)
     * year_of_birth_unknown: 0/1
     * birthday_day (int)
     * birthday_month (int)
     * birthday_year (int)
     *
     *
     * Need:
     * date_of_birth: 'YYYY-MM-DD' or '????-MM-DD'
     * date_of_birth_date: ISODate if year is known, null otherwise
     * date_of_birth_MMDD: 'MM-DD'
     *
     **/

    let date_of_birth, date_of_birth_date, date_of_birth_MMDD;

    if (record.birthday_day && record.birthday_month) {
        date_of_birth_MMDD =
            String(record.birthday_month).padStart(2, "0") +
            "-" +
            String(record.birthday_day).padStart(2, "0");
        date_of_birth = `????-${date_of_birth_MMDD}`;
    }

    if (date_of_birth_MMDD && !record.year_of_birth_unknown) {
        date_of_birth = `${record.birthday_year}-${date_of_birth_MMDD}`;
        date_of_birth_date = new Date(record.birthday * 1000);
    }

    return {
        date_of_birth,
        date_of_birth_date,
        date_of_birth_MMDD,
    };
}

function getPhoneNumbers(record) {
    const created_at = new Date(record.created_at * 1000);

    let number = {
        active: true,
        updated_at: created_at,
    };

    const phoneNumbers = [];

    if (record.cell_personal) {
        phoneNumbers.push({
            phone: record.cell_personal,
            type: "cell",
            ...number,
        });
    }

    if (record.cell_work) {
        phoneNumbers.push({
            phone: record.cell_work,
            type: "cell",
            ...number,
        });
    }

    if (record.main_address_homephone) {
        phoneNumbers.push({
            phone: record.main_address_homephone,
            type: "home",
            ...number,
        });
    }

    if (record.second_address_homephone) {
        phoneNumbers.push({
            phone: record.second_address_homephone,
            type: "home",
            ...number,
        });
    }

    if (record.work_address_homephone) {
        phoneNumbers.push({
            phone: record.work_address_homephone,
            type: "work",
            ...number,
        });
    }

    return phoneNumbers;
}

const addressFields = [
    "address_street",
    "address_zip",
    "address_city",
    "address_province",
    "address_country",
    "address_homephone",
];

function getAddresses(record) {
    const created_at = new Date(record.created_at * 1000);

    const prefixes = ["main", "second", "work"];

    const newAddressFields = [
        "street",
        "zip",
        "city",
        "province",
        "country",
        "phone",
    ];

    const addresses = [];

    let address = {
        active: true,
        updated_at: created_at,
    };

    prefixes.forEach((prefix) => {
        if (haveAddressInfo(prefix, record)) {
            const newAddress = {};

            newAddressFields.forEach((newFieldName, index) => {
                newAddress[newFieldName] =
                    record[prefix + "_" + addressFields[index]];
            });

            addresses.push(newAddress);
        }
    });

    return addresses;
}

function haveAddressInfo(prefix, record) {
    let result = false;

    addressFields.every((fieldName) => {
        if (record[`${prefix}_${fieldName}`]) {
            result = true;
            return true;
        }

        return false;
    });

    return result;
}

function getEmailAddresses(record) {
    const created_at = new Date(record.created_at * 1000);

    const email_addresses = [];

    let email = {
        active: true,
        updated_at: created_at,
    };

    if (record.email_personal) {
        email_addresses.push({
            email: record.email_personal,
            ...email,
        });
    }

    if (record.email_work) {
        email_addresses.push({
            email: record.email_work,
            ...email,
        });
    }

    if (record.email_extra) {
        email_addresses.push({
            email: record.email_extra,
            ...email,
        });
    }

    return email_addresses;
}

// Execute the migration process
migrateData();
