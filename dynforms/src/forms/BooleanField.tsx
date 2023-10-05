function BooleanField(props: any) {

    let { keys, field, record, onChange } = props;

    if(!field) {
        return;
    }

    if (!record) {
        record = {};
    }
    
    return (
        <>
            <div></div>
            <div>
                <input
                    type="checkbox"
                    name={field.key} 
                    data-key={field.key}
                    value={record[field.key]}
                    onChange={onChange}
                />
                { field.label }
            </div>
        </>
    )
}

export default BooleanField;