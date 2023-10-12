import React from "react";
import ReactDOM from "react-dom/client";

import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";

import Root from "./Root.tsx";
import Form from "./forms/Form.tsx";
import RecordsTable from "./records/RecordsTable.tsx";

import "./index.css";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Root />,
        children: [
            {
                path: "/form",
                element: <Form />,        
            },
            {   
                path: "/records",
                element: <RecordsTable /> 
            },
        ]
    }, 
]);
  
ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <RouterProvider router={router} />        
    </React.StrictMode>,
);