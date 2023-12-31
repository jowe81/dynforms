function PhoneField(props: any) {

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
                    value={record[field.key]}
                    placeholder={field.placeholder}
                    onChange={onChange}
                />
            </div>
        </>
    )
}

export default PhoneField;