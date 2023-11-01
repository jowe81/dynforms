import { Interfaces } from "../forms/Form";
import DisplayValue from "./DisplayValue";
import useAppData from "../hooks/useAppData";
import './group.css';

function Group(props: any) {
    const { appData } = useAppData();    
    const settings = appData.formDefinition?.settings;

    let {field, record} = props;

    if(!field || field.type !== 'group') {
        return;
    }

    const group = field;

    if (!Array.isArray(group.fields)) {        
        return;
    }

    if (!record) {
        record = {};
    }


    const fields = group.fields;

    const groupFieldsJsx = fields.map((field: Interfaces.Field, index: number) => {
        const key = field.key;
        const value = record[key];

        return <tr key={index}>
            <td>
                {field.label}:
            </td>
            <td>
                <DisplayValue field={field} value={value}/>
            </td>            
        </tr>
    });

    return <>
        <table className="fieldGroupTable">
            <tbody>{groupFieldsJsx}</tbody>
        </table>
    </>

}

export default Group;