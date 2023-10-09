import axios from 'axios';

import ArrayField from './ArrayField.tsx';

import './form.css';

import { useState, useEffect } from 'react';

function Form(props: any) {
    const inputRecord = typeof props.record === 'object' ? props.record : {};

    console.log('Input Record', inputRecord)
    const [ record, setRecord ] = useState(inputRecord);

    useEffect(() => {
        // console.log('Effect', record);
    }, [record]);

    let collectionName: string = props.collectionName;
    let formDefinition: any = props.formDefinition;

    function updateRecord(fullKeySet: String[], data: any) {
        const newRecord = {...record};        
        arrSet(newRecord, fullKeySet, data);
        console.log('New record:', newRecord);
        setRecord(newRecord);
    }

    function handleSubmit(event) {
        console.log(`Submitting`, record)
        axios
            .post(`http://localhost:3010/db/post/${collectionName}`, record)
            .then((data) => {

            })
            .catch(err => {
                console.log('Axios error: ', err);
            })

    }
    
    
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

    return (
        <div className='form-container'>
            <ArrayField {...formProps}/>
            <button onClick={handleSubmit}>Submit</button>
        </div>
    )
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
        'textarea'|'boolean'|'date'|'select'|'array'|'subfieldArray';
    
    export type Field = BaseField | BooleanField | TextField | TextareaField | SubfieldArray;

    export interface BaseField {
        key: string;
        label?: string;
        type: FieldTypeString;
        rank?: number;
        defaultValue?: string | boolean;
        placeholder?: string;
        hidden?: boolean;
        fields?: Field[];
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

    export interface SelectField extends BaseField {
        options: SelectFieldOption[];
        multiple: boolean;
    }

    export type SelectFieldOption = {
        label: string;
        value: string|number;
        disabled?: boolean;
    }    

    export interface ArrayField extends BaseField {
        fields: Field[];
    }

    export interface SubfieldArray extends BaseField {
        fields: Field[];
    }
}

