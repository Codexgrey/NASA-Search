import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./AssetDetail.css";
import Spinner from "./spinner.js";


const AssetDetail = () => {   
    // get asset id from URL (url parameter - nasa_id: /asset/nasa_id)
    const { id } = useParams(); 
    const [asset, setAsset] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const [mediaUrl, setMediaUrl] = useState(""); 

    const [videoLoading, setVideoLoading] = useState(true);
    const [videoError, setVideoError] = useState(false);
    const [audioLoading, setAudioLoading] = useState(true);
    const [audioError, setAudioError] = useState(false);

    useEffect(() => {
        // ensure details persist
        const storedAsset = JSON.parse(localStorage.getItem(`asset-${id}`));
        const storedMediaUrl = localStorage.getItem(`mediaUrl-${id}`);

        if (storedAsset) {
            setAsset(storedAsset);
            if (storedMediaUrl) setMediaUrl(storedMediaUrl);
            
        } else {
            const fetchAsset = async () => {
                try {
                    const response = await axios.get(`https://images-api.nasa.gov/search?nasa_id=${id}`);
                    // set asset
                    setAsset(response.data.collection.items[0]); 

                    // get asset metadata
                    const mediaResponse = await axios.get(`https://images-api.nasa.gov/asset/${id}`);
                    const mediaItems = mediaResponse.data.collection.items;
        
                    // find playable media items
                    const playback = mediaItems.find(item => {
                        return item.href.endsWith(".mp4") || item.href.endsWith(".mp3") || 
                        item.href.endsWith(".m4a") || item.href.endsWith(".wav"); 
                    });


                    if (playback) {
                        const secureUrl = playback.href.replace('http://', 'https://');
                        setMediaUrl(encodeURI(secureUrl));


                        // set timeout for media loading
                        if (playback.href.match(/\.(mp4|mp3|wav|m4a)$/i)) {
                            const timeout = setTimeout(() => {
                                setVideoLoading(false);
                                setAudioLoading(false);
                                setVideoError(true);
                                setAudioError(true);
                            }, 5000);

                            // clear timeout when component unmounts
                            return () => clearTimeout(timeout);
                        }
                    }

                }   catch (error) {
                    console.error("Error fetching asset details", error);
                    setVideoLoading(false);
                    setAudioLoading(false);
                    setVideoError(true);
                    setAudioError(true);
                }
            };
            fetchAsset();
        }
    // fetch new asset when id changes
    }, [id]); 


    // get page num from URL or localStorage
    const queryParams = new URLSearchParams(location.search);
    const storedPage = queryParams.get("page") || localStorage.getItem("currentPage") || "1";


    const handleBack = () => {
        navigate(`/?page=${storedPage}`); // ,{replace: true}
    };
    //console.log(`Navigating back to page: ${storedPage}`);


    if (!asset) return <div className="asset-detail-container">Loading...</div>;
    const mediaType = asset.data?.[0]?.media_type || "unknown";


    const handleMediaLoaded = (mediaType) => {
        if (mediaType === 'video') {
            setVideoLoading(false);
            setVideoError(false);
        } 
        if (mediaType === "audio") {
            setAudioLoading(false);
            setAudioError(false);
        }
    };

    const handleMediaError = (mediaType) => {
        if (mediaType === 'video') {
            setVideoLoading(false);
            setVideoError(true);
        } 
        if (mediaType === "audio") {
            setAudioLoading(false);
            setAudioError(true);
        }
    };


    // handle description text length
    const limTxt = (text, maxLength) => {
        if (!text) return ""; 
        return text.length > maxLength ? text.slice(0, maxLength) + " ..." : text;
    };


    return (
        <div className="asset-detail-container">
            <button className="back-button" onClick={handleBack}> Back </button>
            <h3 className="asset-title">{asset.data[0].title}</h3>              
            <p className="asset-description">{limTxt(asset.data[0].description)}</p> 
           
            {/* render media based on type */}
            <>
                { mediaType === "image" && ( 
                    <img 
                        src={asset.links[0].href} alt={asset.data[0].title} 
                        className="asset-image"
                        onError={(e) => {
                            e.target.onError = null;
                            e.target.src = "https://via.placeholder.com/400x300?text=Image+Not+Available";
                        }} 
                    />
                )}

                { mediaType === "video" && mediaUrl && ( 
                    <div className="asset-video">
                        { videoLoading && <Spinner />}

                        <video 
                            controls className="video-asset"
                            onLoadedData={handleMediaLoaded}
                            onError={handleMediaError}
                            style={{display: videoLoading ? 'none' : 'block'}}
                        > 
                            <source src={mediaUrl} type="video/mp4" />
                            <source src={mediaUrl} type="video/webm" />
                            It seems your browser does not support video playback.
                        </video>
                    </div>
                )}

                { mediaType === "audio" && mediaUrl && (
                    <div className="asset-audio">
                        { audioLoading && <Spinner />}

                        <audio 
                            controls preload="auto"
                            className="audio-asset"
                            crossOrigin="anonymous"
                            onLoadedData={handleMediaLoaded}
                            onError={handleMediaError}
                            style={{display: audioLoading ? 'none' : 'block'}}
                        >
                            <source src={mediaUrl} type={ 
                                mediaUrl.endsWith(".mp3") ? "audio/mpeg" :
                                mediaUrl.endsWith(".m4a") ? "audio/mp4" :
                                mediaUrl.endsWith(".wav") ? "audio/wav" :
                                "audio/*" } 
                            />
                            It seems your browser does not support audio playback.
                        </audio>
                    </div>
                )}

                {((!mediaUrl && videoError) || (!mediaUrl && audioError))  && (
                    <div className="media-error">
                        <p> Failed to load media. Please try again later.</p>
                    </div>
                )}
            </>              
        </div>
    );
};

export default AssetDetail; 





// const {id} = useParams; 
/*
    extract url params from react router
    example URL	/asset/56789 → id = "56789"
*/






