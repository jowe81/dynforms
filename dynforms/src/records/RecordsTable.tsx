import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";

import useAppData from '../hooks/useAppData.ts';
import { Interfaces } from '../forms/Form.tsx';
import './records.css';
function RecordsTable() {

    const { appData, getRecords, dbDeleteRecord } = useAppData();
    const { state } = useLocation();
    
    const fields = appData.formDefinition?.fields;

    const records = getRecords();

    const action = state?.action;
    const recordId = state?.recordId;

    useEffect(() => {
        if (action === 'delete' && recordId) {            
            dbDeleteRecord(recordId);            
        }
    }, [action, recordId]);

    if (!fields || !Array.isArray(records)) {
        return
    }

    // Put the fields in the order of rank.
    fields.sort((a, b) => {             
        return a.rank > b.rank ? 1 : -1
    })

    const getHeaderRow = (fields: Interfaces.Field[]) => {
        
        return (
            <tr>
                <th></th>{fields.map((field, index) => {
                    return <th key={index}>{field.label}</th>})}
            </tr>);
    }

    const getRowJsx = (record: any) => {

        const recordId = record._id;

        const cellsJsx = fields.map((field: Interfaces.Field, index: number) => {
            const key = field.key;
            const value = record[key];

            let displayValue = '';

            switch(field.type) {
                case 'subfieldArray':                        
                    if (!value.length) {
                        displayValue = `none`;
                    } else if (value.length === 1) {
                        displayValue = value.length + ' item';
                    } else {
                        displayValue = value.length + ' items';
                    }
                    break;

                case 'boolean':
                    displayValue = value ? "yes" : "no";
                    break;

                default:
                    displayValue = value;
            }

            return (<td key={index}>{displayValue}</td>)            
        });
    
        return <tr key={record._id} className='row'>
                    <td key={-1}>
                        <div>
                            <Link to="/records" state={{action: 'delete', recordId}}>Delete</Link>&nbsp;
                            <Link to="/form" state={{recordId}}>Edit</Link>
                            {recordId}
                        </div>   
                    </td>

            {cellsJsx}
        </tr>;
    }

    const rowsJsx = records.map((record: any) => getRowJsx(record));

    return (
        <>
            <table>
                <tbody>
                    {getHeaderRow(fields)}
                    {rowsJsx}
                </tbody>
            </table>
        </>
        
    )
}

export default RecordsTable;