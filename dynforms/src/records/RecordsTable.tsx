import { Link } from "react-router-dom";

import useAppData from '../hooks/useAppData.ts';
import { Interfaces } from '../forms/Form.tsx';
import './records.css';
function RecordsTable(props: any) {

    const { appState } = useAppData();

    const fields = appState.formDefinition?.fields;
    const records = appState.records;

    if (!fields || !Array.isArray(records)) {
        return
    }
    console.log("Fields:", fields );
    console.log("Records:", records)

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
                        <div><a>Delete</a> <Link to="/form" state={{recordId:value}}>Edit</Link></div>   
                    </td>
                );
            } else {
                const field = fields[index - 1];    

                if (!field) {
                    console.warn(`No field for key ${key} at index ${index}!`);
                }

                cellJsx = (
                    <td key={index}>
                        {typeof record[key] !== 'object' ? record[key] : '...'}
                    </td>
                )
            }
            return cellJsx;
        });

        return <tr key={record._id} className='row'>{cellsJsx}</tr>;
    }

    const rowsJsx = records.map((record: any) => getRowJsx(record));

    return (
        <>
            <div>Records:</div>
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