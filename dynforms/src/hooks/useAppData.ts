import axios from "axios";

import useAppState from "./useAppState";
import { Interfaces } from "../forms/Form";

import { formTypes } from "../formTypes";

export default function useAppData() {

    const [appData, setAppData] = <any>useAppState();

    const axiosError = (err: any) => console.log('Axios error: ', err);

    const setCollectionName = (collectionName: string) => {
        console.log('Setting collection name to', collectionName);
        appData.collectionName = collectionName;        
        setAppData(appData);
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
            appData.order[0] = { key: newKey, desc, selectValue };
        }

        if (pri === 1) {
            if (appData.order.length < 2) {
                appData.order.push([]);
            }

            appData.order[1] = { key: newKey, desc, selectValue};
        }
        
        const primary = appData.order[0];
        const secondary = appData.order[1];

        appData.records.sort((a: any, b: any) => {
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
        console.log('Sorting by:', appData.order[0].selectValue, appData.order[1].selectValue);
        setAppData(appData);        
    };

    const resetOrder = () => {
        console.log('Resetting order');
        appData.order = [{ key: null, desc: false }, { key: null, desc: false }];
        setAppData(appData);
    }

    const setSearchValue = (searchValue: string) => {
        console.log('Searching for: ', searchValue);
        appData.searchValue = searchValue;
        setAppData(appData);
    }

    const getRecords = () => {
        if (!appData.searchValue) {
            return appData.records;            
        }

        return appData.records?.filter((record: any) => {
            let found = false;

            appData.formDefinition.fields?.every((field: Interfaces.Field, index: number) => {
                if (['subfieldArray', 'boolean'].includes(field.type)) {
                    // Don't attempt to search on these.
                    return true;
                }

                if (typeof record[field.key] === 'string' && record[field.key].toLowerCase().includes(appData.searchValue.toLowerCase())) { 
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
        appData.formDefinition = formDefinition;
        setAppData(appData);
    }

    const loadRecords = async (collectionName: string) => {
        console.log(`Loading records in ${collectionName}`);
        appData.records = [];
        setAppData(appData);

        axios
            .get(`${constants.apiRoot}/records/${collectionName}`)
            .then((data) => {
                appData.records = data.data;
                setAppData(appData);        
            })
            .catch(axiosError);
    }

    const dbDeleteRecord = async (recordId: string) => {
        const collectionName = appData.collectionName;
        console.log(`Deleting record ${recordId} from collection ${collectionName}`);

        axios
            .delete(`${constants.apiRoot}/records/${collectionName}/${recordId}`)
            .then(result => {
                loadRecords(collectionName);
            })
            .catch(axiosError);
    }
    
    const dbUpdateRecord = async (record: any) => {        
        const collectionName = appData.collectionName;
        console.log(`Updating record in ${collectionName}`, record);

        return axios
            .post(`${constants.apiRoot}/post/${collectionName}`, record)
            .then(data => {
                loadRecords(collectionName);
            })
            .catch(axiosError);
    }

    const loadFormTypes = async () => {
        console.log(`Querying server for form definitions`);
        return axios
            .get(`${constants.apiRoot}/formtypes`)
            .then(data => {                
                appData.formTypes = data.data;
                setAppData(appData);
            })
            .catch(axiosError);
    }

    // Initialize.
    if (!Array.isArray(appData.order)) {
        resetOrder();
        resetSearchValue();

        loadFormTypes();
    }

    return {
        constants,
        appData,
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

