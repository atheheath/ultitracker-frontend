import React from "react";
import { LoginBox, loginMessage, RenewToken } from "../components/login.box";
import { AddUserBox, addUserMessage } from "../components/add.user.box";
import { Sidebar } from "../components/sidebar";
import "../stylesheets/landing.page.css"

const LandingPage = (props) => {
    return (
        <div id="landing-page">
            <div id="landing-page-content">
                <h1>Ultitracker</h1>
                <LoginBox {...props}/>
                {loginMessage(props)}
                <h1>Add User</h1>
                <AddUserBox {...props}/>
                {addUserMessage(props)}
                <h1>Renew Token</h1>
                <RenewToken {...{cookieAuthenticationKey: props.cookieAuthenticationKey}}/>
            </div>
        </div>
    )
}

export default LandingPage;