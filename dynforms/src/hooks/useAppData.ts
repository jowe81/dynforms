import axios from "axios";

import useAppState from "./useAppState";
import { Interfaces } from "../forms/Form";
import constants from "../constants";

export default function useAppData() {

    const [appData, setAppData] = <any>useAppState();

    function updateAppData() {
        setAppData(appData);
    }

    const axiosError = (err: any) => console.log('Axios error: ', err);

    const setCollectionName = (collectionName: string) => {
        console.log('Setting collection name to', collectionName);
        appData.collectionName = collectionName;        
        updateAppData()
        setFormDefinition(appData.formTypes.find((formDefinition: Interfaces.FormType) => formDefinition.collectionName === collectionName));
        updateTableColumns();

        // Load and apply ordering preferences
        appData.order = [
            { key: null, desc: false },
            { key: null, desc: false },
        ];
        const order = storageGet(`order.${appData.collectionName}`);
        if (order && order.length > 1) {
            setOrderColumn(order[0].selectValue, "0");
            setOrderColumn(order[1].selectValue, "1");
        }

        resetSearchValue();
        loadRecords();        
    }

    const updateTableColumns = () => {
        /**
         * The idea is
         * Each field:
         * if not a group member, add to array
         * if a group member, add the following to the array:
         * [
         *      group-id:
         *      type: __group
         *      fields: [
         *          ...the groups fields in ascending rank
         *      ]
         * ]
         **/        
        const fields = appData.formDefinition.fields;
        if (!fields) {
            return;
        }

        const tableColumns: (Interfaces.Field | Interfaces.Group)[] = [];
        const processedGroups:string[] = [];

        fields.forEach((field: Interfaces.Field) => {
            const groupId = field.groupId;

            if (!groupId) {
                tableColumns.push(field);
                return;
            }

            if (processedGroups.includes(groupId)) {
                return;
            }

            const group: Interfaces.Group = getGroup(groupId);
            if (group) {
                tableColumns.push(group);
                processedGroups.push(groupId);
            }
        });

        appData.table.columns = tableColumns;
        console.log(`Computed table columns:`, appData.table.columns);
        updateAppData()
    }

    const getGroup = (groupId: string) => {
        if (!Array.isArray(appData.formDefinition.groups)) {
            return null;
        }

        const group = appData.formDefinition.groups.find((group: Interfaces.Group) => group.id === groupId);

        if (group) {
            group.type = "group";
            group.key = group.id;
            group.fields = appData.formDefinition.fields.filter((field: Interfaces.Field) => field.groupId === groupId);
            group.fields.sort((a: any, b: any) => a.rank > b.rank ? 1 : -1);
        }

        return group;
    }

    const setOrderColumn = (selectValue: string, priority: string) => {
        const pri = parseInt(priority);

        if (!selectValue || selectValue === '__none') {
            appData.order[pri] = { key: null, desc: false };
        } else {
            const parts = selectValue.split("|");
            const newKey: string = parts[0];
            const desc: boolean = parts.length ? !!parts[1] : false;

            if (pri === 0) {
                appData.order[0] = { key: newKey, desc, selectValue };
            }

            if (pri === 1) {
                if (appData.order.length < 2) {
                    appData.order.push([]);
                }

                appData.order[1] = { key: newKey, desc, selectValue };
            }

            const primary = appData.order[0];
            const secondary = appData.order[1];

            appData.records?.sort((a: any, b: any) => {
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
            console.log(
                "Sorting by:",
                appData.order[0].selectValue,
                appData.order[1].selectValue
            );
        }

        storageSet(`order.${appData.collectionName}`, [...appData.order]);

        updateAppData()
        loadRecords();
    };

    const setSearchValue = (searchValue: string) => {
        console.log('Searching for: ', searchValue);
        appData.searchValue = searchValue;
        updateAppData()
        
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
        storageSet('itemsPerPage', itemsPerPage);
        appData.table.itemsPerPage = itemsPerPage;
        appData.table.pageCount = Math.ceil(appData.table.recordsCount / itemsPerPage);
        loadRecords();
    }

    // Set current to the one with index, or just the first one otherwise.
    const setCurrentRecordToIndex = (index: string) => {
        const newCurrentRecord = appData.records.find((record: any) => record._index === parseInt(index));
        if (newCurrentRecord) {
            appData.currentRecord = newCurrentRecord;
        } else {
            appData.currentRecord = appData.records.length ? appData.records[0] : undefined;
        }
        
        updateAppData()
    }

    const setCurrentRecord = (record: any) => {
        appData.currentRecord = { ...record };
        updateAppData()
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

    const setFormDefinition = (formDefinition: Interfaces.FormType) => {
        // Put the fields in the order of rank.
        formDefinition.fields?.sort((a: any, b: any) => a.rank > b.rank ? 1 : -1);
        appData.formDefinition = formDefinition;
        console.log('Setting formDefinition to ', formDefinition);        
        updateAppData()

    }

    const getUser = () => appData.user;

    const setUser = (userToSet: any) => {
        // Determine the current user
        let storedUser;
        try {
            storedUser = JSON.parse(localStorage.getItem('user') ?? "");
        } catch (e) {
            console.log('No valid user object currently stored.')
        }

        const defaultUser = { name: 'Johannes' };
        const user = userToSet ?? storedUser ?? defaultUser;
        localStorage.setItem('user', JSON.stringify(user));

        console.log(`Set current user to`, user);

        // Determine the list of users to choose from.
        const storedUserlist = localStorage.getItem("userlist");
        const defaultUserlist = [
            defaultUser,
            { name: 'Jess'},
            { name: 'Guest'},
        ];

        const userlist = storedUserlist ?? defaultUserlist;
        
        appData.user = {...user};
        appData.userlist = [...userlist];

        updateAppData()
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
        updateAppData()

        const { currentPage, itemsPerPage } = appData.table;
        
        return axios
            .get(`${constants.apiRoot}/records/${appData.collectionName}?search=${appData.searchValue}&sortCol1=${sortCol1}&sortCol2=${sortCol2}&itemsPerPage=${itemsPerPage}&page=${currentPage}`)
            .then(({data}) => {                
                appData.records = data.records;
                appData.table = { ...appData.table, ...data.table };
                if (appData.records?.length) {
                    setCurrentRecordToIndex(currentRecordIndex);
                }
                updateAppData()     
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
        const recordWithUser = { ...record };
        recordWithUser.__user = appData.user;
        return axios
            .post(
                `${constants.apiRoot}/post/${appData.collectionName}`,
                recordWithUser
            )
            .then(loadRecords)
            .then((data) => console.log("Update and load complete."))
            .catch(axiosError);
    }

    const loadFormTypes = async () => {
        console.log(`Querying server for form definitions...`);
        return axios
            .get(`${constants.apiRoot}/formtypes`)
            .then(data => {                
                appData.formTypes = data.data;
                console.log(`Received ${appData.formTypes?.length}.`);
                updateAppData()
            })
            .catch(axiosError);
    }

    const initApp = async () => {
        // Initialize.
        if (!Array.isArray(appData.order)) {
            console.log('Initializing App...');

            // Decide whether to filter locally or on the server.
            appData.filterLocally = false;
            updateAppData()

            setUser(null);
            resetSearchValue();

            appData.order = [
                { key: null, desc: false },
                { key: null, desc: false },
            ];            

            appData.table = {
                itemsPerPage: storageGet('itemsPerPage') ?? constants.itemsPerPageInitial,
                pageCount: 0,                
                currentPage: 0,      
            }

            loadFormTypes();
        }
    }

    // Read or write to local storage; associate with current user by default (use global flag otherwise)
    const store = (key: string, item?: any, global: boolean = false) => {
        const user = getUser();
        let fullKey =
            !global && user?.name
                ? `appData.byUser.${getUser()?.name}.${key}`
                : `appData.global.${key}`;

        if (item) {
            const data = JSON.stringify(item);            
            localStorage.setItem(fullKey, data);
            console.log(`Stored to ${fullKey}`, data);
        } else {
            const item = localStorage.getItem(fullKey);
            const data = JSON.parse(item);
            console.log(`Read from ${fullKey}`, data);
            return data;
        }        
    }

    const storageSet = (key: string, item?: any, global: boolean = false) => {
        store(key, item, global);
    };

    const storageGet: any = (key: string, global: boolean = false) => {
        return store(key, null, global);
    };

    return {
        constants,
        appData,
        setCollectionName,
        setOrderColumn,
        setSearchValue,
        setFormDefinition, 
        setUser,       

        setPage,
        setItemsPerPage,        
        adjustCurrentRecord,
        setCurrentRecordToIndex,
        getRecords,

        dbDeleteRecord,
        dbUpdateRecord,

        initApp,
    }

};

