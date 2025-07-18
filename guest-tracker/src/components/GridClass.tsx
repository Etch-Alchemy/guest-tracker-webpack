import "./Grid.css";
// React Declarations
import React, {
  StrictMode,
  RefObject,
  createRef,
} from "react";
import Select from 'react-select';

// Custom Declarations
import GridFilter from "./GridFilterClass";

// AG Grid Declarations
import {
    AllCommunityModule,
    ModuleRegistry,
    themeQuartz,
    RowSelectionOptions,
    GridApi,
    FirstDataRenderedEvent,
    GridReadyEvent,
    Theme
} from "ag-grid-community";
import { AgGridReact } from 'ag-grid-react';

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);


// Interfaces
interface IProps {
  data?: any[];
}

interface IState {
  data: any[];
  isLoading: boolean;
  error: string;
  filters: React.JSX.Element[];
}

class Grid extends React.Component<IProps, IState> {
    itemRefs: GridFilter[];
    gridRef: RefObject<AgGridReact>;
    clearButtonRef: RefObject<HTMLButtonElement>;
    colDef: any[];
    defaultColDef: {};
    theme: Theme;
    rowSelectionOptions: RowSelectionOptions;
    loadDataFromCsv: () =>  Promise<any[]>;
    generateFilters : (gridRef: GridApi) => React.JSX.Element[];
    handleFirstDataRendered: (event: FirstDataRenderedEvent<any>) => void;
    handleGridReady: (event: GridReadyEvent<any>) => void;
    handleFilterClear: () => void;
    constructor(props: IProps)
    {
        super(props);

        // AG Grid Config
        this.itemRefs = [] as GridFilter[]; // Array to store refs
        this.gridRef = createRef<AgGridReact>();
        this.colDef = [
          { field: "Name" },
          { field: "Surname" },
          { field: "Relationship" },
          { field: "Invitee" },
          { field: "Table" },
          { field: "RSVP" }]
        this.defaultColDef = {
          editable: true,
          flex: 1,
          minWidth: 100,
          filter: true,
        };
        this.theme = themeQuartz.withParams({
            backgroundColor: 'rgb(249, 245, 227)',
            foregroundColor: 'rgb(126, 46, 132)',
            headerTextColor: 'rgb(204, 245, 172)',
            headerBackgroundColor: 'rgb(209, 64, 129)',
            oddRowBackgroundColor: 'rgb(0, 0, 0, 0.03)',
            headerColumnResizeHandleColor: 'rgb(126, 46, 132)',
        });
        this.rowSelectionOptions =  {
                mode: "multiRow",
                selectAll: 'filtered',
                checkboxes: true,
            }
        
        // State Defaults 
        this.state = {
          data: props.data,
          isLoading: false,
          error: null,
          filters: []
        };

        this.loadDataFromCsv = async () : Promise<any[]> => {
          this.setState({
          isLoading: true,
          error: null
          });
          let transformedData : any[] = [];
          await window.electronAPI.loadList().then((result: string) => {
              this.setState({
              isLoading: true,
              error: null
              });
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

        // AG Grid Events
        this.generateFilters = (api: GridApi) => {
        let quickFilters : React.JSX.Element[] = [];
        if(api){
                let rowData = this.state.data;
                if(rowData) {
                    if(rowData.length > 0){
                        let obj = rowData[0];
                        for(let ind in this.colDef){
                            let field = this.colDef[ind].field;
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
                                            api.setFilterModel(filterModel);
                                        }
                                        console.log(value, meta);
                                    }
                                    quickFilters.push(<GridFilter
                                        placeholder={"Select " + field}
                                        options={options}
                                        handleSelectChange={handleChange}
                                        />
                                      );
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
        this.handleFirstDataRendered = (event: FirstDataRenderedEvent<any>) => {
            console.log(event);
        }
        this.handleGridReady = (event: GridReadyEvent<any>) => {
            let filters = this.generateFilters(event.api);
            this.setState({
              filters: filters
            })
        }

        // Event Handlers
        this.handleFilterClear = () => {
          if(this.itemRefs.length > 0){
            for(let i = 0; i < this.itemRefs.length; i++){
              let filter = this.itemRefs[i];
              filter.onClear();
            }
          }
        }
      }
  
    componentDidMount() {
        console.log(this.itemRefs);
        const fetch = async () => {
                    const result = await this.loadDataFromCsv(); 
                    this.setState({
                      data: result
                    });
                    console.log(this.state.data);
                  }
        fetch();
    }
    componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<IState>, snapshot?: any): void {
      console.log(prevState);
    }
    render() {
        // const items = ['Item 1', 'Item 2', 'Item 3'];
        return (
          <React.Fragment>
            <div className="grid-filters">
                <div className="quick-filters" >
                  {this.state.filters.map((item, index) => (
                    React.cloneElement(item, {ref: (el: any) => (this.itemRefs[index] = el)  }))
                    )
                  }
                </div>
                {<button className="grid-filters-clear" ref={this.clearButtonRef} onClick={(event) => {this.clearFilters(event, this.state.filters)}}> Clear Filters </button>}
            </div>
            <AgGridReact
            className="grid"
                ref={this.gridRef}
                rowData={this.state.data}
                columnDefs={this.colDef}
                defaultColDef={this.defaultColDef}
                theme={this.theme}
                rowSelection={this.rowSelectionOptions}
                onFirstDataRendered={this.handleFirstDataRendered}
                onGridReady={this.handleGridReady}
            />
          </React.Fragment>
        );
    }
  clearFilters(event: React.MouseEvent<HTMLButtonElement, MouseEvent>, filters: React.JSX.Element[]) {
    this.gridRef.current!.api.setFilterModel(null);
    this.gridRef.current!.api.applyColumnState({
        defaultState: { sort: null },
    });
    this.handleFilterClear();
  }
}

export default Grid;