import { Interfaces } from "./Form";

function SelectField(props: any) {

    const field: Interfaces.SelectField = props.field;    
    let { keys, record, onChange } = props;

    if(!field) {
        return;
    }

    if (!record) {
        record = {};
    }
    
    const path = keys.join('.');
    const fullKey = path ? `${path}.${field.key}` : field.key; 
    
    return (
        <>
            <label>{ field.label }</label>
            <div>
                <select 
                    name={ field.key }                     
                    data-key={field.key} 
                    value={record[field.key]} 
                    onChange={onChange}
                >
                { 
                    field.options.map(
                        (option, index) => <option key={index} value={option.value}>{option.label}</option>
                    )
                }
                </select>
            </div>
        </>
    )
}

export default SelectField;