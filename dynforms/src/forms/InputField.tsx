function Input(props: any) {

    let { keys, field, record, onChange } = props;

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
                    name={field.key} 
                    data-key={field.key}
                    value={record[field.key]}
                    onChange={onChange}
                />
            </div>
        </>
    )
}

export default Input;