import Field from './Field.tsx';


function ArrayField(props: any) {
    const { record, updateRecord, fields, keys } = props;
    

    if (!(fields && fields.length)) {
        return <>Array field contains no fields.</>
    }

    return fields.map((field: any, index: number) => {
        
        const props = {
            keys,
            field,
            record,            
            updateRecord,
        }

        return <Field key={index} {...props}></Field>;
    })
}

export default ArrayField;