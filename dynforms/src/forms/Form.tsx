import InputField from './InputField.tsx';
import TextareaField from './TextareaField.tsx';
import DateField from './DateField.tsx';
import SubfieldArray from './SubfieldArray.tsx';

import './form.css';

import { useState } from 'react';

function Form(props: any) {
    const [ record, setRecord ] = useState({});

    function updateRecord(fullKeySet: String[], data: any) {
        console.log('UpdateRecord for key: ', fullKeySet.join('.'), 'data: ', data);
        console.log('Current Full Record', record);
        const newRecord = {...record};        
        arrSet(newRecord, fullKeySet, data);
        console.log('New record:', newRecord);
        setRecord(newRecord);
    }
    
    let collectionName: string = props.collectionName;
    let formDefinition: any = props.formDefinition;
    
    console.log(collectionName, formDefinition);

    if (!formDefinition) {
        return <div>Definition for '{collectionName}' not found.</div>;
    }
    

    if (!Object.keys(record).length) {
        console.log('Initializing Record');
        setRecord(initializeRecord(formDefinition.fields));
    }


    const formProps = {
        ...formDefinition,
        keyPath: '',
        keys: [],
        record,
        updateRecord,
    }

    return <div className='form-container'><SubfieldArray {...formProps}/></div>
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

    while (keys.length) {
        const key: String = keys.shift();

        if (keys.length) {
            if (typeof current[key] === undefined) { 
                current[key] = {};
            }
            current = current[key];
        } else {
            current[key] = value;
        }                           

    }

    return obj;
}

export default Form;