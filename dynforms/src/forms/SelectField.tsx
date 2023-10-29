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
    
    const options = [...field.options];
    
    options.unshift({
        label: 'Select one...',
        value: '',
        disabled: true,
    }, {
        label: '_'.repeat(55),
        value: '',
        disabled: true,
    });
    
    const optionsJsx = options.map(
        (option, index) => <option key={index} value={option.value} disabled={option.disabled}>{option.label}</option>
    )

    return (
        <>            
            <div>
                <select 
                    name={ field.key }                     
                    data-key={field.key} 
                    value={record[field.key] ?? ''}                    
                    onChange={onChange}
                    multiple={field.multiple}
                    disabled={field.readOnly}
                >
                    {optionsJsx}
                </select>
            </div>
        </>
    )
}

export default SelectField;