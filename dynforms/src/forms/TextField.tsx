import useAppData from "../hooks/useAppData";

function TextField(props: any) {
    const { appData } = useAppData();    
    const settings = appData.formDefinition?.settings;

    let {field, record, onChange } = props;

    if(!field) {
        return;
    }

    if (!record) {
        record = {};
    }
    
    const key = field.key;

    let preview;

    if (field.isImagePath && record[key]) {
        preview = <div>
            <div className="field-text-field-thumbnail thumbnail"><img src={settings.images.baseUrl + record[key]}/></div>
        </div>
    }
    
    return (
        <>            
            <div className="field-text-field">
                <input 
                    name={key} 
                    data-key={key}
                    value={record[key] ?? ''}
                    onChange={onChange}
                    disabled={field.readOnly}
                />
            </div>
            {preview}
        </>
    )
}

export default TextField;