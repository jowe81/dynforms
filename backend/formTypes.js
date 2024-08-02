import { log, parseJSON } from "./helpers/jUtils.js";
import constants from "./constants.js";
import { getEnhancedCollection } from "./db/dbutils.js";

async function loadFormTypesFromDb(db) {
    const collectionName = constants.formDefinitionsCollectionName;
    const collection = getEnhancedCollection(db, collectionName);

    if (!collection) {
        log(`Could not get collection ${collectionName}.`, 'red');
        return [];
    }

    const records = await collection.find({}).toArray();

    try {
        const formTypes = [
            ...records.map((record) => parseJSON(record.form_definition)).sort((a, b) => a.title > b.title ? 1 : -1),
            formDefinitionsFormType,
        ];

        return formTypes;
    } catch (ex) {
        log(`Error: ${ex.message}`, 'red');
        return [];
    }

}

function formatFormDefinitionsRecord(record) {
    if (!record || !record.form_definition) {
        return `Empty form definition record - can't format.`;
    }

    let formDefinition;
    try {
        formDefinition = parseJSON(record.form_definition);
    } catch (ex) {
        return `Error: ${ex.message}`;
    }

    if (typeof formDefinition !== 'object') {
        return null;
    }

    const {title, collectionName, fields} = formDefinition;

    if (!title) {
        return `Form definition has no title.`;
    }

    if (!collectionName) {
        return `Form definition has no collection name.`;
    }

    if (!fields) {
        return `Form definition has no fields.`;
    }

    record.form_title = title;
    record.collection_name = collectionName;
    record.form_definition = JSON.stringify(formDefinition, null, 4);

    return null;
}

const formDefinitionsFormType = {
    collectionName: constants.formDefinitionsCollectionName,
    title: "Form Definitions",
    fields: [
        {
            key: "form_title",
            label: "Form Title",
            type: "text",
            maxLength: 150,
            readOnly: true,
            rank: 0,
        },
        {
            key: "collection_name",
            label: "Collection Name",
            type: "text",
            maxLength: 50,
            readOnly: true,
            rank: 1,
        },
        {
            key: "form_definition",
            label: "Form Definition",
            type: "json",
            rows: 40,
            rank: 2,
        },
    ],
};



    // These are the old hardcoded ones, just here for reference
