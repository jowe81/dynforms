const formTypes = [
    {
        collectionName: "default",
        title: "Photos",
        settings: {
            images: {
                showImages: true,
                baseUrl: 'http://johannes-mb.wnet.wn:3020/',
            }
        },
        fields: [
            {
                key: "filename",
                label: "Filename",
                type: "text",
                rank: 3,
            },
            {
                key: "description",
                label: "Description",
                type: "textarea",
                rows: 5,
                rank: 0,
            },
            {
                key: "fullname",
                label: "Full Path",
                type: "text",
                isImagePath: true,
                rank: 1,
            },
            {
                key: "extension",
                label: "Extension",
                type: "text",
                rank: 2,
            },
            {
                key: "dirname",
                label: "Path",
                type: "text",
                rank: 4,
            },
            {
                key: "size",
                label: "Size",
                type: "number",
                readOnly: true,
                rank: 5,
            },
            {
                key: "uid",
                label: "UserID",
                type: "number",
                readOnly: true,
                rank: 6,
            },
            {
                key: "gid",
                label: "GroupID",
                type: "number",
                readOnly: true,
                rank: 7,
            },
            {
                key: "updated_at",
                label: "Updated at",
                type: "date",
                readOnly: true,
                rank: 9,
            },
            {
                key: "created_at",
                label: "Created at",
                type: "date",
                readOnly: true,
                rank: 8,
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
                        hidden: true,
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
                        hidden: true,
                    },
                ],
            },
        ],
    },
];

export default formTypes;