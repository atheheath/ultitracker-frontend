import React from 'react';
import auth from './auth';
import { Link } from "react-router-dom"
import "../stylesheets/login.box.css";

const isFromFailedLogin = (props) => {
    if ("from" in props.location) {
        console.log("props.location: " + props.location.from.pathname)
        if (props.location.from.pathname === "/failedLogin") {
            return true;
        }
    }

    return false;
}

const isFromLogout = (props) => {
    if ("from" in props.location) {
        console.log("props.location: " + props.location.from.pathname)
        if (props.location.from.pathname === "/logout") {
            return true;
        }
    }

    return false;
}

const isFromProtectedInvalidAccess = (props) => {
    if ("from" in props.location) {
        console.log("props.location: " + props.location.from.pathname)
        if (props.location.from.pathname === "/protectedInvalidAccess") {
            return true;
        }
    }
}

const isFromAddUser = (props) => {
    if ("from" in props.location) {
        console.log("props.location: " + props.location.from.pathname)
        if (props.location.from.pathname === "/successfulAddUser") {
            return true;
        }
    }
}

const loginMessage = (props) => {
    if (isFromFailedLogin(props)) {
        return <p style={{color: "red"}}>Invalid username or password</p>
    }
    else if (isFromLogout(props)) {
        return <p style={{color: "#4CAF50"}}>Successfully logged out</p>
    }
    else if (isFromProtectedInvalidAccess(props)) {
        return <p style={{color: "red"}}>Please login to access</p>
    }
    else if (isFromAddUser(props)) {
        return <p style={{color: "#4CAF50"}}>Successfully added user</p>
    }
}

const pushToFailedLogin = (props) => {
    props.history.push("/failedLogin");
}

const pushToProtected = (props) => {
    props.history.push("/protected");
}

const pushToExplorer = (props) => {
    props.history.push("/explorer");
}

const pushtoAddUser = (props) => {
    props.history.push("/addUserPage");
}

const handleSubmit = (event) => {
    event.preventDefault();
    console.log("Login Submitted")
}

async function handleLogin(props) {
    var result = await auth.login(
        props.usernameId,
        props.passwordId,
        () => {
            console.log("Executing login callback");
            pushToExplorer(props);
        }
    )
    console.log("result is " + result)
    if (!result) {
        console.log("pushing to failed login")
        pushToFailedLogin(props);
    }
}

// async function handleAddUser(props) {
//     var result = await auth.login(
//         props.usernameId,
//         props.passwordId,
//         () => {
//             console.log("Executing login callback");
//             pushToExplorer(props);
//         }
//     )
//     console.log("result is " + result)
//     if (!result) {
//         console.log("pushing to failed login")
//         pushToFailedLogin(props);
//     }
// }

const LoginButton = (props) => {
    return (
        <div id="loginButton">
            <button 
                onClick={() => {
                    handleLogin(props)
                }}
                tabIndex="0"
            >
                Login
            </button>
        </div>
    )
}

const AddUserButton = (props) => {
    return (
        <div id="addUserButton">
            <button 
                onClick={() => {
                    pushtoAddUser(props)
                }}
                tabIndex="0"
            >
                Add User
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
                        tabIndex="0"
                    ></input>
                </div>
                <div id="loginBoxPassword">
                    <input 
                        id="loginBoxPasswordInput" 
                        name="password" 
                        placeholder="password"
                        type="password"
                        tabIndex="0"
                    ></input>
                </div>
            </form>
            <LoginButton {...props} usernameId="loginBoxUsernameInput" passwordId="loginBoxPasswordInput"/>
            <AddUserButton {...props}/>
            {loginMessage(props)}
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