import React from "react";
import { Route, Redirect } from "react-router-dom";
import Protected from "../pages/protected";
import auth from './auth';
import { thisExpression } from "@babel/types";

class ProtectedComponent extends React.Component {
    // constructor({component: Component, cookieAuthenticationKey, ...rest}) {
    constructor(props) {
        super(props)
        this.state = {isAuthenticated: null}
        this.component = this.props.component;
        this.cookieAuthenticationKey = this.props.cookieAuthenticationKey;
        // this.component = Component
        // this.cookieAuthenticationKey = cookieAuthenticationKey
        this.toRender = this.toRender.bind(this)
    }

    async componentWillMount() {
        const result = await auth.isAuthenticated(this.cookieAuthenticationKey)
        this.setState({isAuthenticated: result})
    }

    renderComponent() {
        return (
            <this.component {...this.props} myProp="myValue"/>
        )
    }

    toRender() {
        console.log(this.props)
        console.log(this.component)
        console.log("Rendering, this.state.authenticated: " + this.state.isAuthenticated)
        if (this.state.isAuthenticated == null) {
            return (
                <div/>
            )
        }
        else if (this.state.isAuthenticated) {
            return (
                <this.props.component {...this.props} cookieAuthenticationKey={this.cookieAuthenticationKey}/>
                // <Route
                //     exact path="/protected"
                //     component={Protected}
                // />
            )
        } else {
            return (
                <Redirect to={{
                    pathname: "/protectedInvalidAccess",
                    state: {from: this.props.location}
                }}/>
            )
        }
    }

    render() {
        return (
            <div {...this.props}>
                {this.toRender()}
            </div> 
        )
    }
}


export default ProtectedComponent;