const oldHardCodedFormTypes = [
    {
        collectionName: "photos",
        title: "Photos",
        settings: {
            /**
             * This allows displaying of images by combining a base URL with with a text field
             * holding an image path.
             */
            images: {
                showImages: true,
                baseUrl: "http://dynforms.wnet.wn:3020/",
            },
        },
        groups: [
            {
                label: "About the Picture",
                id: "about",
            },
            {
                label: "File Info",
                id: "filemeta",
            },
        ],
        fields: [
            {
                key: "fullname",
                label: "Full Path",
                type: "text",
                // Triggers the display of the image in addition to the path.
                isImagePath: true,
                rank: 1,
            },
            {
                key: "description",
                label: "Description",
                type: "textarea",
                rows: 5,
                rank: 2,
                groupId: "about",
            },
            {
                key: "people",
                label: "People",
                type: "textarea",
                annotation: "Enter comma-separated names.",
                rows: 3,
                rank: 3,
                groupId: "about",
            },
            {
                key: "tags",
                label: "Tags",
                type: "textarea",
                annotation: "Enter comma-separated tags.",
                rows: 3,
                rank: 4,
                groupId: "about",
            },
            {
                key: "evaluation",
                label: "Stars",
                type: "select",
                rank: 5,
                defaultValue: 2,
                options: [
                    {
                        label: "1",
                        value: 1,
                    },
                    {
                        label: "2",
                        value: 2,
                    },
                    {
                        label: "3",
                        value: 3,
                    },
                ],
                groupId: "about",
            },
            {
                key: "dateTime",
                label: "Date Taken",
                type: "date",
                rank: 6,
                display: true,
                groupId: "about",
            },
            {
                key: "extension",
                label: "Extension",
                type: "text",
                rank: 7,
                display: false,
            },
            {
                key: "filename",
                label: "Filename",
                type: "text",
                rank: 8,
                display: false,
            },
            {
                key: "dirname",
                label: "Path",
                type: "text",
                rank: 9,
                display: false,
            },
            {
                key: "size",
                label: "Size",
                type: "filesize",
                readOnly: true,
                rank: 13,
                groupId: "filemeta",
            },
            {
                key: "width",
                label: "Width",
                type: "number",
                readOnly: true,
                rank: 10,
                groupId: "filemeta",
            },
            {
                key: "height",
                label: "Height",
                type: "number",
                readOnly: true,
                rank: 11,
                groupId: "filemeta",
            },
            {
                key: "aspect",
                label: "Aspect Ratio",
                type: "number",
                readOnly: true,
                rank: 12,
                groupId: "filemeta",
            },
            {
                key: "uid",
                label: "UserID",
                type: "number",
                readOnly: true,
                rank: 14,
                display: false,
            },
            {
                key: "gid",
                label: "GroupID",
                type: "number",
                readOnly: true,
                rank: 15,
                display: false,
            },
            {
                key: "updated_at",
                label: "Updated at",
                type: "date",
                readOnly: true,
                rank: 16,
                display: false,
            },
        ],
    },
    {
        collectionName: "recipes",
        title: "Recipes",
        fields: [
            {
                key: "name",
                label: "Dish Name",
                type: "text",
                maxLength: 150,
                rank: 0,
            },
            {
                key: "ingredients",
                label: "Ingredients",
                type: "textarea",
                rows: 15,
                rank: 1,
            },
            {
                key: "instructions",
                label: "Instructions",
                type: "textarea",
                rows: 10,
                rank: 2,
            },
        ],
    },
    {
        collectionName: "system_notes",
        title: "System Notes",
        historyEnabled: true,
        fields: [
            {
                key: "category",
                label: "Category",
                type: "select",
                rank: 1,
                options: [
                    {
                        label: "Ubuntu Server",
                        value: "ubuntu_server",
                    },
                    {
                        label: "Docker",
                        value: "docker",
                    },
                    {
                        label: "Raspberry PI",
                        value: "raspberry_pi",
                    },
                    {
                        label: "Other",
                        value: "other",
                    },
                ],
            },
            {
                key: "title",
                label: "Title",
                type: "text",
                rank: 2,
            },
            {
                key: "text",
                label: "Text",
                type: "textarea",
                rank: 3,
            },
            {
                key: "notes",
                label: "Notes",
                type: "subfieldArray",
                rank: 2,
                fields: [
                    {
                        key: "note",
                        label: "Note",
                        type: "textarea",
                        defaultValue: "",
                        rank: 0,
                    },
                ],
            },
        ],
    },
    {
        collectionName: "prayer_requests",
        title: "Prayer Requests",
        fields: [
            {
                key: "title",
                label: "Title",
                type: "text",
                maxLength: 70,
                rank: 0,
            },
            {
                key: "request",
                label: "Request",
                type: "textarea",
                rank: 1,
            },
            {
                key: "updates",
                label: "Updates",
                type: "subfieldArray",
                rank: 2,
                fields: [
                    {
                        key: "update",
                        label: "Update",
                        type: "textarea",
                        defaultValue: "",
                        rank: 0,
                    },
                    {
                        key: "date",
                        label: "Date",
                        type: "date",
                        rank: 1,
                    },
                ],
            },
        ],
    },
    {
        collectionName: "scriptures",
        title: "Scriptures",
        allowExport: true,
        fields: [
            {
                key: "reference",
                label: "Reference",
                type: "text",
                annotation: "John 3:16; Psalm 23:1-3,4,6",
                maxLength: 150,
                rank: 1,
            },
            {
                key: "translation",
                label: "Translation",
                type: "select",
                rank: 2,
                options: [
                    {
                        label: "NIV",
                        value: "niv",
                    },
                    {
                        label: "NIV (1984)",
                        value: "niv1984",
                    },
                    {
                        label: "RSV",
                        value: "rsv",
                    },
                    {
                        label: "NASB",
                        value: "nasb",
                    },
                ],
            },
            {
                key: "text",
                label: "Text",
                type: "textarea",
                rows: 5,
                rank: 3,
            },
            {
                key: "notes",
                label: "Notes",
                type: "textarea",
                rows: 3,
                rank: 4,
            },
            {
                key: "created_at",
                label: "Created at",
                type: "date",
                readOnly: true,
                rank: 5,
                display: true,
            },
        ],
    },
    {
        collectionName: "address_book",
        title: "Address Book",
        historyEnabled: true,
        allowExport: true,
        groups: [
            {
                label: "Record info",
                id: "__info",
            },
            {
                label: "Contact Info",
                id: "__contact",
            },
        ],
        fields: [
            {
                label: "Last Name",
                key: "last_name",
                type: "text",
                rank: 0,
            },
            {
                label: "First Name",
                key: "first_name",
                type: "text",
                rank: 1,
            },
            {
                label: "Middle Name(s)",
                key: "middle_names",
                type: "text",
                rank: 2,
                displayInTable: false,
            },
            {
                label: "Date of birth",
                key: "date_of_birth",
                type: "birthday",
                rank: 3,
            },
            {
                label: "Show Birthday",
                key: "show_birthday",
                type: "boolean",
                defaultValue: true,
                rank: 4,
            },
            {
                label: "Addresses",
                key: "addresses",
                type: "subfieldArray",
                rank: 5,
                fields: [
                    {
                        label: "Street address",
                        key: "street",
                        type: "text",
                        rank: 0,
                    },
                    {
                        label: "Zip Code",
                        key: "zip",
                        type: "text",
                        rank: 1,
                    },
                    {
                        label: "City",
                        key: "city",
                        type: "text",
                        rank: 2,
                    },
                    {
                        label: "Province",
                        key: "province",
                        type: "text",
                        rank: 3,
                    },
                    {
                        label: "Country",
                        key: "country",
                        type: "text",
                        rank: 4,
                    },
                    {
                        label: "Phone (Landline)",
                        key: "phone",
                        type: "text",
                        rank: 5,
                        display: false,
                    },
                    {
                        key: "updated_at",
                        type: "date",
                        rank: 6,
                        display: false,
                    },
                ],
                groupId: "__contact",
            },
            {
                label: "Phone Numbers",
                key: "phone_numbers",
                type: "subfieldArray",
                rank: 6,
                fields: [
                    {
                        label: "Type",
                        key: "type",
                        type: "select",
                        //multiple: true,
                        options: [
                            {
                                label: "Home",
                                value: "home",
                            },
                            {
                                label: "Work",
                                value: "work",
                            },
                            {
                                label: "Cell",
                                value: "cell",
                            },
                            {
                                label: "Other",
                                value: "other",
                            },
                        ],
                    },
                    {
                        label: "Number",
                        key: "phone",
                        type: "phone",
                        placeholder: "123 456-7890",
                        rank: 0,
                    },
                    {
                        label: "Number is Active",
                        key: "active",
                        type: "boolean",
                        defaultValue: false,
                        rank: 1,
                    },
                    {
                        label: "Updated at",
                        key: "updated_at",
                        type: "date",
                        rank: 2,
                        display: false,
                    },
                ],
                groupId: "__contact",
            },
            {
                label: "Email Addresses",
                key: "email_addresses",
                type: "subfieldArray",
                rank: 7,
                fields: [
                    {
                        label: "Email",
                        key: "email",
                        type: "email",
                        placeholder: "email@example.com",
                        rank: 0,
                    },
                    {
                        label: "Active",
                        key: "active",
                        type: "boolean",
                        defaultValue: true,
                        rank: 1,
                    },
                    {
                        label: "Updated at",
                        key: "updated_at",
                        type: "date",
                        rank: 2,
                        display: false,
                    },
                ],
                groupId: "__contact",
            },
            {
                label: "Website",
                key: "website",
                type: "text",
                rank: 8,
                groupId: "__contact",
                displayInTable: false,
            },
            {
                key: "notes",
                label: "Notes",
                type: "textarea",
                rows: 5,
                rank: 9,
                display: true,
                displayInTable: false,
            },
            {
                key: "created_at",
                label: "Created at",
                type: "date",
                readOnly: true,
                rank: 10,
                display: true,
                groupId: "__info",
                export: false,
            },
            {
                label: "Updated at",
                key: "updated_at",
                type: "date",
                readOnly: true,
                rank: 11,
                display: true,
                groupId: "__info",
            },
        ],
    },
    {
        collectionName: "notes_scanned",
        title: "Scanned Notes",
        fields: [
            {
                key: "created_at",
                label: "Created at",
                type: "date",
                readOnly: true,
                rank: 1,
                display: true,
            },
            {
                key: "urlpath",
                label: "URL Path",
                type: "text",
                rank: 2,
            },
            {
                key: "message",
                label: "Message Text",
                type: "text",
                rank: 3,
            },
            {
                label: "Display this note",
                key: "display",
                type: "boolean",
                defaultValue: true,
                rank: 4,
            },
            {
                key: "color",
                label: "Color",
                type: "select",
                rank: 5,
                defaultValue: "",
                options: [
                    {
                        label: "(Auto)",
                        value: "",
                    },
                    {
                        label: "Blue",
                        value: "blue",
                    },
                    {
                        label: "Gray",
                        value: "gray",
                    },
                    {
                        label: "Green",
                        value: "green",
                    },
                    {
                        label: "Pink",
                        value: "pink",
                    },
                    {
                        label: "Purple",
                        value: "purple",
                    },
                    {
                        label: "Red",
                        value: "red",
                    },
                    {
                        label: "Yellow",
                        value: "yellow",
                    },
                ],
            },
        ],
    },
    {
        collectionName: "weight_tracking",
        allowExport: true,
        title: "Weight Tracking",
        fields: [
            {
                key: "created_at",
                label: "Measured at",
                type: "date",
                readOnly: true,
                rank: 1,
                display: true,
            },
            {
                key: "lbs",
                label: "Weight (lbs)",
                type: "number",
                annotation: "pounds",
                rank: 5,
                relative: {
                    key: "kg",
                    factor: 2.20462,
                    precision: 1, // Store 1 decimal after conversion
                },
            },
            {
                key: "kg",
                label: "Weight (kg)",
                type: "number",
                annotation: "kilograms",
                rank: 6,
                relative: {
                    key: "lbs",
                    factor: 1 / 2.20462,
                    precision: 1, // Store 1 decimal after conversion
                },
            },
        ],
    },
    {
        collectionName: "johannes_medical",
        title: "Johannes Medical",
        historyEnabled: true,
        allowExport: true,
        fields: [
            {
                key: "created_at",
                label: "Measured at",
                type: "date",
                readOnly: true,
                rank: 1,
                display: true,
            },
            {
                key: "sys",
                label: "Systolic",
                type: "number",
                rank: 2,
            },
            {
                key: "dia",
                label: "Diastolic",
                type: "number",
                rank: 3,
            },
            {
                key: "pulse",
                label: "Pulse (bpm)",
                type: "number",
                annotation: "bpm",
                rank: 4,
            },
            {
                key: "urine_output",
                label: "Urine output (ml)",
                type: "number",
                annotation: "ml",
                rank: 5,
            },

            {
                key: "medication_intake",
                label: "Medication intake",
                type: "select",
                rank: 6,
                options: [
                    {
                        label: "Candesartan 4mg",
                        value: "Candesartan 4mg",
                    },
                    {
                        label: "Candesartan 8mg",
                        value: "Candesartan 8mg",
                    },
                ],
                display: false,
                export: false,
            },

            {
                key: "candesartan",
                label: "Candesartan (mg)",
                type: "select",
                rank: 6,
                options: [
                    {
                        label: 4,
                        value: 4,
                    },
                    {
                        label: 6,
                        value: 6,
                    },
                    {
                        label: 8,
                        value: 8,
                    },
                ],
                export: false,
            },
            {
                key: "notes",
                label: "Notes",
                type: "textarea",
                rows: 5,
                rank: 7,
            },
            {
                key: "updated_at",
                label: "Updated at",
                type: "date",
                readOnly: true,
                rank: 8,
                display: false,
                export: false,
            },
            {
                key: "_id",
                label: "ID",
                type: "text",
                readOnly: true,
                rank: 9,
                display: false,
                export: false,
            },
        ],
    },
    {
        collectionName: "weatherHistory",
        title: "Weather History",
        allowExport: true,
        historyEnabled: true,
        readOnly: true,
        fields: [
            {
                key: "created_at",
                label: "Submitted by jj-auto at",
                type: "date",
                readOnly: true,
                rank: 1,
                display: true,
            },
            {
                key: "initialized",
                label: "Data from",
                type: "date",
                readOnly: true,
                rank: 2,
                display: true,
            },
            {
                key: "sensorName",
                label: "Sensor",
                type: "text",
                readOnly: true,
                rank: 3,
            },
            {
                key: "min",
                label: "Min temp (C)",
                type: "number",
                readOnly: true,
                rank: 4,
            },
            {
                key: "minMeasuredAt",
                label: "Min measured at",
                type: "date",
                readOnly: true,
                rank: 5,
                display: true,
            },
            {
                key: "max",
                label: "Max temp (C)",
                type: "number",
                readOnly: true,
                rank: 6,
            },
            {
                key: "maxMeasuredAt",
                label: "Max measured at",
                type: "date",
                readOnly: true,
                rank: 7,
                display: true,
            },
            {
                key: "mean",
                label: "Mean temp (C)",
                type: "number",
                readOnly: true,
                rank: 8,
            },
            {
                key: "measurements",
                label: "Measurements",
                type: "subfieldArray",
                readOnly: true,
                rank: 9,
                fields: [
                    {
                        key: "tempC",
                        label: "Temp",
                        type: "number",
                        readOnly: true,
                        rank: 1,
                    },
                    {
                        key: "measuredAt",
                        label: "Measured at",
                        type: "date",
                        readOnly: true,
                        rank: 0,
                    },
                ],
            },
            {
                key: "_id",
                label: "ID",
                type: "text",
                readOnly: true,
                rank: 10,
                display: false,
                export: false,
            },
        ],
    },
];

export { loadFormTypesFromDb, formatFormDefinitionsRecord };

