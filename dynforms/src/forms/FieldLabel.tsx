import { Interfaces } from "./Form";

function FieldLabel(props: any) {
    const field: Interfaces.Field = props.field;

    return <label className="field-label">{field?.label}</label>;
}

export default FieldLabel;