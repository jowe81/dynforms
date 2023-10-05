import InputField from './InputField.tsx';
import TextareaField from './TextareaField.tsx';
import DateField from './DateField.tsx';
import ArrayField from './ArrayField.tsx';


function SubfieldArray(props: any) {
    const { record, updateRecord, fields, keys } = props;
    
    if (!Array.isArray(record)) {
        return;
    }

    if (!(fields && fields.length)) {
        return <>Subfield Array contains no fields.</>
    }

    function addEntry() {
        updateRecord(keys, [...record, getBlankItem(fields)]);
    }

    function getBlankItem(fields) {
        const item = {};
        fields.forEach((field) => {
            item[field.key] = field.defaultValue ?? '';
        });

        return item;
    }


    return (
    <div>
            <div>
                <div className='form-link' onClick={addEntry}>
                    + Add Entry
                </div>
            </div>
            { record.map((arrayItem, itemIndex) => {

                return fields.map((field: any, fieldIndex: number) => {            
                    const path = keys.join('.');
                    const fullKey = path ? `${path}.${field.key}` : field.key; 
                
                    function onChange(event: any) {       
                        const key = event?.currentTarget?.dataset?.key;
                        const fullKeySet = [ ...keys, itemIndex, key ];

                        const fieldValue = event.target.value;

                        console.log(`Setting field ${fullKeySet.join('.')} to '${fieldValue}'` );
                                                
                        const newArray = [ ...record ];
                        newArray[itemIndex][key] = fieldValue;
                        
                        updateRecord(keys, newArray);
                    }
                
                    const props = {
                        fullKey,
                        keys,
                        field,
                        record: arrayItem,            
                        onChange,
                    }
                    
                    switch (field.type) {
                        case 'text':
                            return (<div key={fieldIndex} className="form-element-container"><InputField {...props}/></div>);
                        
                        case 'textarea':
                            return (<div key={fieldIndex} className="form-element-container"><TextareaField {...props}/></div>);
                            
                        case 'date':
                            return (<div key={fieldIndex} className="form-element-container"><DateField {...props}/></div>);

                    }
                })
            })}
        </div>
    )
}

export default SubfieldArray;