import useAppData from "../hooks/useAppData";
import SearchField from "../sidebar/SearchField";

import './pagination.css';

function PaginationControls() {

    const { appData, setPage, setItemsPerPage, setSearchValue } = useAppData();

    const { pageCount, recordsCount, currentPage, itemsPerPage } = appData.table;
    
    // How many steps should the fast rewind/fast forward link take?
    const fastStepWidth = 1 + Math.floor(pageCount/5);
    // How many direct links to pages should be displayed at the most? (you'll get one more than you type here).
    const maxDirectLinks = 4;
    
    const onPaginationLinkClick = (event) => {
        const { targetPage } = event.target.dataset;

        if (targetPage) {
            setPage(targetPage);
        }        
    }

    const onItemsPerPageLinkClick = (event) => {
        const { itemsPerPage } = event.target.dataset;

        if (itemsPerPage) {
            setItemsPerPage(itemsPerPage);
        }        
    }


    // This is a closure in order to keep an index/unique key among the page links.
    const getLinktoPageFunction = () => {
        let index = -1;

        return (page: number, textLeft?: string, textRight?: string) => {
            index++;

            const classNames = ["pagination-link"];
            if (page === currentPage) {
                classNames.push("active-link");
            }
            return <a key={index} className={classNames.join(' ')} data-target-page={page} onClick={onPaginationLinkClick}>{textLeft}{page}{textRight}</a>
        }
    
    }

    const getPaginationLinks = () => {
        const paginationLinks = [];

        const getLinkToPage = getLinktoPageFunction();
        
        const doublePrevPageNo = currentPage > fastStepWidth ? currentPage - fastStepWidth : 1;
        const doubleNextPageNo = currentPage + fastStepWidth < pageCount ? currentPage + fastStepWidth : pageCount;

        paginationLinks.push(<a key="prevFast" className="pagination-link" data-target-page={doublePrevPageNo} onClick={onPaginationLinkClick}>&lt;&lt;</a>);
        paginationLinks.push(<a key="prev" className="pagination-link" data-target-page={currentPage > 1 ? currentPage - 1 : pageCount} onClick={onPaginationLinkClick}>&lt;</a>);

        if (pageCount <= maxDirectLinks) {
            for (let i = 1; i <= pageCount; i++) {
                paginationLinks.push(getLinkToPage(i));
            }    
        } else {
            // Display still maxDirectLinks links.
            const spotsEachSide = Math.floor(maxDirectLinks/2);
            const pagesToTheRight = pageCount - currentPage;
            const pagesToTheLeft = currentPage - 1;
            
            let startPage = 1;

            if (pagesToTheLeft >= spotsEachSide && pagesToTheRight >= spotsEachSide) {
                // Render the current page in the middle
                startPage = currentPage - spotsEachSide;
            } else {
                // Render the current page at an offset
                if (pagesToTheRight <= spotsEachSide) {
                    // Extra space on the left, tight on the right
                    const tightBy = spotsEachSide - pagesToTheRight
                    startPage = currentPage - spotsEachSide - tightBy;
                } else {
                    startPage = currentPage - pagesToTheLeft;
                }                
            }

            for (let i = startPage; i <= startPage + maxDirectLinks; i++) {
                paginationLinks.push(getLinkToPage(i));
            }                            
        }

        paginationLinks.push(<a key="next" className="pagination-link" data-target-page={currentPage < pageCount ? currentPage + 1 : 1} onClick={onPaginationLinkClick}>&gt;</a>);
        paginationLinks.push(<a key="nextFast" className="pagination-link" data-target-page={doubleNextPageNo} onClick={onPaginationLinkClick}>&gt;&gt;</a>);

        return paginationLinks;
    }

    const getItemsPerPageLinks = (values: number[]) => {
        return values.map((value: number, index: number) => { 
            const classNames = ["pagination-link"];
            if (value === itemsPerPage) {
                classNames.push("active-link");
            }    

            return <a key={index} className={classNames.join(' ')} data-items-per-page={value} onClick={onItemsPerPageLinkClick}>{value}</a>;
        })
    }

    const itemsPerPageValues = [ 5, 25, 50, 100 ];

    return <div className="pagination-outer-container">
            <div className="pagination-pagination-links">
                <div className="pagination-pagination-links">Page: {getPaginationLinks()}</div>
                <div className="pagination-items-per-page-links">Items Per Page: {getItemsPerPageLinks(itemsPerPageValues)}</div>                
            </div>
            <div className="pagination-record-count-container">
                <div>Page: {currentPage}/{pageCount}</div>
                <div>Items Total: {recordsCount}</div>
            </div>
            <div>
                <SearchField searchValue={appData.searchValue} setSearchValue={setSearchValue}/>
            </div>            
        </div>;
}

export default PaginationControls;