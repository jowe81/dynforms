function SearchField(props: any) {

    let { searchValue, setSearchValue } = props;

    const onChange = (event: any) => {
        setSearchValue(event.target.value);
    }

    return (
        <>
            <label>Search:</label>
            <div>
                <input                                         
                    value={searchValue}
                    onChange={onChange}
                />
            </div>
        </>
    )
}

export default SearchField;