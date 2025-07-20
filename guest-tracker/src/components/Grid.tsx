// <reference path="index.d.ts" />
import "./Grid.css";
import { fadeIn, fadeOut, flashElement } from "../anim";
// React Declarations
import React, {
  MouseEvent,
  StrictMode,
  RefObject,
  createRef,
} from "react";
import Select from 'react-select';

// Custom Declarations
import GridFilter from "./GridFilter";
// AG Grid Declarations
import {
    AllCommunityModule,
    ModuleRegistry,
    themeQuartz,
    ColDef,
    RowSelectionOptions,
    GridApi,
    FirstDataRenderedEvent,
    GridReadyEvent,
    Theme,
    CellValueChangedEvent,
    AgCheckbox
} from "ag-grid-community";
import { AgGridReact } from 'ag-grid-react';

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);


// Interfaces
interface IProps {
  data?: any[];
  colDef: ColDef[];
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
    clearFilterButtonRef: RefObject<HTMLButtonElement>;
    clearSelectionButtonRef: RefObject<HTMLButtonElement>;
    loadButtonRef: RefObject<HTMLButtonElement>;
    saveButtonRef: RefObject<HTMLButtonElement>;
    addButtonRef: RefObject<HTMLButtonElement>;
    deleteButtonRef: RefObject<HTMLButtonElement>;
    savePath: string;
    colDef: ColDef[];
    defaultColDef: {};
    theme: Theme;
    rowSelectionOptions: RowSelectionOptions;
    loadDataFromCsv: () =>  Promise<any[]>;
    generateFilters : (gridRef: GridApi) => React.JSX.Element[];
    handleFirstDataRendered: (event: FirstDataRenderedEvent<any>) => void;
    handleGridReady: (event: GridReadyEvent<any>) => void;
    handleFilterClear: () => void;
    handleSelectionClear: (event: MouseEvent<HTMLButtonElement>) => void;
    handleCellValueChanged: (event: CellValueChangedEvent) => void;
    handleLoad: (event: MouseEvent<HTMLButtonElement>) => void;
    handleSave: (event: MouseEvent<HTMLButtonElement>) => void;
    handleDelete: (event: MouseEvent<HTMLButtonElement>) => void;
    handleAdd: (event: MouseEvent<HTMLButtonElement>) => void;
    clearFilters: (event: MouseEvent<HTMLButtonElement>, filters: React.JSX.Element[]) => void;
    constructor(props: IProps)
    {
        super(props);

        // AG Grid Config
        this.itemRefs = [] as GridFilter[]; // Array to store refs
        this.gridRef = createRef<AgGridReact>();
        this.colDef = this.props.colDef;
        this.savePath = null;
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
          await window.electronAPI.loadList(this.savePath).then((result: string) => {
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
        const getOptionsFromRowData = (rowData: any[], field: string) => {
        return [...new Set(rowData.filter((row) => row[field]).map((item) => item[field]))].map((item) => {
                                                return { value: item, label: item }
                                            });
        }
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
                                    let options = getOptionsFromRowData(rowData, field);
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
                                    }
                                    quickFilters.push(<GridFilter
                                        colId={field}
                                        gridRef={this.gridRef}
                                        placeholder={
                                          field}
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
        }
        this.handleGridReady = (event: GridReadyEvent<any>) => {
            let filters = this.generateFilters(event.api);
            this.setState({
              filters: filters
            })
        }

        this.handleCellValueChanged = (event: CellValueChangedEvent) => {
          let editedNode = event.node;
          let selectedNodes = event.api.getSelectedNodes();
          let otherNodes = selectedNodes.filter((node) => node !== editedNode);
          otherNodes.forEach((node, idx) => {
            node.setDataValue(event.column.getColId(), event.newValue);
          });
          this.itemRefs.filter((ref) => ref.colId == event.column.getColId()).forEach((affectedFilter, idx) => {
            affectedFilter.updateOptions(getOptionsFromRowData(event.api.getGridOption("rowData"), event.column.getColId()));
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
        this.clearFilters = (event: any, filters: React.JSX.Element[]) => {
          this.gridRef.current!.api.setFilterModel(null);
          this.gridRef.current!.api.applyColumnState({
              defaultState: { sort: null },
          });
          this.handleFilterClear();
        }
        this.handleSelectionClear = (event:any ) => {
          this.gridRef.current!.api.deselectAll();
        }
        this.handleSave = (event: MouseEvent<HTMLButtonElement>) => {
          let csvData = this.gridRef.current.api.getDataAsCsv();
          window.electronAPI.saveData(csvData).then((result: any) => {
          });
        }
        this.handleAdd = (event: MouseEvent<HTMLButtonElement>) => {
          let api = this.gridRef.current.api;
          let data = api.getGridOption("rowData");
          data.unshift({});
          api.setGridOption("rowData", data);
        }
        this.handleDelete = (event: MouseEvent<HTMLButtonElement>) => {
          let api = this.gridRef.current.api;
          let selectedData = api.getSelectedRows();
          const res = api.applyTransaction({ remove: selectedData })!;
          console.log(res);
        }
        this.handleLoad = (event: MouseEvent<HTMLButtonElement>) => {
          this.gridRef.current.api.exportDataAsCsv();
        }
      }
  
    componentDidMount() {
        const fetch = async () => {
                    const result = await this.loadDataFromCsv(); 
                    this.setState({
                      data: result
                    });
                  }
        fetch();
        const getSavePath = async () => {
           await window.electronAPI.getConfig().then((result: any) => {
            this.savePath = result.pathToCsv;
          });
        }
        getSavePath();
    }
    componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<IState>, snapshot?: any): void {
    }
    render() {
        const undoRedoCellEditing = true;
        const undoRedoCellEditingLimit = 20;
        return (
          <React.Fragment>
            <div className="grid-wrapper" id="grid-wrapper">
              <div className="grid-controls">
                <div className="header"> Quick Filters </div>
                <div className="grid-filters">
                    <div className="quick-filters" >
                      {this.state.filters.map((item, index) => (
                        React.cloneElement(item, {ref: (el: any) => (this.itemRefs[index] = el)  }))
                        )
                      }
                    </div>
                    <div className="grid-filters-controls">
                      {<button className="grid-filters-clear" ref={this.clearFilterButtonRef} onClick={(event) => {this.clearFilters(event, this.state.filters)}}> Clear Filters </button>}
                      {<button className="grid-filters-clearSelection" ref={this.clearSelectionButtonRef} onClick={(event) => {this.handleSelectionClear(event)}}> Clear Selections </button>}
                    </div>

                </div>
                <div className="header"> Settings </div>
                <div className="grid-settings">
                    <div className="setting">
                      <label className="setting-label">
                        Auto Save
                      </label>
                      <div className="setting-control">
                        <input type="checkbox" name="toggle-autosave"></input>
                      </div>
                  </div>
                </div>
              </div>
                <div className="grid-content">
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
                    undoRedoCellEditing={undoRedoCellEditing}
                    undoRedoCellEditingLimit={undoRedoCellEditingLimit}
                    onCellValueChanged={this.handleCellValueChanged}
                  />
                <div className="grid-footer">
                  {<button className="add-row" ref={this.addButtonRef} onClick={(event) => {this.handleAdd(event)}}> Add New Guest </button>}
                  {<button className="delete-row" ref={this.deleteButtonRef} onClick={(event) => {this.handleDelete(event)}}> Delete Rows </button>}
                  {<button className="grid-save" ref={this.saveButtonRef} onClick={(event) => {this.handleSave(event)}}> Save </button>}
                  {/* {<button className="grid-load" ref={this.loadButtonRef} onClick={(event) => {this.handleLoad(event)}}> Load </button>} */}
                </div>
                </div>

            </div>
          </React.Fragment>
        );
    }

}

export default Grid;