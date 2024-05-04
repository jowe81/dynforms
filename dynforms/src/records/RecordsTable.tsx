import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";

import useAppData from '../hooks/useAppData.ts';
import { Interfaces } from '../forms/Form.tsx';
import './records.css';

import PaginationControls from "./PaginationControls.tsx";
import DisplayValue from "./DisplayValue.tsx";

import Icon from "../icons/Icon.tsx";

function RecordsTable() {

    const { appData, getRecords, dbDeleteRecord, setCurrentRecordToIndex } = useAppData();
    const { state } = useLocation();
    
    //const displayFields = appData.formDefinition?.fields.filter((field: Interfaces.Field) => field.display !== false);
    const displayFields = appData.table?.columns?.filter((field: Interfaces.Field) => field.display !== false && field.displayInTable !== false);
    const settings = appData.formDefinition?.settings;

    const records = getRecords();

    const action = state?.action;
    const recordId = state?.recordId;

    const setCurrentRecord = (event: any) => {
        const targetIndex = event.currentTarget.dataset.index;
        setCurrentRecordToIndex(targetIndex)
    }

    useEffect(() => {
        if (action === 'delete' && recordId && records?.find((record) => record._id === recordId)) {      
            if (confirm("Are you sure you want to delete this record?")) {
                dbDeleteRecord(recordId);            
            }            
        }
    }, [action, recordId]);

    if (!displayFields || !Array.isArray(records)) {
        return
    }

    const showAddedBy = true;

    const getHeaderRow = (displayFields: Interfaces.Field[]) => {
        
        return (
            <tr className="tr-main">
                <th key={-2} className="th-main"></th>
                {showAddedBy && <th key={-1} className="th-main added-by">Added by</th>}
                {displayFields.map((field, index) => (
                    <th key={index} className="th-main">{field.label}</th>
                ))}
            </tr>
        );
    }

    const getRowJsx = (record: any) => {

        const recordId = record._id;

        const cellsJsx = displayFields.map((field: Interfaces.Field, index: number) => {
            const key = field.key;
            const value = record[key];

            return (<td key={index} className="td-main"><DisplayValue field={field} value={value} record={record}/></td>)            
        });
    
        return (
            <tr key={record._id} className="tr-main">
                <td key={-2} className="td-main">
                    <div className="actions">
                        <Link
                            to="/records"
                            state={{ action: "delete", recordId }}
                        >
                            <Icon name="delete" />
                        </Link>
                        <Link
                            to="/form"
                            onClick={setCurrentRecord}
                            data-index={record._index}
                            data-id={recordId}
                            state={{ recordId }}
                        >
                            <Icon name="edit" />
                        </Link>
                    </div>
                </td>
                {showAddedBy && (
                    <td key={-1} className="td-main added-by">{record.__user?.name ?? "N/A"}</td>
                )}

                {cellsJsx}
            </tr>
        );
    }

    const rowsJsx = records.map((record: any) => getRowJsx(record));

    return (
        <>
            <PaginationControls />
            <div className="records-table-container">
                <table className="records-table">
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