import React from "react";
import auth from '../components/auth';
import {Link} from "react-router-dom";

const Protected = (props) => {
    return (
        <div>
            <Link to="/explorer">
                <h1>Protected</h1>
            </Link>
        </div>
    )
}

export default Protected;