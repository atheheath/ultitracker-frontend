import React from 'react';
import auth from './auth';
import "../stylesheets/login.box.css";

const isFromProtected = (props) => {
    if ("from" in props.location) {
        if (props.location.from.pathname === "/protected") {
            return true;
        }
    }

    return false;
}

const loginMessage = (props) => {
    if (isFromProtected(props)) {
        return <p>Please Login</p>
    }
}

const pushToHome = (props) => {
    props.history.push("/");
}

const pushToProtected = (props) => {
    props.history.push("/protected");
}

const handleSubmit = (event) => {
    event.preventDefault();
    console.log("Login Submitted")
}

const LoginButton = (props) => {
    return (
        <div id="loginButton">
            <button 
                onClick={() => {
                    auth.login(
                        props.usernameId,
                        props.passwordId,
                        () => {
                            console.log("Executing login callback");
                            pushToProtected(props);
                        }
                    )
                }}
            >
                Login
            </button>
        </div>
    )
}

const LoginBox = (props) => {
    return (
        <div id="loginBox">
            <form 
                id="loginBoxForm" 
                method="post" 
                onSubmit={handleSubmit}
                required
            >
                <div id="loginBoxUsername">
                    <input 
                        id="loginBoxUsernameInput" 
                        name="username" 
                        placeholder="username"
                    ></input>
                </div>
                <div id="loginBoxPassword">
                    <input 
                        id="loginBoxPasswordInput" 
                        name="password" 
                        placeholder="password"
                        type="password"
                    ></input>
                </div>
            </form>
            <LoginButton {...props} usernameId="loginBoxUsernameInput" passwordId="loginBoxPasswordInput"/>
        </div>
    )
    
}

const RenewToken = (props) => {
    return (
        <div id="renewToken">
            <button 
                onClick={() => {
                    auth.isAuthenticated(props.cookieAuthenticationKey)
                }}
            >
                Renew Token
            </button>
        </div>
    )
}



export { LoginBox, loginMessage, RenewToken };