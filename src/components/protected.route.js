import React from "react";
import { Route, Redirect } from "react-router-dom";

import auth from './auth';

class ProtectedRoute extends React.Component {
    constructor({component: Component, cookieAuthenticationKey, ...rest}) {
        super(rest)
        this.state = {isAuthenticated: null}
        this.component = Component
        this.cookieAuthenticationKey = cookieAuthenticationKey
        this.toRender = this.toRender.bind(this)
    }

    async componentWillMount() {
        const result = await auth.isAuthenticated(this.cookieAuthenticationKey)
        console.log("result: " + result)
        this.setState({isAuthenticated: result})
    }

    toRender() {
        console.log("Rendering, this.state.authenticated: " + this.state.isAuthenticated)
        if (this.state.isAuthenticated == null) {
            return (
                <Route>
                    <div></div>
                </Route>
            )
        }
        else if (this.state.isAuthenticated) {
            return (
                <Route>
                    <this.component {...this.props} />
                </Route>
            )
        } else {
            return (
                <Route>
                    <Redirect to={{
                        pathname: "/",
                        state: {from: this.props.location}
                    }}/>
                </Route>
            )
        }
    }

    render() {
        return (
            <Route {...this.props}>
                {this.toRender()}
            </Route> 
        )
    }
}


export default ProtectedRoute;