import React from "react";
import { Sidebar } from "../components/sidebar";
import auth from '../components/auth';
import User from '../components/user';
import { GameScrollList } from "../components/game.scroll";
import { withRouter } from "react-router";
import "../stylesheets/explorer.css";
import { UploadVideoBox } from "../components/upload.video.box";
import { apiURI } from "../Consts"

async function constructUserRequest(cookieAuthenticationKey) {
    var headers = auth.getAuthorizationHeader(cookieAuthenticationKey)
    var requestInit = {
        method: "GET",
        headers: headers,
        credentials: "include"
    }
    const request = new Request(
        apiURI + "/users/me",
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
                <h1>Welcome {(this.state.fullName === "") ? this.state.username : this.state.fullName}!</h1>
            </div>
        )
    }
}



class Explorer extends React.Component {
    constructor(props) {
        super(props)
        for (let x in props) {
            console.log("Explorer props: ")
            console.log(props)
        }

        console.log("Explorer cak: " + this.props.cookieAuthenticationKey)
    }

    render() {
        return (
            <div id="explorer">
                <Sidebar {...this.props}/>
                <div id="explorer-content">
                    <h1>Explorer</h1>
                    <div id="user-info-box">
                        <UserInfo {...this.props}/>
                        <div id="upload-video-container">
                            <button id="upload-video-button">
                                Upload Game
                            </button>
                        </div>
                    </div>
                    <UploadVideoBox cookieAuthenticationKey={this.props.cookieAuthenticationKey}/>
                    <GameScrollList {...this.props}/>
                    {/* <LoginBox {...props} loginFormId={loginFormId}/> */}
                    {/* {loginMessage(props)} */}
                    {/* <h1>Renew Token</h1> */}
                    {/* <RenewToken {...props}/> */}
                </div>
            </div>
        )
    }
}

export {Explorer, getUser};