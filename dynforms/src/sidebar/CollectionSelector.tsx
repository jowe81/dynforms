import { Interfaces } from "../forms/Form";
import './collectionSelector.css';
import useAppData from "../hooks/useAppData.ts";

function CollectionSelector(props: any) {

    const { appData } = useAppData();
    const onChange = props.onChange;
    let options: Interfaces.SelectFieldOption[] = [];

    if (Array.isArray(appData.formTypes)) {
        // Add in a spacer between the Form Definitions collection (dynforms__FormDefinitions) and everything after.
        const spacer = {
            label: "_".repeat(55),
            value: "",
            disabled: true,
        };

        const formDefsIndex = appData.formTypes.findIndex((formDefinition: Interfaces.FormType) => formDefinition.collectionName === 'dynforms__FormDefinitions');
        const optionsUntilFormDefs = appData.formTypes
            .slice(0, formDefsIndex) // Get only the options preceding the form definitions one.
            .map(formDefinitionToSelectOption);

        const optionsFromFormDefs = appData.formTypes
            .slice(formDefsIndex)
            .map(formDefinitionToSelectOption);

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