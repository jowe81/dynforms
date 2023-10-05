import TextField from './TextField.tsx';
import TextareaField from './TextareaField.tsx';
import DateField from './DateField.tsx';
import ArrayField from './ArrayField.tsx';
import SubfieldArray from './SubfieldArray.tsx';


function Field(props: any) {
    const { record, updateRecord, field, keys } = props;
    
    const path = keys.join('.');
    const fullKey = path ? `${path}.${field.key}` : field.key; 

    function onChange(event: any) {        
        const key = event?.currentTarget?.dataset?.key;
        const fullKeySet = [ ...keys, key ];

        const fieldValue = event.target.value;

        console.log(`*** Setting field ${fullKeySet.join('.')} to '${fieldValue}'` );
        console.log('Current record:', record);
        updateRecord(fullKeySet, fieldValue);
    }

    const fieldProps = {
        fullKey,
        keys,
        field,
        record,
        onChange,
    }

    const subfieldKeys = [ ...keys, field.key ];
    const subRecord = record[field.key as keyof Object];

    switch (field.type) {
        case 'text':
            return (<div className="form-element-container"><TextField {...fieldProps}/></div>);
        
        case 'textarea':
            return (<div className="form-element-container"><TextareaField {...fieldProps}/></div>);
            
        case 'date':
            return (<div className="form-element-container"><DateField {...fieldProps}/></div>);

        case 'array':                                
            return (
                <div className="form-array-container">
                    <ArrayField 
                        keys={subfieldKeys} 
                        record={subRecord}
                        updateRecord={updateRecord}
                        {...field}
                    />
                </div>
            );
        
        case 'subfieldArray':
            return (
                <div className="form-subfield-array-container">
                    <SubfieldArray 
                        keys={subfieldKeys} 
                        record={subRecord}
                        updateRecord={updateRecord}
                        {...field}
                    />
                </div>
            );
            

    }
        
}

export default Field;