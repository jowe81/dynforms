import axios from "axios";

import useAppState from "./useAppState";
import { Interfaces } from "../forms/Form";

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
        resetSearchValue();
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

    const setSearchValue = (searchValue: string) => {
        console.log('Searching for: ', searchValue);
        appState.searchValue = searchValue;
        setAppState(appState);
    }

    const getRecords = () => {
        if (!appState.searchValue) {
            return appState.records;
            
        }
        return appState.records?.filter((record: any) => {
            let found = false;

            appState.formDefinition.fields?.every((field: Interfaces.Field, index: number) => {
                if (['subfieldArray', 'boolean'].includes(field.type)) {
                    // Don't attempt to search on these.
                    return true;
                }

                if (typeof record[field.key] === 'string' && record[field.key].includes(appState.searchValue)) { 
                    found = true;
                    return false;
                }
                
                return true;
            });

            if (found) {
                return true;
            }
        })
    }

    const resetSearchValue = () => setSearchValue('');

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
        console.log(`Updating record in ${collectionName}`, record);
        const collectionName = appState.collectionName;
        return axios
            .post(`${constants.apiRoot}/post/${collectionName}`, record)
            .then(data => {
                loadRecords(collectionName);
            })
            .catch(axiosError);
    }

    // Initialize.
    if (!Array.isArray(appState.order)) {
        resetOrder();
        resetSearchValue();
    }

    return {
        constants,
        appState,
        setCollectionName,
        setOrderColumn,
        setSearchValue,
        setFormDefinition,
        resetOrder,

        getRecords,

        dbDeleteRecord,
        dbUpdateRecord,
    }

};

const constants = {
    apiRoot: 'http://localhost:3010/db',
}

