function BooleanField(props: any) {

    let { keys, field, record, onChange } = props;

    if(!field) {
        return;
    }

    if (!record) {
        record = {};
    }
    console.log(`field ${field.key}: ${record[field.key]}`);
    return (
        <>
            <div></div>
            <div>
                <input
                    type="checkbox"
                    name={field.key} 
                    data-key={field.key}
                    checked={record[field.key]}                    
                    onChange={onChange}
                    
                />
                { field.label }
            </div>
        </>
    )
}

export default BooleanField;