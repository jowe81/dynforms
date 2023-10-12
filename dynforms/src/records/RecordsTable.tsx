import useAppData from '../hooks/useAppData.ts';

function RecordsTable(props: any) {

    const { appState } = useAppData();

    const getRowJsx = (record: any) => {

        const cellsJsx = Object.keys(record).map((key, index) => <td key={index}>{typeof record[key] !== 'object' ? record[key] : '...'}</td>);

        return <tr key={record._id}>{cellsJsx}</tr>;
    }

    const rowsJsx = appState.records?.map((record: any) => getRowJsx(record));

    return (
        <>
            <div>Records:</div>
            <table>
                <tbody>
                    {rowsJsx}
                </tbody>
            </table>
        </>
        
    )
}

export default RecordsTable;