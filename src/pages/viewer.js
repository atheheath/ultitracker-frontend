import React from "react";
import { Link } from "react-router-dom"
import { Sidebar } from "../components/sidebar";
import auth from '../components/auth';
import User from '../components/user';
import { GameScrollList } from "../components/game.scroll";
import { apiURI } from '../Consts';
import "../stylesheets/viewer.css";

const urlencodeParams = (params) => {
    var paramsArray = Array()

    for (var key in params) {
        paramsArray.push(key + "=" + params[key])
    }

    const encodedString = paramsArray.join("&");

    return encodedString;
}

async function getGameRequest(cookieAuthenticationKey, gameId) {
    var headers = auth.getAuthorizationHeader(cookieAuthenticationKey)
    var requestInit = {
        method: "GET",
        headers: headers,
        credentials: "include"
    }
    const request = new Request(
        apiURI + "/get_game?" + urlencodeParams({
            game_id: gameId
        }),
        requestInit
    )

    const gameInfo = await fetch(request)
        .then((response) => {
            if (!response.ok) {
                throw Error("Can't fetch: " + response)
            }
            return response.json()
        })
        .then((payload) => {
            return payload
        })
        .catch((err) => {
            console.log(err);
            return false;
        })

    return gameInfo
}

class ViewerContent extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            gameInfo: {
                data: {
                    video: null
                },
                game_id: null
            },
            videoNotFound: false
        }

        this.toggleContent = this.toggleContent.bind(this)
    }

    componentDidMount() {
        console.log("ViewerContent has mounted")
    }

    componentWillUnmount() {
    }

    async componentDidMount() {
        const gameInfo = await getGameRequest(
            this.props.cookieAuthenticationKey, 
            this.props.gameId
        )

        console.log("GameInfo:")
        console.log(gameInfo)

        if (!gameInfo) {
            this.setState({videoNotFound: true})
        } else {
            this.setState({gameInfo: gameInfo})
        }
        
    }

    toggleContent() {
        if (this.state.videoNotFound) {
            return (
                <div id="viewer-content">
                    <h1>Viewer</h1>
                    <h1>Video Not Found</h1>
                    <h1><Link to="/explorer">Back to Game Explorer</Link></h1>
                </div>
            )
        } else {
            return (
                <div id="viewer-content">
                    <h1>Viewer</h1>
                    {/* <h2>GameId: {this.state.gameInfo.game_id}, Name: {this.state.gameInfo.data.name}</h2> */}
                    <h2>{this.state.gameInfo.data.name}</h2>
                    <h2>{this.state.gameInfo.data.date}</h2>
                    <div id="video-container">
                        <video id="video-player" controls>
                            {(!this.state.gameInfo.data.video ? null : <source src={this.state.gameInfo.data.video} type="video/mp4"/>)}
                            Your browser does not support HTML5 video.
                    </video>
                    </div>
                </div>
            )
        }
    }

    render() {
        return this.toggleContent()
    }
}

const Viewer = (props) => {
    return (
        <div id="viewer">
            <Sidebar />
            <ViewerContent 
                cookieAuthenticationKey={props.cookieAuthenticationKey}
                gameId={props.match.params.gameId}
            />
        </div>
    )
}

export default Viewer;