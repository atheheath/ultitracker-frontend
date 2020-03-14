import React from "react";
// import { LoginBox, RenewToken } from "../components/login.box";
import { AddUserBox, addUserMessage } from "../components/add.user.box";
import { Sidebar } from "../components/sidebar";
import "../stylesheets/landing.page.css"

const AddUserPage = (props) => {
    return (
        <div id="add-user-page">
            <div id="add-user-page-content">
                {/* <h1>Ultitracker</h1>
                <LoginBox {...props}/> */}
                <h1>Add User</h1>
                <AddUserBox {...props}/>
                {/* {addUserMessage(props)} */}
                {/* <h1>Renew Token</h1> */}
                {/* <RenewToken {...{cookieAuthenticationKey: props.cookieAuthenticationKey}}/> */}
            </div>
        </div>
    )
}

export default AddUserPage;