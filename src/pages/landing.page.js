import React from "react";
import { LoginBox, loginMessage, RenewToken} from "../components/login.box";

const loginFormId = "login";
const cookieAuthenticationKey = "ultitracker-api-access-token";

const LandingPage = (props) => {
    return (
        <div>
            <h1>Landing Page</h1>
            <LoginBox {...props} loginFormId={loginFormId}/>
            {loginMessage(props)}
            <h1>Renew Token</h1>
            <RenewToken {...props} cookieAuthenticationKey={cookieAuthenticationKey}/>
        </div>
    )
}

export default LandingPage;