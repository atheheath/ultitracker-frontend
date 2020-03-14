import React from "react";
import { LoginBox } from "../components/login.box";
import "../stylesheets/landing.page.css"
import { Route, Redirect } from "react-router-dom";
import auth from '../components/auth';


const LandingPageContent = (props) => {
    return (
        <div id="landing-page">
            <div id="landing-page-content">
                <h1>Ultitracker</h1>
                <LoginBox {...props}/>
            </div>
        </div>
    )
}


class LandingPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {isAuthenticated: null}
        this.cookieAuthenticationKey = this.props.cookieAuthenticationKey;
        this.toRender = this.toRender.bind(this)
    }

    async componentWillMount() {
        const result = await auth.isAuthenticated(this.cookieAuthenticationKey)
        this.setState({isAuthenticated: result})
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
                <Redirect to={{
                    pathname: "/explorer",
                    state: {from: this.props.location}
                }}/> 
            )
        } else {
            return (
                <LandingPageContent {...this.props}/>
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

export default LandingPage;