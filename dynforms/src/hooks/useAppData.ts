import axios from "axios";

import useAppState from "./useAppState";

import { formTypes } from "../formTypes";

export default function useAppData() {

    const [appState, setAppState] = <any>useAppState();

    const axiosError = (err: any) => console.log('Axios error: ', err);

    const setCollectionName = (collectionName: string) => {
        console.log('Setting collection name to ', collectionName);

        appState.collectionName = collectionName;        
        setFormDefinition(formTypes.find(formDefinition => formDefinition.collectionName === collectionName));
        setAppState(appState);
        loadRecords(collectionName);
    }

    const setOrderColumn = (key: string) => {        
        const parts = key.split('|');
        console.log('parts', parts);
        const newKey: string = parts[0];
        const desc: boolean = parts.length ? !!parts[1] : false;
        
        appState.order = { key: newKey, desc };

        console.log('Setting order column to ', appState.order);
        appState.records.sort((a: any, b: any) => {
            if (desc) {
                return a[newKey] < b[newKey] ? 1 : -1;
            } else {
                return a[newKey] > b[newKey] ? 1 : -1;
            }           
            
        });
    
        setAppState(appState);        
    };

    const setFormDefinition = (formDefinition: any) => {
        console.log('Setting formDefinition to ', formDefinition);
        appState.formDefinition = formDefinition;
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
            .catch(axiosError);
    }

    const dbDeleteRecord = async (recordId: string) => {
        const collectionName = appState.collectionName;
        console.log(`Deleting record ${recordId} from collection ${collectionName}`);

        axios
            .delete(`${constants.apiRoot}/records/${collectionName}/${recordId}`)
            .then(result => {
                loadRecords(collectionName);
            })
            .catch(axiosError);
    }
    
    const dbUpdateRecord = async (record: any) => {
        const collectionName = appState.collectionName;
        console.log(`Updating record in ${collectionName}`, record);
        return axios
            .post(`${constants.apiRoot}/post/${collectionName}`, record)
            .then(data => {
                loadRecords(collectionName);
            })
            .catch(axiosError);
    }

    return {
        constants,
        appState,
        setCollectionName,
        setOrderColumn,
        setFormDefinition,

        dbDeleteRecord,
        dbUpdateRecord,
    }

};


const constants = {
    apiRoot: 'http://localhost:3010/db',
}

