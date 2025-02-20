import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// axios for making HTTP requests
import axios from "axios"; 
import "./Search.css"; 



// component to search and display results
const Search = () => {
    /*
    state [query]: to store the search query input by the user
    state [results]: to store the search results fetched from the NASA API
    state [filter]: to store the media type filter settings (images, audio)
    */ 
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [filter, setFilter] = useState({ image: true, audio: true });
    
    // pagination
    const [currentPage, setCurrentPage] = useState(1);
    const assetsPerPage = 12;

    // useNavigate hook to navigate to asset details page
    const navigate = useNavigate(); 
  
    // function to fetch assets from the NASA API
    const searchAssets = async () => {
        try {
            // array of image & audio assets   
            const mediaTypes = [];
            if (filter.image) mediaTypes.push("image");  // error: push(filter.image)
            if (filter.audio) mediaTypes.push("audio");  // error: push(filter.audio)

            // API endpoint with search query and media type filter
                // debugging API URL
            const apiUrl = `https://images-api.nasa.gov/search?q=${query}&media_type=${mediaTypes.join(',')}`;
            console.log("Fetching data from:", apiUrl); 

                // debugging API response
            const response = await axios.get(apiUrl);
            console.log("API Response:", response.data); 
            /* 
                const response = await axios.get(
                    `https://images-api.nasa.gov/search?q=${query}&media_type=${mediaTypes.join(",")}` 
                );
            */ 
            // update the results state with fetched data
                // ensure results are properly set
            setResults(response.data.collection.items || []); 
            setCurrentPage(1);
            
        }   catch (error) {
            // log request errors
            console.error("Error fetching data from NASA API", error); 
        }
    };
    
    // get assets for current page
    const lastAssetIndex = currentPage * assetsPerPage;                     // 2 * 12 
    const firstAssetIndex = lastAssetIndex - assetsPerPage;                 // 24 - 12
    const currentResults = results.slice(firstAssetIndex, lastAssetIndex);   // slicing to paginate results

    // Change page
    const nextPage = () => { if (lastAssetIndex < results.length) setCurrentPage(currentPage + 1); };
    const prevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };

    return (
        <div className="search-container">
            <div className="search-controls">
                {/* input field for user's search query */}
                <h5> NASA Search </h5>
                <input 
                    type="text"
                    value={query}                                 // controlled input field with state binding
                    onChange={(e) => setQuery(e.target.value)}    // updates query state on user input
                    placeholder="Search for assets..." 
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
                </div>
            </div>


            {/* grid-display search results */}
            <div className="results-grid">
                {/* IF to display current results */}
                { currentResults.length > 0 ?
                    ( currentResults.map((item) => (                    // each result must have a unique id 
                        <div className="result-card" 
                            key={item.data[0].nasa_id} 
                            onClick={() => navigate(`/asset/${item.data[0].nasa_id}`)}
                        >      
                            {/* display asset title and available media */} 
                            <h5>{item.data[0].title}</h5>
                            {item.links && item.links[0] && (
                                // image URL from API response & Alt text for accessibility
                                <img src={item.links[0].href} alt={item.data[0].title} className="result-image" />
                            )}
                        </div>
                        ))
                    ) : ( <p>No results found. <br /> Search for something else...</p> )
                }
            </div>
            
                
            {/* Pagination Controls */}
            {results.length > assetsPerPage && (
                <div className="pagination">
                <button onClick={prevPage} disabled={currentPage === 1} className="pagination-button">Previous</button>
                <span>Page {currentPage} of {Math.ceil(results.length / assetsPerPage)}</span>
                <button onClick={nextPage} disabled={lastAssetIndex >= results.length} className="pagination-button">Next</button>
                </div>
            )}
        </div>
    );
};
  
// export component for external use
export default Search; 


/*
    Resolved the following fetching and performance issues
    - Initially used useState in App.js to store selectedAsset, but when navigating to /asset/:id, 
      the page refreshes, and selectedAsset becomes null. 
      This results in AssetDetail not receiving any {asset} data.
      Also, Search.js was not passing onSelectAsset to update selectedAsset.

        * Search.js: Decided on using navigate hook when navigating to /asset/:id 
        * AssetDetail.js: The component now fetches asset details dynamically using useParams,
          no need for {asset} in App.js.
        * Performance improvements: The component now fetches asset details only when the asset ID changes,
          reducing unnecessary API requests; Using useEffect hook to fetch dynamically on ID changes.
*/