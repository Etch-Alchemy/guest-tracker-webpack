import React, { useState } from 'react';
import Container from './Container';
import Titlebar from './Titlebar';
import Grid from './Grid';
import { AgGridReact } from "ag-grid-react";
import {
  ClientSideRowModelModule,
  ColDef,
  ColGroupDef,
  GridApi,
  GridOptions,
  ISelectCellEditorParams,
  ITextCellEditorParams,
  ModuleRegistry,
  SelectEditorModule,
  ValidationModule,
} from "ag-grid-community";
ModuleRegistry.registerModules([
  SelectEditorModule
]);
interface Guest {
    Name: string,
    Surname: string,
    Relationship: string,
    Invitee: string,
    Table: string
}
const App = () => {
    const containerConfig = {
        header: "Guest List"
    };
    return (
        <React.Fragment>
        <div className='map'>
        <Titlebar></Titlebar>    
           <Container
                options = {{
                    header: "Guest Tracker v1"
                }}>
                <Grid 
                colDef={
                [
                { 
                    field: "Name",
                    headerName: "Name",
                    cellEditor: "agSelectTextEditor",
                    enableCellChangeFlash: true,
                        cellEditorParams: {
                            maxLength: 20
                    } as ITextCellEditorParams
                },
                { 
                    field: "Surname",
                    headerName: "Surname",
                    cellEditor: "agSelectTextEditor",
                    enableCellChangeFlash: true,
                        cellEditorParams: {
                            maxLength: 20
                    } as ITextCellEditorParams
                },
                { 
                    field: "Relationship",
                    headerName: "Relationship",
                    cellEditor: "agSelectCellEditor",
                    enableCellChangeFlash: true,
                    cellEditorParams: {
                        values: [
                            "Friend",
                            "Family",
                            "Anoima",
                            "Ika",
                            "Esan",
                            "Igbodo",
                        ]
                    } as ISelectCellEditorParams
                },
                { 
                    field: "Invitee",
                    headerName: "Invitee",
                    cellEditor: "agSelectCellEditor",
                    enableCellChangeFlash: true,
                    cellEditorParams: {
                        values: [
                            "Mamode",
                            "Christine",
                            "Mamode's Parents",
                            "Christine's Parents",
                            "CJ",
                            "Chi",
                        ]
                    } as ISelectCellEditorParams
                },
                                { 
                    field: "Table #",
                    headerName: "Table #",
                    cellEditor: "agSelectCellEditor",
                    enableCellChangeFlash: true,
                    cellEditorParams: {
                        values: [
                                    "1",
                                    "2",
                                    "3",
                                    "4",
                                    "5",
                                    "6",
                                    "7",
                                    "8",
                                    "9",
                                    "10",
                                    "11",
                                    "12",
                                    "13",
                                    "14",
                                    "15",
                                    "16",
                                    "17",
                                    "18",
                                    "19",
                                    "20",
                                    "21",
                                    "22",
                                    "23",
                                    "24",
                                    "25",
                                    "26",
                                    "27",
                                    "28",
                                    "29",
                                    "30",
                                    "31",
                                    "32",
                                    "33",
                                    "34",
                                    "35",
                                    "36",
                                    "37",
                                    "38",
                                    "39",
                                    "40",
                                ]
                    } as ISelectCellEditorParams
                },

                ]
                }
                />
            </Container>
        </div>
        </React.Fragment>
    )
}

export default App;
