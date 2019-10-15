import React from "react";
import auth from '../components/auth';

const Protected = () => {
    console.log(auth.isAuthenticated())
    return (
        <div>
            <h1>Protected</h1>
        </div>
    )
}

export default Protected;