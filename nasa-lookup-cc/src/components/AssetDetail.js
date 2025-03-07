import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./AssetDetail.css";


// component to display details of a selected NASA asset
    // fetching asset dynamically, no need for {asset}
const AssetDetail = () => {   
    // get asset ID from URL (url parameter)
    const { id } = useParams(); 
    const [asset, setAsset] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const fetchAsset = async () => {
            try {
                const response = await axios.get(`https://images-api.nasa.gov/search?nasa_id=${id}`);
                // set the first item found
                setAsset(response.data.collection.items[0]); 

            }   catch (error) {
                console.error("Error fetching asset details", error);
            }
        };
        fetchAsset();
    // fetch new asset when id changes
    }, [id]); 

    // get page number from the URL or localStorage
    const queryParams = new URLSearchParams(location.search);
    const storedPage = queryParams.get("page") || localStorage.getItem("currentPage") || "1";

    // debug storedPage
    //console.log(`Navigating back to page: ${storedPage}`);

    const handleBack = () => {
        navigate(`/?page=${storedPage}`); // ,{replace: true}
    };

    if (!asset) return <div className="asset-detail-container">Loading...</div>;

    return (
        <div className="asset-detail-container">
            {/* back button */}
            <button className="back-button" onClick={handleBack}> Back </button>
            <h3 className="asset-title">{asset.data[0].title}</h3>              {/* display asset title */}
            <p className="asset-description">{asset.data[0].description}</p>    {/* display asset description */}
           
            {/* render image if asset contains media links */}
            {asset.links && ( 
                // image URL from API response & Alt text for accessibility                  
                <img src={asset.links[0].href} alt={asset.data[0].title} className="asset-media" />
            )}
        </div>
    );
};

export default AssetDetail; 











