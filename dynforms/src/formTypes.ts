const formTypes = [
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
                type: "subfield_array",
                rank: 2,
                fields: [
                    {
                        key: "update",
                        label: "Update",
                        type: "textarea",
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
                type: "subfield_array",
                rank: 3,
                fields: [
                    {
                        label: "Number",
                        key: "phone_number",
                        type: "phone_number",
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
                        visible: false,
                    },
                ],
            },
            {
                label: "Email Addresses",
                key: "email_addresses",
                type: "subfield_array",
                rank: 4,
                fields: [
                    {
                        label: "Email",
                        key: "email",
                        type: "email_address",
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
                        visible: false,
                    },
                ],
            },
        ],
    },
];

export { formTypes }