import React from 'react';
import auth from './auth';

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

const LoginButton = (props) => {
    return (
        <div>
            <button 
                onClick={() => {
                    auth.login(
                        document.getElementById(props.loginFormId), 
                        () => {pushToHome(props)}
                    );
                }}
            >
                Login
            </button>
        </div>
    )
}

const LoginBox = (props) => {
    return (
        <div>
            <form action="http://localhost:5678/token" id={props.loginFormId} method="post">
                <div>
                    <input name="username" value="username"></input>
                    <br/>
                    <input name="password" value="password"></input>
                    <br/>
                </div>
            </form>
            <LoginButton {...props}/>
        </div>
    )
    
}

const RenewToken = (props) => {
    return (
        <div>
            <button 
                onClick={() => {
                    auth.isAuthenticated(props, () => {pushToHome(props)})
                }}
            >
                Renew Token
            </button>
        </div>
    )
}



export { LoginBox, loginMessage, RenewToken };