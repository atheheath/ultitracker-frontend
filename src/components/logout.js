import React, { Component } from "react";
import {
    Redirect
} from "react-router-dom"
import auth from "./auth";

class Logout extends React.Component {
    constructor(props) {
        super(props)
        this.state = {isLoggedOut: null}
        this.toRender = this.toRender.bind(this)
    }

    async componentDidMount() {
        const result = await auth.logout();
        console.log("logout result: " + result) 
        this.setState({isLoggedOut: result})
    }

    toRender() {
        if (this.state.isLoggedOut == null) {
            return (
                <div/>
            )
        }
        else {
            return (
                <Redirect to={{
                    pathname: "/",
                    from: this.props.location,
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

export default Logout