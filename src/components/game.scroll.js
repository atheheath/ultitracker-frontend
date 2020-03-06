import React from 'react';
import auth from './auth';
import User from './user';
import { Link } from "react-router-dom"

import "../stylesheets/game.scroll.css";


async function getGameListRequest(cookieAuthenticationKey) {
    var headers = auth.getAuthorizationHeader(cookieAuthenticationKey)
    var requestInit = {
        method: "GET",
        headers: headers,
        credentials: "include"
    }
    const request = new Request(
        "http://localhost:3001/get_game_list",
        requestInit
    )

    const gameList = await fetch(request)
        .then((response) => {
            if (!response.ok) {
                throw Error("Can't fetch: " + response)
            }
            return response.json()
        })
        .then((payload) => {
            return payload.game_list
        })
        .catch((err) => {
            console.log(err);
            return false;
        })

    return gameList
}

async function getGameList(cookieAuthenticationKey) {
    
    const isAuthenticated = await auth.isAuthenticated(cookieAuthenticationKey)
    
    if (!isAuthenticated) {
        console.log("Not authenticated");
        throw Error("Not authenticated");
    }

    console.log("Calling constructUserRequest")
    const gameList = getGameListRequest(cookieAuthenticationKey)
    
    return gameList;
}


class GameScrollList extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            gameList: new Array()
        }

        this.constructGameDiv = this.constructGameDiv.bind(this);
        this.constructDivList = this.constructDivList.bind(this);
    }

    async componentDidMount() {
        const gameList = await getGameList(this.props.cookieAuthenticationKey)
        console.log("gameList length: " + gameList.length)
        this.setState({gameList: gameList})
    }

    constructGameDiv(game) {
        const gameData = game.data
        return (
            <div className="gameDiv">
                <div className="gameDivImg">
                    <Link to={'/viewer/' + game.game_id}>
                        <img src={gameData.thumbnail}/>
                    </Link>
                </div>
                <div className="gameDivDesc">
                    <table>
                        <tr>
                            <th>{gameData.home + " vs. " + gameData.away}</th>
                        </tr>
                        <tr><th>{"Date: " + gameData.date}</th></tr>
                        <tr><th>{"Length: " + gameData.length}</th></tr>
                    </table>
                </div>
            </div>
        )
    }
    
    constructDivList() {
        var divList = new Array();
        console.log("Gamelist length Div is: " + this.state.gameList.length)
        this.state.gameList.forEach((game, index) => {
            divList.push(this.constructGameDiv(game))
        })

        return divList;
    }

    render() {
        return (
            <div id="gameScrollList">
                {this.constructDivList()}
            </div>
            
        )
    }
}

export { GameScrollList, getGameList };