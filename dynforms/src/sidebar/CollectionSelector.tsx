import { Interfaces } from "../forms/Form";
import './collectionSelector.css';
import useAppData from "../hooks/useAppData.ts";

function CollectionSelector(props: any) {

    const { appData } = useAppData();
    const onChange = props.onChange;
    let options: Interfaces.SelectFieldOption[] = [];

    if (Array.isArray(appData.formTypes)) {
        const spacer = {
            label: "_".repeat(55),
            value: "",
            disabled: true,
        };

        // Grab all options together by default.
        let allOptions = appData.formTypes.map(formDefinitionToSelectOption);
        let optionsUntilFormDefs = [...allOptions];
        let optionsFromFormDefs = [];

        // If the form definitions option is present, put a spacer option before it.
        const formDefsIndex = allOptions.findIndex((option: any) => option.value === 'dynforms__FormDefinitions');        
        if (formDefsIndex !== -1) {
            optionsUntilFormDefs = allOptions.slice(0, formDefsIndex); // Get only the options preceding the form definitions one.
            optionsFromFormDefs = allOptions.slice(formDefsIndex);
        }

        options = [
            {
                label: 'Select...',
                value: '',
                disabled: true,
            },
            spacer,
            ...optionsUntilFormDefs,            
        ]

        if (optionsFromFormDefs.length) {
            options.push(spacer, ...optionsFromFormDefs);
        }
    }    
        
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

function formDefinitionToSelectOption(formDefinition: Interfaces.FormType) {
    return { label: formDefinition.title, value: formDefinition.collectionName };
}

export default CollectionSelector;