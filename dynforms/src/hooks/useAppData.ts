import axios from "axios";

import useAppState from "./useAppState";

import { formTypes } from "../formTypes";

export default function useAppData() {

    const [appState, setAppState] = <any>useAppState();

    const setCollectionName = (collectionName: string) => {
        console.log('Setting collection name to ', collectionName);

        appState.collectionName = collectionName;        
        setFormDefinition(formTypes.find(formDefinition => formDefinition.collectionName === collectionName));
        setAppState(appState);
        loadRecords(collectionName);

    }

    const setFormDefinition = (formDefinition: any) => {
        console.log('Setting formDefinition to ', formDefinition);
        appState.formDefinition = formDefinition;
        setAppState(appState);
    }
    

    const setBlankRecord = (blankRecord: any) => {
        console.log('Setting blank record to ', blankRecord);
        appState.blankRecord = blankRecord;
        setAppState(appState);
    }

    const loadRecords = async (collectionName: string) => {
        appState.records = [];
        setAppState(appState);

        console.log(`Loading records in ${collectionName}`);

        axios
            .get(`${constants.apiRoot}/records/${collectionName}`)
            .then((data) => {
                appState.records = data.data;
                setAppState(appState);        
            })
            .catch(err => console.log('Axios error: ', err));
    }
    

    return {
        constants,
        appState,
        setCollectionName,
        setFormDefinition,
        setBlankRecord,        
    }

};


const constants = {
    apiRoot: 'http://localhost:3010/db',
}

