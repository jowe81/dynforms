import ArrayField from './ArrayField.tsx';

import './form.css';

import { useState, useEffect } from 'react';

function Form(props: any) {
    const [ record, setRecord ] = useState({
        'title': 'Travel',
        'request': 'Sufficient funds',
        'updates': [
            {
                'update': 'Transfer',
                'date': '2023-09-30',
            },
            {
                'update': 'Another transfer',
                'date': '2023-10-01',
            },
        ]
    });

    useEffect(() => {
        console.log('Effect', record);
    }, [record]);

    function updateRecord(fullKeySet: String[], data: any) {
        const newRecord = {...record};        
        arrSet(newRecord, fullKeySet, data);
        console.log('New record:', newRecord);
        setRecord(newRecord);
    }
    
    let collectionName: string = props.collectionName;
    let formDefinition: any = props.formDefinition;
    
    if (!formDefinition) {
        return <div>Definition for '{collectionName}' not found.</div>;
    }
    

    if (!Object.keys(record).length) {
        setRecord(initializeRecord(formDefinition.fields));
    }


    const formProps = {
        ...formDefinition,
        keyPath: '',
        keys: [],
        record,
        updateRecord,
    }

    return <div className='form-container'><ArrayField {...formProps}/></div>
}


function initializeRecord(fields: []) {

    const record = {};

    fields.forEach(field => {
        const type: String = field['type'];
        const key: String = field['key'];

        switch (type) {

            case "array":
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