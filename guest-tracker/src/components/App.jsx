import React, { useState } from 'react';
import Container from './Container';
import Titlebar from './Titlebar';
import Grid from './Grid';
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
                <Grid></Grid>
            </Container>
        </div>
        </React.Fragment>
    )
}

export default App;
