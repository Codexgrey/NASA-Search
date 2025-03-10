import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Search from "./components/Search";
import AssetDetail from "./components/AssetDetail";

const App = () => {
    /*
      fetching assets dynamically in AssetDetail.js, w/ using state [selectedAsset]. 
       const [selectedAsset, setSelectedAsset] = useState(null); 
    */

    return (
        <Router basename="/nasa-lookup-cc">
            <Routes>
                <Route path="/" element={<Search />} />
                <Route path="/asset/:id" element={<AssetDetail />}  /> 
            </Routes>
        </Router>
    );
};

export default App; 
