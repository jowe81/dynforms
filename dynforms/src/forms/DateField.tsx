import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


function DateField(props: any) {
    let { field, record, onValueChange, readOnly } = props;

    if(!field) {
        return;
    }

    if (!record) {
        record = {};
    }

    const dbDate = record[field.key];

    let date = new Date(dbDate);
    if (isNaN(date.getTime())) {
        // If no date was set, default to now.
        date = new Date();
    }

    return (
        <>
            <div>
                <DatePicker
                    selected={dbDate ? date : null}
                    showTimeSelect
                    onChange={(date) => onValueChange(date, field.key)}
                    dateFormat="M/d/YYYY h:mm:ss a" // Date and time.
                    disabled={readOnly || field.readOnly}
                    className="date-picker-custom"
                />
            </div>
        </>
    );
}


export default DateField;