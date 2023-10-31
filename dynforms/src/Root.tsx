import { Outlet, Link, useNavigate } from "react-router-dom";

import useAppData from "./hooks/useAppData";

import CollectionSelector from "./sidebar/CollectionSelector";
import OrderSelector from "./sidebar/OrderSelector";
import SearchField from "./sidebar/SearchField";

import './root.css';

export default function Root() {
    const navigate = useNavigate();

    const { appData, setCollectionName, setOrderColumn, setSearchValue } = useAppData();
    const collectionName = appData.collectionName;
    const primaryColumn = appData.order[0].selectValue;
    const secondaryColumn = appData.order[1].selectValue;    

    function onCollectionSelect(event: any) {
        const value = event.target.value;

        if (value) {
            setCollectionName(value);
            navigate('/records');
        }
    }

    function onOrderColumnSelect(event: any) {
        const value = event.target.value;
        const priority = event.target.dataset.priority;

        if (value) {
            setOrderColumn(value, priority);            
        }
    }

    function onNewRecordClick(event: any) {
        navigate('/form');
    }
        
    return (
        <div id="ui-root">
            <div id="sidebar">
                <div className="top-selector-container top-nav-item">
                    <label>Collection:</label>
                    <CollectionSelector value={collectionName} onChange={onCollectionSelect}/>
                </div>                
                <div className="top-selector-container-wide top-nav-item">
                    { appData.collectionName && <label>Order by:</label> }
                    <OrderSelector orderColumn={primaryColumn ?? "none"} onOrderColumnSelect={onOrderColumnSelect} priority="0"/>
                    <OrderSelector orderColumn={secondaryColumn ?? "none"} onOrderColumnSelect={onOrderColumnSelect} priority="1"/>
                </div>         

                <div className="top-nav-item">
                    { appData.collectionName && <button className="button-small" onClick={onNewRecordClick}>New Record</button> }
                </div>
            </div>
            <div id="main-content-area">
                <Outlet />
            </div>
        </div>
    );
}