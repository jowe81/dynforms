import ArrayField from './ArrayField.tsx';

import './form.css';

import { useState, useEffect } from 'react';

function Form(props: any) {
    const testRecord = {
        'title': 'Travel',
        'request': 'Sufficient funds',
        'updates': [
            // {
            //     'update': 'Transfer',
            //     'date': '2023-09-30',
            // },
            // {
            //     'update': 'Another transfer',
            //     'date': '2023-10-01',
            // },
        ]
    };

    const [ record, setRecord ] = useState({});

    useEffect(() => {
        // console.log('Effect', record);
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


function initializeRecord(fields: Interfaces.Field[]) {

    const record: any = {};

    fields.forEach(field => {
        const type: Interfaces.FieldTypeString = field.type;
        const key: string = field.key;        
    
        console.log(`Initializing field: ${key} (${type})`, field);
        
        switch (type) {

            case 'subfieldArray':
                record[key] = [];//initializeRecord(field.fields);
                break;

            case 'array':
                record[key] = initializeRecord(field.fields);
                break;

            default:
                record[key] = '';
                break;
        }
    });
    console.log('finished record', record)
    return record;
}

function arrSet(obj: any, key: Object | string, value: any) {
    const keys = typeof key === 'object' ? key : key.split('.');

    if (!Array.isArray(keys)) {
        console.log('arrSet: invalid params')
        return;
    }

    let current = obj;

    while (keys.length) {
        const key: string = keys.shift();

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


export namespace Interfaces {
    export interface FormType {
        collectionName: string;
        title: string;
        fields: Field[];
    }

    export type FieldTypeString = 
        'text' | 'phone' | 'email' |
        'textarea'|'boolean'|'date'|'array'|'subfieldArray';
    
    export type Field = BaseField | BooleanField | TextField | TextareaField | SubfieldArray;

    export interface BaseField {
        key: string;
        label?: string;
        type: FieldTypeString;
        rank?: number;
        defaultValue?: string | boolean;
        placeholder?: string;
        hidden?: boolean;
    }

    export interface BooleanField extends BaseField {
        value?: true | false | null;
    }
    
    export interface TextField extends BaseField {
        maxLength?: number;
    }

    export interface TextareaField extends BaseField {
        rows?: number;
    }

    export interface ArrayField extends BaseField {
        fields: Field[];
    }

    export interface SubfieldArray extends BaseField {
        fields: Field[];
    }
}

