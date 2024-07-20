const formTypes = [
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
        collectionName: "outburst_tracking",
        title: "Outburst Tracking",
        fields: [
            {
                key: "created_at",
                label: "Observed at",
                type: "date",
                readOnly: true,
                rank: 1,
                display: true,
            },
            {
                label: "Trigger",
                key: "trigger",
                type: "select",
                rank: 2,
                defaultValue: "relational",
                options: [
                    {
                        label: "Personal",
                        value: "personal",
                    },
                    {
                        label: "Relational",
                        value: "relational",
                    },
                    {
                        label: "Other",
                        value: "other",
                    },
                    {
                        label: "Unknown",
                        value: "unknown",
                    },
                ],
            },
            {
                label: "Trigger Validity",
                key: "trigger_validity",
                type: "select",
                rank: 3,
                defaultValue: "none",
                options: [
                    {
                        label: "None",
                        value: "none",
                    },
                    {
                        label: "Minor",
                        value: "minor",
                    },
                    {
                        label: "Major",
                        value: "major",
                    },
                ],
            },
            {
                label: "Initial Response",
                key: "response",
                type: "select",
                rank: 4,
                options: [
                    {
                        label: "Contained",
                        value: "contained",
                    },
                    {
                        label: "Uncontained",
                        value: "uncontained",
                    },
                ],
            },
            {
                label: "Contained After",
                key: "contained_after",
                type: "select",
                defaultValue: "none",
                rank: 5,
                options: [
                    {
                        label: "Seconds",
                        value: "seconds",
                    },
                    {
                        label: "Minutes",
                        value: "minutes",
                    },
                    {
                        label: "Hours",
                        value: "hours",
                    },
                    {
                        label: "A Day",
                        value: "a day",
                    },
                    {
                        label: "Days",
                        value: "days",
                    },
                    {
                        label: "Cumulative (not before next)",
                        value: "cumulative",
                    },
                ],
            },
            {
                label: "Contained By Initiative Of",
                key: "contained_by_initiative_of",
                type: "select",
                defaultValue: "none",
                rank: 5,
                options: [
                    {
                        label: "Self",
                        value: "self",
                    },
                    {
                        label: "Other",
                        value: "other",
                    },
                ],
            },
            {
                label: "Notes",
                key: "notes",
                type: "textarea",
                rows: 5,
                rank: 6,
                display: true,
            },
        ],
    },
    {
        collectionName: "johannes_medical",
        title: "Johannes Medical",
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
                key: "tempC",
                label: "Temperature (Celsius)",
                type: "number",
                readOnly: true,
                rank: 2,
            },
            {
                key: "updated_at",
                label: "Updated at",
                type: "date",
                readOnly: true,
                rank: 4,
                display: false,
                export: false,
            },
            {
                key: "_id",
                label: "ID",
                type: "text",
                readOnly: true,
                rank: 5,
                display: false,
                export: false,
            },
        ],
    },
];

export default formTypes;