import { Interfaces } from "../forms/Form";
import './collectionSelector.css';
import useAppData from "../hooks/useAppData.ts";

function CollectionSelector(props: any) {

    const { appData } = useAppData();
    const onChange = props.onChange;
    let options: Interfaces.SelectFieldOption[] = [];

    if (Array.isArray(appData.formTypes)) {
        options = appData.formTypes.map((formDefinition: Interfaces.FormType) => { return { label: formDefinition.title, value: formDefinition.collectionName }});
    }    
    
    options.unshift({
        label: 'Select...',
        value: '',
        disabled: true,
    }, {
        label: '_'.repeat(55),
        value: '',
        disabled: true,
    });
    
    const optionsJsx = options.map(
        (option, index) => <option key={index} value={option.value} disabled={option.disabled}>{option.label}</option>
    )

    return (
        <select id="collection-selector"
            value={props.value ?? ''} 
            onChange={onChange}
        >   
            { optionsJsx }
        </select>
    )
}

export default CollectionSelector;