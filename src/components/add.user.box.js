import React from 'react';
import auth from './auth';
import "../stylesheets/add.user.box.css";

const isFromProtected = (props) => {
    if ("from" in props.location) {
        if (props.location.from.pathname === "/protected") {
            return true;
        }
    }

    return false;
}

const addUserMessage = (props) => {
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
    console.log("Add User Submitted")
}

const AddUserButton = (props) => {
    return (
        <div id="addUserButton">
            <button 
                onClick={() => {
                    auth.addUser(
                        props.usernameId,
                        props.passwordId,
                        props.confirmPasswordId,
                        props.emailId,
                        props.fullNameId,
                        () => {
                            console.log("Executing addUser callback");
                            pushToHome(props);
                        }
                    )
                }}
            >
                Add User
            </button>
        </div>
    )
}

const AddUserBox = (props) => {
    return (
        <div id="addUserBox">
            <form 
                id="addUserBoxForm"
                method="post" 
                onSubmit={handleSubmit}
                required
            >
                <div id="addUserBoxUsername">
                    <input 
                        id="addUserBoxUsernameInput" 
                        name="username" 
                        placeholder="username"
                    ></input>
                </div>
                <div id="addUserBoxPassword">
                    <input 
                        id="addUserBoxPasswordInput" 
                        name="password" 
                        placeholder="password"
                        type="password"
                    ></input>
                </div>
                <div id="addUserBoxConfirmPassword">
                    <input 
                        id="addUserBoxConfirmPasswordInput" 
                        name="confirmPassword" 
                        placeholder="confirm password"
                        type="password"
                    ></input>
                </div>
                <div id="addUserBoxEmail">
                    <input 
                        id="addUserBoxEmailInput" 
                        name="email" 
                        placeholder="e-mail"
                    ></input>
                </div>
                <div id="addUserBoxFullName">
                    <input 
                        id="addUserBoxFullNameInput" 
                        name="fullName" 
                        placeholder="fullName"
                    ></input>
                </div>
            </form>
            <AddUserButton 
                {...props} 
                usernameId="addUserBoxUsernameInput" 
                passwordId="addUserBoxPasswordInput"
                confirmPasswordId="addUserBoxConfirmPasswordInput"
                emailId="addUserBoxEmailInput"
                fullNameId="addUserBoxFullNameInput"
            />
        </div>
    )
    
}

export { AddUserBox, addUserMessage };