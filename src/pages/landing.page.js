import React from "react";
import { LoginBox, loginMessage, RenewToken} from "../components/login.box";
import { Sidebar } from "../components/sidebar";
import "../stylesheets/landing.page.css"

const loginFormId = "login";

const LandingPage = (props) => {
    return (
        <div id="landing-page">
            <Sidebar />
            <div id="landing-page-content">
                <h1>Ultitracker</h1>
                <LoginBox {...props} loginFormId={loginFormId}/>
                {loginMessage(props)}
                <h1>Renew Token</h1>
                <RenewToken {...props}/>
            </div>
        </div>
    )
}

export default LandingPage;