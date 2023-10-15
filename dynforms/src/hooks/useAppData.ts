import axios from "axios";

import useAppState from "./useAppState";

import { formTypes } from "../formTypes";

export default function useAppData() {

    const [appState, setAppState] = <any>useAppState();

    const axiosError = (err: any) => console.log('Axios error: ', err);

    const setCollectionName = (collectionName: string) => {
        console.log('Setting collection name to', collectionName);
        appState.collectionName = collectionName;        
        setAppState(appState);
        setFormDefinition(formTypes.find(formDefinition => formDefinition.collectionName === collectionName));
        resetOrder();        
        loadRecords(collectionName);
    }

    const setOrderColumn = (selectValue: string, priority: string) => {        
        const parts = selectValue.split('|');
        const newKey: string = parts[0];
        const desc: boolean = parts.length ? !!parts[1] : false;
        const pri = parseInt(priority);

        if (pri === 0) {
            appState.order[0] = { key: newKey, desc, selectValue };
        }

        if (pri === 1) {
            if (appState.order.length < 2) {
                appState.order.push([]);
            }

            appState.order[1] = { key: newKey, desc, selectValue};
        }
        
        const primary = appState.order[0];
        const secondary = appState.order[1];

        appState.records.sort((a: any, b: any) => {
            if (a[primary.key] < b[primary.key]) {
                return primary.desc ? 1 : -1;
            } else if (a[primary.key] > b[primary.key]) {
                return primary.desc ? -1 : 1;
            } else {
                // Primary values are equal
                if (a[secondary.key] < b[secondary.key]) {
                    return secondary.desc ? 1 : -1;
                } else {
                    return secondary.desc ? -1 : 1;
                }
            }            
        });
        console.log('Sorting by:', appState.order[0].selectValue, appState.order[1].selectValue);
        setAppState(appState);        
    };

    const resetOrder = () => {
        console.log('Resetting order');
        appState.order = [{ key: null, desc: false }, { key: null, desc: false }];
        setAppState(appState);
    }

    const setFormDefinition = (formDefinition: any) => {
        console.log('Setting formDefinition to ', formDefinition);
        appState.formDefinition = formDefinition;
        setAppState(appState);
    }

    const loadRecords = async (collectionName: string) => {
        console.log(`Loading records in ${collectionName}`);
        appState.records = [];
        setAppState(appState);

        axios
            .get(`${constants.apiRoot}/records/${collectionName}`)
            .then((data) => {
                appState.records = data.data;
                setAppState(appState);        
            })
            .catch(axiosError);
    }

    const dbDeleteRecord = async (recordId: string) => {
        console.log(`Deleting record ${recordId} from collection ${collectionName}`);
        const collectionName = appState.collectionName;

        axios
            .delete(`${constants.apiRoot}/records/${collectionName}/${recordId}`)
            .then(result => {
                loadRecords(collectionName);
            })
            .catch(axiosError);
    }
    
    const dbUpdateRecord = async (record: any) => {
        console.log(`Updating record in ${collectionName}`, record);
        const collectionName = appState.collectionName;
        return axios
            .post(`${constants.apiRoot}/post/${collectionName}`, record)
            .then(data => {
                loadRecords(collectionName);
            })
            .catch(axiosError);
    }

    // Initialize the order array
    if (!Array.isArray(appState.order)) {
        resetOrder();
    }

    return {
        constants,
        appState,
        setCollectionName,
        setOrderColumn,
        setFormDefinition,
        resetOrder,

        dbDeleteRecord,
        dbUpdateRecord,
    }

};

const constants = {
    apiRoot: 'http://localhost:3010/db',
}

