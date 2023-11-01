import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";

import useAppData from '../hooks/useAppData.ts';
import { Interfaces } from '../forms/Form.tsx';
import './records.css';

import PaginationControls from "./PaginationControls.tsx";
import DisplayValue from "./DisplayValue.tsx";
import Group from "./Group.tsx";

function RecordsTable() {

    const { appData, getRecords, dbDeleteRecord, setCurrentRecordToIndex } = useAppData();
    const { state } = useLocation();
    
    //const displayFields = appData.formDefinition?.fields.filter((field: Interfaces.Field) => field.display !== false);
    const displayFields = appData.table?.columns?.filter((field: Interfaces.Field) => field.display !== false);
    console.log('displayFields at table', displayFields);
    const settings = appData.formDefinition?.settings;

    const records = getRecords();

    const action = state?.action;
    const recordId = state?.recordId;

    const setCurrentRecord = (event: any) => {
        const targetIndex = event.currentTarget.dataset.index;
        setCurrentRecordToIndex(targetIndex)
    }

    useEffect(() => {
        if (action === 'delete' && recordId) {            
            dbDeleteRecord(recordId);            
        }
    }, [action, recordId]);

    if (!displayFields || !Array.isArray(records)) {
        return
    }

    const getHeaderRow = (displayFields: Interfaces.Field[]) => {
        
        return (
            <tr>
                <th></th>{displayFields.map((field, index) => {
                    return <th key={index}>{field.label}</th>})}
            </tr>);
    }

    const getRowJsx = (record: any) => {

        const recordId = record._id;

        const cellsJsx = displayFields.map((field: Interfaces.Field, index: number) => {
            const key = field.key;
            const value = record[key];

            return (<td key={index}><DisplayValue field={field} value={value} record={record}/></td>)            
        });
    
        return <tr key={record._id} className='row'>
                    <td key={-1}>
                        <div>
                            <Link to="/records" state={{action: 'delete', recordId}}>Delete</Link>&nbsp;|&nbsp;
                            <Link to="/form" onClick={setCurrentRecord} data-index={record._index} data-id={recordId} state={{recordId}}>Edit</Link>
                        </div>   
                    </td>

            {cellsJsx}
        </tr>;
    }

    const rowsJsx = records.map((record: any) => getRowJsx(record));

    return (
        <>
            <PaginationControls />
            <div className="records-table-container">
                <table>
                    <tbody>
                        {getHeaderRow(displayFields)}
                        {rowsJsx}
                    </tbody>
                </table>
            </div>
        </>
        
    )
}

export default RecordsTable;