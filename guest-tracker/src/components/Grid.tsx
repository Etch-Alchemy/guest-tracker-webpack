import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
  useEffect,
  StrictMode,
  SyntheticEvent,
} from "react";
import Select from 'react-select'
import {
    AllCommunityModule,
    ModuleRegistry,
    themeQuartz,
    RowSelectionOptions
} from "ag-grid-community";
import { themeBalham } from 'ag-grid-community';
import { themeMaterial } from 'ag-grid-community';
// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);
import { AgGridReact } from 'ag-grid-react';
import "./Grid.css";
function Grid(props) {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false); // For loading status
    const [error, setError] = useState(null); // For error handling

    // Filter State
    const [selectedName, setSelectedName] = useState('');
    const getGridData = () => console.log(data);
    const options = [
    { value: 'chocolate', label: 'Chocolate' },
    { value: 'strawberry', label: 'Strawberry' },
    { value: 'vanilla', label: 'Vanilla' }
    ]

    const gridRef = useRef<AgGridReact>(null);
    const clearFilters = useCallback(() => {
        gridRef.current!.api.setFilterModel(null);
    }, []);


    // Column Definitions: Defines the columns to be displayed.
    const [colDefs, setColDefs] = useState([
        { field: "Name" },
        { field: "Surname" },
        { field: "Relationship" },
        { field: "Invitee" },
        { field: "Table" },
        { field: "RSVP" },

    ]);
    
    const defaultColDef = {
        editable: true,
        flex: 1,
        minWidth: 100,
        filter: true,
    };

    // Grid Theming
    const myTheme = themeQuartz.withParams({
        backgroundColor: 'rgb(249, 245, 227)',
        foregroundColor: 'rgb(126, 46, 132)',
        headerTextColor: 'rgb(204, 245, 172)',
        headerBackgroundColor: 'rgb(209, 64, 129)',
        oddRowBackgroundColor: 'rgb(0, 0, 0, 0.03)',
        headerColumnResizeHandleColor: 'rgb(126, 46, 132)',
    });
    const theme = useMemo<Theme | "legacy">(() => {
        return myTheme;
    }, []);
    const quickFilterText = '';
    useEffect(() => {
        const getData = async (e) => {
            setIsLoading(true); // Set loading state
            setError(null); // Clear previous errors
            await window.electronAPI.loadList().then((result) => {
                setIsLoading(false);
                setError(null);
                result = JSON.parse(result);
                let transformedData = [];
                for(let i = 0; i < result.length; i++){
                    let item = result[i];
                    let arr = Object.keys(item)
                    if(item["Name"]){
                        for(let j = 0; j < arr.length; j++){
                        let key = Object.keys(item)[j];
                            if(item[key] == 'TRUE')
                                item[key] = true;
                            if(item[key] == 'FALSE')
                                item[key] = false;
                        }
                        transformedData.push(item);
                    }
                    console.log(item);
                }
                console.log(transformedData);
                setData(transformedData);
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
    const rowSelectionOptons : RowSelectionOptions = {
        mode: "multiRow",
        selectAll: 'filtered',
        checkboxes: true
    }
    const handleClearFilter = (e: any) => {
        
    }
    return (
        <React.Fragment>
        <div>
            <div className="grid-filters">
                <Select options={options}         
                className="filter"
                placeholder="Select a Surname..."
                classNamePrefix="filter"/>
                <button className="grid-filters-clear" onClick={clearFilters}> Clear Filters </button>
            </div>
            <AgGridReact
            className="grid"
                ref={gridRef}
                rowData={data}
                columnDefs={colDefs}
                defaultColDef={defaultColDef}
                theme={theme}
                quickFilterText={quickFilterText}
                sideBar={"filters"}
                rowSelection={rowSelectionOptons}
                
                
            />
        </div>
        </React.Fragment>
    )
}
export default Grid;