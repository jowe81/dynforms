import { Interfaces } from "./Form";

function FieldLabel(props: any) {
    const field: Interfaces.Field = props.field;

    return <div><label className="field-label">{field?.label}</label></div>;
}

export default FieldLabel;