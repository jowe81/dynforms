import './search.css';

function SearchField(props: any) {

    let { searchValue, setSearchValue } = props;

    const onChange = (event: any) => {
        setSearchValue(event.target.value);
    }

    return (
        <div className="search-container">
            <label>Search:</label>
            <input value={searchValue} onChange={onChange}/>
            <button className='button-small' onClick={onChange}>Clear</button>
        </div>
    )
}

export default SearchField;