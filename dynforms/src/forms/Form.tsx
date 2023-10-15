import axios from 'axios';
import _ from 'lodash';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { formTypes } from '../formTypes.ts';
import useAppData from '../hooks/useAppData.ts';
import './form.css';

import ArrayField from './ArrayField.tsx';

function Form(props: any) {    
    const navigate = useNavigate();
    const [ record, setRecord ] = useState({});
    const { appState, dbUpdateRecord } = useAppData();
    const { collectionName } = appState;

    const formDefinition = formTypes.find((formDefinition: Interfaces.FormType) => formDefinition.collectionName === collectionName);

    const { state } = useLocation();
    const recordId = state?.recordId;

    useEffect(() => {
        // Selected Collection and/or recordId changed.
        if (formDefinition) {            
            const dbRecord = _.cloneDeep(appState?.records?.find((record: Interfaces.MongoRecord) => record._id === recordId));
            setRecord(dbRecord ? dbRecord : initializeRecord(formDefinition.fields));
        }        
    }, [collectionName, recordId]);

    function updateRecord(fullKeySet: String[], data: any) {
        const newRecord = {...record};        
        arrSet(newRecord, fullKeySet, data);
        setRecord(newRecord);
    }

    function handleSubmit(event: any) {
        dbUpdateRecord(record)
        .then(() => {
            navigate('/records');
        })
        .catch(err => {
            console.log('Axios error: ', err);
        });
    }
    
    if (!collectionName) {
        return;
    }

    if (!formDefinition) {
        return <div>Definition for '{collectionName}' not found.</div>;
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
            <label>Collection: {collectionName}</label>
            <ArrayField {...formProps}/>
            <button onClick={handleSubmit}>Save</button>
            &nbsp;
            <button onClick={() => navigate('/records')}>Cancel</button>
        </div>
    )
}


function initializeRecord(fields: Interfaces.Field[]) {

    const record: any = {};

    fields.forEach(field => {
        const type: Interfaces.FieldTypeString = field.type;
        const key: string = field.key;        
        
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
    console.log('Initialized record to', record);
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


    export interface MongoRecord {
        _id: string;
    }
}

