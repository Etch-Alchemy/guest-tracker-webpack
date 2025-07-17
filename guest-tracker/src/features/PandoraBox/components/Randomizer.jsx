import React, {useEffect, useState} from 'react';
import ReactDOM from 'react-dom/client';
import Count from '../utils/count';
import toolbox from '../../../utils/toolbox';
import Box from './Box';

class Randomizer extends React.Component {
    constructor(props){
        super(props);
        this.dataset = props.dataset;
        this.state = {
            pick: Count.getRandomObjectByDataProp("id", this.dataset)
        };
    }
    render() {
        return (
            <div className='factoid' onClick={(e) => {
                e.preventDefault();
                toolbox.clearSelection();
                console.log(e);
                let newPick = null;
                do {
                    newPick = Count.getRandomObjectByDataProp("id", this.dataset);
                } while (this.state.pick.id == newPick.id);
                this.setState({pick: newPick});
            }}>
                <div className='name'> {this.state.pick.name} </div>
                <div className='detail'> {this.state.pick.detail} </div>
            </div>
        )
    }
}
export default Randomizer;