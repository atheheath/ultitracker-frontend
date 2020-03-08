import React, { Component } from "react";
import {
    Redirect
} from "react-router-dom"
import auth from "./auth";

class Logout extends React.Component {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
        auth.logout(); 
        console.log("Overwriting cookie")
        var cookieSetToValue = this.props.cookieAuthenticationKey + "=None"
        document.cookie = cookieSetToValue
        console.log("Cookie set to value: " + cookieSetToValue)
        console.log(document.cookie)
    }
    render() {
        return (
            <Redirect to={{
                pathname: "/",
                from: this.props.location,
                state: {from: this.props.location}
            }}/>
        )
    }
}

export default Logout