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
    
    let preview;

    if (field.isImagePath) {
        preview = <div>
            <div className="field-text-field-thumbnail thumbnail"><img src={settings.images.baseUrl + record[field.key]}/></div>
        </div>
    }
    

    return (
        <>            
            <div className="field-text-field">
                <input 
                    name={field.key} 
                    data-key={field.key}
                    value={record[field.key] ?? ''}
                    onChange={onChange}
                    disabled={field.readOnly}
                />
            </div>
            {preview}
        </>
    )
}

export default TextField;