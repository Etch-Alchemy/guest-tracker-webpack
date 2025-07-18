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
interface IProps {
  options: any[],
  placeholder: string,
  handleSelectChange: (newValue: any, meta: any) => void
}
interface IState {
  options: any[]
}
    class GridFilter extends React.Component<IProps, IState> {
        filterRef: React.RefObject<any>;
        onClear: () => void;
        constructor(props: IProps){
          super(props);
          this.state = {
            options: props.options
          }
          this.filterRef = React.createRef();
          this.onClear = () => {
              this.filterRef.current.clearValue();
          };
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