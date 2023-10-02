import { useState } from 'react';
import _ from 'lodash';
import InputField from './InputField.tsx';
import TextareaField from './TextareaField.tsx';
import DateField from './DateField.tsx';

function SubfieldArray(props: any) {
    const [ record, setRecord ] = useState({});
    const { fields, keys } = props;
    

    if (!(fields && fields.length)) {
        return <>Subfield Array contains no fields.</>
    }


    if (!Object.keys(record).length) {
        console.log('Initializing Record');
        setRecord(initializeRecord(fields));
    }


    return fields.map((field, index) => {
        const path = keys.join('.');
        const fullKey = path ? `${path}.${field.key}` : field.key; 
    
        function onChange(event: Event) {        
            const key = event?.currentTarget?.dataset?.key;
            const fullKeySet = [ ...keys, key ];

            const fieldValue = event.target.value;
            console.log(`*** Setting field ${fullKeySet.join('.')} to '${fieldValue}'` );
            console.log('Current record:', record);
            let newRecord = _.cloneDeep(record);
            arrSet(newRecord, fullKeySet, fieldValue);
            console.log('newRecord:', newRecord);

            setRecord(_.cloneDeep(newRecord)); 
        }
    
        const props = {
            fullKey,
            keys,
            field,
            record,            
            onChange,
        }

        switch (field.type) {
            case 'text':
                return (<div key={index} className="form-element-container"><InputField {...props}/></div>);
            
            case 'textarea':
                return (<div key={index} className="form-element-container"><TextareaField {...props}/></div>);
                
            case 'date':
                return (<div key={index} className="form-element-container"><DateField {...props}/></div>);

            case 'subfield_array':
                const subfieldKeys = [ ...keys, field.key ];
                const subRecord = record[field.key as keyof Object];

                return (
                    <div key={index} className="form-subfield-array-container">
                        <SubfieldArray 
                            keys={subfieldKeys} 
                            record={subRecord}
                            {...field}
                        />
                    </div>
                );

        }
        
    })
}


function initializeRecord(fields: []) {

    const record = {};

    fields.forEach(field => {
        const type: String = field['type'];
        const key: String = field['key'];

        switch (type) {

            case "subfield_array":
                record[key] = initializeRecord(field['fields']);
                break;

            default:
                record[key] = '';
                break;
        }
    });

    return record;
}

function arrSet(obj: Object, key: Object | string, value: any) {
    const keys = typeof key === 'object' ? key : key.split('.');

    if (!Array.isArray(keys)) {
        console.log('arrSet: invalid params')
        return;
    }

    let current = obj;

    console.log('arrSet: obj', obj, 'keys: ', keys, 'value', value, );

    while (keys.length) {
        const key: String = keys.shift();
        console.log(`-- This key: ${key}. Have ${keys.length} more key(s).`);   



        if (keys.length) {
            console.log(`-- Going deeper, setting ${current[key]} to {}`);
            current[key] = {};
            current = current[key];
        } else {
            console.log(`-- Assigning target value ${value}`);
            current[key] = value;
        }                           

    }
    console.log('Returning obj', obj);

    return obj;
}

export default SubfieldArray;