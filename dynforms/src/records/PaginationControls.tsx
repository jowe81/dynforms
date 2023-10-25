import useAppData from "../hooks/useAppData";
import './pagination.css';

function PaginationControls() {

    const { appData, setPage, setItemsPerPage } = useAppData();

    const { pageCount, currentPage, itemsPerPage, recordsCount } = appData.table;
    //const pageCount = npageCount;
    const fastStepWidth = Math.floor(pageCount/10);
    
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


    const getLinkToPage = (page: number, textLeft?: string, textRight?: string) => {
        const classNames = ["pagination-link"];
        if (page === currentPage) {
            classNames.push("active-link");
        }
        return <a className={classNames.join(' ')} data-target-page={page} onClick={onPaginationLinkClick}>{textLeft}{page}{textRight}</a>
    }

    const getPaginationLinks = () => {
        const paginationLinks = [];

        
        if (currentPage > 1) {
            paginationLinks.push(getLinkToPage(1));
        }
        

        if (pageCount <= 5) {
            for (let i = 2; i <= pageCount - 1; i++) {
                paginationLinks.push(getLinkToPage(1));
            }    
        }

        if (pageCount > 5) {
            if (currentPage > fastStepWidth + 1) {  
                paginationLinks.push(getLinkToPage(currentPage - fastStepWidth, '. . ', ' . .'));
            }

            if (currentPage > 2) {
                paginationLinks.push(getLinkToPage(currentPage - 1));
            }
        }

        paginationLinks.push(getLinkToPage(currentPage, '', ''));

        if (pageCount > 5) {            
            if (currentPage < pageCount - 1) {
                paginationLinks.push(getLinkToPage(currentPage + 1));
            }

            if (currentPage < pageCount - fastStepWidth) {  
                paginationLinks.push(getLinkToPage(currentPage + fastStepWidth, '. . ', ' . .'));
            }
        }

        if (pageCount > 1 && pageCount > currentPage) {
            paginationLinks.push(getLinkToPage(pageCount));
        }
        
        return paginationLinks;
    }

    const getItemsPerPageLinks = (values: number[]) => {
        return values.map((value: number) => { 
            const classNames = ["pagination-link"];
            if (value === itemsPerPage) {
                classNames.push("active-link");
            }    

            return <a className={classNames.join(' ')} data-items-per-page={value} onClick={onItemsPerPageLinkClick}>{value}</a>;
        })
    }

    const itemsPerPageValues = [ 5, 25, 50, 100 ];

    return <div className="pagination-outer-container">
        <div className="pagination-header-left">
            <div className="pagination-pagination-links">Page: {getPaginationLinks()}</div>
        </div>
        <div className="pagination-header-right">
            <div className="pagination-record-count-container">Items Total: {recordsCount}</div>
            <div className="pagination-items-per-page-links">Per Page: {getItemsPerPageLinks(itemsPerPageValues)}</div>
        </div>
    </div>
}

export default PaginationControls;