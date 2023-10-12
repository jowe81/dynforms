function TextField(props: any) {

    let { keys, field, record, onChange } = props;

    if(!field) {
        return;
    }

    if (!record) {
        record = {};
    }
    
    return (
        <>
            <label>{ field.label }</label>
            <div>
                <input 
                    name={field.key} 
                    data-key={field.key}
                    value={record[field.key] ?? ''}
                    onChange={onChange}
                />
            </div>
        </>
    )
}

export default TextField;