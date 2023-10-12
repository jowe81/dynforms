import axios from "axios";

import useAppState from "./useAppState";

export default function useAppData() {

    const [appState, setAppState] = <any>useAppState();

    const setCollectionName = (collectionName: string) => {
        console.log('Setting collection name to ', collectionName);

        appState.collectionName = collectionName;
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

    const loadRecords = async (collectionName) => {
        console.log(`Loading records in ${collectionName}`);
        const data = await axios.get(`${constants.apiRoot}/records/${collectionName}`);
        appState.records = data.data;
        setAppState(appState);
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

