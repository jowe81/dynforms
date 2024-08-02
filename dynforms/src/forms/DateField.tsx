function DateField(props: any) {

    let { field, record, onChange, readOnly } = props;

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
                    name={ field.key } 
                    value={record[field.key] ?? ''} 
                    data-key={field.key}
                    onChange={onChange}
                    disabled={readOnly || field.readOnly}
                />                                        
                </div>            
        </>
    )
}

export default DateField;