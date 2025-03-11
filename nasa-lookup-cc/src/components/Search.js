import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./Search.css"; 
import Pagination from "./Paginate.js";



// component to search and display results
const Search = () => {
    /*
    state [query]: to store the search query input by the user
    state [results]: to store the search results fetched from the NASA API
    state [filter]: to store the media type filter settings (images, audio)
    */ 
    const [query, setQuery] = useState("");
    const [searching, setSearching] = useState(false);
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
            // array of image & audio assets   
            const mediaTypes = [];
            if (filter.image) mediaTypes.push("image");     // error: push(filter.image)
            if (filter.audio) mediaTypes.push("audio");     // error: push(filter.audio)
            if (filter.video) mediaTypes.push("video"); 

            // API endpoint with search query and media type filter
            const apiUrl = `https://images-api.nasa.gov/search?q=${query}&media_type=${mediaTypes.join(',')}`;
            // console.log("Fetching data from:", apiUrl);     // debugging API URL

            const response = await axios.get(apiUrl);
            // console.log("API Response:", response.data);    // debugging API response
        
            // update the results state with fetched data 
            setResults(response.data.collection.items || []); // set results properly; if response is null, default to []
            setCurrentPage(1);
            setSearching(true);

            // save results, query, currpage using localstorage
            localStorage.setItem("searchResults", JSON.stringify(response.data.collection.items || [])); 
            localStorage.setItem("searchQuery", query);     
            localStorage.setItem("currentPage", "1");         
            
        }   catch (error) {
            console.error("Error fetching data from NASA API", error); // log request errors
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

        // Clear localStorage when the page is manually reloaded
        const clearStorageOnReload = () => {
            localStorage.removeItem("searchResults");
            localStorage.removeItem("searchQuery");
        };

        window.addEventListener("beforeunload", clearStorageOnReload);
        return () => {
            window.removeEventListener("beforeunload", clearStorageOnReload);
        };
    }, []);


    // update URL with currentPage number, when currentPage changes
    useEffect(() => {
        navigate(`/?page=${currentPage}`)
    }, [currentPage, navigate]);


    // handle welcome and "no results" message only if query state changes
    useEffect(() => {
        // reset searching where query changes
        if (query) setSearching(false);
    }, [query]);


    // get currentPage number from URL, update currentPage with it, save to local storage
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
                {/* input field for user's search query */}
                <h5> NASA Search </h5>
                <p>Please <strong>select</strong> media type(s) before clicking search.</p>
                <input 
                    type="text"
                    value={query}                                 // control input field, state binding
                    onChange={(e) => setQuery(e.target.value)}    // updates query state on user input
                    placeholder="What do you want to find?" 
                    className="search-input"          
                />
                
                {/* button to trigger the searchAssets */}
                <button onClick={searchAssets} className="search-button">Search</button>
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


            {/* grid-display search results */}
            <div className="results-grid">
                {/* IF to display current results */}
                { currentResults.length > 0 ?
                    ( currentResults.map((item) => ( // each result must have a unique id 
                        <div className={(item.data?.[0]?.media_type === "audio" ||
                            item.data[0].media_type === "video") ? "result-card play" : "result-card"} 
                            key={item.data[0].nasa_id} 
                            onClick={() => navigate(`/asset/${item.data[0].nasa_id}`)}
                        >      
                            {/* display asset title */} 
                            <h5>{item.data[0].title}</h5>

                            {/* render available media if item contains media links */}
                            {item.links && item.links[0] && (
                                // image URL from API response & Alt text for accessibility
                                <img src={item.links[0].href} alt={item.data[0].title} className="result-image" />
                            )}
                        </div>
                        ))
                    ) : !searching ? ( 
                        <p className="cosmos"> Welcome to the Cosmos &#127756; <br/> Let's begin our exploration &#128269; </p> 
                    ) : (
                        <p className="nothing">No results found &#10060; <br /> Please try something else...</p> 
                    )     
                }
            </div>
                
            {/* pagination controls */}
            {results.length > assetsPerPage && ( // checking if results length greater than assets per page 
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









