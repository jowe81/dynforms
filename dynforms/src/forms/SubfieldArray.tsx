import TextField from './TextField.tsx';
import TextareaField from './TextareaField.tsx';
import DateField from './DateField.tsx';
import ArrayField from './ArrayField.tsx';

import Field from './Field.tsx';

import { Interfaces } from './Form.tsx';


function SubfieldArray(props: any) {
    const { record, updateRecord, fields, keys } = props;
    
    if (!Array.isArray(record)) {
        return;
    }

    if (!(fields && fields.length)) {
        return <>Subfield Array contains no fields.</>
    }

    function addEntry() {
        updateRecord(keys, [...record, getBlankItem(fields)], true);
    }

    function removeEntry(event) {
        const itemIndex = event.target.dataset.itemIndex;
        console.log('Delete index', itemIndex);

        updateRecord(keys, record.toSpliced(itemIndex, 1));
    }

    function getBlankItem(fields: Interfaces.Field[]) {
        const item = {};
        fields.forEach((field: Interfaces.Field) => {
            item[field.key] = field.defaultValue ?? '';
        });

        return item;
    }

    return (
        <>  
            <div className="form-subfield-array-header form-header">                
                <a href="#" className='form-link' onClick={addEntry}>
                    + Add Entry
                </a>
            </div>
            { record.map((arrayItem, itemIndex) => {                
                return (
                    <div className="form-subfield-array-item-container" key={itemIndex}>
                        <div className="form-subfield-array-item-header form-header">
                            <a href="#" className='form-link' data-item-index={itemIndex} onClick={removeEntry}>Delete</a>
                        </div>
                        {
                                    
                            fields.map((field: any, fieldIndex: number) => {            
                                const path = keys.join('.');
                                const fullKey = path ? `${path}.${field.key}` : field.key; 
                                                        
                                const props = {
                                    fullKey,
                                    keys,
                                    field,
                                    record: arrayItem,
                                    itemIndex,
                                    updateRecord,
                                }
                                            
                                return <Field key={fieldIndex} {...props}></Field>;
                        
                            })

                        }
                    </div>
                )
                
            })}
        </>
    )
}

export default SubfieldArray;