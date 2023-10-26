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
                baseUrl: 'http://johannes-mb.wnet.wn:3020/',
            }
        },
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
            },
            {
                key: "width",
                label: "Width",
                type: "number",
                rank: 3,
                
            },
            {
                key: "height",
                label: "Height",
                type: "number",
                rank: 4,
                
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
                ]
            },


            {
                key: "extension",
                label: "Extension",
                type: "text",
                rank: 6,
                display: false,
            },
            {
                key: "filename",
                label: "Filename",
                type: "text",
                rank: 7,
                display: false,
            },
            {
                key: "dirname",
                label: "Path",
                type: "text",
                rank: 8,
                display: false,
            },
            {
                key: "size",
                label: "Size",
                type: "filesize",
                readOnly: true,
                rank: 9,
            },
            {
                key: "uid",
                label: "UserID",
                type: "number",
                readOnly: true,
                rank: 10,
                display: false,
            },
            {
                key: "gid",
                label: "GroupID",
                type: "number",
                readOnly: true,
                rank: 11,
                display: false,
            },
            {
                key: "created_at",
                label: "Created at",
                type: "date",
                readOnly: true,
                rank: 12,
                display: false,
            },
            {
                key: "updated_at",
                label: "Updated at",
                type: "date",
                readOnly: true,
                rank: 13,
            },



        ]
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
                rows: 5,
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
                        defaultValue: 'hello',
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
        collectionName: "address_book",
        title: "Address Book",
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
                label: "Date of birth",
                key: "date_of_birth",
                type: "date",
                rank: 2,
            },
            {
                label: "Display Birthday",
                key: "display_birthday",
                type: "boolean",
                defaultValue: true,
                rank: 2,
            },
            {
                label: "Phone Numbers",
                key: "phone_numbers",
                type: "subfieldArray",
                rank: 3,
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
                                label: "Mobile",
                                value: "mobile",
                            },
                        ]
                    },
                    {
                        label: "Number",
                        key: "phone",
                        type: "phone",
                        placeholder:"123 456-7890",
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
                        key: "updated_at",
                        type: "date",                        
                        rank: 2,
                        display: false,
                    },
                ],
            },
            {
                label: "Email Addresses",
                key: "email_addresses",
                type: "subfieldArray",
                rank: 4,
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
                        key: "updated_at",
                        type: "date",                        
                        rank: 2,
                        display: false,
                    },
                ],
            },
        ],
    },
];

export default formTypes;