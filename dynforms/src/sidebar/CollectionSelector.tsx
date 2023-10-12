import { Interfaces } from "../forms/Form";
import { formTypes } from '../formTypes.ts';

function CollectionSelector(props: any) {

    const onChange = props.onChange;
    const options: Interfaces.SelectFieldOption[] = formTypes.map((formDefinition) => { return { label: formDefinition.title, value: formDefinition.collectionName }});
    
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
        <select 
            value={props.value ?? ''} 
            onChange={onChange}
        >   
            { optionsJsx }
        </select>
    )
}

export default CollectionSelector;