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
  import Select from 'react-select';
import { AgGridReact } from 'ag-grid-react';
interface IProps {
  options: any[],
  colId: string,
  gridRef: RefObject<AgGridReact>,
  placeholder: string,
  handleSelectChange: (newValue: any, meta: any) => void
}
interface IState {
  options: any[]
}

    class GridFilter extends React.Component<IProps, IState> {
        colId: string;
        gridRef: RefObject<AgGridReact>;
        filterRef: React.RefObject<any>;
        onClear: () => void;
        updateOptions: (options: any[]) => void;
        constructor(props: IProps){
          super(props);
          this.state = {
            options: props.options
          }
          this.colId = props.colId;
          this.filterRef = React.createRef();
          this.gridRef = this.props.gridRef;
          this.onClear = () => {
              this.filterRef.current.clearValue();
          };
          this.updateOptions = (options) => {
            this.setState({
              options: options
            });
          }
        }
        render () {
          return (
              <Select
              className={`filter`}
              ref={this.filterRef}
              placeholder={this.props.placeholder}
              options={this.state.options} // Your array of available options
              escapeClearsValue={true}
              backspaceRemovesValue={true}
              isClearable={true}
              isMulti={true}
              onChange={this.props.handleSelectChange}
              />
          );
        }
    }

    export default GridFilter;