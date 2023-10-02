import InputField from './InputField.tsx';
import TextareaField from './TextareaField.tsx';
import DateField from './DateField.tsx';
import SubfieldArray from './SubfieldArray.tsx';

import './form.css';

import { useState } from 'react';

function Form(props: any) {
    const [ record, setRecord ] = useState({});

    let collectionName: string = props.collectionName;
    let formDefinition: any = props.formDefinition;
    
    console.log(collectionName, formDefinition);

    if (!formDefinition) {
        return <div>Definition for '{collectionName}' not found.</div>;
    }
    
    const formProps = {
        ...formDefinition,
        keyPath: '',
        keys: [],
    }

    return <div className='form-container'><SubfieldArray {...formProps}/></div>
}

export default Form;