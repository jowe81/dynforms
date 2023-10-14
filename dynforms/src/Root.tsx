import { Outlet, Link, useNavigate } from "react-router-dom";

import useAppData from "./hooks/useAppData";

import CollectionSelector from "./sidebar/CollectionSelector";

import './root.css';

export default function Root() {
    const navigate = useNavigate();
    const { appState, setCollectionName } = useAppData();
    const collectionName = appState.collectionName;

    function onCollectionSelect(event: any) {
        const value = event.target.value;

        if (value) {
            setCollectionName(value);
            navigate('/records');
        }
    }

    return (
        <div id="ui-root">
            <div id="sidebar">
                <div id="collection-selector-container" className="top-nav-item">
                    <label>Collection:</label>
                    <CollectionSelector value={collectionName} onChange={onCollectionSelect}/>
                </div>                
                <div className="top-nav-item">
                    <Link to="/records">Records</Link>
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