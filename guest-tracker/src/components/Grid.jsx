import React from 'react';
import { useState, useEffect } from 'react';
import "./Grid.css";
function Grid(props) {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false); // For loading status
    const [error, setError] = useState(null); // For error handling
    const getGridData = () => console.log(data);
    useEffect(() => {
        const getData = async (e) => {
            setIsLoading(true); // Set loading state
            setError(null); // Clear previous errors
            await window.electronAPI.loadList().then((result) => {
                setIsLoading(false);
                setError(null);
                console.log(result);
                setData(result);
            })
        }
        getData();
    }, []); // Empty dependency array means this effect runs once on mount

    if (isLoading) {
        return <div>Loading data...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }
    return (
        <React.Fragment>
        <ul className="grid">
            {data.map((item, index) => (
                <li key={index}>
                    <div className="field">
                        {item["Name"]}
                    </div>
                    <div className="field">
                        {item["Surname"]}
                    </div>
                </li>
            ))}
        </ul>
        <div className="editor">
            <p> edit values </p>
        </div>
        </React.Fragment>
    )
}
export default Grid;