import axios from "axios";

import useAppState from "./useAppState";
import { Interfaces } from "../forms/Form";
import { keyBy } from "lodash";

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
        loadRecords();        
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
        loadRecords();
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

    const setPage = async (page: number) => {
        const targetPage = Math.min(page, appData.table.pageCount);
        console.log(`Going to page ${targetPage}`);
        appData.table.currentPage = targetPage;
        return loadRecords();
    }

    const setItemsPerPage = (items: number) => {
        const itemsPerPage = Math.min(items, 100);
        console.log(`Items per page: ${itemsPerPage}`);
        appData.table.itemsPerPage = itemsPerPage;
        appData.table.pageCount = Math.ceil(appData.table.recordsCount / itemsPerPage);
        loadRecords();
    }

    // Set current to the one with index, or just the first one otherwise.
    const setCurrentRecordToIndex = (index: string) => {
        const newCurrentRecord = appData.records.find((record: any) => record._index === index);
        if (newCurrentRecord) {
            appData.currentRecord = newCurrentRecord;
        } else {
            appData.currentRecord = appData.records.length ? appData.records[0] : undefined;
        }
        
        setAppData(appData);
    }

    const setCurrentRecord = (record: any) => {
        appData.currentRecord = { ...record };
        setAppData(appData);
    }
    
    const incrementCurrentRecord = async() => {
        if (!appData.records) {
            return;
        }

        const oldCurrentRecordIndex = appData.currentRecord._index;

        if (oldCurrentRecordIndex === appData.records[appData.records.length - 1]._index) {
            // At the last one on this page

            const nextPage = (appData.table.currentPage < appData.table.pageCount ? appData.table.currentPage + 1 : 1);

            return setPage(nextPage)
                .then(() => {
                    setCurrentRecord(appData.records.length ? appData.records[0] : {});
                });
        } else {
            const newCurrentRecord = appData.records.find((record: any) => record._index === oldCurrentRecordIndex + 1);
            setCurrentRecord(newCurrentRecord);                        
        }
    }

    const  decrementCurrentRecord = async () => {
        if (!appData.records) {
            return;
        }

        const oldCurrentRecordIndex = appData.currentRecord._index;
        const newCurrentRecordIndex = oldCurrentRecordIndex > 0 ? oldCurrentRecordIndex - 1 : appData.table.recordsCount;

        if (oldCurrentRecordIndex === appData.records[0]._index) {
            // At the first one on this page

            const nextPage = (appData.table.currentPage > 1 ? appData.table.currentPage - 1 : appData.table.pageCount);

            return setPage(nextPage)
                .then(() => {
                    setCurrentRecord(appData.records.length ? appData.records[appData.records.length - 1] : {});
                });
        } else {
            setCurrentRecord(appData.records.find((record: any) => record._index === newCurrentRecordIndex));
        }
    }

    const adjustCurrentRecord = async (offset: number) => {
        if (offset > 0) {
            return incrementCurrentRecord();
        } else if (offset - 0) {
            return decrementCurrentRecord();
        }
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

    const setFormDefinition = (formDefinition: any) => {
        console.log('Setting formDefinition to ', formDefinition);
        appData.formDefinition = formDefinition;
        setAppData(appData);
    }

    const loadRecords = async () => {
        if (!appData.collectionName) {
            return;
        }
        
        const getOrderString = (orderObj: any) => {
            if (!(orderObj && orderObj.key)) {
                return '';
            }

            const { key, desc } = orderObj;
            return `${key}|${desc ? 'true' : ''}`;            
        }

        const sortCol1 = appData.order[0] && getOrderString(appData.order[0]);
        const sortCol2 = appData.order[1] && getOrderString(appData.order[1]);


        console.log(`Loading records in "${appData.collectionName}". Current index: ${(appData.currentRecord?._index !== undefined) ? appData.currentRecord?._index : 'none'}.`);

        const currentRecordIndex = appData.currentRecord?._index;
        appData.records = [];
        setAppData(appData);

        const { currentPage, itemsPerPage } = appData.table;
        
        return axios
            .get(`${constants.apiRoot}/records/${appData.collectionName}?search=${appData.searchValue}&sortCol1=${sortCol1}&sortCol2=${sortCol2}&itemsPerPage=${itemsPerPage}&page=${currentPage}`)
            .then(({data}) => {                
                appData.records = data.records;
                appData.table = { ...data.table };
                if (appData.records?.length) {
                    setCurrentRecordToIndex(currentRecordIndex);
                }
                setAppData(appData);     
                console.log(`Loaded ${appData.records?.length} records from collection "${appData.collectionName}".`);
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
            .then(data => console.log("Update and load complete."))
            .catch(axiosError);
    }

    const loadFormTypes = async () => {
        console.log(`Querying server for form definitions...`);
        return axios
            .get(`${constants.apiRoot}/formtypes`)
            .then(data => {                
                appData.formTypes = data.data;
                console.log(`Received ${appData.formTypes?.length}.`);
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
        appData.table = {
            itemsPerPage: constants.itemsPerPageInitial,
            pageCount: 0,                
            currentPage: 0,      
        }


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

        setPage,
        setItemsPerPage,        
        adjustCurrentRecord,
        setCurrentRecordToIndex,
        getRecords,

        dbDeleteRecord,
        dbUpdateRecord,
    }

};

const constants = {
    apiRoot: 'http://localhost:3010/db',
    itemsPerPageInitial: 5,
}

