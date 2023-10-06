import TextField from './TextField.tsx';
import TextareaField from './TextareaField.tsx';
import DateField from './DateField.tsx';
import BooleanField from './BooleanField.tsx';
import PhoneField from './PhoneField.tsx';
import EmailField from './EmailField.tsx';
import ArrayField from './ArrayField.tsx';
import SubfieldArray from './SubfieldArray.tsx';


function Field(props: any) {
    const { record, itemIndex, updateRecord, field, keys } = props;

    if (field.hidden) {
        // For now don't render hidden fields at all.
        return;
    }
 
    const path = keys.join('.');
    const fullKey = path ? `${path}.${field.key}` : field.key; 

    function onChange(event: any) {        
        const key = event?.currentTarget?.dataset?.key;        

        // The itemIndex will be undefined if the field isn't part of an array; it then needs to be excluded from the keyset.
        const fullKeySet = [ ...keys, itemIndex, key ].filter(item => ![undefined, null].includes(item));

        let keyToValue = Object.keys(event.target).includes('checked') ? 'checked' : 'value';

        const fieldValue = event.target[keyToValue];

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

        case 'boolean':
            return (<div className="form-element-container"><BooleanField {...fieldProps}/></div>);

        case 'phone':
            return (<div className="form-element-container"><PhoneField {...fieldProps}/></div>);
    
        case 'email':
            return (<div className="form-element-container"><EmailField {...fieldProps}/></div>);    
    
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
                <>
                    { field.label }
                    <div className="form-subfield-array-container">                    
                        <SubfieldArray 
                            keys={subfieldKeys} 
                            record={subRecord}
                            updateRecord={updateRecord}
                            {...field}
                        />
                    </div>
                </>
            );
            

    }
        
}

export default Field;