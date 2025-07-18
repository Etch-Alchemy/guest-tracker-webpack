import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
  useEffect,
  StrictMode,
  SyntheticEvent,
  RefObject,
  createRef,
} from "react";
import Select, { components, InputProps } from 'react-select';
import {
    AllCommunityModule,
    ModuleRegistry,
    themeQuartz,
    RowSelectionOptions,
    GridApi,
    FirstDataRenderedEvent,
    GridReadyEvent
} from "ag-grid-community";
import { themeBalham } from 'ag-grid-community';
import { themeMaterial } from 'ag-grid-community';
// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);
import { AgGridReact } from 'ag-grid-react';
import "./Grid.css";
import Control, { ControlProps } from "react-select/dist/declarations/src/components/Control";
function GridFunction(props: any) {
    // States
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false); // For loading status
    const [error, setError] = useState(null); // For error handling
    const [filters, setFilters] = React.useState([] as React.JSX.Element[]);
    const [filterRefs, setFilterRefs] = React.useState<RefObject<React.JSX.Element>[]>([] as RefObject<React.JSX.Element>[]);
    const itemsRef = useRef(null);
    function getItemRef(item: any) {
    const map = getMap();
    const node = map.get(item);
        console.log(node);
    }
    function getMap() {
    if (!itemsRef.current) {
        // Initialize the Map on first usage.
        itemsRef.current = new Map();
        }
        return itemsRef.current;
    }
    const [selectedName, setSelectedName] = useState('');

    // Refs
    const gridRef = useRef<AgGridReact>(null);
    const filterBarRef = useRef<HTMLDivElement>(null);
    const clearButtonRef = useRef<HTMLButtonElement>(null);
    const refFilters = useRef([]);

    const createQuickFilters = (gridRef: React.RefObject<AgGridReact>) => {
        let quickFilters : React.JSX.Element[] = [];
        if(gridRef.current){
                let rowData = gridRef.current!.props.rowData;
                let api = gridRef.current!.api;
                if(rowData) {
                    if(rowData.length > 0){
                        let obj = rowData[0];
                        for(let ind in colDefs){
                            let field = colDefs[ind].field;
                            let fieldType = typeof(obj[field]);
                            switch(fieldType){
                                case "string": {
                                    let options =  [...new Set(rowData.filter((row) => row[field]).map((item) => item[field]))].map((item) => {
                                        return { value: item, label: item }
                                    });
                                    // options.unshift({value: "", label: `Select ${field}...`})
                                    let handleChange = (value: any, meta: any) => {

                                        if(value.length == 0){
                                            let currentFilter = api.getColumnFilterModel(field);
                                            api.setColumnFilterModel(field, null);
                                            api.onFilterChanged();
                                        } else if(value.length > 1){
                                            let filterModel = {
                                                [field]: {
                                                    filterType: 'text',
                                                    type: 'equals',
                                                    operator: 'OR',
                                                    conditions: [...new Set(value.map((item: any) => { 
                                                        return {
                                                            filterType: 'text',
                                                            type: 'equals',
                                                            filter: item.value
                                                        } 
                                                    }))]
                                                }
                                            } 
                                            api.setFilterModel(filterModel);
                                        } else {
                                            let filterModel = {
                                                [field]: {
                                                    filterType: 'text',
                                                    type: 'equals',
                                                    filter: value[0].value
                                                }
                                            } 
                                            gridRef.current!.api.setFilterModel(filterModel);
                                        }
                                        console.log(value, meta);
                                    }
                                    quickFilters.push(<Select 
                                        className={`filter`}
                                        placeholder={"Select " + field}
                                        options={options}
                                        escapeClearsValue={true}
                                        backspaceRemovesValue={true}
                                        isClearable={true}
                                        isMulti={true}
                                        onChange={handleChange}
                                        ></Select>);
                                }
                                case "boolean":{
                                    
                                }
                                default: {

                                }
                            }
                        }
                    }
                }
        }
        return quickFilters;
    }

    // Callbacks
    const clearFilters = useCallback((event: any, filters: any) => {
        gridRef.current!.api.setFilterModel(null);
        gridRef.current!.api.applyColumnState({
            defaultState: { sort: null },
        });
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
    const loadDataFromCsv = async () : Promise<any[]> => {
        setIsLoading(true); // Set loading state
        setError(null); // Clear previous errors
        let transformedData : any[] = [];
        await window.electronAPI.loadList().then((result: string) => {
            setIsLoading(false);
            setError(null);
            let rawData = JSON.parse(result);
            for(let i = 0; i < rawData.length; i++){
                let item = rawData[i];
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
            }
        })
        return transformedData;
    }
    useEffect(() => {
                const fetch = async () => {
                    const result = await loadDataFromCsv(); 
                    setData(result);
                }
                fetch();
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
        checkboxes: true,
    }
const options = [
  { value: 'chocolate', label: 'Chocolate' },
  { value: 'strawberry', label: 'Strawberry' },
  { value: 'vanilla', label: 'Vanilla' }
]
    const handleFirstDataRendered = (event: FirstDataRenderedEvent<any>) => {
        console.log(event);
    }
    const handleGridReady = (event: GridReadyEvent<any>) => {
        let filters = createQuickFilters(gridRef);
        setFilters(filters);
    }
    return (
        <React.Fragment>
        <div>
            <div className="grid-filters" ref={filterBarRef}>
                <div className="quick-filters" >
                    {filters}
                </div>
                {/* <button className="grid-filters-clear" ref={clearButtonRef} onClick={(event) => {clearFilters(event, filters)}}> Clear Filters </button> */}
            </div>
            <AgGridReact
            className="grid"
                ref={gridRef}
                rowData={data}
                columnDefs={colDefs}
                defaultColDef={defaultColDef}
                theme={theme}
                rowSelection={rowSelectionOptons}
                onFirstDataRendered={handleFirstDataRendered}
                onGridReady={handleGridReady}
            />
        </div>
        </React.Fragment>
    )
}
export default GridFunction;