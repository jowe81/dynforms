import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Form from "./forms/Form";

import { formTypes } from './formTypes.ts';


// const testRecord = {
//     'title': 'Travel',
//     'request': 'Sufficient funds',
//     'updates': [
//         {
//             'update': 'Transfer',
//             'date': '2023-09-30',
//         },
//         {
//             'update': 'Another transfer',
//             'date': '2023-10-01',
//         },
//     ]
// };

const testRecord = {
    last_name: 'Weber',
    first_name: 'Johannes',
    date_of_birth: '1981-03-28',
    display_birthday: true,
    phone_numbers: [
        {
            phone: '123-456-7890',
            active: true,
            updated_at: '234567890',
        },
        {
            phone: '123-456-7891',
            active: false,
            updated_at: '234567890',
        },
    ],
    email_addresses: [
        {
            email: 'johannes@drweber.de',
            active: true,
            updated_at: '234567891',
        },

    ]
};


function App() {

    const collectionName = 'address_book';
    const formDefinition = formTypes.find((item) => item.collectionName === collectionName);

    const props = {
        collectionName,
        formDefinition,
        record: testRecord,
    }

    console.log('FormDef', formDefinition)
    return (
        <>
            <Form {...props}/>
        </>
    );
}

export default App;
