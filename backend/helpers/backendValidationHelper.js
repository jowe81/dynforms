import { arrayGet, arraySet, parseJSON } from "./jUtils.js";
import { formatFormDefinitionsRecord } from "../formTypes.js";
import constants from "../constants.js";

function validateRecordData(formDefinition, record) {
    if (!formDefinition || !record) {
        console.warn("Validator: form definition or record missing.");
        return;
    }

    const validationErrors = [];
    validate(formDefinition.fields, record, "", validationErrors);

    if (formDefinition.collectionName === constants.formDefinitionsCollectionName) {
        const message = formatFormDefinitionsRecord(record);
        if (message) {
            validationErrors.push({fullKey: "form_definition", fieldLabel: "Form Definition", message})
        }
    }

    return validationErrors;
}

function validate(fields, record, keyPrefix = "", recordValidationErrors = []) {
    fields?.forEach((field) => {
        const fullKey = keyPrefix ? `${keyPrefix}.${field.key}` : field.key;
        const value = arrayGet(record, fullKey);
        let errorMsg = "";

        switch (field.type) {
            case "number":
                errorMsg = validateNumber(value);
                break;

            case "json":
                const jsonData = parseJSON(value);
                if (jsonData) {
                    arraySet(record, fullKey, JSON.stringify(jsonData, null, 4));
                } else {
                    errorMsg = "Invalid JSON.";
                }
                break;

            case "subfield_array":
                validate(arrayGet(field, "fields", []), record, fullKey, recordValidationErrors);
                break;
        }

        if (errorMsg) {
            recordValidationErrors.push({
                fullKey,
                fieldLabel: field.label,
                message: errorMsg,
            });
        }
    });
}

function validateNumber(value) {
    const numberRegex = /^\s*\d+(\.\d+|$|\s)\s*$/;
    if (!numberRegex.test(value)) {
        return `"${value}" is not a number.`;
    }

    return "";
}

export { validateRecordData };
