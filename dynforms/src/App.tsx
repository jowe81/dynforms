import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Form from "./forms/Form";

import { formTypes } from './formTypes.ts';





function App() {

    const collectionName = 'prayer_requests';
    const formDefinition = formTypes.find((item) => item.collectionName === collectionName);

    const props = {
        collectionName,
        formDefinition,
    }

    console.log('FormDef', formDefinition)
    return (
        <>
            <Form {...props}/>
        </>
    );
}

export default App;
