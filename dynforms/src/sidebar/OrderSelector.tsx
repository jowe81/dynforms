import useAppData from "../hooks/useAppData.ts";
import { Interfaces } from "../forms/Form";
import './orderSelector.css';

function OrderSelector(props: any) {
    const { appData } = useAppData();
    const fields = appData?.formDefinition?.fields;

    if (!fields) {
        return;
    }

    const { orderColumn, onOrderColumnSelect, priority } = props;

    const allOptions: Interfaces.SelectFieldOption[] = [];

    const options: Interfaces.SelectFieldOption[] = fields.map((field: Interfaces.Field) => { return { label: field.label, value: field.key }});

    options.forEach((option, index) => {
        allOptions.push(option);
        const reverseOption = {
            label: option.label + ' (reverse)',
            value: option.value + '|desc',
        };
        allOptions.push(reverseOption);
    })

    const optionsJsx = allOptions.map(
        (option, index) => <option key={index} value={option.value} disabled={option.disabled}>{option.label}</option>                    
    )

    return (<>
        <select id="order-selector"            
            value={orderColumn} 
            onChange={onOrderColumnSelect}
            data-priority={priority}
        >   
            <option disabled value="none">Select a column</option>
            <option disabled>{'_'.repeat(50)}</option>
            { optionsJsx }
        </select>
    </>)
}

export default OrderSelector;