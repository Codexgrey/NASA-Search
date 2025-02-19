import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./AssetDetail.css";


// component to display details of a selected NASA asset
    // fetching asset dynamically, no need for {asset}
const AssetDetail = () => {   
    // get asset ID from URL
    const { id } = useParams(); 
    const [asset, setAsset] = useState(null);
    const navigate = useNavigate();


    /*
        changed approach of relying on selectedAsset from App.js, 
        fetching the asset data dynamically using useParams instead 
    */
    useEffect(() => {
        const fetchAsset = async () => {
            try {
                const response = await axios.get(`https://images-api.nasa.gov/search?nasa_id=${id}`);
                // set the first item found
                setAsset(response.data.collection.items[0]); 
            } catch (error) {
                console.error("Error fetching asset details", error);
            }
        };
        fetchAsset();

    // fetch new asset when the ID changes
    }, [id]); 


    // if no asset is provided, display a message
    if (!asset) return <div className="asset-detail-container">Please select an asset...</div>;

    return (
        <div className="asset-detail-container">
            {/* Back button */}
            <button className="back-button" onClick={() => navigate(-1)}> Back </button>
            <h3 className="asset-title">{asset.data[0].title}</h3>              {/* display asset title */}
            <p className="asset-description">{asset.data[0].description}</p>    {/* display asset description */}
           
            {/* render image if asset contains media links */}
            {asset.links && (                   
                <img
                src={asset.links[0].href}       // image source URL from asset
                alt={asset.data[0].title}       // Alt text for accessibility
                className="asset-media"      
                />
            )}
        </div>
    );
};

// export component for external use
export default AssetDetail; 


/*
    Resolved the following fetching and performance issues
    - Initially used useState in App.js to store selectedAsset, but when navigating to /asset/:id, 
      the page refreshes, and selectedAsset resets to null. 
      This results in AssetDetail not receiving any asset data.
      Also, Search.js was not passing onSelectAsset to update selectedAsset.

        * Search.js: Decided on using navigate hook when navigating to /asset/:id 
        * AssetDetail.js: The component now fetches asset details dynamically using useParams,
          no need for {asset} in App.js.
        * Performance improvements: The component now fetches asset details only when the asset ID changes,
          reducing unnecessary API requests; Using useEffect hook to fetch dynamically on ID changes.
        
        - Implemented conditional rendering to display a message when no asset is provided.
        - Rendered image if asset contains media links.
        - Used Axios for making API requests.
*/