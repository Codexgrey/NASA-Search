import React from "react";
import "./spinner.css"; 
const Spinner = () => {
    return (
        <div className="spinner-container">
            <div className="spinner"></div>
            <p>Loading media...</p>
        </div>
    );
};

export default Spinner;