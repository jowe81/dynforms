import { Outlet, Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import useAppData from "./hooks/useAppData";

import UserSelector from "./sidebar/UserSelector";
import CollectionSelector from "./sidebar/CollectionSelector";
import OrderSelector from "./sidebar/OrderSelector";

import './root.css';

export default function Root() {
    const navigate = useNavigate();

    const { appData, setCollectionName, setOrderColumn, initApp } = useAppData();

    useEffect(() => {
        initApp()
    }, []);

    const collectionName = appData.collectionName;
    const primaryColumn = appData.order && appData.order[0].selectValue;
    const secondaryColumn = appData.order && appData.order[1].selectValue;    

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
        
    return (
        <div id="ui-root">
            <div id="sidebar">
                <div className="top-selector-container top-nav-item">
                    <label>User:</label>
                    <UserSelector />
                </div>                
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
                    { appData.collectionName && <Link to="/records" state={{createNewRecord: true}}>Records Table</Link>}
                    { appData.collectionName && <Link to="/form" state={{createNewRecord: true}}>New Record</Link>}
                </div>
            </div>
            <div id="main-content-area">
                <Outlet />
            </div>
        </div>
    );
}