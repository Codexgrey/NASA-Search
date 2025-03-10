import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./AssetDetail.css";


// component to display details of a selected NASA asset
    // fetching asset dynamically via useParams 
const AssetDetail = () => {   
    // get asset id from URL (url parameter - nasa_id: /asset/nasa_id)
    const { id } = useParams(); 
    const [asset, setAsset] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const [mediaUrl, setMediaUrl] = useState("");  // store media url

    useEffect(() => {
        const fetchAsset = async () => {
            try {
                const response = await axios.get(`https://images-api.nasa.gov/search?nasa_id=${id}`);
                // set the first item found
                setAsset(response.data.collection.items[0]); 

                // fetch video/audio file URL
                const mediaResponse = await axios.get(`https://images-api.nasa.gov/asset/${id}`);
                const mediaItems = mediaResponse.data.collection.items;
                //console.log("Media Items:", mediaItems);
                
                // find the first available MP4 (video) or MP3, m4a (audio) file
                const playback = mediaItems.find(item =>
                    item.href.endsWith(".mp4") || item.href.endsWith(".mp3") || item.href.endsWith(".m4a")
                );

                if (playback) {
                    setMediaUrl(playback.href); 
                }

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

    const handleBack = () => {
        navigate(`/?page=${storedPage}`); // ,{replace: true}
    };
    // debug storedPage
    //console.log(`Navigating back to page: ${storedPage}`);

    if (!asset) return <div className="asset-detail-container">Loading...</div>;
    const mediaType = asset.data?.[0]?.media_type || "unknown";

    // limit description text
    const limTxt = (text, maxLength) => {
        if (!text) return ""; 
        return text.length > maxLength ? text.slice(0, maxLength) + " ..." : text;
    };


    return (
        <div className="asset-detail-container">
            {/* back button */}
            <button className="back-button" onClick={handleBack}> Back </button>
            {/* display asset title, description */}
            <h3 className="asset-title">{asset.data[0].title}</h3>              
            <p className="asset-description">{limTxt(asset.data[0].description, 1500)}</p> 
           
            {/* render media based on type */}
            {asset.links && asset.links[0] && (
                <>
                    { mediaType === "image" && ( 
                        <img src={asset.links[0].href} alt={asset.data[0].title} className="asset-media" />
                    )}

                    { mediaType === "video" && mediaUrl && ( 
                        <video controls className="asset-video"> 
                            <source src={mediaUrl} type="video/mp4" />
                            It seems your browser does not support video elements.
                        </video>
                    )}

                    { mediaType === "audio" && mediaUrl && (
                        <audio controls className="asset-audio">
                            <source src={mediaUrl} type={mediaUrl.endsWith(".mp3") ? "audio/mpeg" : "audio/mp4"} />
                            It seems your browser does not support audio elements.
                        </audio>
                    )}

                    {!mediaUrl && (mediaType === "video" || mediaType === "audio") && (
                        <p>Media file not available.</p>
                    )}
                </>              
            )}
        </div>
    );
};

export default AssetDetail; 





// const {id} = useParams; 
/*
    extract url params from react router
    example URL	/asset/56789 → id = "56789"
*/






