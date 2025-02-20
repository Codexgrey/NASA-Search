import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Search from "./components/Search";
import AssetDetail from "./components/AssetDetail";

const App = () => {
    /*
      fetching assets dynamically in AssetDetail.js, w/ using state [selectedAsset]. 
      - state to keep track of the selected asset
        const [selectedAsset, setSelectedAsset] = useState(null); 
    */

    return (
        <Router basename="/Technical-Assessment-CC/nasa-lookup-cc">
            <Routes>
                {/* route: search page, passing a function to update selected asset */}
                <Route path="/" element={<Search />} /> {/* onSelectAsset={setSelectedAsset} */} 
                
                {/* route: asset details page, passing the selected asset */}
                <Route path="/asset/:id" element={<AssetDetail />}  />  {/* asset={selectedAsset}  */}
            </Routes>
        </Router>
    );
};

// export omponent for external use
export default App; 
