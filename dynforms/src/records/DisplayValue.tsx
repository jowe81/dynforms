import useAppData from "../hooks/useAppData";
import { Interfaces } from "../forms/Form";
import Group from "./Group";

function DisplayValue(props: any) {
    const field: Interfaces.Field = props.field;
    const value: any = props.value;
    const record: any = props.record;

    const { appData } = useAppData();
    
    const settings = appData.formDefinition?.settings;

    
    let displayValue = value;

    switch (field.type) {
        case 'boolean':
            displayValue = value ? "yes" : "no";
            break;

        case 'date':
            displayValue = value ? new Date(value).toLocaleString() : '';
            break;

        case 'filesize':
            displayValue = bytesToHumandReadableSize(value);
            break;

        case 'subfieldArray':
            if (!value?.length) {
                displayValue = `none`;
            } else if (value.length === 1) {
                displayValue = value.length + ' item';
            } else {
                displayValue = value.length + ' items';
            }
            break;

        case 'group':
            displayValue = <Group field={field} record={record} />
            break;
    }

    if (settings?.images.showImages && field.isImagePath) {        
        displayValue = (<>
            <div className="thumbnail"><img src={settings.images.baseUrl + value}/></div>
            <span>{displayValue}</span>
        </>)
    }


    return displayValue;
}

function bytesToHumandReadableSize(bytes: number, unitChars = 1) {
    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

    let index = 0;
    let value = bytes;
    while (value > 1024) {
        value /= 1024;
        index++;
    }

    return Math.round(value) + units[index].substring(0, unitChars);
}

export default DisplayValue;