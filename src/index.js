import React from 'react';
import ReactDOM from 'react-dom';
import {
    BrowserRouter,
    Route,
    Switch
} from "react-router-dom"

import './index.css';
import LandingPage from "./pages/landing.page";
import Protected from "./pages/protected";
import ProtectedRoute from "./components/protected.route";
import * as serviceWorker from './serviceWorker';

const cookieAuthenticationKey = "ultitracker-api-access-token";

function App() {
    return (
        <div className="App">
            <Switch>
                    render={(props) => <LandingPage {...props} cookieAuthenticationKey={cookieAuthenticationKey}/>} 
                />
                <ProtectedRoute 
                    exact path="/protected" 
                    component={Protected}
                    cookieAuthenticationKey={cookieAuthenticationKey}
                />
                <Route 
                    path="*" 
                    component={() => "404 NOT FOUND"}
                />
                <ProtectedRoute exact path="/protected" component={Protected} />
                <Route path="*" component={() => "404 NOT FOUND"}/>
            </Switch>
        </div>
    )
}

const rootElement = document.getElementById("root");
ReactDOM.render(
    <BrowserRouter>
        <App />
    </BrowserRouter>,
    rootElement
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
