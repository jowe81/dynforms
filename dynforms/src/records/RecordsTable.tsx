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

    const getHeaderRow = (fields: Interfaces.Field[]) => {
        return (<tr><th></th>{fields.map((field, index) => <th key={index}>{field.label}</th>)}</tr>);
    }

    const getRowJsx = (record: any) => {

        const cellsJsx = Object.keys(record).map((key, index) => {

            const value = record[key];

            let cellJsx;

            if (index === 0) {
                cellJsx = (
                    <td key={index}>
                        <div>
                            <Link to="/records" state={{action: 'delete', recordId: value}}>Delete</Link>&nbsp;
                            <Link to="/form" state={{recordId:value}}>Edit</Link>
                        </div>   
                    </td>
                );
            } else {
                const field = fields[index - 1];    

                if (!field) {
                    console.warn(`No field for key ${key} at index ${index}!`);
                }

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

                cellJsx = (<td key={index}>{displayValue}</td>)
            }
            return cellJsx;
        });

        return <tr key={record._id} className='row'>{cellsJsx}</tr>;
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