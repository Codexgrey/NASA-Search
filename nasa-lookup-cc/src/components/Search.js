import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./Search.css"; 
import Spinner from "./spinner.js";
import Pagination from "./Paginate.js";
import { FaHome } from "react-icons/fa";



// component to search and display results
const Search = () => {
    /*
    state [query]: to store the search query input by the user
    state [results]: to store the search results fetched from the NASA API
    state [filter]: to store the media type filter settings (images, audio, video)
    */ 
    const [query, setQuery] = useState("");
    const [searching, setSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [results, setResults] = useState([]);
    const [filter, setFilter] = useState({ image: false, audio: false, video: false });
    
    // pagination
    const [currentPage, setCurrentPage] = useState(1);
    const assetsPerPage = 12;
    const navigate = useNavigate(); 
    const location = useLocation();

  
    // function to fetch assets from the NASA API
    const searchAssets = async () => {
        try {
            setSearching(true);
            setHasSearched(true);
            const mediaTypes = [];
            if (filter.image) mediaTypes.push("image");  
            if (filter.audio) mediaTypes.push("audio");  
            if (filter.video) mediaTypes.push("video"); 

            const apiUrl = `https://images-api.nasa.gov/search?q=${query}&media_type=${mediaTypes.join(',')}`;
            const response = await axios.get(apiUrl);
        
            // update the results state with fetched data 
            setResults(response.data.collection.items || []); // if response is null, default to []
            setCurrentPage(1);

            // save results, query, currpage using localstorage
            localStorage.setItem("searchResults", JSON.stringify(response.data.collection.items || [])); 
            localStorage.setItem("searchQuery", query);     
            localStorage.setItem("currentPage", "1");         
            
        }   catch (error) {
            console.error("Error fetching data from NASA API", error); // log request errors

        }   finally {
            setSearching(false);
        }
    };


    // useEffect to handle localstorage
    useEffect(() => {
        // get results from localStorage
        const savedResults = JSON.parse(localStorage.getItem("searchResults"));
        const savedQuery = localStorage.getItem("searchQuery");
        const savedPage = localStorage.getItem("currentPage");

        // load saved results when component mounts
        if (savedResults) setResults(savedResults);
        if (savedQuery) setQuery(savedQuery);
        if (savedPage) setCurrentPage(parseInt(savedPage, 10));
        
    }, []);


    // update URL; add currentPage number as query params
    useEffect(() => {
        navigate(`/?page=${currentPage}`)
    }, [currentPage, navigate]);


    // reset hasSearch
    useEffect(() => {
        setHasSearched(false);
    }, [query]);


    // get currentPage number from URL, update currentPage with it, save to localStorage
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const savedPage = urlParams.get("page") || localStorage.getItem("currentPage") || "1";

        setCurrentPage(parseInt(savedPage, 10));
        localStorage.setItem("currentPage", savedPage);
    }, [location.search]); 
    

    // get assets for current page
    const lastAssetIndex = currentPage * assetsPerPage;                      // 2 * 12 
    const firstAssetIndex = lastAssetIndex - assetsPerPage;                  // 24 - 12
    const currentResults = results.slice(firstAssetIndex, lastAssetIndex);   // slicing to paginate results


    return (
        <div className="search-container">
            <div className="search-controls">
                <div className="header">
                    <FaHome 
                        onClick={() => {
                            localStorage.clear(); 
                            window.location.reload(); 
                        }} 
                        className="home-icon"
                        title="Home" 
                    />
                    <h5> NASA Search </h5>
                </div>
        
                <p>Enter query and <strong>select media type(s) </strong> to enable search. </p>

                <input 
                    type="text"
                    value={query}                                 
                    onChange={(e) => setQuery(e.target.value)} 
                    placeholder="What do you want to find?" 
                    className="search-input"          
                />
                
                <button 
                    onClick={searchAssets} 
                    className="search-button"
                    disabled={!filter.image && !filter.audio && !filter.video}
                    >
                    Search
                </button>
                <br />
                
                <div className="filters" >
                    {/* 
                        checked={filter.asset}: checking current state of filters
                        onChange={...}: toggles/updates filter state when checkbox is clicked
                    */}
                    <label>
                        <input type="checkbox" checked={filter.image} 
                        onChange={ () => setFilter({...filter, image: !filter.image}) } /> Images
                    </label>
                    <label>
                        <input type="checkbox" checked={filter.audio}
                        onChange={ () => setFilter({...filter, audio: !filter.audio}) } /> Audios
                    </label>
                    <label>
                        <input type="checkbox" checked={filter.video}
                        onChange={ () => setFilter({...filter, video: !filter.video}) } /> Videos
                    </label>
                </div>
            </div>
            
            {/* spinner ui */}
            {searching && (
                <div className="searching">
                    <Spinner />
                </div>
            )}

            {/* grid-display search results */}
            <div className="results-grid">
                { currentResults.length > 0 ?
                    ( currentResults.map((item) => ( 
                        <div className={(item.data?.[0]?.media_type === "audio" ||
                            item.data[0].media_type === "video") ? "result-card play" : "result-card"} 
                            key={item.data[0].nasa_id} 
                            onClick={() => navigate(`/asset/${item.data[0].nasa_id}`)}
                        >      
                            {/* display asset title */} 
                            <h5>{item.data[0].title}</h5>

                            {/* render available media if item contains media links */}
                            {item.links && item.links[0] && (
                                <img src={item.links[0].href} alt={item.data[0].title} className="result-image" />
                            )}
                        </div>
                        ))
                    ) : !searching && !hasSearched ? ( 
                        <p className="cosmos"> Welcome to the Cosmos &#127756; <br/> Let's begin our exploration &#128269; </p> 
                    ) : !searching && hasSearched ? (
                        <p className="nothing"> No results found &#10060; <br /> Please try something else...
                        </p> 
                    ) : null
                }
            </div>
                
            {/* pagination controls */}
            {results.length > assetsPerPage && (
                <div className="pagination">
                    <Pagination
                        totalAssets={results.length}
                        assetsPerPage={assetsPerPage}
                        setCurrentPage={setCurrentPage}
                        currentPage={currentPage}
                    />
                </div>
            )}
        </div>
    );
};
  

export default Search; 




// location.search = represents the query string portion of the URL (e.g ?page=3)









