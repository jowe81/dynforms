import InputField from './InputField.tsx';
import TextareaField from './TextareaField.tsx';
import DateField from './DateField.tsx';

function SubfieldArray(props: any) {
    const { record, updateRecord, fields, keys } = props;
    

    if (!(fields && fields.length)) {
        return <>Subfield Array contains no fields.</>
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
            updateRecord(fullKeySet, fieldValue);
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
                            updateRecord={updateRecord}
                            {...field}
                        />
                    </div>
                );

        }
        
    })
}

export default SubfieldArray;