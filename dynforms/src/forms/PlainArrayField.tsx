function PlainArrayField(props: any) {

    let { keys, field, record, onChange } = props;

    if(!field) {
        return;
    }

    if (!record) {
        record = {};
    }
    
    return (
        <>
            
            <div>
                <input 
                    name={field.key} 
                    data-key={field.key}
                    value={record[field.key] ?? ''}
                    onChange={onChange}
                />
                <button>Add</button>
            </div>
            <div>
                <select></select>
            </div>
        </>
    )
}

export default PlainArrayField;