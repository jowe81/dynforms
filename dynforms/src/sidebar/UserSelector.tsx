import { Interfaces } from "../forms/Form";
import "./collectionSelector.css";
import useAppData from "../hooks/useAppData.ts";

function UserSelector() {
    const { appData, setUser } = useAppData();

    function onUserChange(event: any) {
        const selectedName = event.target.value;
        const selectedUser = appData.userlist.find((user: any) => user.name === selectedName);
        setUser(selectedUser);
    }

    let options: any[] = [];

    if (Array.isArray(appData.userlist)) {
        options = appData.userlist.map(
            (user: any) => {
                return {
                    label: user.name,
                    value: user.name,
                };
            }
        );
    }

    options.unshift(
        {
            label: "Select...",
            value: "",
            disabled: true,
        },
        {
            label: "_".repeat(55),
            value: "",
            disabled: true,
        }
    );

    const optionsJsx = options.map((option, index) => (
        <option key={index} value={option.value} disabled={option.disabled}>
            {option.label}
        </option>
    ));

    return (
        <select
            id="collection-selector"
            value={appData.user?.name ?? ""}
            onChange={onUserChange}
        >
            {optionsJsx}
        </select>
    );
}

export default UserSelector;
