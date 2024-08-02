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

        const pushError = (errorMsg) =>
            recordValidationErrors.push({
                fullKey,
                fieldLabel: field.label,
                message: errorMsg,
            });

        if (!value) {
            // No value. If field is required, add error.
            if (field.required && [null, "", []].includes(value)) {
                pushError("Field is required. Please enter a value.");
            }
            return;
        }

        switch (field.type) {
            case "number":
                errorMsg = validateNumber(value);
                break;

            case "email":
                errorMsg = validateEmail(value);
                break;

            case "url":
                errorMsg = validateUrl(value);
                break;

            case "phone":
                errorMsg = validatePhone(value);
                break;

            case "birthday":
                errorMsg = validateBirthday(value);
                break;

            case "json":
                const jsonData = parseJSON(value);
                if (jsonData) {
                    arraySet(record, fullKey, JSON.stringify(jsonData, null, 4));
                } else {
                    errorMsg = "Invalid JSON.";
                }
                break;

            case "subfieldArray":
                if (Array.isArray(value)) {
                    value.forEach((data, index) => {
                        validate(arrayGet(field, "fields", []), record, `${fullKey}.${index}`, recordValidationErrors);
                    });
                }
                break;
        }

        if (errorMsg) {
            pushError(errorMsg);
        }
    });
}

function validateNumber(value) {
    const regex = /^\s*\d+(\.\d+|$|\s)\s*$/;
    if (!regex.test(value)) {
        return `"${value}" is not a number.`;
    }

    return "";
}

function validateEmail(value) {
    const regex = /^[a-zA-Z0-9\.-_]+@[a-zA-Z0-9-_]+\.[a-zA-Z0-9\.-_]+$/;
    if (!regex.test(value)) {
        return `"${value}" is not a valid email address.`;
    }

    return "";
}

function validateUrl(value) {
    const regex = /^[a-zA-Z0-9]+:\/\/[a-zA-Z0-9\.-_].[^\s]+$/;
    if (!regex.test(value)) {
        return `"${value}" is not a valid url.`;
    }

    return "";
}

function validatePhone(value) {
    const regex = /^[0-9- ]+$/;
    if (!regex.test(value)) {
        return `"${value}" is not a valid phone number.`;
    }

    return "";
}

function validateBirthday(value) {
    const regex = /^((\?\?\?\?|\d{4})-\d{2}-\d{2}|\d{2}-\d{2})$/;
    if (!regex.test(value)) {
        return `"${value}" is not a valid birthday. Allowed is either YYYY-MM-DD or, if the year is unknown, ????-MM-DD or MM-DD.`;
    }

    return "";
}

export { validateRecordData };
