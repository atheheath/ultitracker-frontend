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

const loginButton = (props) => {
    console.log(auth.isAuthenticated());
    if (!auth.isAuthenticated()) {
        return (
            <div>
                <button 
                    onClick={() => {
                        auth.login(() => {
                            props.history.push("/protected");
                        });
                    }}
                >
                    Login
                </button>
            </div>
        )
    }
}

const createUserBox = (props) => {
    if (!auth.isAuthenticated()) {
        return (
            <div>
                <form action="http://localhost:5678/login" id="login" method="post">
                    <div>
                        Username: <input name="username"></input>
                        <br/>
                        Password: <input name="password"></input>
                        <br/>
                    </div>
                </form>
                <button onClick="javascript:postLogin();">Login</button>
            </div>
        )
    }
}

export { createUserBox };