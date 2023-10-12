import axios from "axios";

import useAppState from "./useAppState";

export default function useAppData() {

    const [appState, setAppState] = <any>useAppState();

    const setCollectionName = (collectionName: string) => {
        console.log('Setting collection name to ', collectionName);

        appState.collectionName = collectionName;
        setAppState(appState);
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

    

    return {
        appState,        
        setCollectionName,
        setFormDefinition,
        setBlankRecord,
    }

};

