import useAppData from "../hooks/useAppData.ts";
import { Interfaces } from "../forms/Form";
import './orderSelector.css';

function OrderSelector(props: any) {
    const { appState } = useAppData();
    const fields = appState?.formDefinition?.fields;

    if (!fields) {
        return;
    }

    const { orderColumn, onOrderColumnSelect } = props;

    const options: Interfaces.SelectFieldOption[] = fields.map((field: Interfaces.Field) => { return { label: field.label, value: field.key }});
            
    const optionsJsx = options.map(
        (option, index) => <option key={index} value={option.value} disabled={option.disabled}>{option.label}</option>                    
    )
    const optionInverseJsx = options.map(
        (option, index) => <option key={`${index}|desc`} value={option.value + '|desc'} disabled={option.disabled}>{option.label + ' (reverse)'}</option>                    
    )

    return (<>
        <select id="order-selector"
            value={orderColumn} 
            onChange={onOrderColumnSelect}
        >   
            <option disabled>Select a column</option>
            <option disabled>{'_'.repeat(50)}</option>
            { optionsJsx }
            { optionInverseJsx }
        </select>
    </>)
}

export default OrderSelector;