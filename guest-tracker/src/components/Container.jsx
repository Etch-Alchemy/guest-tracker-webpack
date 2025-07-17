import React, {useState, useEffect} from 'react';
import ReactDOM from 'react-dom';
import './Container.css';
class Container extends React.Component {
    constructor(props)
    {
        super(props);
        this.state = { count: 0 };
        this.options = props.options;
        this.dataset = this.options.dataset;
        console.log(this.dataset);

        this.defaults = {
            header: <span className='header'> Pandora's Box </span>
        };
    }
    handleClick = () => { // Arrow function for concise syntax and 'this' binding
        this.setState({ count: this.state.count + 1 });
    };
    render() {
        return ( 
            <React.Fragment>
                <div className='box mid'>
                    <div className="box--banner">
                        { this.options.header ? <span className='header'> {this.options.header} </span> : this.defaults.header } 
                    </div>
                    <div className='box--content'>
                        { this.props.children }
                    </div>
                </div>
            </React.Fragment>
        );
    }
}
export default Container;
