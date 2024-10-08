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
    const [ validationErrors, setValidationErrors ] = useState([]);

    const { appData, dbUpdateRecord, adjustCurrentRecord } = useAppData();
    const { collectionName } = appData;

    const formDefinition = appData.formTypes?.find((formDefinition: Interfaces.FormType) => formDefinition.collectionName === collectionName);

    const { state } = useLocation();

    const recordId = state?.createNewRecord ? null : appData.currentRecord?._id;

    useEffect(() => {
        // Selected Collection and/or recordId changed.
        if (formDefinition) {            
            const dbRecord = _.cloneDeep(appData?.records?.find((record: Interfaces.MongoRecord) => record._id === recordId));
            setRecord(dbRecord ? dbRecord : initializeRecord(formDefinition.fields));
        }        
    }, [collectionName, recordId]);
    
    useEffect(() => {
        // Focus on the first element if its a new record.
        if (recordId) {
            return;
        }

        // With help from ChatGPT
        const formElement = document.querySelector(".form-container");
        if (formElement) {
            const firstFocusableElement = formElement.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
                "input:not(:disabled), textarea:not(:disabled), select:not(:disabled)"
            );
            if (firstFocusableElement) {
                firstFocusableElement.focus();
            }
        }
    }, []);

    function updateRecord(fullKeySet: String[], data: any, supressSetEdited = false) {
        const newRecord = {...record};        
        arrSet(newRecord, fullKeySet, data);
        setRecord(newRecord);

        if (!supressSetEdited) {
            setEdited(true);
        } 
    }

    function handleSubmit(event: any) {
        const next = event.currentTarget.dataset.next;
        if (!edited) {
            console.log('Record was not edited - not updating.');
            navigate("/records"); 
            return;
        }

        dbUpdateRecord(record)
        .then(() => {
            console.log('Record Updated');
            if (next) {
                // This handles both the next and the previous button.
                adjustCurrentRecord(next).then(() => {
                    console.log("Adjusted index.");
                    navigate('/form');
                    setEdited(false);    
                });
            } else {
                navigate('/records');                
            }
        })
        .catch(err => {
            const response = err.response.data;

            if (response.error === 'validation_errors') {
                setValidationErrors(response.validationErrors);
            }            
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

    let actionsJSX;

    if (recordId) {
        actionsJSX = (
            <>
                <div className="form-actions-container">
                    {edited && (
                        <button onClick={() => navigate("/records")} className="btn-cancel">
                            {edited ? "Cancel & Back" : "Back"}
                        </button>
                    )}
                    <button onClick={handleSubmit} data-next={-1} className="btn-save">
                        {edited ? "Save & Previous" : "Previous"}
                    </button>
                    <button onClick={handleSubmit} data-next={1} className="btn-save">
                        {edited ? "Save & Next" : "Next"}
                    </button>
                    <button onClick={handleSubmit} className="btn-save">
                        {edited ? "Save & Back" : "Back"}
                    </button>
                </div>
            </>
        );
    } else {
        actionsJSX = (
            <div className="form-actions-container">
                <button onClick={() => navigate("/records")} className="btn-cancel">
                    Cancel
                </button>
                {edited && (
                    <button onClick={handleSubmit} className="btn-save">
                        Save
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="form-outer-container">
            <div className="form-container">
                <div className="form-header-container">
                    <label className="form-header-label">{formDefinition.title}</label>
                </div>

                <ArrayField {...formProps} />
            </div>
            {validationErrors.length > 0 && (
                <div className="form-validation-errors-container">
                    {validationErrors.map((error, index) => (
                        <div key={index}>
                            Field "{error.fieldLabel ?? error.fullKey}": {error.message}
                        </div>
                    ))}
                </div>
            )}
            <div className="form-actions-outer-container">{actionsJSX}</div>
        </div>
    );
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
                console.log(`setting ${key} to ${field.defaultValue}`)
                record[key] = field.defaultValue ?? '';
                break;
        }
    });
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
        'textarea'|'boolean'|'date'|'select'|'array'|'subfieldArray'|'number'|'filesize'|'richText'|'canvas'|'signature' |
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
        displayInTable?: boolean;
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



