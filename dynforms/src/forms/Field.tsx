import { Interfaces } from "./forms/Form";

import TextField from './TextField.tsx';
import TextareaField from './TextareaField.tsx';
import DateField from './DateField.tsx';
import BooleanField from './BooleanField.tsx';
import PhoneField from './PhoneField.tsx';
import EmailField from './EmailField.tsx';
import SelectField from './SelectField.tsx';
import ArrayField from './ArrayField.tsx';
import PlainArrayField from "./PlainArrayField.tsx";
import SubfieldArray from './SubfieldArray.tsx';

import FieldLabel from "./FieldLabel.tsx";


function Field(props: any) {
    const { record, itemIndex, updateRecord, field, readOnly, keys } = props;

    if (field.display === false) {
        // For now don't render hidden fields at all.
        return;
    }

    const path = keys.join('.');
    const fullKey = path ? `${path}.${field.key}` : field.key; 

    // Return an array of keys that together make up the full key to the current field.
    function getFullKeySet(key: any) {
        // The itemIndex will be undefined if the field isn't part of an array; it then needs to be excluded from the keyset.
        return [...keys, itemIndex, key].filter((item) => ![undefined, null].includes(item));
    }

    // General handilng for changes in most fields.
    function onChange(event: any) {        
        const key = event?.currentTarget?.dataset?.key;                
        const keyToValue = Object.keys(event.target).includes('checked') ? 'checked' : 'value';
        const fieldValue = event.target[keyToValue];

        updateRecord(getFullKeySet(key), fieldValue);        
    }

    // Special handling for date fields because of the picker.
    function onDateChange(date: any, key: any) {
        const fieldValue = date.toISOString();

        updateRecord(getFullKeySet(key), fieldValue);        
    }

    const fieldProps = {
        fullKey,
        keys,
        field,
        record,
        readOnly, // Form level
        onChange,
        onDateChange,
    };

    const subfieldKeys = [ ...keys, field.key ];
    const subRecord = record[field.key as keyof Object];

    const annotationJsx = field.annotation ? <div className="form-annotation">{field.annotation}</div> : null;

    let jsx;

    switch (field.type) {
        case 'text':
        case 'number':
        case 'filesize':
        case 'birthday':
        case 'url':
            jsx =  (<div className="form-element-container"><TextField {...fieldProps}/></div>);
            break;
        
        case 'textarea':
        case 'json':
            jsx =  (<div className="form-element-container">{annotationJsx}<TextareaField {...fieldProps}/></div>);
            break;
            
        case 'date':
            jsx =  (<div className="form-element-container"><DateField {...fieldProps}/></div>);
            break;

        case 'boolean':
            jsx =  (<div className="form-element-container"><BooleanField {...fieldProps}/></div>);
            break;

        case 'phone':
            jsx =  (<div className="form-element-container"><PhoneField {...fieldProps}/></div>);
            break;
    
        case 'email':
            jsx =  (<div className="form-element-container"><EmailField {...fieldProps}/></div>);    
            break;

        case 'select':
            jsx =  (<div className="form-element-container"><SelectField {...fieldProps}/></div>);                
            break;

        case 'array':                                
            jsx =  (
                <div className="form-array-container">
                    <ArrayField 
                        keys={subfieldKeys} 
                        record={subRecord}
                        updateRecord={updateRecord}
                        {...field}
                    />
                </div>
            );
            break;

        case 'plainArray':
            jsx =  (<div className="form-element-container"><PlainArrayField {...fieldProps}/></div>);
            break;
        
        case 'subfieldArray':
            jsx =  (
                <>
                    <div className="form-subfield-array-container">                    
                        <SubfieldArray 
                            keys={subfieldKeys} 
                            record={subRecord}
                            updateRecord={updateRecord}
                            readOnly={readOnly}
                            {...field}
                        />
                    </div>
                </>
            );
            break;            
    }

    return <>
        <div className="form-element-outer-container">
            <FieldLabel field={field}/>
            {jsx}
        </div>
    </>;
        
}

export default Field;