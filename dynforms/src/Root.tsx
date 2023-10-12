import { Outlet, Link } from "react-router-dom";

import useAppData from "./hooks/useAppData";

import CollectionSelector from "./sidebar/CollectionSelector";

import './root.css';

export default function Root() {
    const { appState, setCollectionName } = useAppData();
    const collectionName = appState.collectionName;

    function onCollectionSelect(event: any) {
        const value = event.target.value;

        if (value) {
            setCollectionName(value);            
        }
    }

    return (
        <div id="ui-root">
            <div id="sidebar">
                <div>
                    <label>Collection</label>
                    <CollectionSelector value={collectionName} onChange={onCollectionSelect}/>
                </div>
                
                <nav>
                    <ul>
                        <li><Link to="/records">Records</Link></li>
                    </ul>
                    <ul>
                        <li><Link to="/form">New Record</Link></li>
                    </ul>
                    <ul>
                        <li><Link to="/collections">Collections</Link></li>
                    </ul>
                </nav>
            </div>
            <div id="main-content-area">
                <Outlet />
            </div>
        </div>
    );
}