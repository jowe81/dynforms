function DateField(props: any) {

    let { field, record, onChange } = props;

    if(!field) {
        return;
    }

    if (!record) {
        record = {};
    }
        
    return (
        <>
            <div>{ field.label }</div>
            <div>
                <input 
                    name={ field.key } 
                    value={record[field.key]} 
                    data-key={field.key}
                    onChange={onChange}/>
                </div>            
        </>
    )
}

export default DateField;