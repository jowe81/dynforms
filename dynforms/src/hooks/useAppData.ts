import axios from "axios";

import useAppState from "./useAppState";
import { Interfaces } from "../forms/Form";

export default function useAppData() {

    const [appData, setAppData] = <any>useAppState();

    const axiosError = (err: any) => console.log('Axios error: ', err);

    const setCollectionName = (collectionName: string) => {
        console.log('Setting collection name to', collectionName);
        appData.collectionName = collectionName;        
        setAppData(appData);
        setFormDefinition(appData.formTypes.find(formDefinition => formDefinition.collectionName === collectionName));
        resetOrder();
        resetSearchValue();
        setPagination();
        loadPageCount().then((pageCountInfo) => {
            console.log(`Got page count info:`, pageCountInfo);
            setPagination(pageCountInfo)
            loadRecords();
        });
        
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
        
        if (!appData.filterLocally) {
            loadRecords();
        }        
    }

    const setPage = (page: number) => {
        console.log(`Going to page ${page}`);
        appData.table.page = page;
    }

    // Filter locally
    const getRecords = () => {        
        if (!appData.filterLocally || !appData.searchValue) {
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

    const setPagination = (pageCountInfo: {}|undefined|null) => {

        if (pageCountInfo) {
            appData.table = {
                itemsPerPage: constants.itemsPerPageInitial,
                ...pageCountInfo,
                currentPage: 1,      
            }
        } else {
            appData.table = {
                itemsPerPage: constants.itemsPerPageInitial,
                pageCount: 0,                
                currentPage: 0,      
            }
        }
        console.log('Resetting pagination to', appData.table);
        setAppData(appData);
    }

    const setFormDefinition = (formDefinition: any) => {
        console.log('Setting formDefinition to ', formDefinition);
        appData.formDefinition = formDefinition;
        setAppData(appData);
    }

    const loadPageCount = () => {
        if (appData.table.itemsPerPage) {
            return axios
                .get(`${constants.apiRoot}/pageCount/${appData.collectionName}?search=${appData.searchValue}&itemsPerPage=${appData.table.itemsPerPage}`)
                .then((data) => {
                    return data.data;
                })
                .catch(axiosError);
        }
        
        return Promise.resolve(null);
    }

    const loadRecords = async () => {
        if (!appData.collectionName) {
            return;
        }
        
        console.log(`Loading records in ${appData.collectionName}`);
        appData.records = [];
        setAppData(appData);

        const { currentPage, itemsPerPage } = appData.table;

        axios
            .get(`${constants.apiRoot}/records/${appData.collectionName}?search=${appData.searchValue}&itemsPerPage=${itemsPerPage}&page=${currentPage}`)
            .then((data) => {
                appData.records = data.data;
                setAppData(appData);        
            })
            .catch(axiosError);
    }

    const dbDeleteRecord = async (recordId: string) => {        
        console.log(`Deleting record ${recordId} from collection ${appData.collectionName}`);

        axios
            .delete(`${constants.apiRoot}/records/${appData.collectionName}/${recordId}`)
            .then(loadRecords)
            .catch(axiosError);
    }
    
    const dbUpdateRecord = async (record: any) => {        
        console.log(`Updating record in ${appData.collectionName}`, record);

        return axios
            .post(`${constants.apiRoot}/post/${appData.collectionName}`, record)
            .then(loadRecords)
            .catch(axiosError);
    }

    const loadFormTypes = async () => {
        console.log(`Querying server for form definitions...`);
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

        // Decide whether to filter locally or on the server.
        appData.filterLocally = false;
        setAppData(appData);

        resetOrder();
        resetSearchValue();
        setPagination();

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
    itemsPerPageInitial: 5,
}

