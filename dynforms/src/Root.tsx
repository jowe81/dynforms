import { Outlet, Link, useNavigate } from "react-router-dom";

import useAppData from "./hooks/useAppData";

import CollectionSelector from "./sidebar/CollectionSelector";
import OrderSelector from "./sidebar/OrderSelector";

import './root.css';

export default function Root() {
    const navigate = useNavigate();
    const { appState, setCollectionName, setOrderColumn } = useAppData();
    const collectionName = appState.collectionName;
    const orderColumn = appState.order?.key;    

    function onCollectionSelect(event: any) {
        const value = event.target.value;

        if (value) {
            setCollectionName(value);
            navigate('/records');
        }
    }

    function onOrderColumnSelect(event: any) {
        const value = event.target.value;

        if (value) {
            setOrderColumn(value);            
        }
    }

    return (
        <div id="ui-root">
            <div id="sidebar">
                <div className="top-selector-container top-nav-item">
                    <label>Collection:</label>
                    <CollectionSelector value={collectionName} onChange={onCollectionSelect}/>
                </div>                
                <div className="top-selector-container-wide top-nav-item">
                    <label>Order by:</label>
                    <OrderSelector orderColumn={orderColumn} onOrderColumnSelect={onOrderColumnSelect} />
                </div>         

                <div className="top-nav-item">
                    <Link to="/form">New Record</Link>
                </div>
            </div>
            <div id="main-content-area">
                <Outlet />
            </div>
        </div>
    );
}