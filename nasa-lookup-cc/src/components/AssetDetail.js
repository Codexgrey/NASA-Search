import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./AssetDetail.css";

const AssetDetail = () => {
    const { id } = useParams();
    const [asset, setAsset] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const [mediaUrl, setMediaUrl] = useState("");

    const [audioLoading, setAudioLoading] = useState(true);
    const [audioError, setAudioError] = useState(false);

    useEffect(() => {
        const fetchAsset = async () => {
            try {
                const response = await axios.get(`https://images-api.nasa.gov/search?nasa_id=${id}`);
                setAsset(response.data.collection.items[0]);

                // Get asset metadata
                const mediaResponse = await axios.get(`https://images-api.nasa.gov/asset/${id}`);
                const mediaItems = mediaResponse.data.collection.items;

                // Look for playable media files
                const playback = mediaItems.find(item => {
                    const href = item.href.toLowerCase();
                    return href.endsWith('.mp4') || href.endsWith('.mp3') ||
                        href.endsWith('.m4a') || href.endsWith('.wav');
                });

                if (playback) {
                    const secureUrl = playback.href.replace('http://', 'https://');
                    setMediaUrl(encodeURI(secureUrl));

                    // Set timeout for audio loading
                    if (playback.href.match(/\.(mp3|wav|m4a)$/i)) {
                        const timeoutId = setTimeout(() => {
                            setAudioLoading(false);
                            setAudioError(true);
                        }, 25000);

                        // Cleanup timeout if component unmounts
                        return () => clearTimeout(timeoutId);
                    }
                }

            } catch (error) {
                console.error("Error fetching asset details:", error);
                setAudioError(true);
                setAudioLoading(false);
            }
        };
        fetchAsset();
    }, [id]);

    const queryParams = new URLSearchParams(location.search);
    const storedPage = queryParams.get("page") || localStorage.getItem("currentPage") || "1";

    const handleBack = () => {
        navigate(`/?page=${storedPage}`);
    };

    if (!asset) return <div className="asset-detail-container">Loading...</div>;
    const mediaType = asset.data?.[0]?.media_type || "unknown";

    const limTxt = (text, maxLength) => {
        if (!text) return "";
        return text.length > maxLength ? text.slice(0, maxLength) + " ..." : text;
    };

    const handleAudioLoaded = () => {
        setAudioLoading(false);
        setAudioError(false);
    };

    const handleAudioError = () => {
        setAudioLoading(false);
        setAudioError(true);
    };

    return (
        <div className="asset-detail-container">
            <button className="back-button" onClick={handleBack}> Back </button>
            <h3 className="asset-title">{asset.data[0].title}</h3>
            <p className="asset-description">{limTxt(asset.data[0].description)}</p>

            <>
                {mediaType === "image" && (
                    <img
                        src={asset.links[0].href}
                        alt={asset.data[0].title}
                        className="asset-media"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://via.placeholder.com/400x300?text=Image+Not+Available";
                        }}
                    />
                )}

                {console.log("here")}
                {mediaType === "video" && mediaUrl && (
                    <video controls className="asset-video">
                        <source src={mediaUrl} type="video/mp4" />
                        <source src={mediaUrl} type="video/webm" />
                        <p>Your browser does not support video playback.</p>
                    </video>
                )}
                {mediaType === "audio" && mediaUrl && (
                    <div className="asset-audio">
                        {audioLoading && (
                            <div className="loading-spinner">
                                <div className="spinner"></div>
                                <p>Loading audio file...</p>
                            </div>
                        )}

                        <audio
                            controls
                            preload="auto"
                            crossOrigin="anonymous"
                            className="asset-audio"
                            onLoadedData={handleAudioLoaded}
                            onError={handleAudioError}
                            style={{ display: audioLoading ? 'none' : 'block' }}
                        >
                            <source src={mediaUrl} type="audio/mpeg" />
                            <source src={mediaUrl} type="audio/wav" />
                            <p>Your browser does not support audio playback.</p>
                        </audio>

                        {audioError && (
                            <div className="media-error">
                                <p>Failed to load audio file. Please try again later.</p>
                            </div>
                        )}
                    </div>
                )}
            </>

        </div>
    );
};

export default AssetDetail;