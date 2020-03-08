import React from 'react';
import auth from './auth';
import "../stylesheets/add.user.box.css";

const isFromFailedAddUser = (props) => {
    if ("from" in props.location) {
        console.log("props.location: " + props.location.from.pathname)
        if (props.location.from.pathname === "/failedAddUser") {
            return true;
        }
    }

    return false;
}

const addUserMessage = (props) => {
    if (isFromFailedAddUser(props)) {
        return <p style={{color: "red"}}>Username already exists</p>
    }
    if ("nonmatchingPassword" in props) {
        return <p style={{color: "red"}}>Passwords do not match</p>
    }
}

const pushToHome = (props) => {
    props.history.push("/successfulAddUser");
}

const pushToFailedAddUser = (props) => {
    props.history.push("/failedAddUser");
}

const handleSubmit = (event) => {
    event.preventDefault();
    console.log("Add User Submitted")
}

async function handleAddUser(props) {
    var password = document.getElementById(props.passwordId).value;
    var confirmPassword = document.getElementById(props.confirmPasswordId).value;
    if (password != confirmPassword) {
        alert("Passwords do not match")
        return true;
    }

    var result = await auth.addUser(
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

    console.log("result is " + result)
    if (!result) {
        console.log("pushing to failed add user")
        pushToFailedAddUser(props);
    }
}

const AddUserButton = (props) => {
    return (
        <div id="addUserButton">
            <button 
                onClick={() => {
                    handleAddUser(props)
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
            {addUserMessage(props)}
        </div>
    )
    
}

export { AddUserBox, addUserMessage };