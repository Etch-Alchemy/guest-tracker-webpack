import React from 'react';
import './Titlebar.css';
import { XMarkIcon, MinusCircleIcon  } from '@heroicons/react/24/solid';
class Titlebar extends React.Component {
    constructor(props){
        super(props);
    }


    render() {
    const close = (e) => {
        console.log(e);
        window.electronAPI.closeWindow();
    }

    const minimize = (e) => {
        console.log(e);
        window.electronAPI.minimizeWindow();
    }
        return (
            <React.Fragment>

                <div className="titlebar">
                    <div className="app-name">Guest Tracker v1</div>
                    <div className="icon-group">
                        <MinusCircleIcon className="icon" onClick={minimize}></MinusCircleIcon>
                        <XMarkIcon className="icon" onClick={close}></XMarkIcon>
                    </div>
                </div>
            </React.Fragment>
        )
    }
}

export default Titlebar;