import _ from 'lodash';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import useAppData from '../hooks/useAppData.ts';
import './form.css';

import ArrayField from './ArrayField.tsx';

function Form() {    
    const navigate = useNavigate();
    const [ record, setRecord ] = useState({});
    const [ edited, setEdited ] = useState(false);

    const { appData, dbUpdateRecord, adjustCurrentRecord } = useAppData();
    const { collectionName } = appData;

    const formDefinition = appData.formTypes?.find((formDefinition: Interfaces.FormType) => formDefinition.collectionName === collectionName);

    const { state } = useLocation();
    const recordId = appData.currentRecord?._id;

    useEffect(() => {
        // Selected Collection and/or recordId changed.
        if (formDefinition) {            
            const dbRecord = _.cloneDeep(appData?.records?.find((record: Interfaces.MongoRecord) => record._id === recordId));
            setRecord(dbRecord ? dbRecord : initializeRecord(formDefinition.fields));
        }        
    }, [collectionName, recordId]);

    function updateRecord(fullKeySet: String[], data: any) {
        const newRecord = {...record};        
        arrSet(newRecord, fullKeySet, data);
        setRecord(newRecord);
    }

    function handleSubmit(event: any) {
        const next = event.currentTarget.dataset.next;

        dbUpdateRecord(record)
        .then(() => {
            if (next) {
                adjustCurrentRecord(next).then(() => {
                    navigate('/form');
                    setEdited(false);    
                });
            } else {
                navigate('/records');                
            }
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
        setEdited,
        updateRecord,        
    }

    return (<div className="form-outer-container">
        <div className='form-container'>
            <div className="form-header-container">
                <label>Collection: {collectionName}</label>
            </div>

            <ArrayField {...formProps}/>

        </div>
        <div className="form-actions-outer-container">
            <div className="form-actions-container">
                { edited && <button onClick={() => navigate('/records')}>{edited ? 'Cancel & Back' : 'Back'}</button>}
                <button onClick={handleSubmit} data-next={-1}>{edited ? 'Save & Previous' : 'Previous'}</button>
                <button onClick={handleSubmit} data-next={1}>{edited ? 'Save & Next' : 'Next'}</button>
                <button onClick={handleSubmit}>{edited ? 'Save & Back' : 'Back'}</button>
            </div>
        </div>

    </div>)
}


function initializeRecord(fields: Interfaces.Field[]) {

    const record: any = {};

    fields.forEach((field: any) => {
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
        'textarea'|'boolean'|'date'|'select'|'array'|'subfieldArray'|'number'|'filesize' |
        'group';
    
    export type Field = BaseField | BooleanField | TextField | TextareaField | SubfieldArray | SelectField | ArrayField;

    export interface BaseField {
        key: string;
        label?: string;
        type: FieldTypeString;
        rank?: number;
        defaultValue?: string | boolean;
        placeholder?: string;
        hidden?: boolean;
        fields?: Field[];
        groupId?: string;
        display?: boolean;
        readOnly?: boolean;
        isImagePath?: boolean; // This can be on text, select
    }

    export interface Group {
        id: string;
        name?: string;
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



