import React from "react";
import { Sidebar } from "../components/sidebar";
import auth from '../components/auth';
import User from '../components/user';
import { GameScrollList } from "../components/game.scroll";
import "../stylesheets/explorer.css";

async function constructUserRequest(cookieAuthenticationKey) {
    var headers = auth.getAuthorizationHeader(cookieAuthenticationKey)
    var requestInit = {
        method: "GET",
        headers: headers,
        credentials: "include"
    }
    const request = new Request(
        "http://localhost:3001/users/me",
        requestInit
    )

    const user = await fetch(request)
        .then((response) => {
            if (!response.ok) {
                throw Error("Can't fetch: " + response)
            }
            return response.json()
        })
        .then((payload) => {
            const newUser = new User({
                username: payload.username,
                email: payload.email,
                fullName: payload.full_name
            })      
            return newUser  
        })
        .catch((err) => {
            console.log(err);
            return false;
        })

    return user
}

async function getUser(cookieAuthenticationKey) {
    
    const isAuthenticated = await auth.isAuthenticated(cookieAuthenticationKey)
    
    if (!isAuthenticated) {
        console.log("Not authenticated");
        throw Error("Not authenticated");
    }

    console.log("Calling constructUserRequest")
    const user = constructUserRequest(cookieAuthenticationKey)
    
    return user;
}

class UserInfo extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            username: null,
            email: null,
            fullName: null
        }
    }

    componentDidMount() {
        console.log("userinfo cak: " + this.props.cookieAuthenticationKey)
        getUser(this.props.cookieAuthenticationKey).then((user) => {
            console.log("user: " + user)
            this.setState({
                username: user.username,
                email: user.email,
                fullName: user.fullName
            })
        })
    }

    render() {
        return (
            <div id="UserInfo">
                <h1>User Info</h1>
                <table align="center">
                    <tr>
                        <th>Username</th>
                        <th>{this.state.username}</th>
                    </tr>
                    <tr>
                        <th>E-mail</th>
                        <th>{this.state.email}</th>
                    </tr>
                    <tr>
                        <th>Full Name</th>
                        <th>{this.state.fullName}</th>
                    </tr>
                </table>
            </div>
        )
    }
}



const Explorer = (props) => {
    console.log("Explorer cak: " + props.cookieAuthenticationKey)
    return (
        <div id="explorer">
            <Sidebar />
            <div id="explorer-content">
                <h1>Explorer</h1>
                <UserInfo {...props}/>
                <GameScrollList {...props}/>
                {/* <LoginBox {...props} loginFormId={loginFormId}/> */}
                {/* {loginMessage(props)} */}
                {/* <h1>Renew Token</h1> */}
                {/* <RenewToken {...props}/> */}
            </div>
        </div>
    )
}

export default Explorer;