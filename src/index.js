import React from 'react';
import ReactDOM from 'react-dom';
import {
    BrowserRouter,
    Route,
    Switch,
    withRouter
} from "react-router-dom"

import './stylesheets/index.css';
import LandingPage from "./pages/landing.page";
import Protected from "./pages/protected";
import ProtectedComponent from "./components/protected.component";
import Explorer from "./pages/explorer";
import Viewer from "./pages/viewer";
import * as serviceWorker from './serviceWorker';

const cookieAuthenticationKey = "ultitracker-api-access-token";

function App() {
    return (
        <div className="App">
            <Switch>
                <Route 
                    exact path="/" 
                    render={(props) => 
                        <LandingPage 
                            {...props} 
                            cookieAuthenticationKey={cookieAuthenticationKey}
                        />
                    } 
                />
                <Route
                    exact path="/protected"
                    render={(props) =>
                        <ProtectedComponent
                            {...props}
                            component={withRouter(Protected)}
                            cookieAuthenticationKey={cookieAuthenticationKey}
                        />
                    }
                />
                <Route
                    exact path="/explorer"
                    render={(props) =>
                        <ProtectedComponent
                            component={withRouter(Explorer)}
                            cookieAuthenticationKey={cookieAuthenticationKey}
                        />
                    }
                />
                <Route
                    path="/viewer/:gameId"
                    render={(props) => 
                        <ProtectedComponent
                            {...props}
                            component={withRouter(Viewer)}
                            cookieAuthenticationKey={cookieAuthenticationKey}
                        />
                    }
                />
                <Route 
                    path="*" 
                    component={() => "404 NOT FOUND"}
                />
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
