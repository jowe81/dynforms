import { Interfaces } from "./Form";

function Textarea(props: any) {

    const field: Interfaces.TextareaField = props.field;    
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
            <div>{ field.label }</div>
            <div>
                <textarea 
                    name={ field.key } 
                    rows={ field.rows } 
                    data-key={field.key} 
                    value={record[field.key]} 
                    onChange={onChange}
                />
            </div>
        </>
    )
}

export default Textarea;